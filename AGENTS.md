# AGENTS.md - skill-launcher-windows

## 项目概览
- 名称: skill-launcher-windows
- 目标: Windows 版 Claude Code Skills 启动器
- 技术栈: Tauri 2 + React 18 + TypeScript + Fluent UI + Vite

## 目录结构（简要）
- src/: React 前端
- src-tauri/: Tauri/Rust 后端
- docs/: 文档
- skills/: 内置/示例技能

## 常用命令（PowerShell 7.5）
```powershell
npm install
npm run tauri dev
npm run tauri build
```

## 运行方式
- 开发: `npm run tauri dev`
- 生产: `npm run tauri build`

## 代码约定
- TypeScript/React 组件放在 `src/`，Rust 代码在 `src-tauri/`。
- UI 使用 Fluent UI 组件，避免重复造轮子。
- 新增功能优先考虑键盘交互与快捷键路径。

## 设计目标
- 以“键盘优先”的启动器体验为核心
- 支持技能搜索、选择与执行
- 对齐原版 macOS：优先在终端内触发搜索与选择，再决定是否唤起桌面 UI

## 备注
- 默认系统: Windows 11
- 默认终端: PowerShell 7.5

## 关于 Skill 的定位（建议）
- `skill-launcher` 建议作为“项目级 skill”，而不是全局 skill。
- 原因: 不同项目可能有自定义 skill，启动器应以项目为作用域进行发现与筛选。

## 技能发现范围（建议）
- 项目内优先: `./skills/`、`./.codex/skills/`、`./.claude/skills/`（如存在）。
- 其次考虑: 用户全局 skills 目录（仅在项目未定义或用户明确要求时启用）。
- 发现顺序: 项目级 > 工作区级 > 用户全局（同名 skill 以靠前范围为准）。

## 终端触发体验（建议）
- 提供 PowerShell 命令入口（如 `skill-launcher` 或 `sl`）。
- 终端触发时优先在终端内完成搜索/选择，必要时再唤起窗口。
