# SkillLauncher Windows

Windows 版 Claude Code Skills 快速启动器，灵感来自 [SkillLauncher (macOS)](https://github.com/Ceeon/SkillLauncher)。

[![Download](https://img.shields.io/badge/Download-Latest-blue)](https://github.com/gxj1134506645/skillLauncher-windows/releases/latest) ![Skill Launcher](https://img.shields.io/badge/Platform-Windows-blue) ![Tauri](https://img.shields.io/badge/Tauri-2.0-orange) ![License](https://img.shields.io/badge/License-MIT-green)

## 🚀 新用户快速上手（GUI）

### 1️⃣ 获取项目
```powershell
git clone https://github.com/gxj1134506645/skillLauncher-windows.git
cd skillLauncher-windows
```

### 2️⃣ 启动应用（自动安装全局 skill）
```powershell
npm install
npm run tauri dev
```
应用首次启动会自动安装全局 skill 到 `~/.claude/skills/skill-launcher/`。

---

## 🪟 安装版（可选）
### 1️⃣ 下载并安装
前往 [Releases 页面](https://github.com/gxj1134506645/skillLauncher-windows/releases/latest) 下载：
```
Skill Launcher_1.0.0_x64-setup.exe
```
双击安装。

### 2️⃣ 使用 /skill-launcher
重新打开 Claude Code CLI，输入：
```
/skill-launcher
```
会启动 Skill Launcher GUI。

---

## ✨ 功能特性

- **全局 skill** - 安装一次，所有项目可用
- **项目级优先** - 项目内 skills 优先于全局 skills
- **智能搜索** - 输入关键词，模糊匹配 skills
- **点击复制** - 点击 skill 直接复制 `/skill-name`

---

## 🎯 使用方法
在 Claude Code 里输入：
```
/skill-launcher
```
点击任意 skill，会将 `/skill-name` 复制到剪贴板，回到 CLI 粘贴即可。

---

## 🎮 GUI 快捷键

| 快捷键 | 功能 |
|--------|------|
| `Ctrl+Alt+Space` | 打开/关闭启动器（可在设置里修改） |
| `↑` / `↓` | 上下选择 |
| `Enter` | 复制到剪贴板 |
| `Esc` | 关闭窗口 |
| `Tab` | 自动补全 skill 名称 |

---

## 🛠️ 开发

```powershell
# 安装依赖
npm install

# 开发模式
npm run tauri dev

# 构建发布版
npm run tauri build
```

## 📦 技术栈

- **前端**: React 18 + TypeScript + Fluent UI
- **后端**: Tauri 2.0 (Rust)
- **构建**: Vite

---

欢迎关注公众号 **FishTech Notes**，一块交流使用心得
