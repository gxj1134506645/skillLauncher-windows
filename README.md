# SkillLauncher Windows

Windows 版 Claude Code Skills 快速启动器，灵感来自 [SkillLauncher (macOS)](https://github.com/Ceeon/SkillLauncher)。

![Skill Launcher](https://img.shields.io/badge/Platform-Windows-blue) ![Tauri](https://img.shields.io/badge/Tauri-2.0-orange) ![License](https://img.shields.io/badge/License-MIT-green)

## 功能特性

- **全局快捷键** - `Ctrl+Shift+P` 随时唤起，不打断工作流
- **智能搜索** - 输入几个字母，模糊匹配 Skill
- **自动读取** - 扫描 `~/.claude/skills/` 目录下所有 Skill
- **键盘导航** - 方向键选择，回车执行，Escape 隐藏
- **实时输出** - 执行结果实时显示

## 安装方法

### 方法一：通过 Claude Code 安装（推荐）

1. 新建一个文件夹，打开 Claude Code
2. 复制以下内容给 Claude：

```
帮我安装 SkillLauncher Windows 版。

地址：https://github.com/gxj1134506645/skillLauncher-windows

要求：
1. clone 到当前目录
2. 安装依赖：npm install
3. 编译：npm run tauri build
4. 把 skillLauncher-windows/skills 里的内容复制到 ~/.claude/skills/
```

3. Claude 会帮你完成安装

### 方法二：手动安装

```powershell
# 1. 克隆仓库
git clone https://github.com/gxj1134506645/skillLauncher-windows.git
cd skillLauncher-windows

# 2. 安装依赖
npm install

# 3. 编译
npm run tauri build

# 4. 复制 skills 到 Claude 目录
Copy-Item -Path ".\skills\*" -Destination "$env:USERPROFILE\.claude\skills\" -Recurse
```

编译完成后，可执行文件位于 `src-tauri/target/release/skill-launcher.exe`

## 使用方法

### 首次运行

退出 Claude Code，重新打开，输入 `/skill-launcher`

### 日常使用

- `Ctrl+Shift+P` 唤起窗口
- 输入 skill 名字（支持模糊搜索）+ 任务指令
- 回车执行
- `Escape` 隐藏窗口

## 开发

```powershell
# 安装依赖
npm install

# 开发模式
npm run tauri dev

# 构建发布版
npm run tauri build
```

## 技术栈

- **前端**: React 18 + TypeScript + Fluent UI
- **后端**: Tauri 2.0 (Rust)
- **构建**: Vite

## 项目结构

```
skillLauncher-windows/
├── src/                     # React 前端源码
│   ├── components/          # UI 组件
│   ├── hooks/               # React Hooks
│   ├── types/               # TypeScript 类型
│   └── App.tsx              # 主组件
├── src-tauri/               # Tauri 后端 (Rust)
│   ├── src/                 # Rust 源码
│   └── tauri.conf.json      # Tauri 配置
├── skills/                  # Claude Code Skills
│   └── skill-launcher.md    # 启动器 Skill
└── package.json
```

## 相关项目

- [SkillLauncher (macOS)](https://github.com/Ceeon/SkillLauncher) - 原版 macOS 启动器
- [Claude Code](https://claude.ai/code) - Anthropic 官方 CLI

## License

MIT
