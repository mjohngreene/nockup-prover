markdown
# Prover - SNARK Submission System

A [NockApp](https://github.com/nockchain/nockchain) for submitting and tracking Zero-Knowledge Proofs (SNARKs) on Nockchain.

![Prover Banner](https://img.shields.io/badge/NockApp-Prover-purple?style=for-the-badge)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 🎯 Overview

Prover is a web-based NockApp that allows users to submit SNARK (Zero-Knowledge Succinct Non-Interactive Argument of Knowledge) proofs and track their verification status. Built on the Nockchain NockApp framework, it provides both a user-friendly web interface and a REST API for programmatic access.

### Current Status

⚠️ **Note:** Nockchain does not yet support user-provided ZKP verification on-chain. Prover currently operates in **local storage mode**, tracking submissions in preparation for future Nockchain integration. Once Nockchain adds this capability, Prover will be updated to submit proofs on-chain for verification.

## ✨ Features

- ✅ Submit Groth16, PLONK, and STARK proofs
- ✅ Track submission history with timestamps
- ✅ Web-based user interface
- ✅ REST API for programmatic access
- ✅ Base64-encoded proof data handling
- ✅ Public input tracking
- ⏳ On-chain verification (pending Nockchain feature)
- ⏳ Real-time verification status updates

## 🚀 Getting Started

### Prerequisites

- Rust toolchain (nightly-2024-11-01)
- Nockchain development environment
- `hoonc` (Hoon compiler)
- `nockup` CLI tool

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/mjohngreene/nockup-prover.git
   cd nockup-prover
   ```

2. **Install dependencies**
   ```bash
   nockup package install
   ```

3. **Build the project**
   ```bash
   nockup project build
   ```

4. **Run the server**
   ```bash
   # Development mode with detailed logging
   RUST_BACKTRACE=1 RUST_LOG=debug,gnort=off MINIMAL_LOG_FORMAT=true nockup project run
   
   # Or production mode
   nockup project run
   ```

5. **Access the web interface**
   
   Open your browser to: `http://localhost:8080`

## 📖 Usage

### Web Interface

The web interface provides an intuitive form for submitting SNARKs:

1. Select your proof system (Groth16, PLONK, or STARK)
2. Paste your Base64-encoded proof data
3. Add your verification key
4. Include public inputs (one per line)
5. Provide your submitter identifier
6. Add optional notes
7. Click "Submit SNARK"

View all submitted SNARKs in the list below the form, with status tracking and detail viewing.

### REST API

#### Submit SNARK

```bash
curl -X POST http://localhost:8080/api/v1/snark \
  -H "Content-Type: application/json" \
  -d '{
    "proof": "BASE64_ENCODED_PROOF_DATA",
    "public_inputs": ["input1", "input2"],
    "verification_key": "BASE64_ENCODED_VK",
    "proof_system": "groth16",
    "submitter": "your-address",
    "notes": "Optional notes"
  }'
```

#### List All SNARKs

```bash
curl http://localhost:8080/api/v1/snarks
```

#### Get Specific SNARK

```bash
curl http://localhost:8080/api/v1/snark/{id}
```

#### Delete SNARK

```bash
curl -X DELETE http://localhost:8080/api/v1/snark/{id}
```

## 🏗️ Architecture

Prover follows the NockApp architecture pattern:

- **Hoon Kernel** (`prover/hoon/prover.hoon`): Core logic for state management and SNARK tracking
- **Rust Driver** (`prover/src/main.rs`): HTTP server with Axum, API endpoints, and static file serving
- **Web Interface** (`prover/web/`): HTML, CSS, and JavaScript for user interaction

The Rust driver communicates with the Hoon kernel using noun-based message passing, following NockApp conventions.

## 🔮 Future Integration

When Nockchain adds support for user-provided ZKP verification, Prover will be updated to:

1. Submit proofs to Nockchain as transactions
2. Monitor on-chain verification results
3. Update status based on blockchain confirmation
4. Display transaction hashes and block explorer links

The current architecture is designed to make this transition seamless.

## 🛠️ Development

### Project Structure

```
prover/
├── prover/
│   ├── hoon/
│   │   └── prover.hoon      # Hoon kernel
│   ├── src/
│   │   └── main.rs          # Rust HTTP driver
│   └── web/
│       ├── index.html       # Web UI
│       ├── prover.js        # Client logic
│       └── style.css        # Styling
├── nockapp.toml             # Project config
├── rust-toolchain.toml      # Rust version
└── Cargo.toml               # Rust dependencies
```

### Building from Source

```bash
# Compile Hoon to Nock
hoonc prover/hoon/prover.hoon -o prover/out.jam

# Build Rust binary
cargo build --release

# Run
./target/release/prover
```

### Testing

```bash
# Run integration tests
cargo test

# Test with sample data
cat test-data/sample-groth16-proof.txt
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [Nockchain](https://github.com/nockchain/nockchain)
- Inspired by the [three-body-hybrid](https://github.com/sigilante/three-body-hybrid) demo
- Thanks to the Nockchain and Urbit communities

## 📞 Contact

Michael Greene - [@mjohngreene](https://github.com/mjohngreene)

Project Link: [https://github.com/mjohngreene/nockup-prover](https://github.com/mjohngreene/nockup-prover)

---

**Note:** This is an early-stage project built in anticipation of upcoming Nockchain features. The current implementation provides a foundation for future on-chain ZKP verification.
