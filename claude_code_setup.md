# Claude Code Setup Plan for Prover NockApp Development
## Optimized for Ubuntu CLI + VS Code Workflow

This plan will help you leverage Claude Code to its fullest potential for developing the Prover NockApp.

---

## Phase 1: Install and Configure Claude Code

### 1.1 Install Claude Code CLI

```bash
# Install Claude Code (requires Claude Pro/Team subscription)
curl -fsSL https://cli.claude.ai/install.sh | sh

# Verify installation
claude --version

# Login to your Claude account
claude login
```

### 1.2 Initial Configuration

```bash
# Create global config directory
mkdir -p ~/.claude/{commands,rules}

# Set up terminal for better Claude Code experience
claude /terminal-setup

# Test that it works
claude "hello"
```

### 1.3 Configure Permissions (Recommended for Development)

For development workflow, you have two options:

**Option A: Safe Mode (Recommended for production)**
```zsh
# Claude will ask permission for each action
claude
```

**Option B: Developer Mode (Faster iteration)**
```zsh
# Skip permission prompts (use with caution)
alias cc='claude --dangerously-skip-permissions'

# Add to ~/.zshrc
echo "alias cc='claude --dangerously-skip-permissions'" >> ~/.zshrc
source ~/.zshrc
```

**My Recommendation**: Start with safe mode, switch to `--dangerously-skip-permissions` once you're comfortable.

### 1.4 ZSH-Specific Enhancements

```zsh
# Add to ~/.zshrc for better Claude Code experience

# Alias for quick access
alias claude-prover='cd ~/nockup-prover && claude'

# Function to start Claude with context
claude-dev() {
    local project_dir="${1:-.}"
    cd "$project_dir" && claude
}

# Function to quickly test Claude changes
claude-test() {
    claude -p "Run all tests and report results" --allowedTools "Bash(cargo:*)" "Bash(curl:*)" "Read"
}

# Reload config
source ~/.zshrc
```

---

## Phase 2: Set Up Prover Project with Claude Code

### 2.1 Project Directory Structure

```bash
nockup-prover/
├── CLAUDE.md                    # Main project context
├── .claude/
│   ├── commands/                # Custom slash commands
│   │   ├── build.md
│   │   ├── test.md
│   │   ├── review-hoon.md
│   │   └── deploy.md
│   └── rules/                   # Conditional rules
│       ├── hoon.md             # Rules for .hoon files
│       └── rust.md             # Rules for .rs files
├── prover/
│   ├── hoon/
│   │   └── prover.hoon
│   ├── src/
│   │   └── main.rs
│   └── web/
│       ├── index.html
│       ├── prover.js
│       └── style.css
└── test-data/
```

### 2.2 Create CLAUDE.md (Project Context)

Create `.claude/CLAUDE.md` or `CLAUDE.md` in project root:

```markdown
# Prover - SNARK Submission System

A NockApp for submitting and tracking Zero-Knowledge Proofs on Nockchain.

## Critical Context

**IMPORTANT**: Nockchain does NOT yet support user-provided ZKP verification. This app stores SNARKs locally in preparation for future on-chain verification.

## Tech Stack

- **Hoon**: Kernel logic (Nock ISA compiled with `hoonc`)
- **Rust**: HTTP server driver (Axum framework)
- **NockApp Framework**: Crown (Rust interface) + Sword (Nock runtime)
- **Frontend**: Vanilla HTML/CSS/JavaScript (no frameworks)

## Build Commands

```bash
# Compile Hoon to Nock
hoonc prover/hoon/prover.hoon -o prover/out.jam

# Build Rust binary
cargo build --release

# Run server (development)
RUST_LOG=debug RUST_BACKTRACE=1 cargo run

# Full build with nockup
nockup project build
nockup project run
```

## Testing

```bash
# Test SNARK submission
curl -X POST http://localhost:8080/api/v1/snark \
  -H "Content-Type: application/json" \
  -d @test-data/sample-submission.json

