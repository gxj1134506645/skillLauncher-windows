# Skill Launcher Windows - 新用户安装指南

## 🚀 超简单安装（2 步完成）

### 第 1 步：安装应用

1. 下载 `Skill Launcher_1.0.0_x64-setup.exe`
2. 双击运行安装（点击"下一步"直到完成）

### 第 2 步：配置 Claude Code 集成

**安装完成后**，双击桌面新增的快捷方式：
```
"配置 Claude Code Skill"
```

或者在项目目录运行：
```powershell
install-skill.bat
```

**完成！** 重启 Claude Code，输入 `/skill-launcher` 即可使用。

---

## ✨ 实际上，更简单...

**如果你是普通用户**：
1. 下载并安装应用
2. 在项目目录找到 `install-skill.bat`
3. 双击运行
4. 完成！

**如果你是开发者**：
1. Clone 项目，`npm run tauri build`
2. 运行 `install-skill.bat`
3. 完成！

---

## 🎯 使用方法

安装配置完成后：
- ✅ 按 `Ctrl+Shift+P` 快速唤起启动器
- ✅ 在 Claude Code 中输入 `/skill-launcher`
- ✅ 智能搜索、排序 skills
- ✅ 一键发送命令到 CLI

---

## 📝 技术说明

**为什么不能全自动？**
- Tauri 安装程序限制，无法在安装时修改外部目录
- 需要用户权限才能写入 `~/.claude/skills/`
- 两步安装更安全、可控

**已经很方便了！**
- 第一步：安装应用（30秒）
- 第二步：配置 skill（10秒）
- 总共不到 1 分钟

---

欢迎关注公众号 **FishTech Notes**，一块交流使用心得
