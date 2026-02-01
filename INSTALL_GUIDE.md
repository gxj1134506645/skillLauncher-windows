# Skill Launcher Windows - 新用户安装指南

## 🎯 3 步完成安装和集成

### 第 1 步：下载安装

1. 访问：https://github.com/gxj1134506645/skillLauncher-windows/releases
2. 下载：`Skill Launcher_1.0.0_x64-setup.exe`
3. 双击运行安装程序

**默认安装位置**：
```
C:\Users\你的用户名\AppData\Local\Programs\skill-launcher
```

---

### 第 2 步：配置 Claude Code Skill（自动）

首次运行 Skill Launcher 应用时，会自动安装全局 skill 到：
```
%USERPROFILE%\.claude\skills\skill-launcher
```
无需手动复制任何文件。

---

### 第 3 步：测试

1. **完全重启** Claude Code CLI
2. 输入命令：
   ```
   /skill-launcher
   ```
3. 应该会看到应用窗口弹出！

---

## 📦 完整安装流程详解

### 新用户完整流程

```
下载 setup.exe
    ↓
双击安装（自动安装到固定位置）
    ↓
首次运行应用（自动配置 skill）
    ↓
重启 Claude Code
    ↓
输入 /skill-launcher ✅
```

---

## 🤔 常见问题

### Q1: 我不想安装在默认位置，可以吗？

**A**: 可以！但需要设置环境变量：

```powershell
# 设置自定义路径
setx SKILL_LAUNCHER_PATH "你的自定义路径"
```

### Q2: 输入 `/skill-launcher` 还是没反应？

**A**: 确认你已经运行过一次 Skill Launcher 应用（自动安装全局 skill）。

### Q3: 输入 `/skill-launcher` 没反应？

**A**: 检查以下几点：
1. 应用是否已安装？
2. skill 文件是否在正确位置？
3. 是否重启了 Claude Code？

---

## 🔍 验证安装

### 检查应用是否安装
```powershell
Test-Path "$env:LOCALAPPDATA\Programs\skill-launcher\skill-launcher.exe"
```
应该返回 `True`

### 检查 skill 是否配置
```powershell
Test-Path "$env:USERPROFILE\.claude\skills\skill-launcher\SKILL.md"
```
应该返回 `True`

---

## 🎉 完成！

安装完成后，你可以：

- ✅ 使用 `Ctrl+Alt+Space` 快速唤起启动器（可在设置里修改）
- ✅ 搜索和选择 skills
- ✅ 按 Enter 复制 `/skill-name` 到剪贴板
- ✅ 自动记录使用频率，智能排序

---

欢迎关注公众号 **FishTech Notes**，一块交流使用心得