# Check server logs
tail -f target/debug/prover.log
```

## Repository Structure

- `prover/hoon/` - Hoon kernel source (state management, SNARK tracking)
- `prover/src/` - Rust HTTP driver (Axum server, API endpoints)
- `prover/web/` - Static web assets (served by Axum)
- `test-data/` - Sample SNARKs for testing

## Critical Files

- `prover/hoon/prover.hoon` - Core kernel logic, NEVER modify without understanding Nock
- `prover/src/main.rs` - HTTP server entry point
- `prover/web/prover.js` - Client-side API interactions

## Code Conventions

### Hoon
- Use `::` for comments
- Follow Nockchain's Hoon style guide
- Test changes with `hoonc` before committing

### Rust
- Use `rustfmt` and `clippy`
- Prefer explicit error handling with `Result<T, E>`
- Keep noun serialization in helper functions
- Document all public APIs

### Web
- Vanilla JS (no build step required)
- Use modern ES6+ features
- Validate Base64 encoding client-side

## Git Workflow

```bash
# Always run tests before committing
cargo test
cargo fmt
cargo clippy

# Conventional commits
git commit -m "feat: add SNARK deletion endpoint"
git commit -m "fix: correct Base64 validation"
```

## Common Tasks

**Add new API endpoint**:
1. Add cause to Hoon `$cause` type
2. Implement in `++poke` arm
3. Add Rust handler function
4. Wire up route in `main.rs`
5. Update frontend if needed

**Modify SNARK structure**:
1. Update `$snark-entry` in Hoon
2. Update Rust `SnarkDetails` struct
3. Rebuild kernel: `hoonc prover/hoon/prover.hoon -o prover/out.jam`
4. Update API responses
5. Update web UI display

## Known Issues

- Hoon JSON serialization is simplified (TODO: use proper library)
- Noun parsing in Rust is incomplete (uses placeholders)
- localStorage not used (could track recent submissions client-side)

## Future Integration

When Nockchain adds ZKP verification:
1. Add `nockchain-client` dependency
2. Implement `submit_to_nockchain()` function
3. Add tx hash tracking to SNARK state
4. Update UI to show on-chain status
5. Add block explorer links

## Resources

- NockApp docs: https://docs.nockchain.org/nockapp
- Nockchain GitHub: https://github.com/nockchain/nockchain
- Three-body-hybrid example: https://github.com/sigilante/three-body-hybrid
```

### 2.3 Create Custom Commands

**`.claude/commands/build.md`**:
```markdown
# Build Prover

Build the complete Prover NockApp.

Steps:
1. Compile Hoon kernel: `hoonc prover/hoon/prover.hoon -o prover/out.jam`
2. Build Rust binary: `cargo build --release`
3. Verify out.jam exists and has correct size
4. Run `cargo test` to ensure nothing broke
5. Report build status and any warnings

If build fails, analyze errors and suggest fixes.
```

**`.claude/commands/test.md`**:
```markdown
# Test Prover

Run comprehensive tests for Prover.

Steps:
1. Start server in background: `cargo run &`
2. Wait 3 seconds for server to start
3. Run API tests using curl:
   - Submit test SNARK from test-data/
   - List all SNARKs
   - Get specific SNARK
   - Delete SNARK
4. Check all responses are valid JSON
5. Verify server logs for errors
6. Stop background server
7. Report test results

Show any failures with details.
```

**`.claude/commands/review-hoon.md`**:
```markdown
# Review Hoon Code

Review Hoon code for correctness and style.

Focus on:
1. **Correctness**: Proper Nock semantics, correct arm signatures
2. **State Management**: Version tags, proper state transitions
3. **Type Safety**: Correct $cause and $effect types
4. **Comments**: Adequate `::` documentation
5. **Performance**: Unnecessary recomputations, inefficient patterns
6. **Security**: Input validation, potential crashes

DO NOT suggest changes based on Rust/Python conventions.
Hoon is functional - embrace it.

Provide specific line numbers and concrete suggestions.
```

