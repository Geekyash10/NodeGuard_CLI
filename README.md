# 🧠 NodeGuard CLI

NodeGuard is a powerful CLI tool to analyze and safely clean `node_modules` folders in your workspace.

## ✨ Features

- 📦 Scan all `node_modules` recursively
- 📊 Show total disk usage
- 🧹 Clean by project name
- ⏳ Clean by age
- 🛡 Dry run mode
- 🎨 Interactive TUI Dashboard
- 🔍 Search filtering
- 📈 Sorted by size (largest first)
- 🎯 Multi-select delete

---

## 📦 Installation (Local Development)

```bash
git clone <repo>
cd NodeGuard_CLI
npm install
npm run build
npm link
```

Now use globally:

```bash
nodeguard scan .
nodeguard clean MyProject
nodeguard clean --older-than 90
nodeguard ui
```

---

## 🎮 Interactive Mode

Launch:

```bash
nodeguard ui
```

Controls:

- ↑ ↓ Navigate
- SPACE Select
- ENTER Delete
- / Search
- Q Exit

---

## 🛡 Safety

NodeGuard:
- Never auto deletes
- Always asks confirmation
- Supports dry-run mode

---

## 🛠 Built With

- TypeScript
- Commander
- Blessed (TUI)
- fs-extra