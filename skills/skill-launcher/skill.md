---
command: "launch.bat"
---

# Skill Launcher for Windows

一个 Windows 版本的 Claude Code Skills 快速启动器。通过全局快捷键快速启动和执行 Claude Code Skills。

A Windows launcher for Claude Code Skills. Launch and execute skills quickly via global hotkey.

## 功能特性 / Features

- **全局快捷键** - `Ctrl+Shift+P` 随时唤起窗口
- **智能搜索** - 模糊匹配 skills，最近使用的自动排前面
- **自动扫描** - 自动读取 `~/.claude/skills/` 里的所有 skills
- **键盘操作** - 支持上下键选择，回车执行，ESC 关闭

## 安装方法 / Installation

### 前置要求 / Prerequisites

- Windows 11
- Node.js 18+
- Rust (用于编译 Tauri)
- Claude Code CLI

### 安装步骤

1. **Clone 项目到当前目录**
   ```bash
   git clone https://github.com/yourusername/skillLauncher-windows.git
   cd skillLauncher-windows
   ```

2. **安装依赖**
   ```bash
   npm install
   ```

3. **编译 Tauri 应用**
   ```bash
   npm run tauri build
   ```

4. **复制 skill 文件到 Claude Code skills 目录**
   ```bash
   # Windows
   xcopy skills\skill-launcher %USERPROFILE%\.claude\skills\skill-launcher\ /E /I /Y
   ```

5. **重启 Claude Code**

6. **启动应用**
   - 在 Claude Code 中输入: `/skill-launcher`
   - 或者直接运行编译后的 exe 文件

## 使用方法 / Usage

### 快捷键 / Hotkeys

- `Ctrl+Shift+P` - 打开/关闭启动器窗口
- `↑` / `↓` - 上下选择 skills
- `Enter` - 执行选中的 skill
- `Esc` - 关闭窗口
- `Tab` - 自动补全 skill 名称

### 输入模式 / Input Modes

1. **搜索模式** - 直接输入关键词搜索
   ```
   commit      -> 搜索包含 "commit" 的 skills
   ```

2. **直接模式** - 输入 `/skill-name` 直接执行
   ```
   /commit     -> 直接执行 commit skill
   ```

3. **任务模式** - 输入 `/skill-name task` 执行带任务
   ```
   /commit fix bug -> 执行 commit skill 并传递任务 "fix bug"
   ```

## 配置 / Configuration

应用配置文件保存在：
```
%APPDATA%\com.skillLauncher.app\skill-usage.json
```

### 使用记录 / Usage Records

应用会自动记录 skills 使用情况，包括：
- 使用次数
- 最后使用时间
- 用于智能排序

## 开发 / Development

### 开发模式运行
```bash
npm run tauri dev
```

### 构建生产版本
```bash
npm run tauri build
```

构建产物位于 `src-tauri/target/release/bundle/`

## 故障排除 / Troubleshooting

### 快捷键不工作？
- 检查是否有其他应用占用了 `Ctrl+Shift+P`
- 尝试以管理员身份运行

### 执行 skill 没反应？
- 检查 skill 命令是否正确
- 查看控制台日志（开发模式下）

### Skills 列表为空？
- 确认 `~/.claude/skills/` 目录存在
- 检查 skill 扫描权限

## 技术栈 / Tech Stack

- **Frontend**: React 18 + TypeScript + Fluent UI
- **Backend**: Tauri 2.0 (Rust)
- **Build**: Vite

## 许可证 / License

MIT License

## 相关链接 / Related Links

- macOS 版本: https://github.com/Ceeon/SkillLauncher
- Claude Code: https://claude.ai/code

---

欢迎关注公众号 **FishTech Notes**，一块交流使用心得