**`.claude/commands/add-endpoint.md`**:
```markdown
# Add New API Endpoint

Add a new API endpoint to Prover: $ARGUMENTS

This requires changes across the stack:

## 1. Hoon Changes
- Add new variant to `$cause` type
- Implement handler in `++poke` arm
- Add appropriate `$effect` responses
- Test Hoon changes compile

## 2. Rust Changes
- Define request/response structs with serde
- Create async handler function
- Add route to Router
- Implement noun serialization for request
- Add error handling

## 3. Frontend Changes (if needed)
- Add JavaScript function to call endpoint
- Update UI to trigger new endpoint
- Display results appropriately

## 4. Testing
- Add curl test command
- Test happy path and error cases
- Update test-data/ if needed

Implement all changes, then ask if I want to test.
```

### 2.4 Create Conditional Rules

**`.claude/rules/hoon.md`**:
```yaml
---
paths: "**/*.hoon"
---

# Hoon-Specific Rules

When working with `.hoon` files:

## CRITICAL
- Hoon is NOT Rust/Python - it's a functional language
- NEVER add semicolons (`;` is rune, not statement terminator)
- Whitespace matters - respect indentation
- Test ALL changes with `hoonc` before suggesting

## Runes
- `|%` - core construction
- `++` - arm definition  
- `^-` - cast
- `?-` - switch
- `:_` - inverted cons
- `~` - null

## Common Patterns
```hoon
::  Type definition
+$  my-type  @ud

::  Function with typed return
++  my-function
  |=  input=@ud
  ^-  @ud
  (add input 1)

::  List operations
=/  my-list  `(list @ud)`~[1 2 3]
(lent my-list)  :: length
(snag 0 my-list) :: index
```

## Before Modifying
1. Read surrounding code carefully
2. Understand the type system
3. Check existing patterns
4. Verify with `hoonc`

## DO NOT
- Mix functional/imperative paradigms
- Add unnecessary complexity
- Ignore type errors
- Skip compilation checks
```

**`.claude/rules/rust.md`**:
```yaml
---
paths: "prover/src/**/*.rs"
---

# Rust-Specific Rules

## NockApp Patterns

**Noun Creation**:
```rust
let mut slab = NounSlab::new();
let atom = D(42);  // Direct atom
let cell = T(&mut slab, &[atom1, atom2]);  // Cell
slab.set_root(cell);
```

**String to Cord**:
```rust
fn string_to_cord(slab: &mut NounSlab, s: &str) -> Noun {
    // Simplified - see main.rs for full implementation
    D(string_as_bytes_to_u64(s))
}
```

## Error Handling
- Prefer `Result<T, Box<dyn Error>>` for main functions
- Use `anyhow` for complex error chaining
- Log errors before returning: `log::error!("Context: {:?}", e)`

## HTTP Patterns
```rust
async fn handler(
    State(state): State<SharedState>,
    Json(payload): Json<RequestType>,
) -> Response {
    // Validate input
    // Create poke
    // Send to kernel
    // Parse effects
    // Return response
}
```

## Testing
- Add unit tests for noun conversion functions
- Integration tests for HTTP endpoints
- Use `#[tokio::test]` for async tests
```

---

## Phase 3: Optimize Your Workflow

### 3.1 Create Personal Commands (Global)

Add to `~/.claude/commands/` for use across all projects:

**`~/.claude/commands/git-commit.md`**:
```markdown
# Smart Git Commit

Create a conventional commit with proper message.

Steps:
1. Run `git status` to see changes
2. Run `git diff --staged` to review changes
3. Analyze changes and determine type:
   - feat: new feature
   - fix: bug fix
   - docs: documentation
   - refactor: code restructuring
   - test: adding tests
   - chore: maintenance
4. Create commit message: `<type>(<scope>): <description>`
5. Show me the message for approval
6. If approved: `git commit -m "message"`
```

**`~/.claude/commands/explain.md`**:
```markdown
# Explain Code

