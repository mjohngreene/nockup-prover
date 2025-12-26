# GitHub Upload Guide for Prover NockApp

## Step-by-Step Instructions

### Step 1: Create Local Project

1. **Create the directory structure:**
   ```bash
   mkdir -p nockup-prover/prover/hoon
   mkdir -p nockup-prover/prover/src
   mkdir -p nockup-prover/prover/web
   mkdir -p nockup-prover/test-data
   cd nockup-prover
   ```

2. **Copy all files from the artifact** into their respective locations:
   - Root level files: `.gitignore`, `LICENSE`, `README.md`, `nockapp.toml`, `rust-toolchain.toml`, `Cargo.toml`
   - `prover/hoon/prover.hoon`
   - `prover/src/main.rs`
   - `prover/web/index.html`, `prover/web/prover.js`, `prover/web/style.css`
   - `test-data/sample-groth16-proof.txt`, `test-data/sample-verification-key.txt`

### Step 2: Initialize Git Repository

```bash
git init
git add .
git commit -m "Initial commit: Prover NockApp for SNARK submission and tracking"
```

### Step 3: Create GitHub Repository

1. Go to: https://github.com/new
2. Fill in the details:
   - **Repository name:** `nockup-prover`
   - **Description:** "SNARK submission and tracking system built on Nockchain"
   - **Visibility:** Public (or Private if you prefer)
   - **DO NOT** initialize with README, .gitignore, or license (we already have these)
3. Click "Create repository"

### Step 4: Connect and Push to GitHub

After creating the repository, GitHub will show you commands. Use these:

```bash
git remote add origin https://github.com/mjohngreene/nockup-prover.git
git branch -M master  # or 'main' depending on your preference
git push -u origin master
```

If you're using `main` as your default branch name:
```bash
git branch -M main
git push -u origin main
```

### Step 5: Verify Upload

Go to `https://github.com/mjohngreene/nockup-prover` and verify that all files are present:
- ✅ README.md shows properly formatted
- ✅ All source files are present
- ✅ License file is visible
- ✅ Correct file structure

### Step 6: Add Repository Topics (Optional but Recommended)

On your GitHub repository page:
1. Click "⚙️" next to "About"
2. Add topics: `nockchain`, `nockapp`, `zero-knowledge`, `snark`, `zk-proof`, `hoon`, `rust`, `blockchain`
3. Save changes

### Step 7: Enable GitHub Pages (Optional)

If you want to host documentation:
1. Go to Settings > Pages
2. Source: Deploy from a branch
3. Branch: master / docs (if you add a docs folder later)

## Alternative: Using GitHub CLI

If you have the GitHub CLI installed (`gh`):

```bash
# Create repo directly from command line
gh repo create nockup-prover --public --source=. --remote=origin --push

# Or if you want to add a description
gh repo create nockup-prover --public --source=. --remote=origin \
  --description "SNARK submission and tracking system built on Nockchain" --push
```

## Troubleshooting

### Authentication Issues

If you get authentication errors:

1. **Using HTTPS:**
   ```bash
   # You may need to use a Personal Access Token
   # Create one at: https://github.com/settings/tokens
   git remote set-url origin https://YOUR_TOKEN@github.com/mjohngreene/nockup-prover.git
   ```

2. **Using SSH (recommended):**
   ```bash
   # Generate SSH key if you don't have one
   ssh-keygen -t ed25519 -C "your.email@example.com"
   
   # Add to GitHub: https://github.com/settings/keys
   
   # Change remote to SSH
   git remote set-url origin git@github.com:mjohngreene/nockup-prover.git
   ```

### Large Files

If you have large files (>100MB), you may need Git LFS:
```bash
git lfs install
git lfs track "*.jam"
git add .gitattributes
git commit -m "Add Git LFS tracking"
```

## Post-Upload Checklist

After uploading to GitHub:

- [ ] Verify README displays correctly
- [ ] Check that all files are present
- [ ] Test clone from GitHub: `git clone https://github.com/mjohngreene/nockup-prover.git`
- [ ] Add repository description and topics
- [ ] Consider adding a banner image or logo
- [ ] Set up branch protection rules (if desired)
- [ ] Enable Issues for bug tracking and feature requests
- [ ] Add CONTRIBUTING.md if you want contributors

## Keeping Your Local and Remote in Sync

After the initial push:

```bash
# Make changes locally
git add .
git commit -m "Description of changes"
git push

# Pull changes from GitHub
git pull
```

## Next Steps After Upload

1. **Share your repository:**
   - Tweet about it with #Nockchain
   - Share in Nockchain Discord/community channels
   - Add to your GitHub profile README

2. **Set up CI/CD (optional):**
   - GitHub Actions for automated testing
   - Automated builds on push

3. **Create releases:**
   ```bash
   git tag -a v0.1.0 -m "Initial release"
   git push origin v0.1.0
   ```

4. **Add badges to README:**
   - Build status
   - License
   - Version
   - Activity level

## Repository URL

Your repository will be available at:
**https://github.com/mjohngreene/nockup-prover**

---

Good luck with your Prover NockApp! 🚀
