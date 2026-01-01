# NockApp API Design Patterns - Real Examples

This document contains real examples from the prover codebase showing the complete flow from Hoon to Rust.

## Example 1: Submit SNARK Endpoint

### Step 1: Hoon Type Definition (prover/hoon/prover.hoon:27-34)

```hoon
+$  cause
  $%  [%init ~]
      [%submit-snark proof=@t inputs=(list @t) vk=@t system=@tas submitter=@t notes=@t]
      [%get-snark id=@ud]
      [%list-snarks ~]
      [%delete-snark id=@ud]
      [%update-status id=@ud status=@tas error=(unit @t)]
  ==
```

**Key Points**:
- `proof=@t`: Text/cord for base64-encoded proof
- `inputs=(list @t)`: List of text cords for public inputs
- `vk=@t`: Verification key as text
- `system=@tas`: Term (symbol) for proof system type
- `submitter=@t`: Submitter identifier
- `notes=@t`: Additional metadata

### Step 2: Hoon Handler Implementation (prover/hoon/prover.hoon:65-84)

```hoon
%submit-snark
  =/  new-id  next-id.state
  =/  entry  ^-  snark-entry
    :*  new-id
        proof.cause
        inputs.cause
        vk.cause
        system.cause
        submitter.cause
        now
        %pending
        ~
        notes.cause
    ==
  =/  updated-state
    state(snarks (~(put by snarks.state) new-id entry), next-id +(next-id.state))
  :_  updated-state
  :~  [%http-response 201 (crip (format-submit-response new-id))]
      [%log (crip "SNARK #{(scow %ud new-id)} submitted by {(trip submitter.cause)}")]
  ==
```

**Pattern Breakdown**:
1. `=/  new-id  next-id.state` - Get current ID counter
2. `=/  entry  ^-  snark-entry` - Build new entry with type hint
3. `:*  ...  ==` - Build tuple with all fields
4. `state(...)` - Update state immutably
5. `:_  updated-state` - Return updated state
6. `:~  ...  ==` - Return list of effects

### Step 3: Rust Type Definition (prover/src/main.rs:32-40)

```rust
#[derive(Debug, Serialize, Deserialize)]
struct SnarkSubmission {
    proof: String,
    public_inputs: Vec<String>,
    verification_key: String,
    proof_system: String,
    submitter: String,
    notes: Option<String>,
}
```

**Mapping**:
- Hoon `@t` → Rust `String`
- Hoon `(list @t)` → Rust `Vec<String>`
- Hoon `@tas` → Rust `String` (serialized as term)
- Hoon `@t` with defaults → Rust `Option<String>`

### Step 4: Rust Handler (prover/src/main.rs:97-145)

```rust
async fn submit_snark(
    State(nockapp): State<SharedState>,
    Json(submission): Json<SnarkSubmission>,
) -> Response {
    // Validate base64 encoding
    if !is_valid_base64(&submission.proof) {
        return error_response(StatusCode::BAD_REQUEST, "Invalid base64 in proof");
    }
    if !is_valid_base64(&submission.verification_key) {
        return error_response(StatusCode::BAD_REQUEST, "Invalid base64 in verification_key");
    }

    // Build noun for Hoon kernel
    let mut slab = NounSlab::new();
    let notes = submission.notes.as_deref().unwrap_or("");

    let noun = build_submit_snark_noun(
        &mut slab,
        &submission.proof,
        &submission.public_inputs,
        &submission.verification_key,
        &submission.proof_system,
        &submission.submitter,
        notes,
    );

    // Send to kernel
    let mut handle = nockapp.write().await;
    let result = handle.poke(noun).await;

    match result {
        Ok(response_noun) => {
            // Parse response
            let id = extract_snark_id(&response_noun);
            success_response(
                StatusCode::CREATED,
                &SnarkResponse {
                    success: true,
                    id: Some(id),
                    message: format!("SNARK {} submitted successfully", id),
                },
            )
        }
        Err(e) => error_response(StatusCode::INTERNAL_SERVER_ERROR, &e.to_string()),
    }
}
```

---

## Example 2: Get SNARK Endpoint

### Step 1: Hoon Type (prover/hoon/prover.hoon:30)