Explain the code/concept: $ARGUMENTS

Provide:
1. High-level overview (2-3 sentences)
2. Key components and their roles
3. Data flow or control flow
4. Important implementation details
5. Related concepts to understand
6. Common gotchas or edge cases

Use diagrams where helpful (ASCII art for terminal).
Be concise but thorough.
```

### 3.2 Set Up Hooks (Advanced)

Create `.claude/hooks.json` in project root:

```json
{
  "hooks": {
    "PostToolUse": {
      "matcher": "Edit|Write",
      "command": "cargo fmt -- ${FILE}",
      "description": "Auto-format Rust files after edits"
    },
    "PreToolUse": {
      "matcher": "Bash(git commit:*)",
      "command": "cargo test --quiet",
      "description": "Run tests before committing"
    }
  }
}
```

### 3.3 Configure VS Code Integration

Install the Claude Code VS Code extension:

```bash
# From VS Code extensions marketplace
# Search for "Claude Code" and install
```

Then configure in `.vscode/settings.json`:

```json
{
  "claude-code.enablePreview": true,
  "claude-code.showDiffs": true,
  "claude-code.autoAcceptSuggestions": false,
  "files.watcherExclude": {
    "**/.claude/**": true,
    "**/target/**": true,
    "**/*.jam": true
  }
}
```

---

## Phase 4: Optimal Usage Patterns

### 4.1 Starting a Session

**For Feature Development**:
```zsh
cd nockup-prover
claude

# In Claude Code:
> I want to add support for STARK proof verification. Can you:
> 1. First explore the current SNARK structure
> 2. Create a plan for adding STARK support
> 3. Implement the changes
> 4. Add tests

# Claude will automatically use Plan mode for complex tasks
```

**For Bug Fixes**:
```zsh
cd nockup-prover
claude

> There's a bug where Base64 validation fails on valid proofs.
> @prover/web/prover.js
> Can you debug this?
```

**For Code Review**:
```zsh
cd nockup-prover
claude

> /review-hoon
> Review the recent changes to prover.hoon
```

### 4.2 Using Subagents

For complex work, use subagents:

```zsh
claude --agents '{
  "hoon-expert": {
    "description": "Hoon/Nock specialist",
    "prompt": "Expert in Hoon, Nock ISA, and functional programming. Focus on correctness and Nock semantics.",
    "tools": ["Read", "Edit", "Bash(hoonc:*)"],
    "model": "opus"
  },
  "rust-dev": {
    "description": "Rust developer",
    "prompt": "Rust expert focused on async, error handling, and NockApp integration.",
    "tools": ["Read", "Edit", "Bash(cargo:*)"],
    "model": "sonnet"
  }
}'
```

### 4.3 Headless Mode for Automation

Use `-p` (print mode) for scripts:

**`scripts/test-all.sh`**:
```zsh
#!/usr/bin/env zsh
# Run comprehensive tests using Claude Code

claude -p "Run all tests and generate a report" \
  --allowedTools "Bash(cargo:*)" "Bash(curl:*)" "Read" \
  > test-report.txt

if grep -q "FAIL" test-report.txt; then
  echo "Tests failed!"
  exit 1
fi

echo "All tests passed!"
```

Make executable:
```zsh
chmod +x scripts/test-all.sh
```

### 4.4 Multi-Instance Development

Use separate terminal tabs/panes for parallel work:

**Terminal 1**: Feature development
```zsh
cd nockup-prover
claude
> Working on new API endpoint...
```

**Terminal 2**: Code review  
```zsh
cd nockup-prover
claude
> /review reviewing the changes from Terminal 1...
```

**Terminal 3**: Documentation
```zsh
cd nockup-prover
claude
> Update README with new API endpoint docs
```

**Using tmux for better workflow**:
```zsh
# Create tmux session for Prover development
tmux new -s prover

