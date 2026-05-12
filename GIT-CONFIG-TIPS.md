# ⚙️ Git Configuration untuk Smooth Workflow

File ini berisi Git configuration dan best practices untuk membuat workflow commit & push lebih lancar.

## 🔧 Recommended Git Config

Run commands berikut di PowerShell/Terminal:

```powershell
# Global configuration (untuk semua project)

# 1. Setup Credential Manager (sekali saja, sudah dilakukan)
git config --global credential.helper manager-core

# 2. Setup default branch (modern default)
git config --global init.defaultBranch main

# 3. Setup push default (push current branch)
git config --global push.default current

# 4. Auto-setup tracking branch
git config --global push.autoSetupRemote true

# 5. Rebase on pull (cleaner history)
git config --global pull.rebase true

# 6. Setup editor for commit messages (gunakan VS Code)
git config --global core.editor "code --wait"

# 7. Color output
git config --global color.ui true

# 8. Pretty log alias
git config --global alias.lg "log --graph --abbrev-commit --decorate --format=format:'%C(bold blue)%h%C(reset) - %C(bold green)(%ar)%C(reset) %C(white)%s%C(reset) %C(dim white)- %an%C(reset)%C(bold yellow)%d%C(reset)' --all"
```

## 📋 Per-Project Configuration

Untuk project ini, sudah recommended:

```powershell
# Run di project root (K:\Website\Ertiga)

# Configure user untuk project ini (optional, jika berbeda dari global)
git config user.name "Your Name"
git config user.email "your.email@example.com"

# View config
git config --list
```

## 🔑 GitHub SSH Setup (Optional, tapi Recommended)

Kalau ingin push lebih cepat tanpa password dialog:

### Step 1: Generate SSH Key
```powershell
ssh-keygen -t ed25519 -C "your.email@github.com"
# Press Enter untuk default location
# Enter passphrase (boleh kosong)
```

### Step 2: Add to SSH Agent
```powershell
# Start SSH Agent
Start-Service ssh-agent

# Add key
ssh-add $env:USERPROFILE\.ssh\id_ed25519
```

### Step 3: Add to GitHub
1. Copy public key: `type $env:USERPROFILE\.ssh\id_ed25519.pub | clip`
2. Go to GitHub Settings → SSH and GPG keys
3. New SSH key → Paste → Save

### Step 4: Change Remote URL
```powershell
cd K:\Website\Ertiga
git remote set-url origin git@github.com:igarsdev/Ertiga.git

# Verify
git remote -v
```

**Benefit:** Push tidak perlu input password, lebih cepat dan aman!

## 📊 Useful Git Aliases

Tambahkan aliases untuk shortcuts:

```powershell
# Fast status
git config --global alias.st "status"

# Stage semua
git config --global alias.aa "add ."

# Commit dengan message
git config --global alias.cm "commit -m"

# Commit dan push
git config --global alias.cap "!git add . && git commit -m && git push"

# View log yang cantik
git config --global alias.lg "log --graph --abbrev-commit --decorate --format=format:'%C(bold blue)%h%C(reset) - %C(bold green)(%ar)%C(reset) %C(white)%s%C(reset) %C(dim white)- %an%C(reset)%C(bold yellow)%d%C(reset)' --all"
```

Usage:
```powershell
git st              # status
git aa              # add .
git cm "message"    # commit -m "message"
git cap "msg"       # commit, add, push all in one
```

## ⚡ One-Liner Commit & Push

Jika suka terminal commands, gunakan:

```powershell
# Method 1: Menggunakan alias
git config --global alias.push-all "!git add . && git commit -m '$1' && git push"
# Usage: git push-all "Your message"

# Method 2: Direct command
git add . && git commit -m "message" && git push origin main

# Method 3: Gunakan quick-push script
.\quick-push.ps1 "message"
```

## 🔐 Store Credentials Securely

### Windows Credential Manager (Sudah Setup)
```powershell
# Check stored credentials
cmdkey /list

# Delete if needed
cmdkey /delete:https://github.com
```

### GitHub Personal Access Token
1. GitHub Settings → Developer settings → Personal access tokens
2. Generate new token
3. Give scope: `repo` (Full control of private repositories)
4. Copy token
5. When Git asks for password, paste token

## 📈 Performance Tips

### Disable auto-GC untuk folder besar
```powershell
cd K:\Website\Ertiga
git config core.autogc false
```

### Pack objects untuk faster push
```powershell
git gc --aggressive
```

### Shallow clone untuk project besar (optional)
```powershell
# Clone only recent history
git clone --depth 1 https://github.com/igarsdev/Ertiga.git
```

## 🎯 Recommended Workflow dengan Setup Ini

```powershell
# 1. Edit files
# 2. Save di VS Code
# 3. Press Ctrl+Shift+G
# 4. Done! Auto commit & push dengan "Update"

# Atau untuk custom message:
# 1. Edit files
# 2. Save di VS Code
# 3. Press Ctrl+Shift+Alt+G
# 4. Type commit message
# 5. Done!
```

## ✅ Verify Setup

Check semua config:
```powershell
git config --list | findstr /i "push pull credential"
```

Output seharusnya:
```
push.default=current
push.autoSetupRemote=true
pull.rebase=true
credential.helper=manager-core
```

---

## 🆘 Troubleshooting Git Config

### SSH key tidak bekerja
```powershell
# Test connection
ssh -T git@github.com

# Debug
ssh -vT git@github.com
```

### Credential tidak tersimpan
```powershell
# Check credential helper
git config credential.helper

# Reset ke manager-core
git config --global credential.helper manager-core
```

### Push timeout
```powershell
# Increase timeout
git config --global http.postBuffer 524288000

# Disable SSL verify (not recommended)
git config --global http.sslVerify false
```

---

**Happy committing dengan smooth workflow! 🚀**
