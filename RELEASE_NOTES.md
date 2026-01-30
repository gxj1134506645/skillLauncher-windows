# Skill Launcher Windows - Release Notes

## 🎉 v1.0.0 - 首次发布

这是一个 Windows 版本的 Claude Code Skills 快速启动器，灵感来自 [SkillLauncher (macOS)](https://github.com/Ceeon/SkillLauncher)。

### ✨ 核心功能

- **全局快捷键** - `Ctrl+Shift+P` 随时唤起，不打断工作流
- **智能搜索** - 模糊匹配 skills，最近使用的自动排前面
- **自动扫描** - 自动读取 `~/.claude/skills/` 里的所有 skills
- **键盘导航** - 方向键选择，回车执行，Escape 隐藏
- **智能排序** - 基于使用次数和最近使用时间的权重排序
- **使用记录** - 自动记录 skill 使用情况，持久化存储

### 📦 下载安装

#### 推荐方式（NSIS 安装包）
- **文件**: `Skill Launcher_1.0.0_x64-setup.exe`
- **说明**: 推荐给大多数用户，安装向导友好
- **大小**: 约 15MB
- **系统要求**: Windows 11

#### 备选方式（MSI 安装包）
- **文件**: `Skill Launcher_1.0.0_x64_en-US.msi`
- **说明**: 适合企业部署和静默安装
- **大小**: 约 15MB
- **系统要求**: Windows 11

### 🚀 使用方法

1. **安装应用**
   - 下载 `Skill Launcher_1.0.0_x64-setup.exe`
   - 双击运行，按提示完成安装

2. **配置 Skill**
   - 将 `skills/skill-launcher` 复制到 `%USERPROFILE%\.claude\skills\skill-launcher`
   - 或在 Claude Code 中执行安装命令（见下方）

3. **启动应用**
   - 方式1: 在 Claude Code 中输入 `/skill-launcher`
   - 方式2: 从开始菜单运行 Skill Launcher

4. **使用快捷键**
   - 按 `Ctrl+Shift+P` 唤起窗口
   - 输入 skill 名字搜索
   - 按 `Enter` 发送到 Claude Code CLI
   - 按 `Esc` 隐藏窗口

### 🔧 技术栈

- **前端**: React 18 + TypeScript + Fluent UI
- **后端**: Tauri 2.0 (Rust)
- **构建**: Vite

### 📝 开源协议

MIT License

### 🙏 致谢

- 原版 macOS 项目: [SkillLauncher by Ceeon](https://github.com/Ceeon/SkillLauncher)
- [Claude Code](https://claude.ai/code) - Anthropic 官方 CLI

---

欢迎关注公众号 **FishTech Notes**，一块交流使用心得

### 📮 反馈与支持

- **Issues**: [GitHub Issues](https://github.com/yourusername/skillLauncher-windows/issues)
- **讨论**: [GitHub Discussions](https://github.com/yourusername/skillLauncher-windows/discussions)