# Split into panes
# Ctrl+B then %  (vertical split)
# Ctrl+B then "  (horizontal split)

# In each pane:
# Pane 1: claude (main development)
# Pane 2: cargo run (server)
# Pane 3: tail -f logs (monitoring)
# Pane 4: claude (code review)
```

**Or using Zellij (modern tmux alternative)**:
```zsh
# Install Zellij
cargo install zellij

# Create layout for Prover development
zellij --layout prover-dev.kdl
```

Create `prover-dev.kdl`:
```kdl
layout {
    pane split_direction="vertical" {
        pane command="claude" name="Development"
        pane split_direction="horizontal" {
            pane command="cargo" args="run" name="Server"
            pane command="tail" args="-f" "target/debug/prover.log" name="Logs"
        }
    }
    pane command="claude" name="Review"
}
```

---

## Phase 5: Advanced Techniques

### 5.1 Context Management

**Check context usage**:
```zsh
# In Claude Code session
> /context

# Or use ccusage tool
npx ccusage@latest
```

**Manage large files**:
```markdown
# In CLAUDE.md

## Large File Handling

For files > 1000 lines:
- Read specific functions only: `grep -A 50 'fn function_name'`
- Use `head`/`tail` for relevant sections
- Break into multiple focused sessions
```

### 5.2 Create a Development Log

**`.claude/commands/log-session.md`**:
```markdown
# Log Development Session

Create a development log entry: $ARGUMENTS

Generate a structured log:
```markdown
## [Date] - $ARGUMENTS

### Changes Made
- List all files modified
- Key functions/modules changed

### Decisions
- Important architectural decisions
- Trade-offs considered

### Next Steps
- What needs to be done next
- Open questions

### Commands Run
```bash
# Key commands from this session
```
```

Append to `DEVELOPMENT.md` in project root.
```

### 5.3 GitHub Integration

Install GitHub CLI MCP:

```zsh
claude mcp add github --npx -y @modelcontextprotocol/server-github

# Configure token in ~/.claude/mcp.json
{
  "github": {
    "command": "npx",
    "args": ["-y", "@modelcontextprotocol/server-github"],
    "env": {
      "GITHUB_PERSONAL_ACCESS_TOKEN": "ghp_your_token_here"
    }
  }
}
```

Then use in sessions:
```zsh
> Create a new GitHub issue for the STARK support feature
> Create a PR for the Base64 validation fix
```

### 5.4 ZSH-Specific Productivity Enhancements

**Advanced ZSH configuration for Claude Code** (`~/.zshrc`):

```zsh
# ============================================================================
# Claude Code Configuration for ZSH
# ============================================================================

# Environment variables
export CLAUDE_CODE_PROJECT_ROOT="$HOME/projects/nockup-prover"

# Aliases
alias cc='claude --dangerously-skip-permissions'
alias ccp='cd $CLAUDE_CODE_PROJECT_ROOT && claude'
alias cc-build='claude -p "Build the project" --allowedTools "Bash(cargo:*)" "Bash(hoonc:*)"'
alias cc-test='claude -p "Run all tests" --allowedTools "Bash(cargo:*)" "Bash(curl:*)"'

# Functions
claude-session() {
    # Start Claude Code with session name
    local session_name="${1:-$(basename $(pwd))}"
    echo "Starting Claude Code session: $session_name"
    claude
}

claude-quick() {
    # Quick one-off Claude Code command
    local task="$@"
    if [[ -z "$task" ]]; then
        echo "Usage: claude-quick <task description>"
        return 1
    fi
    claude -p "$task"
}

claude-review() {
    # Review specific files or current changes
    local files="${@:-.}"
    claude -p "Review code changes in: $files" --allowedTools "Read" "Grep" "Bash(git:*)"
}

claude-commit() {
    # Generate commit message and commit
    claude -p "Review staged changes, generate conventional commit message, and commit" \
        --allowedTools "Bash(git:*)" "Read"
}

