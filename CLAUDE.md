# Skill Launcher Windows

## Project Overview

**Project Name**: skill-launcher-windows
**Description**: A Windows launcher for Claude Code Skills
**Tech Stack**: Tauri 2.0 + React 18 + TypeScript + Fluent UI + Vite

## Architecture

```
skillLauncher-windows/
├── docs/                    # Documentation
├── src/                     # React frontend source
│   ├── components/          # UI components
│   │   └── SkillList.tsx    # Skill list component
│   ├── hooks/               # Custom React hooks
│   │   ├── useSkills.ts     # Skills loading hook
│   │   └── useKeyboardNavigation.ts
│   ├── types/               # TypeScript types
│   │   └── skill.ts         # Skill type definitions
│   ├── App.tsx              # Main app component
│   ├── main.tsx             # Entry point
│   └── index.css            # Global styles
├── src-tauri/               # Tauri backend (Rust)
│   ├── src/
│   │   ├── main.rs          # Rust entry point
│   │   └── lib.rs           # App initialization
│   ├── Cargo.toml           # Rust dependencies
│   └── tauri.conf.json      # Tauri configuration
├── index.html               # HTML entry
├── package.json             # NPM dependencies
├── tsconfig.json            # TypeScript config
└── vite.config.ts           # Vite config
```

## Key Features

1. **Global Shortcut**: `Ctrl+Shift+Space` to toggle launcher window
2. **Keyboard Navigation**: Arrow keys to navigate, Enter to execute, Escape to hide
3. **Search**: Real-time filtering of skills by name/description
4. **Shell Execution**: Execute Claude Code commands via Tauri shell plugin
5. **Default Skills**: Built-in demo skills (commit, review-pr, explain, etc.)

## Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| @tauri-apps/api | ^2.0.0 | Tauri frontend API |
| @tauri-apps/plugin-global-shortcut | ^2.0.0 | Global hotkey support |
| @tauri-apps/plugin-shell | ^2.0.0 | Shell command execution |
| @fluentui/react-components | ^9.54.0 | UI component library |
| react | ^18.3.1 | Frontend framework |
| yaml | ^2.4.0 | YAML config parsing |

## Development Commands

```bash
# Install dependencies
npm install

# Start development server
npm run tauri dev

# Build for production
npm run tauri build
```

## Current Progress

- [x] Project initialization
- [x] Source code structure setup
- [x] Core functionality (skill management, global shortcut, shell integration)
- [x] UI development (launcher window, skill list, search, keyboard navigation)
- [ ] Testing and optimization
- [ ] Settings panel
- [ ] Dark/Light theme support
- [ ] Windows installer configuration
