# Skill Launcher Windows - 安装指南

## 快速安装（推荐）

### 第一步：新建一个文件夹，打开 Claude Code

随便建个文件夹，比如在桌面。

在里面打开 Claude Code。

### 第二步：复制这段话给 Claude

```
帮我安装 SkillLauncher Windows。

要求：
1. Clone 项目：https://github.com/yourusername/skillLauncher-windows.git
2. 进入项目目录
3. 运行 npm install 安装依赖
4. 运行 npm run tauri build 编译应用
5. 把 skills/skill-launcher 目录复制到 %USERPROFILE%\.claude\skills\skill-launcher\
6. 把编译后的 exe 文件路径告诉我
```

Claude 会帮你搞定一切。

### 第三步：首次运行

退出 Claude Code，重新打开。

输入 `/skill-launcher`，它会启动。

首次运行会需要管理员权限（用于注册全局快捷键），点允许。

然后 `Ctrl+Shift+P` 就能用了。

## 手动安装

### 前置要求

1. **安装 Node.js**
   - 下载地址：https://nodejs.org/
   - 需要 Node.js 18 或更高版本

2. **安装 Rust**
   - 下载地址：https://www.rust-lang.org/tools/install
   - Windows 下运行：`rustup-init.exe`

3. **安装 Visual Studio C++ Build Tools**
   - Rust 编译需要
   - 下载地址：https://visualstudio.microsoft.com/visual-cpp-build-tools/

### 安装步骤

```powershell
# 1. Clone 项目
git clone https://github.com/yourusername/skillLauncher-windows.git
cd skillLauncher-windows

# 2. 安装依赖
npm install

# 3. 编译应用
npm run tauri build

# 4. 复制 skill 文件
xcopy skills\skill-launcher %USERPROFILE%\.claude\skills\skill-launcher\ /E /I /Y

# 5. 运行应用
# 编译后的 exe 位于: src-tauri\target\release\skill-launcher-windows.exe
```

### 配置启动路径

编译后，记下 exe 文件的完整路径，例如：
```
C:\Users\YourName\skillLauncher-windows\src-tauri\target\release\skill-launcher-windows.exe
```

在 `skills/skill-launcher/skill.md` 中更新 command 字段为你的实际路径。

## 使用说明

### 快捷键

| 快捷键 | 功能 |
|--------|------|
| `Ctrl+Shift+P` | 打开/关闭启动器 |
| `↑` / `↓` | 上下选择 |
| `Enter` | 执行选中 skill |
| `Esc` | 关闭窗口 |
| `Tab` | 自动补全 skill 名称 |

### 输入模式

1. **搜索模式** - 直接输入关键词
   ```
   commit
   ```

2. **直接模式** - 使用 `/skill-name`
   ```
   /commit
   ```

3. **任务模式** - 使用 `/skill-name task`
   ```
   /commit fix bug
   ```

## 故障排除

### 编译失败

1. 确保 Node.js 版本 >= 18
2. 确保 Rust 正确安装：`rustc --version`
3. 安装 Visual Studio C++ Build Tools

### 快捷键不工作

1. 以管理员身份运行应用
2. 检查是否有其他应用占用快捷键
3. 在设置中修改快捷键

### 执行 skill 没反应

1. 检查 skill 命令路径是否正确
2. 在开发模式下查看控制台日志：`npm run tauri dev`

## 开发模式

```powershell
# 开发模式运行（支持热重载）
npm run tauri dev
```

## 卸载

```powershell
# 1. 关闭应用
# 2. 删除 skill 文件
rmdir /s /q %USERPROFILE%\.claude\skills\skill-launcher

# 3. 删除应用数据
rmdir /s /q %APPDATA%\com.skillLauncher.app
```

---

欢迎关注公众号 **FishTech Notes**，一块交流使用心得