claude-explain() {
    # Explain code at cursor or file
    local target="${1:-.}"
    claude -p "Explain the code in: $target" --allowedTools "Read" "Grep"
}

# Directory navigation with Claude context
cc-cd() {
    local dir="$1"
    if [[ -z "$dir" ]]; then
        dir="$CLAUDE_CODE_PROJECT_ROOT"
    fi
    cd "$dir" && claude /init
}

# Monitor Claude Code usage
alias cc-usage='npx ccusage@latest'
alias cc-stats='npx ccusage@latest --breakdown'

# Quick access to Claude Code config
alias cc-config='$EDITOR ~/.claude/CLAUDE.md'
alias cc-commands='ls -la ~/.claude/commands/ && ls -la .claude/commands/ 2>/dev/null'
alias cc-hooks='$EDITOR .claude/hooks.json'

# Development workflow shortcuts
alias cc-start='cd $CLAUDE_CODE_PROJECT_ROOT && cargo run &'
alias cc-stop='pkill -f "cargo run"'
alias cc-logs='tail -f target/debug/prover.log'

# Git worktree helpers for parallel Claude instances
cc-worktree() {
    local branch="$1"
    if [[ -z "$branch" ]]; then
        echo "Usage: cc-worktree <branch-name>"
        return 1
    fi
    git worktree add "../$(basename $(pwd))-$branch" -b "$branch"
    cd "../$(basename $(pwd))-$branch"
    claude
}

