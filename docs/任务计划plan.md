# Skill Launcher Windows - Task Plan

## Project Overview

**Project Name**: skill-launcher-windows
**Description**: A Windows launcher for Claude Code Skills
**Tech Stack**: Tauri 2.0 + React 18 + TypeScript + Fluent UI + Vite

## Current Status

- [x] Project initialization (package.json, tsconfig.json)
- [x] Source code structure setup
- [x] Core functionality implementation (basic)
- [x] UI development (basic)
- [ ] Testing and optimization

---

## Phase 1: Project Structure Setup ✅ COMPLETED

### 1.1 Frontend Structure (src/)

- [x] Create `src/main.tsx` - Application entry point
- [x] Create `src/App.tsx` - Main application component
- [x] Create `src/index.css` - Global styles
- [x] Create `src/vite-env.d.ts` - Vite type declarations
- [x] Create `src/components/SkillList.tsx` - Skill list component
- [x] Create `src/hooks/useSkills.ts` - Skills loading hook
- [x] Create `src/hooks/useKeyboardNavigation.ts` - Keyboard navigation hook
- [x] Create `src/types/skill.ts` - TypeScript type definitions

### 1.2 Tauri Backend Structure (src-tauri/)

- [x] Initialize Tauri project structure
- [x] Configure `tauri.conf.json`
- [x] Setup Rust backend (`main.rs`, `lib.rs`)
- [x] Configure Cargo.toml dependencies

### 1.3 Configuration Files

- [x] Create `vite.config.ts`
- [x] Create `tsconfig.node.json`
- [x] Create `.gitignore`
- [x] Create `index.html`

---

## Phase 2: Core Functionality ✅ COMPLETED (Basic)

### 2.1 Skill Management

- [x] Skill configuration file parsing (YAML format)
- [x] Skill list loading and display
- [x] Skill search and filtering
- [x] Skill execution via shell commands

### 2.2 Global Shortcut

- [x] Register global hotkey (Ctrl+Shift+Space)
- [x] Quick launcher window toggle
- [ ] Hotkey customization support

### 2.3 Shell Integration

- [x] Execute Claude Code commands (using @tauri-apps/plugin-shell)
- [x] Command output handling (console logging)
- [x] Error handling and user feedback

---

## Phase 3: UI Development ✅ COMPLETED (Basic)

### 3.1 Main Window

- [x] Launcher window design (Fluent UI components)
- [x] Skill list component
- [x] Search input component
- [ ] Settings panel

### 3.2 User Experience

- [x] Keyboard navigation support (Arrow keys + Enter)
- [x] Window hide on Escape key
- [x] Loading states and animations
- [ ] Dark/Light theme support

---

## Phase 4: Testing & Optimization

### 4.1 Testing

- [ ] Unit tests for core functions
- [ ] Integration tests for Tauri commands
- [ ] UI component tests

### 4.2 Optimization

- [ ] Build optimization
- [ ] Startup performance
- [ ] Memory usage optimization

### 4.3 Release

- [ ] Windows installer configuration
- [ ] Auto-update mechanism
- [ ] Documentation

---

## Technical Notes

### Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| @tauri-apps/api | ^2.0.0 | Tauri frontend API |
| @tauri-apps/plugin-global-shortcut | ^2.0.0 | Global hotkey support |
| @tauri-apps/plugin-shell | ^2.0.0 | Shell command execution |
| @fluentui/react-components | ^9.54.0 | UI component library |
| react | ^18.3.1 | Frontend framework |
| yaml | ^2.4.0 | YAML config parsing |

### Architecture

```
skillLauncher-windows/
├── docs/                    # Documentation
│   └── 任务计划plan.md      # This file
├── src/                     # React frontend source
│   ├── components/          # UI components
│   │   └── SkillList.tsx    # Skill list component
│   ├── hooks/               # Custom React hooks
│   │   ├── useSkills.ts     # Skills loading hook
│   │   └── useKeyboardNavigation.ts
│   ├── services/            # Business logic (empty)
│   ├── types/               # TypeScript types
│   │   └── skill.ts         # Skill type definitions
│   ├── App.tsx              # Main app component
│   ├── main.tsx             # Entry point
│   ├── index.css            # Global styles
│   └── vite-env.d.ts        # Vite types
├── src-tauri/               # Tauri backend (Rust)
│   ├── src/
│   │   ├── main.rs          # Rust entry point
│   │   └── lib.rs           # App initialization
│   ├── Cargo.toml           # Rust dependencies
│   ├── build.rs             # Build script
│   └── tauri.conf.json      # Tauri configuration
├── index.html               # HTML entry
├── package.json             # NPM dependencies
├── tsconfig.json            # TypeScript config
├── tsconfig.node.json       # Node TypeScript config
├── vite.config.ts           # Vite config
└── .gitignore               # Git ignore rules
```

### Key Features Implemented

1. **Global Shortcut**: `Ctrl+Shift+Space` to toggle launcher window
2. **Keyboard Navigation**: Arrow keys to navigate, Enter to execute, Escape to hide
3. **Search**: Real-time filtering of skills by name/description
4. **Shell Execution**: Execute Claude Code commands via Tauri shell plugin
5. **Default Skills**: Built-in demo skills (commit, review-pr, explain, etc.)

---

## Progress Log

| Date | Task | Status | Notes |
|------|------|--------|-------|
| 2026-01-28 | Project initialization | Done | Basic config files created |
| 2026-01-28 | Task plan created | Done | This document |
| 2026-01-28 | Phase 1 completed | Done | All project structure files created |
| 2026-01-28 | Phase 2 completed | Done | Core functionality implemented |
| 2026-01-28 | Phase 3 completed | Done | Basic UI implemented |

---

## Next Steps

1. **Install dependencies**: Run `npm install` to install all packages
2. **Add Fluent UI icons**: Run `npm install @fluentui/react-icons`
3. **Build and test**: Run `npm run tauri dev` to start development
4. **Add custom skills**: Create `skills.yaml` in app config directory
5. **Implement settings panel**: Allow users to customize hotkeys and themes

---

## How to Run

```bash
# Install dependencies
npm install

# Add missing icon package
npm install @fluentui/react-icons

# Start development server
npm run tauri dev

# Build for production
npm run tauri build
```
