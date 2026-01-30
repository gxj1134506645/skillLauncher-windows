# SkillLauncher Windows

Windows 版 Claude Code Skills 快速启动器，灵感来自 [SkillLauncher (macOS)](https://github.com/Ceeon/SkillLauncher)。

[![Download](https://img.shields.io/badge/Download-Latest-blue)](https://github.com/gxj1134506645/skillLauncher-windows/releases/latest) ![Skill Launcher](https://img.shields.io/badge/Platform-Windows-blue) ![Tauri](https://img.shields.io/badge/Tauri-2.0-orange) ![License](https://img.shields.io/badge/License-MIT-green)

## 🚀 超简单安装（3 步完成）

### 1️⃣ 下载
前往 [Releases 页面](https://github.com/gxj1134506645/skillLauncher-windows/releases/latest) 下载：
```
Skill Launcher_1.0.0_x64-setup.exe
```

### 2️⃣ 安装
双击 `setup.exe`，点击"下一步"直到安装完成。

**应用会在首次启动时自动配置 Claude Code skill！** ✨

### 3️⃣ 使用
完全退出 **Claude Code**，重新打开，输入：
```
/skill-launcher
```

---

## ✨ 功能特性

- **全局快捷键** - `Ctrl+Shift+P` 随时唤起，不打断工作流
- **智能搜索** - 输入关键词，模糊匹配 skills
- **智能排序** - 常用的 skills 自动排在前面
- **键盘导航** - `↑↓` 选择，`Enter` 执行，`Esc` 隐藏
- **自动配置** - 首次启动自动配置 Claude Code skill
- **使用记录** - 记录使用频率，智能排序

---

## 🎯 使用方法

### 启动方式

**方式 1：Claude Code CLI（推荐）**
```
/skill-launcher
```

**方式 2：全局快捷键**
按 `Ctrl+Shift+P`

**方式 3：桌面快捷方式**
双击桌面图标

---

## 🎮 快捷键

| 快捷键 | 功能 |
|--------|------|
| `Ctrl+Shift+P` | 打开/关闭启动器 |
| `↑` / `↓` | 上下选择 |
| `Enter` | 发送到 Claude Code CLI |
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
