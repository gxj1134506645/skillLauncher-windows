# Skill Launcher Windows - 用户安装指南

## 🚀 快速开始（3 步完成）

### 步骤 1：下载安装

1. 前往 [Releases 页面](https://github.com/gxj1134506645/skillLauncher-windows/releases/latest)
2. 下载 `Skill Launcher_1.0.0_x64-setup.exe`
3. 双击安装

### 步骤 2：首次运行（自动配置）

首次运行应用会自动将全局 skill 配置到：
```
%USERPROFILE%\.claude\skills\skill-launcher\
```

包含文件：
- `SKILL.md` - Skill 定义
- `launch.bat` - 启动脚本（自动查找已安装的 exe）

### 步骤 3：重启 Claude Code

完全退出 Claude Code 并重新打开，然后输入：
```
/skill-launcher
```

---

## 📦 两种安装方式

### 方式 A：完整安装（推荐给普通用户）

**适合**：只想使用启动器的用户

**步骤**：
1. 下载并运行 `Skill Launcher_1.0.0_x64-setup.exe`
2. 默认安装到：`C:\Users\YourName\AppData\Local\Programs\skill-launcher`
3. ✅ Skill 自动配置到 Claude Code
4. 重启 Claude Code，使用 `/skill-launcher`

**卸载**：
- 通过"控制面板"或"设置 → 应用"卸载

---

### 方式 B：便携版（推荐给开发者）

**适合**：想要源代码或自定义配置的用户

**步骤**：
1. 下载源代码或 ZIP 包
2. 解压到任意目录（如 `F:\skillLauncher-windows`）
3. 设置环境变量：
   ```powershell
   setx SKILL_LAUNCHER_PATH "F:\skillLauncher-windows"
   ```
4. 运行 `npm run tauri build` 编译
5. 运行一次应用（自动配置）
6. 重启 Claude Code

---

## 🔧 配置说明

### launch.bat 的智能查找机制

启动脚本会按以下顺序查找 `skill-launcher.exe`：

1. **用户应用目录**（推荐位置）
   ```
   %LOCALAPPDATA%\Programs\skill-launcher\skill-launcher.exe
   ```

2. **程序文件目录**（系统安装）
   ```
   %PROGRAMFILES%\Skill Launcher\skill-launcher.exe
   ```

3. **用户目录**
   ```
   %USERPROFILE%\AppData\Local\skill-launcher\skill-launcher.exe
   ```

4. **开发环境**（仅开发者）
   ```
   %SKILL_LAUNCHER_PATH%\src-tauri\target\release\skill-launcher.exe
   ```
5. **当前项目目录**（开发调试）
   ```
   %CD%\src-tauri\target\debug\skill-launcher.exe
   ```

---

## 🛠️ 故障排除

### 问题 1：输入 `/skill-launcher` 没反应

**原因**：未运行过应用，自动配置未完成

**解决**：先启动一次 Skill Launcher 应用，再重启 Claude Code。

### 问题 2：找不到 exe 文件

**原因**：安装路径不正确

**解决**：
1. 检查应用是否已安装
2. 手动设置路径：创建 `launch.bat` 指向正确位置

---

## 📝 开发者说明

如果你想从源代码构建：

```powershell
# 1. Clone 项目
git clone https://github.com/gxj1134506645/skillLauncher-windows.git
cd skillLauncher-windows

# 2. 安装依赖
npm install

# 3. 编译
npm run tauri build

# 4. 运行一次应用（自动配置）
# 5. 重启终端并测试
```

---

欢迎关注公众号 **FishTech Notes**，一块交流使用心得
