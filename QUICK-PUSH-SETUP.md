# Quick Commit & Push Setup

Setup ini menyediakan 3 cara untuk membuat commit dan push lebih cepat dan lancar di VS Code.

## 🚀 Solusi 1: Script PowerShell (Paling Fleksibel)

### Usage:

```powershell
# Buka PowerShell di project root, kemudian:

# Commit & push dengan pesan default "Update"
.\quick-push.ps1

# Commit & push dengan custom message
.\quick-push.ps1 "Your commit message"
```

### Fitur:

- ✅ Otomatis stage semua changes
- ✅ Commit dengan pesan custom atau default
- ✅ Push ke origin/main
- ✅ Menampilkan status perubahan
- ✅ Error handling yang jelas

---

## 🎹 Solusi 2: Keyboard Shortcut di VS Code (Tercepat)

### Setup Keybinding:

**Opsi A: Autoimport keybindings (Recommended)**

1. Buka Command Palette: `Ctrl+Shift+P`
2. Ketik: `Preferences: Open Keyboard Shortcuts (JSON)`
3. Tambahkan keybindings dari `.vscode/keybindings-quick-push.json` ke file tersebut

**Opsi B: Manual Setup**

1. File → Preferences → Keyboard Shortcuts
2. Search: "Quick Commit & Push"
3. Klik icon "Add Keybinding" dan set shortcut

### Keyboard Shortcuts:

- **`Ctrl+Shift+G`** → Quick Commit & Push (dengan pesan default "Update")
- **`Ctrl+Shift+Alt+G`** → Quick Commit & Push (tanya pesan commit)

---

## 🏗️ Solusi 3: VS Code Tasks (Terintegrasi)

Task sudah dikonfigurasi di `.vscode/tasks.json`

### Usage di VS Code:

1. Buka Command Palette: `Ctrl+Shift+P`
2. Ketik: `Tasks: Run Task`
3. Pilih:
   - **"Quick Commit & Push"** → commit dengan pesan default
   - **"Quick Commit & Push (With Message)"** → tanya pesan commit

Atau gunakan keyboard shortcut (jika sudah setup keybindings).

---

## 🔐 Solusi 4: Git Credentials Helper (Otomatis)

Credentials helper sudah disetup, sehingga:

- ✅ GitHub password disimpan aman di Windows Credential Manager
- ✅ Tidak perlu input password setiap kali push
- ✅ Proses push lebih cepat

Jika belum berhasil push pertama kali, maka Windows akan minta login GitHub sekali, dan setelah itu otomatis.

---

## 📋 Quick Checklist

- [ ] PowerShell script ready: `./quick-push.ps1` ✅
- [ ] Batch script ready: `./quick-push.bat` ✅
- [ ] VS Code tasks configured: `./.vscode/tasks.json` ✅
- [ ] Git credentials helper enabled ✅

---

## 🎯 Recommended Workflow

**Untuk commit & push paling cepat:**

1. **Edit file** di VS Code
2. **Tekan `Ctrl+Shift+G`** (atau keyboard shortcut pilihan Anda)
3. **Selesai!** Changes ter-commit dan ter-push otomatis

**Atau via Command Palette:**

1. **`Ctrl+Shift+P`** → `Tasks: Run Task` → `Quick Commit & Push`

---

## 🔧 Troubleshooting

### "Git command not found"

- Pastikan Git sudah terinstall dan ada di system PATH
- Cek: Buka PowerShell, ketik `git --version`

### "Keybinding tidak bekerja"

- Pastikan keybindings sudah ditambahkan ke `C:\Users\{username}\AppData\Roaming\Code\User\keybindings.json`
- Restart VS Code setelah menambahkan keybindings

### "Push gagal (auth error)"

- Buka Command Palette → `Git: Terminal`
- Jalankan: `git push origin main`
- Windows akan minta login GitHub, login sekali saja
- Setelah itu otomatis tersimpan di Credential Manager

---

## ⚙️ Customization

### Ubah pesan commit default:

Edit `quick-push.ps1` atau `quick-push.bat`, ubah `"Update"` menjadi pesan favorit Anda.

### Ubah branch:

Edit script, ubah `main` menjadi branch name yang diinginkan.

### Ubah keyboard shortcut:

Edit `.vscode/keybindings-quick-push.json` dengan shortcut favorit Anda.

---

**Happy committing! 🚀**