```hoon
[%get-snark id=@ud]
```

### Step 2: Hoon Handler (prover/hoon/prover.hoon:87-96)

```hoon
%get-snark
  =/  maybe-entry  (~(get by snarks.state) id.cause)
  ?~  maybe-entry
    :_  state
    :~  [%http-response 404 '{"error":"SNARK not found"}']
        [%log (crip "SNARK #{(scow %ud id.cause)} not found")]
    ==
  :_  state
  :~  [%http-response 200 (crip (format-snark-detail id.cause u.maybe-entry))]
  ==
```

**Key Patterns**:
- `(~(get by map) key)` - Map lookup returns `(unit value)`
- `?~  maybe-entry` - Check if null
- `u.maybe-entry` - Unwrap unit (safe because we checked)
- Return 404 if not found, 200 with data if found

### Step 3: Rust Handler (prover/src/main.rs:147-180)

```rust
async fn get_snark(
    State(nockapp): State<SharedState>,
    AxumPath(id): AxumPath<u64>,
) -> Response {
    // Build noun: [%get-snark id]
    let mut slab = NounSlab::new();
    let noun = build_get_snark_noun(&mut slab, id);

    // Send to kernel
    let mut handle = nockapp.write().await;
    let result = handle.poke(noun).await;

    match result {
        Ok(response_noun) => {
            // Parse response
            if is_404_response(&response_noun) {
                return error_response(StatusCode::NOT_FOUND, "SNARK not found");
            }

            let details = parse_snark_details(&response_noun);
            success_response(StatusCode::OK, &details)
        }
        Err(e) => error_response(StatusCode::INTERNAL_SERVER_ERROR, &e.to_string()),
    }
}
```

**Route Definition** (prover/src/main.rs:280-285):

```rust
let app = Router::new()
    .route("/api/v1/snark", post(submit_snark))
    .route("/api/v1/snark/:id", get(get_snark))
    .route("/api/v1/snarks", get(list_snarks))
    .route("/api/v1/snark/:id", delete(delete_snark))
    .with_state(nockapp);
```

---

## Example 3: List SNARKs Endpoint

### Step 1: Hoon Type (prover/hoon/prover.hoon:31)

```hoon
[%list-snarks ~]
```

### Step 2: Hoon Handler (prover/hoon/prover.hoon:99-104)

```hoon
%list-snarks
  =/  snark-list  ~(tap by snarks.state)
  :_  state
  :~  [%http-response 200 (crip (format-snark-list snark-list))]
  ==
```

**Pattern**: `~(tap by map)` converts map to list of key-value pairs

### Step 3: Rust Response Type (prover/src/main.rs:66-81)

```rust
#[derive(Debug, Serialize, Deserialize)]
struct SnarkList {
    snarks: Vec<SnarkSummary>,
    total: usize,
}

#[derive(Debug, Serialize, Deserialize)]
struct SnarkSummary {
    id: u64,
    proof_system: String,
    submitter: String,
    submitted: String,
    status: String,
    notes: String,
}
```

---

## Example 4: Delete SNARK Endpoint

### Step 1: Hoon Type (prover/hoon/prover.hoon:32)

```hoon
[%delete-snark id=@ud]
```

### Step 2: Hoon Handler (prover/hoon/prover.hoon:106-116)

```hoon
%delete-snark
  =/  maybe-entry  (~(get by snarks.state) id.cause)
  ?~  maybe-entry
    :_  state
    :~  [%http-response 404 '{"error":"SNARK not found"}']
    ==
  =/  updated-state  state(snarks (~(del by snarks.state) id.cause))
  :_  updated-state
  :~  [%http-response 200 '{"success":true,"message":"SNARK deleted"}']
      [%log (crip "SNARK #{(scow %ud id.cause)} deleted")]
  ==
```

**Pattern**: `(~(del by map) key)` removes key from map

### Step 3: Rust Handler

