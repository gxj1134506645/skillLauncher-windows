# Skill Launcher Windows - 新用户安装指南

## 🚀 超简单安装（2 步完成）

### 第 1 步：安装应用

1. 下载 `Skill Launcher_1.0.0_x64-setup.exe`
2. 双击运行安装（点击"下一步"直到完成）

### 第 2 步：首次运行（自动配置）

首次运行 Skill Launcher 应用会自动安装全局 skill。  
**完成！** 重启 Claude Code，输入 `/skill-launcher` 即可使用。

---

## ✨ 实际上，更简单...

**如果你是普通用户**：
1. 下载并安装应用
2. 启动一次应用（自动配置）
3. 完成！

**如果你是开发者**：
1. Clone 项目，`npm run tauri build`
2. 运行一次应用（自动配置）
3. 完成！

---

## 🎯 使用方法

安装配置完成后：
- ✅ 按 `Ctrl+Alt+Space` 快速唤起启动器（可在设置里修改）
- ✅ 在 Claude Code 中输入 `/skill-launcher`
- ✅ 智能搜索、排序 skills
- ✅ 点击复制 `/skill-name` 到剪贴板

---

## 📝 技术说明

**为什么要首次运行？**
- 需要用户权限写入 `~/.claude/skills/`
- 首次运行会自动完成配置

---

欢迎关注公众号 **FishTech Notes**，一块交流使用心得
