# GitHub Release 发布指南

## 📋 发布前检查清单

- [ ] 所有代码已提交到 Git
- [ ] 版本号已更新（package.json, tauri.conf.json）
- [ ] 构建成功无错误
- [ ] 测试基本功能正常
- [ ] 更新了 RELEASE_NOTES.md

## 🚀 发布步骤

### 1. 创建 Git Tag

```bash
# 确保在 main 分支
git checkout main

# 创建标签
git tag -a v1.0.0 -m "Release v1.0.0"

# 推送标签到 GitHub
git push origin v1.0.0
```

### 2. 在 GitHub 上创建 Release

1. 访问仓库的 **Releases** 页面
2. 点击 **Create a new release**
3. 填写以下信息：

#### Release 信息

- **Tag**: 选择 `v1.0.0`
- **Title**: `🎉 v1.0.0 - Skill Launcher Windows 首次发布`
- **Description**: 复制 `RELEASE_NOTES.md` 的内容

#### 上传附件

上传以下文件（位于 `src-tauri/target/release/bundle/`）：

| 文件 | 说明 | 推荐度 |
|------|------|--------|
| `nsis/Skill Launcher_1.0.0_x64-setup.exe` | NSIS 安装包 | ⭐⭐⭐⭐⭐ |
| `msi/Skill Launcher_1.0.0_x64_en-US.msi` | MSI 安装包 | ⭐⭐⭐⭐ |

#### 设置

- ✅ **Set as the latest release** (勾选)
- ⬜ **Set as a pre-release** (不勾选)

### 3. 发布

点击 **Publish release** 按钮

## 📢 发布后宣传

### 更新 README

确保 README.md 中的下载链接指向最新 Release：

```markdown
## 下载安装

[![Download](https://img.shields.io/badge/Download-Latest-blue)](https://github.com/yourusername/skillLauncher-windows/releases/latest)
```

### 社交媒体宣传

建议渠道：
- Twitter/X
- 微信群
- GitHub Discussions
- Reddit (r/Claude, r/WindowsApps)

宣传模板：

```
🎉 Skill Launcher Windows v1.0.0 发布！

Windows 版 Claude Code Skills 快速启动器来了！

✨ 核心功能：
• Ctrl+Shift+P 全局快捷键唤起
• 智能搜索和排序
• 自动扫描所有 skills
• 键盘快捷操作

📦 下载：https://github.com/yourusername/skillLauncher-windows/releases/latest

#ClaudeCode #Windows #DevTools
```

## 📊 发布后监控

- 关注 GitHub Stars 和 Forks
- 及时回复 Issues 和 Discussions
- 收集用户反馈
- 规划下一版本功能

## 🔖 标签命名规范

- `v1.0.0` - 正式发布版本
- `v1.0.1` - Bug 修复版本
- `v1.1.0` - 新功能版本
- `v2.0.0` - 重大更新版本

遵循 [语义化版本](https://semver.org/lang/zh-CN/) 规范。
