# 🧠 NodeGuard CLI

![npm](https://img.shields.io/npm/v/@geekyashmittal/nodeguard)

NodeGuard is a powerful CLI tool to analyze and safely clean `node_modules` folders in your workspace.

---

## ✨ Features

- 📦 Recursively scan all `node_modules`
- 📊 Show total disk usage
- 🧹 Clean by project name
- ⏳ Clean by age
- 🛡 Dry-run mode (safe preview)
- 🎨 Interactive TUI Dashboard
- 🔍 Live search filtering
- 📈 Sorted by size (largest first)
- 🎯 Multi-select delete with confirmation

---

## 📦 Installation

### Install globally (Recommended)

```bash
npm install -g @geekyashmittal/nodeguard

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