# Completion for custom commands
_claude_commands() {
    local commands_dir
    commands_dir=("${HOME}/.claude/commands" ".claude/commands")
    local -a commands
    for dir in $commands_dir; do
        if [[ -d "$dir" ]]; then
            commands+=(${dir}/*.md(:t:r))
        fi
    done
    _describe 'command' commands
}

# ZSH key bindings for Claude Code
bindkey -s '^[c' 'claude\n'  # Alt+C to launch Claude Code
bindkey -s '^[q' 'claude-quick '  # Alt+Q for quick task

# Auto-activate virtualenv/conda if needed (for Python MCP servers)
# Uncomment if using Python-based MCP servers
# autoload -Uz add-zsh-hook
# load_mcp_env() {
#     if [[ -f .mcp-venv/bin/activate ]]; then
#         source .mcp-venv/bin/activate
#     fi
# }
# add-zsh-hook chpwd load_mcp_env

# Claude Code session management
CC_SESSION_DIR="$HOME/.claude/sessions"
mkdir -p "$CC_SESSION_DIR"

cc-save-session() {
    local session_name="${1:-$(date +%Y%m%d-%H%M%S)}"
    local session_file="$CC_SESSION_DIR/$session_name.md"
    
    echo "# Claude Code Session - $session_name" > "$session_file"
    echo "Date: $(date)" >> "$session_file"
    echo "Project: $(pwd)" >> "$session_file"
    echo "" >> "$session_file"
    echo "## Context" >> "$session_file"
    cat .claude/CLAUDE.md >> "$session_file" 2>/dev/null || echo "No CLAUDE.md" >> "$session_file"
    
    echo "Session saved to: $session_file"
}

cc-list-sessions() {
    ls -lht "$CC_SESSION_DIR"
}

# Initialize Claude Code in current directory
cc-init-here() {
    mkdir -p .claude/{commands,rules}
    
    if [[ ! -f CLAUDE.md ]] && [[ ! -f .claude/CLAUDE.md ]]; then
        claude /init
    else
        echo "CLAUDE.md already exists"
    fi
}

# Quick project setup
cc-setup-prover() {
    cd "$CLAUDE_CODE_PROJECT_ROOT" || return 1
    
    # Ensure directories exist
    mkdir -p .claude/{commands,rules}
    
    # Check for required files
    if [[ ! -f CLAUDE.md ]]; then
        echo "⚠️  CLAUDE.md not found. Run /init to create it."
    fi
    
    # Check build tools
    command -v hoonc >/dev/null 2>&1 || echo "⚠️  hoonc not found"
    command -v cargo >/dev/null 2>&1 || echo "⚠️  cargo not found"
    command -v nockup >/dev/null 2>&1 || echo "⚠️  nockup not found"
    
    echo "✅ Setup check complete"
    echo "Run 'claude' to start coding"
}

# Add to PATH if needed
# export PATH="$HOME/.cargo/bin:$PATH"

# Oh My Zsh plugin configuration (if using Oh My Zsh)
# Add 'claude-code' to plugins array in ~/.zshrc if you create a custom plugin

# Starship prompt integration (optional)
# Shows Claude Code session indicator in prompt
# Add to ~/.config/starship.toml:
# [custom.claude]
# command = "echo '🤖'"
# when = "test -n \"$CLAUDE_CODE_SESSION\""
# style = "bold purple"
```

**Create ZSH completion file** (`~/.zsh/completions/_claude`):

```zsh
#compdef claude

_claude() {
    local -a commands
    commands=(
        'mcp:Manage MCP servers'
        '--version:Show version'
        '--help:Show help'
        '-p:Print mode (headless)'
        '--dangerously-skip-permissions:Skip permission prompts'
        '--agents:Configure subagents'
        '--mcp-debug:Debug MCP connections'
    )
    
    _describe 'command' commands
}

_claude "$@"
```

Then enable completions:

```zsh
# Add to ~/.zshrc
fpath=(~/.zsh/completions $fpath)
autoload -Uz compinit && compinit
```

**Create Oh My Zsh plugin** (optional, if using Oh My Zsh):

```zsh
# Create ~/.oh-my-zsh/custom/plugins/claude-code/claude-code.plugin.zsh

# Claude Code Plugin for Oh My Zsh

# Aliases
alias cc='claude --dangerously-skip-permissions'
alias ccp='cd $(git rev-parse --show-toplevel 2>/dev/null || pwd) && claude'

# Functions
claude_prompt_info() {
    if [[ -n "$CLAUDE_CODE_SESSION" ]]; then
        echo "%{$fg[purple]%}🤖%{$reset_color%}"
    fi
}

# Add to right prompt
RPROMPT='$(claude_prompt_info)'$RPROMPT
```

Then add `claude-code` to your plugins in `~/.zshrc`:
```zsh
plugins=(git docker ... claude-code)
```

---

## Phase 6: Best Practices

### DO:
✅ Start sessions with clear goals
✅ Use /init in new projects
✅ Leverage custom commands for repeated tasks
✅ Keep CLAUDE.md concise (<200 lines)
✅ Use headless mode for automation
✅ Review generated code before accepting
✅ Use multiple instances for parallel work
✅ Commit CLAUDE.md and commands to git

### DON'T:
❌ Put code style rules in CLAUDE.md (use formatters)
❌ Include sensitive data in CLAUDE.md
❌ Skip testing Claude-generated code
❌ Let context window fill up without managing it
❌ Use --dangerously-skip-permissions without understanding risks
❌ Treat Claude Code as infallible
❌ Forget to save/commit important changes

---

## Quick Reference

### Essential Commands
```zsh
claude                          # Start interactive session
claude -p "task"               # Headless mode
claude --dangerously-skip-permissions  # Skip permission prompts
claude /init                   # Generate CLAUDE.md
claude /memory                 # Edit CLAUDE.md
claude /hooks                  # Configure hooks
claude /context                # Check context usage
```

### ZSH Aliases (from setup above)
```zsh
cc                             # Claude with skip permissions
ccp                            # cd to project and start Claude
cc-build                       # Build project headlessly
cc-test                        # Run tests headlessly
cc-usage                       # Check token usage
cc-stats                       # Detailed usage stats
cc-config                      # Edit CLAUDE.md
cc-commands                    # List available commands
cc-init-here                   # Initialize Claude in current dir
cc-setup-prover                # Setup check for Prover project
```

### ZSH Functions (from setup above)
```zsh
claude-session [name]          # Start named session
claude-quick <task>            # One-off task
claude-review [files]          # Review code
claude-commit                  # Generate commit message
claude-explain [file]          # Explain code
cc-cd [dir]                    # cd and init Claude
cc-worktree <branch>           # Create git worktree
cc-save-session [name]         # Save session notes
cc-list-sessions               # List saved sessions
```

### Key Shortcuts (in session)
- `/command-name` - Run custom command
- `@file` - Reference file
- `#` - Add to CLAUDE.md
- `Shift+Drag` - Reference file (don't open)
- `Ctrl+V` - Paste image (not Cmd+V)
- `Escape` - Interrupt Claude
- `/terminal-setup` - Fix Shift+Enter
- `Alt+C` - Launch Claude (if configured)
- `Alt+Q` - Quick task (if configured)

### File Locations
- `CLAUDE.md` or `.claude/CLAUDE.md` - Project context
- `.claude/commands/` - Custom slash commands
- `.claude/rules/` - Conditional rules
- `.claude/hooks.json` - Hook configuration
- `~/.claude/commands/` - Global commands
- `~/.claude/CLAUDE.md` - Global context
- `~/.zshrc` - ZSH configuration
- `~/.zsh/completions/` - ZSH completions

---

## Your Next Steps

1. **Install Claude Code** (15 min)
   ```zsh
   curl -fsSL https://cli.claude.ai/install.sh | sh
   claude login
   claude /terminal-setup  # Configure for ZSH
   ```

2. **Set up ZSH enhancements** (20 min)
   - Copy ZSH configuration from Section 5.4 to `~/.zshrc`
   - Create completions directory: `mkdir -p ~/.zsh/completions`
   - Copy completion script to `~/.zsh/completions/_claude`
   - Reload: `source ~/.zshrc`

3. **Set up Prover project** (30 min)
   - Create project structure
   - Create CLAUDE.md from template above
   - Add custom commands (build, test, review-hoon)
   - Test with: `cc-setup-prover` then `claude /init`

4. **Test your workflow** (30 min)
   ```zsh
   # Use your new ZSH functions
   ccp  # cd to project and start Claude
   
   # In Claude:
   > Let's add a /health endpoint to the API
   ```

5. **Configure your workflow** (30 min)
   - Add global commands to ~/.claude/commands/
   - Set up VS Code extension (optional)
   - Create hooks for auto-formatting
   - Configure tmux/Zellij layout if desired

6. **Build something awesome!** 🚀

### ZSH-Specific Tips

- Use `Tab` completion for Claude commands
- `Alt+C` launches Claude quickly (if configured)
- `Alt+Q` for quick one-off tasks (if configured)
- Use `cc-*` aliases for common operations
- `cc-setup-prover` validates your environment before starting

### Recommended ZSH Plugins (Oh My Zsh)

If using Oh My Zsh, these plugins work well with Claude Code:

```zsh
# In ~/.zshrc
plugins=(
  git                # Git aliases and completions
  docker             # Docker completions
  rust               # Rust/Cargo completions  
  command-not-found  # Suggests packages for missing commands
  zsh-autosuggestions  # Fish-like autosuggestions
  zsh-syntax-highlighting  # Syntax highlighting
  claude-code        # Your custom plugin (from Section 5.4)
)
```

Install autosuggestions and syntax highlighting:
```zsh
git clone https://github.com/zsh-users/zsh-autosuggestions ${ZSH_CUSTOM:-~/.oh-my-zsh/custom}/plugins/zsh-autosuggestions

git clone https://github.com/zsh-users/zsh-syntax-highlighting.git ${ZSH_CUSTOM:-~/.oh-my-zsh/custom}/plugins/zsh-syntax-highlighting
```

---

Happy coding with Claude Code on ZSH! Remember: Claude Code is a powerful collaborator, but you're still the architect. Review everything, test thoroughly, and iterate based on what works for your workflow.