```rust
async fn delete_snark(
    State(nockapp): State<SharedState>,
    AxumPath(id): AxumPath<u64>,
) -> Response {
    let mut slab = NounSlab::new();
    let noun = build_delete_snark_noun(&mut slab, id);

    let mut handle = nockapp.write().await;
    let result = handle.poke(noun).await;

    match result {
        Ok(response_noun) => {
            if is_404_response(&response_noun) {
                return error_response(StatusCode::NOT_FOUND, "SNARK not found");
            }
            success_response(StatusCode::OK, &serde_json::json!({
                "success": true,
                "message": "SNARK deleted successfully"
            }))
        }
        Err(e) => error_response(StatusCode::INTERNAL_SERVER_ERROR, &e.to_string()),
    }
}
```

---

## Common Hoon Patterns

### Map Operations

```hoon
::  Insert/update
state(snarks (~(put by snarks.state) key value))

::  Lookup
=/  maybe-value  (~(get by snarks.state) key)

::  Delete
state(snarks (~(del by snarks.state) key))

::  Convert to list
=/  list  ~(tap by snarks.state)

::  Check if key exists
=/  has-key  (~(has by snarks.state) key)
```

### State Updates

```hoon
::  Single field
state(next-id +(next-id.state))

::  Multiple fields
state(snarks new-map, next-id +(next-id.state))
```

### Conditional Returns

```hoon
::  If-then-else for values
?:  condition
  value-if-true
value-if-false

::  If-null check
?~  maybe-value
  handle-null-case
handle-value-case
```

### Effect Lists

```hoon
::  Return with state
:_  updated-state
:~  [%http-response 200 body]
    [%log message]
==
```

---

## Common Rust Patterns

### Noun Building

```rust
let mut slab = NounSlab::new();

// Simple tag with atom
let noun = T(&mut slab, &[
    D(TAG),           // %submit-snark
    D(value),         // atom value
]);

// Complex nested structure
let noun = T(&mut slab, &[
    D(TAG),
    string_to_noun(&mut slab, "text"),
    list_to_noun(&mut slab, &vec_of_strings),
]);
```

### Response Helpers

```rust
fn success_response<T: Serialize>(status: StatusCode, data: &T) -> Response {
    (status, Json(data)).into_response()
}

fn error_response(status: StatusCode, message: &str) -> Response {
    (
        status,
        Json(ErrorResponse {
            error: message.to_string(),
        }),
    )
    .into_response()
}
```

### Async State Access

```rust
// Read lock (multiple readers)
let handle = nockapp.read().await;
let result = handle.peek(...);

// Write lock (exclusive access)
let mut handle = nockapp.write().await;
let result = handle.poke(...).await;
```

---

## Type Mapping Reference

| Hoon Type | Rust Type | Notes |
|-----------|-----------|-------|
| `@ud` | `u64` | Unsigned decimal |
| `@t` | `String` | Text/cord |
| `@tas` | `String` | Term (lowercase alphanumeric) |
| `@da` | `String` or `u64` | Timestamp (format as ISO8601 string) |
| `(list @t)` | `Vec<String>` | List of strings |
| `(map @ud @t)` | `HashMap<u64, String>` | Map (converted via `~(tap by ...)`) |
| `(unit @t)` | `Option<String>` | Optional value |
| `?(%a %b)` | `enum` or `String` | Union type |
| `~` | `null` or omit field | Null/unit |

---

## Complete Flow Diagram

```
User Request
    ↓
Axum Router → Match route → Extract path/body
    ↓
Handler Function
    ↓
Validate Input (Rust)
    ↓
Build Noun Message
    ↓
Kernel.poke(noun) → Send to Hoon
    ↓
Hoon ++poke arm
    ↓
Pattern Match on -.cause
    ↓
Validate Input (Hoon)
    ↓
Update State (immutable)
    ↓
Return [effects new-state]
    ↓
Parse Response Noun (Rust)
    ↓
Serialize to JSON
    ↓
HTTP Response → User
```

---

## Testing New Endpoints

```bash
# 1. Compile Hoon changes
hoonc prover/hoon/prover.hoon -o prover/out.jam

# 2. Rebuild Rust
cargo build

# 3. Run with debug logging
RUST_LOG=debug cargo run

# 4. Test endpoint
curl -X POST http://localhost:8080/api/v1/your-endpoint \
  -H "Content-Type: application/json" \
  -d '{"field": "value"}'

# 5. Check logs
# Look for your Hoon log messages and Rust debug output
```
