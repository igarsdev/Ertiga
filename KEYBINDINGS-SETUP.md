# 🎹 Setup Keybindings untuk Quick Commit & Push

Ikuti langkah-langkah di bawah untuk setup keyboard shortcut di VS Code.

## Step-by-Step Setup

### Step 1: Buka Keybindings File

1. Buka VS Code
2. Tekan **`Ctrl+Shift+P`** (Command Palette)
3. Ketik: **`Preferences: Open Keyboard Shortcuts (JSON)`**
4. Tekan Enter

Atau manual:

- File → Preferences → Keyboard Shortcuts
- Klik icon `{}` di kanan atas untuk switch ke JSON view

### Step 2: Copy Keybindings

Salin kode di bawah dan paste ke file `keybindings.json` yang sudah terbuka:

```json
// Quick Commit & Push Keybindings
{
  "key": "ctrl+shift+g",
  "command": "workbench.action.tasks.runTask",
  "args": "Quick Commit & Push",
  "when": "resourceScheme == file"
},
{
  "key": "ctrl+shift+alt+g",
  "command": "workbench.action.tasks.runTask",
  "args": "Quick Commit & Push (With Message)",
  "when": "resourceScheme == file"
}
```

### Step 3: Save dan Restart

1. Tekan **`Ctrl+S`** untuk save
2. Restart VS Code (atau reload window)

---

## 🎯 Keyboard Shortcuts

Setelah setup, Anda bisa gunakan:

### `Ctrl+Shift+G` - Quick Commit & Push

Commit dengan pesan default "Update" dan langsung push:

```
✔️ Staged semua changes
✔️ Commit dengan pesan "Update"
✔️ Push ke origin/main
```

### `Ctrl+Shift+Alt+G` - Quick Commit & Push (With Message)

Commit dengan custom message:

```
1. Tekan Ctrl+Shift+Alt+G
2. Input pesan commit yang ingin Anda gunakan
3. Enter
4. Done! Commit & Push otomatis
```

---

## ✅ Verification

Untuk memastikan keybindings sudah setup dengan benar:

1. Buka **Command Palette** (`Ctrl+Shift+P`)
2. Search: **`Keybindings: Show Active Keybindings`**
3. Search di list: **`Quick Commit`**
4. Seharusnya muncul 2 keybindings yang sudah Anda setup

---

## 🔄 Alternative: Change Shortcuts

Jika Anda tidak suka shortcuts `Ctrl+Shift+G`, Anda bisa menggantinya dengan:

```json
// Contoh alternative shortcuts:

// Option 1: Lebih simple
"key": "alt+g",

// Option 2: Gunakan Windows key
"key": "meta+shift+c",

// Option 3: Ctrl+Alt+C
"key": "ctrl+alt+c",

// Option 4: F12
"key": "f12",
```

---

## 🆘 Troubleshooting

### "Keybinding tidak bekerja"

**Solution:**

- Pastikan `.vscode/tasks.json` ada di project root
- Pastikan task names di keybindings.json sesuai dengan task di tasks.json
- Restart VS Code setelah save keybindings

### "Command palette shows 'command not found'"

**Solution:**

- Buka Terminal VS Code (`Ctrl+` `` ` ``)
- Run: `git status`
- Jika error, berarti folder bukan git repo
- Jika ok, berarti tasks.json belum ter-load dengan benar, try restart VS Code

### "Keybinding bekerja tapi task tidak run"

**Solution:**

- Buka Command Palette → `Tasks: Run Task`
- Seharusnya muncul task "Quick Commit & Push"
- Jika tidak muncul, berarti `.vscode/tasks.json` tidak valid
- Check file untuk syntax errors (gunakan VS Code JSON validator)

---

## 🚀 Test Keybindings

Setelah setup, Anda bisa test dengan:

1. Edit satu file di project (contoh: ubah file app.js)
2. Save file
3. Tekan **`Ctrl+Shift+G`**
4. Seharusnya:
   - Task runner membuka terminal baru
   - File ter-stage otomatis
   - Commit dengan pesan "Update"
   - Push ke origin/main
   - Terminal menunjukkan success message

---

## 📌 Extra Tips

### Tip 1: Disable keybinding untuk project tertentu

Kalau Anda ingin keybinding ini hanya active di folder tertentu:

```json
{
  "key": "ctrl+shift+g",
  "command": "workbench.action.tasks.runTask",
  "args": "Quick Commit & Push",
  "when": "resourceScheme == file && workspaceFolderCount >= 1"
}
```

### Tip 2: Combine dengan Git lens

Install extension **GitLens** untuk tambahan power:

- Lihat siapa yang edit setiap line
- View commit history
- Blame mode

### Tip 3: Auto-format sebelum commit

Kalau ingin auto-format code sebelum commit, buka `.vscode/tasks.json` dan tambahkan pre-commit task.

---

**Questions? Check QUICK-PUSH-SETUP.md untuk info lengkap!**
