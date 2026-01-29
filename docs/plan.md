# Skill Launcher Windows - 完整实施计划

## Project Overview

**Project Name**: skill-launcher-windows
**Description**: Windows 版本的 Claude Code Skills 快速启动器（对齐 macOS 版功能）
**Tech Stack**: Tauri 2.0 + React 18 + TypeScript + Fluent UI + Vite
**GitHub**: https://github.com/gxj1134506645/skillLauncher-windows

---

## 当前状态 (Current Status)

### ✅ 已完成（基础版本 - v0.1）

- [x] 项目初始化（package.json, tsconfig.json）
- [x] 源代码结构搭建
- [x] 核心功能实现（基础版）
  - [x] 从 YAML 配置文件加载演示 skills
  - [x] 全局快捷键（默认 Ctrl+Alt+Space，可自定义）
  - [x] Shell 命令执行（`cmd /c claude /commit`）
  - [x] 基础 UI（搜索框、技能列表、设置对话框）
- [x] 键盘导航（上下箭头、Enter 执行、Esc 关闭）

### ❌ 核心缺失（需要实现 - v1.0）

- [ ] **扫描 `~/.claude/skills/` 目录**（替换 YAML 配置）
- [ ] **支持 "skill + 任务指令" 输入**（例如：`/commit 修复登录bug`）
- [ ] **实时显示 CLI 输出**（当前只是 console.log）
- [ ] **集成到 Claude Code**（创建 `/skill-launcher` skill）
- [ ] Windows 原生优化（系统托盘、开机自启动、通知）

---

## Phase 1: Skill 目录扫描与解析（1-2天）🚧 IN PROGRESS

### 目标
替换当前的 YAML 配置加载机制，改为扫描 `~/.claude/skills/` 目录并解析 SKILL.md 文件。

### 实施步骤

#### 1.1 创建 SkillScanner 服务

**文件**: `src/services/skillScanner.ts`（新建）

**功能**:
- 扫描 `~/.claude/skills/` 目录
- 解析每个 skill 子目录中的 `SKILL.md` 文件
- 提取 Front Matter（name, description, category）
- 容错处理：单个 skill 失败不影响整体加载

**核心代码结构**:
```typescript
import { readDir, BaseDirectory, readTextFile } from "@tauri-apps/plugin-fs";
import { join } from "@tauri-apps/api/path";
import { homeDir } from "@tauri-apps/api/path";
import type { Skill } from "../types/skill";

export class SkillScanner {
  private readonly SKILLS_DIR = ".claude/skills";

  async scanSkills(): Promise<Skill[]>
  private async parseSkillDir(skillName: string): Promise<Skill | null>
  private parseSkillMd(content: string): { frontMatter, description }
}
```

**关键技术点**:
- 使用 `@tauri-apps/plugin-fs` 读取目录（支持 Windows 路径）
- 使用 `@tauri-apps/api/path` 处理路径拼接
- 并行解析：`Promise.all()` 提升性能
- 简单的 YAML 解析（仅支持 key: value 格式，避免引入重级库）

**测试用例**:
```bash
# 测试数据
~/.claude/skills/
├── commit/
│   └── SKILL.md
├── review-pr/
│   └── SKILL.md
└── explain/
    └── SKILL.md
```

#### 1.2 修改 useSkills Hook

**文件**: `src/hooks/useSkills.ts`（修改）

**修改内容**:
```typescript
// 删除：loadSkillsFromConfig() 函数
// 添加：使用 SkillScanner
import { SkillScanner } from "../services/skillScanner";

export function useSkills() {
  const [skills, setSkills] = useState<Skill[]>([]);

  useEffect(() => {
    const scanner = new SkillScanner();
    scanner.scanSkills().then(setSkills);
  }, []);

  return { skills, loading, error };
}
```

**保留功能**:
- `getDefaultSkills()` 作为回退方案（扫描失败时使用）
- 错误处理和加载状态

#### 1.3 类型扩展（可选）

**文件**: `src/types/skill.ts`（修改）

**添加字段**:
```typescript
export interface Skill {
  name: string;
  displayName?: string;
  description?: string;
  command?: string;  // 可选：不再需要固定命令
  category?: string;
  icon?: string;
  shortcut?: string;
  path?: string;     // 新增：skill 目录路径
  lastModified?: Date; // 新增：最后修改时间
}
```

#### 1.4 测试验证

- [ ] 扫描 `~/.claude/skills/` 正常显示所有 skills
- [ ] 解析 SKILL.md 的 Front Matter 正确
- [ ] 单个 skill 解析失败不影响其他 skills
- [ ] 扫描失败时回退到默认 skills

**预期结果**:
- 启动应用后，看到所有已安装的 Claude Code skills
- 每个 skill 显示正确的名称和描述

---

## Phase 2: 输入解析器 - 双模式输入（1天）

### 目标
支持两种输入模式：
1. **搜索模式**: 输入普通关键词，模糊匹配 skills
2. **Skill 调用模式**:
   - 直接模式：`/commit`（选择 skill）
   - 任务模式：`/commit 修复登录bug`（传递任务给 CLI）

### 实施步骤

#### 2.1 创建 useInputParser Hook

**文件**: `src/hooks/useInputParser.ts`（新建）

**功能**:
```typescript
export interface ParsedInput {
  mode: "search" | "direct" | "task";
  skillName: string;
  task?: string;
}

export function useInputParser(skills: Skill[]) {
  const [rawInput, setRawInput] = useState("");

  // 解析输入内容
  const parsedInput: ParsedInput | null = useMemo(() => {
    const trimmed = rawInput.trim();
    if (!trimmed.startsWith("/")) {
      return { mode: "search", skillName: "" };
    }
    const parts = trimmed.slice(1).split(/\s+/);
    const skillName = parts[0];
    const task = parts.slice(1).join(" ");
    return {
      mode: task ? "task" : "direct",
      skillName,
      task: task || undefined
    };
  }, [rawInput]);

  // 根据输入过滤 skills
  const filteredSkills = useMemo(() => {
    if (parsedInput.mode === "search") {
      // 模糊搜索
      const query = rawInput.toLowerCase();
      return skills.filter(skill =>
        skill.name.toLowerCase().includes(query) ||
        skill.displayName?.toLowerCase().includes(query) ||
        skill.description?.toLowerCase().includes(query)
      );
    } else {
      // 精确匹配 skill name
      return skills.filter(skill =>
        skill.name === parsedInput.skillName ||
        skill.name.startsWith(parsedInput.skillName)
      );
    }
  }, [skills, rawInput, parsedInput]);

  return { rawInput, setRawInput, parsedInput, filteredSkills };
}
```

#### 2.2 修改 App.tsx

**文件**: `src/App.tsx`（修改）

**修改内容**:
```typescript
// 替换：
- const { skills, loading, error } = useSkills();
+ const { skills } = useSkills();
+ const { rawInput, setRawInput, parsedInput, filteredSkills } = useInputParser(skills);

// 删除：
- const [searchQuery, setSearchQuery] = useState("");
- const filteredSkills = skills.filter(...)

// 调整 executeSkill 函数：
async function executeSkill(skill: Skill, task?: string) {
  // 构建命令：claude /skill-name "任务描述"
  const args = [`/${skill.name}`];
  if (task) {
    args.push(task);
  }

  const { Command } = await import("@tauri-apps/plugin-shell");
  const command = Command.create("claude", args);
  await command.execute();
}
```

#### 2.3 UI 调整

**搜索框提示**:
- 搜索模式：显示 "Search skills..."
- Skill 模式：显示 "Executing: /commit 修复bug"

**选中状态**:
- 直接模式：高亮选中的 skill
- 任务模式：显示任务预览

#### 2.4 测试验证

- [ ] 输入普通关键词进入搜索模式
- [ ] 输入 `/commit` 进入直接模式
- [ ] 输入 `/commit 修复bug` 进入任务模式
- [ ] Enter 键执行正确的逻辑

**预期结果**:
- 用户可以直接在启动器中输入完整的命令
- 无需手动打开终端输入任务描述

---

## Phase 3: CLI 调用与实时输出（2-3天）

### 目标
1. 直接调用 `claude` CLI（而非 `cmd /c`）
2. 实时显示 CLI 输出（stdout/stderr）
3. 支持取消正在运行的命令

### 实施步骤

#### 3.1 Rust 后端 - 命令执行

**文件**: `src-tauri/src/commands.rs`（新建）

**功能**:
```rust
use tauri::AppHandle;
use tauri_plugin_shell::ShellExt;
use std::sync::Mutex;

/// 进程状态
#[derive(Debug, serde::Serialize, serde::Deserialize)]
pub struct ProcessStatus {
    pub pid: u32,
    pub skill_name: String,
    pub status: String, // "running" | "completed" | "failed"
}

/// 全局进程注册表
pub struct ProcessRegistry(Mutex<Vec<ProcessStatus>>);

/// 执行 Claude Skill 并流式输出
#[tauri::command]
async fn execute_claude_skill(
    app_handle: AppHandle,
    skill_name: String,
    task: Option<String>,
    window_label: String
) -> Result<String, String> {
    // 1. 构建 claude CLI 命令
    let skill_arg = format!("/{}", skill_name);
    let args: Vec<String> = if let Some(task_desc) = task {
        vec![skill_arg, task_desc]
    } else {
        vec![skill_arg]
    };

    // 2. 创建命令
    let shell = app_handle.shell();
    let command = shell.command("claude").args(args);

    // 3. 异步执行并发送事件到前端
    let window = app_handle.get_webview_window(&window_label)
        .ok_or_else(|| format!("未找到窗口: {}", window_label))?;

    // 发送开始事件
    window.emit("claude-output", serde_json::json!({
        "type": "start",
        "skill": skill_name
    })).map_err(|e| format!("发送事件失败: {}", e))?;

    // TODO: 实现流式输出（使用 tokio spawn）
    // 当前简化版：等待完成并返回全部输出

    Ok("命令已启动".to_string())
}

/// 取消正在运行的命令
#[tauri::command]
async fn cancel_command(
    app_handle: AppHandle,
    pid: u32
) -> Result<(), String> {
    let shell = app_handle.shell();
    shell.command("taskkill")
        .args(["/F", "/PID", &pid.to_string()])
        .output()
        .await
        .map_err(|e| format!("终止进程失败: {}", e))?;
    Ok(())
}
```

**依赖更新**:

**文件**: `src-tauri/Cargo.toml`（修改）

```toml
[dependencies]
# ... 现有依赖
tokio = { version = "1", features = ["full"] }
serde_json = "1"
```

#### 3.2 注册 Tauri 命令

**文件**: `src-tauri/src/lib.rs`（修改）

```rust
mod commands; // 新增

use commands::ProcessRegistry;

pub fn run() {
    tauri::Builder::default()
        // ... 现有插件
        .manage(ProcessRegistry(Mutex::new(Vec::new()))) // 新增
        .invoke_handler(tauri::generate_handler![
            update_shortcut,
            commands::execute_claude_skill,  // 新增
            commands::cancel_command          // 新增
        ])
        .setup(|app| {
            // ... 现有代码
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
```

#### 3.3 前端 - 执行管理 Hook

**文件**: `src/hooks/useClaudeExecution.ts`（新建）

**功能**:
```typescript
import { useState, useEffect } from "react";
import { listen } from "@tauri-apps/api/event";
import { invoke } from "@tauri-apps/api/core";

export type ExecutionStatus = "idle" | "running" | "completed" | "error";

export interface ExecutionState {
  status: ExecutionStatus;
  skillName?: string;
  output: string;
  error?: string;
  pid?: number;
}

export function useClaudeExecution() {
  const [execution, setExecution] = useState<ExecutionState>({
    status: "idle",
    output: ""
  });

  // 监听来自 Rust 的输出事件
  useEffect(() => {
    const unlisten = listen("claude-output", (event) => {
      const payload = event.payload as any;
      // TODO: 处理各种事件类型
    });
    return () => { unlisten.then(fn => fn()); };
  }, []);

  const execute = async (skillName: string, task?: string) => {
    await invoke("execute_claude_skill", {
      skillName,
      task,
      windowLabel: "main"
    });
  };

  const cancel = async () => {
    if (execution.pid) {
      await invoke("cancel_command", { pid: execution.pid });
    }
  };

  return { execution, execute, cancel };
}
```

#### 3.4 实时输出组件

**文件**: `src/components/ExecutionOutput.tsx`（新建）

**功能**:
```typescript
import { useClaudeExecution } from "../hooks/useClaudeExecution";
import { Spinner, Text, Button } from "@fluentui/react-components";

export function ExecutionOutput() {
  const { execution, cancel } = useClaudeExecution();

  if (execution.status === "idle") {
    return null;
  }

  return (
    <div className="execution-output">
      {/* 头部：状态和操作 */}
      <div className="execution-header">
        <Text>
          {execution.skillName && `正在执行: ${execution.skillName}`}
          {execution.status === "running" && <Spinner size="tiny" />}
        </Text>
        {execution.status === "running" && (
          <Button onClick={cancel}>取消</Button>
        )}
      </div>

      {/* 输出内容 */}
      <div className="execution-content">
        {execution.output && <pre>{execution.output}</pre>}
        {execution.error && <Text style={{ color: "red" }}>{execution.error}</Text>}
      </div>
    </div>
  );
}
```

**文件**: `src/components/ExecutionOutput.css`（新建）

```css
.execution-output {
  margin-top: 16px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
}

.execution-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: #f5f5f5;
  border-bottom: 1px solid #e0e0e0;
}

.execution-content {
  padding: 16px;
  max-height: 300px;
  overflow-y: auto;
  background: #1e1e1e;
  color: #d4d4d4;
  font-family: "Consolas", "Monaco", monospace;
  font-size: 12px;
}

.execution-content pre {
  margin: 0;
  white-space: pre-wrap;
  word-break: break-all;
}
```

#### 3.5 集成到 App.tsx

**文件**: `src/App.tsx`（修改）

```typescript
import { ExecutionOutput } from "./components/ExecutionOutput";
import { useClaudeExecution } from "./hooks/useClaudeExecution";

function App() {
  const { execute, cancel } = useClaudeExecution();

  // 修改 executeSkill 函数
  async function executeSkill(skill: Skill, task?: string) {
    await execute(skill.name, task);
  }

  return (
    <div className="container">
      {/* ... 现有 UI */}

      {/* 新增：实时输出 */}
      <ExecutionOutput />
    </div>
  );
}
```

#### 3.6 测试验证

- [ ] 调用 `claude /commit` 命令成功
- [ ] 实时显示 CLI 输出
- [ ] 支持 stderr 错误输出
- [ ] 取消按钮正常工作
- [ ] 长时间运行的命令不阻塞 UI

**预期结果**:
- 用户可以在应用内看到 claude CLI 的完整输出
- 无需打开终端查看执行结果

---

## Phase 4: 集成到 Claude Code（1天）

### 目标
让用户可以通过 `/skill-launcher` 命令启动应用。

### 实施步骤

#### 4.1 创建 skill-launcher skill

**文件**: `skills/skill-launcher/SKILL.md`（新建）

```markdown
---
name: skill-launcher
description: Launch SkillLauncher Windows - A quick launcher for Claude Code Skills
category: tools
---

# Skill Launcher Windows

This skill launches the SkillLauncher Windows application.

## Instructions

When the user invokes this skill, perform the following steps:

### 1. Check if SkillLauncher is installed

Look for the executable at common locations:
- `%USERPROFILE%\skillLauncher-windows\src-tauri\target\release\skill-launcher.exe` (development)
- `%LOCALAPPDATA%\skill-launcher\skill-launcher.exe` (production)

### 2. If installed, launch it

```powershell
Start-Process "skill-launcher.exe"
```

### 3. If not installed, guide the user

Tell the user:

> SkillLauncher Windows is not installed. To install it:
>
> 1. Clone the repository:
>    ```
>    git clone https://github.com/gxj1134506645/skillLauncher-windows.git
>    ```
> 2. Install dependencies:
>    ```
>    cd skillLauncher-windows
>    npm install
>    ```
> 3. Build the application:
>    ```
>    npm run tauri build
>    ```
> 4. The executable will be at `src-tauri/target/release/skill-launcher.exe`

## Usage

After launching, you can:
- Press `Ctrl+Alt+Space` (or your custom shortcut) to toggle the launcher
- Type skill names to search
- Type `/skill-name task-description` to execute with a task
- Use arrow keys to navigate, Enter to execute, Escape to hide

## Features

- Global hotkey launcher
- Real-time skill scanning from `~/.claude/skills/`
- Task mode: Pass instructions directly to skills
- Real-time CLI output display
- Customizable shortcuts
```

**安装位置**: 复制到 `~/.claude/skills/skill-launcher/SKILL.md`

#### 4.2 创建安装脚本

**文件**: `scripts/install.ps1`（新建）

```powershell
# SkillLauncher Windows 安装脚本

Write-Host "SkillLauncher Windows 安装脚本" -ForegroundColor Green

# 1. 检查是否已安装
$exePaths = @(
    "$env:USERPROFILE\skillLauncher-windows\src-tauri\target\release\skill-launcher.exe",
    "$env:LOCALAPPDATA\skill-launcher\skill-launcher.exe"
)

$exePath = $exePaths | Where-Object { Test-Path $_ } | Select-Object -First 1

if ($exePath) {
    Write-Host "✓ SkillLauncher 已安装: $exePath" -ForegroundColor Green
    exit 0
}

# 2. 询问是否安装
Write-Host "SkillLauncher 未安装，是否立即安装？(Y/N)" -ForegroundColor Yellow
$response = Read-Host

if ($response -ne "Y" -and $response -ne "y") {
    Write-Host "取消安装" -ForegroundColor Red
    exit 1
}

# 3. 克隆仓库
Write-Host "正在克隆仓库..." -ForegroundColor Cyan
git clone https://github.com/gxj1134506645/skillLauncher-windows.git
cd skillLauncher-windows

# 4. 安装依赖
Write-Host "正在安装依赖..." -ForegroundColor Cyan
npm install

# 5. 构建应用
Write-Host "正在构建应用..." -ForegroundColor Cyan
npm run tauri build

# 6. 检查构建结果
if (Test-Path "src-tauri\target\release\skill-launcher.exe") {
    Write-Host "✓ 构建成功！" -ForegroundColor Green
    Write-Host "可执行文件位置: src-tauri\target\release\skill-launcher.exe" -ForegroundColor Cyan

    # 7. 安装 skill-launcher skill
    Write-Host "正在安装 skill-launcher skill..." -ForegroundColor Cyan
    $skillDir = "$env:USERPROFILE\.claude\skills\skill-launcher"
    New-Item -ItemType Directory -Path $skillDir -Force | Out-Null
    Copy-Item "skills\skill-launcher\SKILL.md" -Destination "$skillDir\SKILL.md" -Force

    Write-Host "✓ 安装完成！现在可以使用 /skill-launcher 启动应用" -ForegroundColor Green
} else {
    Write-Host "✗ 构建失败，请检查错误信息" -ForegroundColor Red
    exit 1
}
```

#### 4.3 验证集成

- [ ] 在 Claude Code 中输入 `/skill-launcher` 能启动应用
- [ ] 应用启动后快捷键正常工作
- [ ] skill 文档正确显示功能说明

---

## Phase 5: 优化与 Windows 原生集成（1-2天）

### 目标
相比原版的优化改进和 Windows 原生特性集成。

### 实施步骤

#### 5.1 性能优化

**虚拟滚动**:
```bash
npm install react-window
```

**缓存机制**:
```typescript
// localStorage 缓存 skills
const CACHE_KEY = "skills-cache";
const CACHE_TTL = 5 * 60 * 1000; // 5分钟

function useSkills() {
  const [cached, setCached] = useState<Skill[]>([]);

  useEffect(() => {
    // 检查缓存
    const cachedData = localStorage.getItem(CACHE_KEY);
    if (cachedData) {
      const { skills, timestamp } = JSON.parse(cachedData);
      if (Date.now() - timestamp < CACHE_TTL) {
        setCached(skills);
        return;
      }
    }

    // 扫描并缓存
    scanner.scanSkills().then(skills => {
      localStorage.setItem(CACHE_KEY, JSON.stringify({
        skills,
        timestamp: Date.now()
      }));
      setCached(skills);
    });
  }, []);
}
```

**限制输出缓冲区**:
```typescript
// 最多保留 1000 行输出
const MAX_OUTPUT_LINES = 1000;

function useClaudeExecution() {
  const addOutput = (line: string) => {
    setExecution(prev => {
      const lines = prev.output.split('\n');
      const newLines = [...lines, line].slice(-MAX_OUTPUT_LINES);
      return { ...prev, output: newLines.join('\n') };
    });
  };
}
```

#### 5.2 系统托盘（可选）

**文件**: `src-tauri/src/lib.rs`（修改）

```rust
use tauri_plugin_notification::NotificationExt;

pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_notification::init())
        .setup(|app| {
            // 创建系统托盘图标
            let _tray = app.tray_handler();
            Ok(())
        })
        .run(tauri::generate_context!())
}
```

#### 5.3 开机自启动（可选）

**文件**: `src/hooks/useAutoStart.ts`（新建）

```typescript
import { invoke } from "@tauri-apps/api/core";

export async function setAutoStart(enable: boolean) {
  // 写入注册表或 Startup 文件夹
  await invoke("set_auto_start", { enable });
}
```

**Rust 实现**:
```rust
#[tauri::command]
async fn set_auto_start(enable: bool) -> Result<(), String> {
    // Windows: 使用 Startup 文件夹
    let startup_dir = dirs::home_dir()
        .unwrap()
        .join("AppData\\Roaming\\Microsoft\\Windows\\Start Menu\\Programs\\Startup");

    let shortcut_path = startup_dir.join("SkillLauncher.lnk");

    if enable {
        // 创建快捷方式
        std::os::windows::fs::symlink_file(
            "当前exe路径",
            &shortcut_path
        ).map_err(|e| e.to_string())?;
    } else {
        // 删除快捷方式
        std::fs::remove_file(&shortcut_path).ok();
    }

    Ok(())
}
```

#### 5.4 Windows 通知（可选）

**依赖**: `src-tauri/Cargo.toml`

```toml
tauri-plugin-notification = "2"
```

**使用**:
```typescript
import { isPermissionGranted, requestPermission, sendNotification } from "@tauri-apps/plugin-notification";

async function notifyComplete(skillName: string) {
  let permission = await isPermissionGranted();
  if (!permission) {
    permission = await requestPermission();
  }

  if (permission) {
    sendNotification({
      title: "Skill 执行完成",
      body: `${skillName} 已成功执行`
    });
  }
}
```

---

## Phase 6: 测试与发布（1天）

### 6.1 功能测试清单

#### 核心功能
- [ ] 扫描 `~/.claude/skills/` 并正确显示所有 skills
- [ ] 输入普通关键词进行模糊搜索
- [ ] 输入 `/commit` 进入直接模式
- [ ] 输入 `/commit 修复bug` 进入任务模式
- [ ] 实时显示 CLI 输出（stdout）
- [ ] 正确显示错误输出（stderr）
- [ ] 取消正在运行的命令
- [ ] 快捷键切换窗口显示/隐藏

#### 集成功能
- [ ] 执行 `/skill-launcher` 启动应用
- [ ] 设置界面正常工作
- [ ] 修改快捷键后立即生效

#### 边界情况
- [ ] CLI 不可用时的错误提示
- [ ] 无效 skill 名称的处理
- [ ] 空任务描述的处理
- [ ] 长时间运行的命令（测试 5 分钟以上）
- [ ] 大量输出的性能测试（1000+ 行）

#### 性能测试
- [ ] 100+ skills 不卡顿
- [ ] 搜索响应时间 < 100ms
- [ ] 启动时间 < 2 秒
- [ ] 内存占用 < 200MB

### 6.2 文档更新

**文件**: `README.md`（更新）

**新增内容**:
```markdown
## 功能特性

- ✅ 全局快捷键唤起（可自定义）
- ✅ 自动扫描 `~/.claude/skills/` 目录
- ✅ 双模式输入（搜索 vs skill 调用）
- ✅ 任务模式：直接传递任务描述
- ✅ 实时显示 CLI 输出
- ✅ 可取消正在运行的命令
- ✅ 深度集成到 Claude Code

## 使用指南

### 模式 1：搜索 Skill

输入关键词（如 "commit"），按 Enter 执行。

### 模式 2：直接执行 Skill

输入 `/commit`，按 Enter 执行。

### 模式 3：传递任务

输入 `/commit 修复登录bug`，按 Enter 执行，任务会传递给 Claude。

## 安装

详见 [docs/plan.md](docs/plan.md)
```

### 6.3 构建与打包

```bash
# 开发构建
npm run tauri dev

# 生产构建
npm run tauri build

# 输出位置
src-tauri/target/release/skill-launcher.exe
```

### 6.4 发布检查清单

- [ ] 所有测试通过
- [ ] 文档更新完整
- [ ] README 截图更新
- [ ] 版本号更新（package.json, tauri.conf.json）
- [ ] Git tag 创建
- [ ] GitHub Release 发布

---

## Phase 1: Project Structure Setup ✅ COMPLETED

### 1.1 Frontend Structure (src/)

- [x] Create `src/main.tsx` - Application entry point
- [x] Create `src/App.tsx` - Main application component
- [x] Create `src/index.css` - Global styles
- [x] Create `src/vite-env.d.ts` - Vite type declarations
- [x] Create `src/components/SkillList.tsx` - Skill list component
- [x] Create `src/hooks/useSkills.ts` - Skills loading hook
- [x] Create `src/hooks/useKeyboardNavigation.ts` - Keyboard navigation hook
- [x] Create `src/types/skill.ts` - TypeScript type definitions

### 1.2 Tauri Backend Structure (src-tauri/)

- [x] Initialize Tauri project structure
- [x] Configure `tauri.conf.json`
- [x] Setup Rust backend (`main.rs`, `lib.rs`)
- [x] Configure Cargo.toml dependencies

### 1.3 Configuration Files

- [x] Create `vite.config.ts`
- [x] Create `tsconfig.node.json`
- [x] Create `.gitignore`
- [x] Create `index.html`

---

## Phase 2: Core Functionality ✅ COMPLETED (Basic)

### 2.1 Skill Management

- [x] Skill 配置文件解析（YAML 格式）- **将被替换为目录扫描**
- [x] Skill 列表加载和显示
- [x] Skill 搜索和过滤
- [x] Skill 执行（通过 Shell 插件）

**升级计划**:
- [ ] 替换 YAML 为 `~/.claude/skills/` 目录扫描（Phase 1）
- [ ] 支持任务模式输入（Phase 2）
- [ ] 实时 CLI 输出（Phase 3）

### 2.2 Global Shortcut

- [x] 注册全局快捷键（默认 Ctrl+Alt+Space）
- [x] 快速切换窗口显示/隐藏
- [x] 快捷键自定义（设置对话框）

**已完成**:
- [x] 设置界面（SettingsDialog.tsx）
- [x] 动态更新快捷键（无需重启）

### 2.3 Shell Integration

- [x] 执行 Claude Code 命令（`cmd /c claude /commit`）
- [x] 命令输出处理（console.log）
- [x] 错误处理和用户反馈

**升级计划**:
- [ ] 直接调用 `claude` 命令（Phase 3）
- [ ] 实时输出到 UI（Phase 3）
- [ ] 支持取消命令（Phase 3）

---

## Phase 3: UI Development ✅ COMPLETED (Basic)

### 3.1 Main Window

- [x] Launcher window design (Fluent UI components)
- [x] Skill list component
- [x] Search input component
- [ ] Settings panel

### 3.2 User Experience

- [x] Keyboard navigation support (Arrow keys + Enter)
- [x] Window hide on Escape key
- [x] Loading states and animations
- [ ] Dark/Light theme support

### 3.1 Main Window

- [x] Launcher 窗口设计（Fluent UI）
- [x] Skill 列表组件
- [x] 搜索输入框
- [x] 设置对话框

**新增**:
- [ ] 实时输出组件（ExecutionOutput.tsx）- Phase 3

### 3.2 User Experience

- [x] 键盘导航（箭头键 + Enter）
- [x] Esc 键隐藏窗口
- [x] 加载状态和动画
- [ ] 暗色主题支持（可选）

---

## 技术架构 (Technical Architecture)

### 项目结构

```
skillLauncher-windows/
├── docs/
│   └── plan.md                    # 本文档
├── src/                           # React 前端
│   ├── components/                # UI 组件
│   │   ├── SkillList.tsx         # Skill 列表
│   │   ├── SettingsDialog.tsx    # 设置对话框 ✅
│   │   └── ExecutionOutput.tsx   # 实时输出 ⏳ Phase 3
│   ├── hooks/                     # React Hooks
│   │   ├── useSkills.ts          # Skill 加载 ✅
│   │   ├── useInputParser.ts     # 输入解析 ⏳ Phase 2
│   │   ├── useClaudeExecution.ts # CLI 执行 ⏳ Phase 3
│   │   ├── useKeyboardNavigation.ts # 键盘导航 ✅
│   │   └── useSettings.ts        # 设置管理 ✅
│   ├── services/                  # 业务逻辑
│   │   └── skillScanner.ts       # Skill 扫描器 ⏳ Phase 1
│   ├── types/                     # TypeScript 类型
│   │   ├── skill.ts              # Skill 类型定义 ✅
│   │   └── settings.ts           # 设置类型定义 ✅
│   ├── App.tsx                    # 主应用 ✅
│   ├── main.tsx                   # 入口文件 ✅
│   └── index.css                  # 全局样式 ✅
├── src-tauri/                     # Tauri 后端 (Rust)
│   ├── src/
│   │   ├── commands.rs           # Tauri 命令 ⏳ Phase 3
│   │   ├── lib.rs                # 应用初始化 ✅
│   │   └── main.rs               # Rust 入口 ✅
│   ├── Cargo.toml                 # Rust 依赖 ✅
│   └── tauri.conf.json           # Tauri 配置 ✅
├── skills/                        # Skill 文件
│   └── skill-launcher/           # skill-launcher skill ⏳ Phase 4
│       └── SKILL.md
├── scripts/                       # 脚本
│   └── install.ps1               # 安装脚本 ⏳ Phase 4
├── index.html                     # HTML 入口 ✅
├── package.json                   # NPM 依赖 ✅
├── tsconfig.json                  # TypeScript 配置 ✅
├── vite.config.ts                 # Vite 配置 ✅
└── README.md                      # 项目文档
```

### 依赖清单

| Package | Version | Purpose |
|---------|---------|---------|
| @tauri-apps/api | ^2.0.0 | Tauri 前端 API ✅ |
| @tauri-apps/plugin-global-shortcut | ^2.0.0 | 全局快捷键 ✅ |
| @tauri-apps/plugin-shell | ^2.0.0 | Shell 命令执行 ✅ |
| @tauri-apps/plugin-fs | ^2.0.0 | 文件系统访问 ✅ |
| @fluentui/react-components | ^9.54.0 | UI 组件库 ✅ |
| @fluentui/react-icons | latest | 图标库 ✅ |
| react | ^18.3.1 | 前端框架 ✅ |
| yaml | ^2.4.0 | YAML 解析（将被移除） |
| tokio | ^1.0.0 | Rust 异步运行时 ⏳ Phase 3 |
| serde_json | ^1.0.0 | JSON 序列化 ⏳ Phase 3 |

### 数据流架构

```
用户输入
  ↓
useInputParser (解析模式)
  ↓
┌─────────────┬─────────────┐
│  搜索模式    │ Skill 模式  │
│  模糊匹配    │  精确匹配    │
└─────────────┴─────────────┘
  ↓
useSkills (过滤)
  ↓
SkillList (显示)
  ↓
用户选择 (点击/Enter)
  ↓
useClaudeExecution (调用)
  ↓
execute_claude_skill (Rust)
  ↓
claude CLI 执行
  ↓
Tauri Events (实时推送)
  ↓
ExecutionOutput (显示)
```

---

## 关键文件列表

### 需要创建的文件 (8个)

1. `src/services/skillScanner.ts` - Skill 扫描器
2. `src/hooks/useInputParser.ts` - 输入解析器
3. `src/hooks/useClaudeExecution.ts` - CLI 执行管理
4. `src/components/ExecutionOutput.tsx` - 输出显示组件
5. `src/components/ExecutionOutput.css` - 输出组件样式
6. `src-tauri/src/commands.rs` - Rust 后端命令
7. `skills/skill-launcher/SKILL.md` - skill-launcher skill
8. `scripts/install.ps1` - 安装脚本

### 需要修改的文件 (6个)

9. `src/hooks/useSkills.ts` - 使用 SkillScanner
10. `src/App.tsx` - 集成新功能
11. `src/types/skill.ts` - 扩展类型定义（可选）
12. `src-tauri/src/lib.rs` - 注册 Tauri 命令
13. `src-tauri/Cargo.toml` - 添加依赖
14. `README.md` - 更新文档

---

## 实施时间线

| 阶段 | 任务 | 预计时间 | 优先级 |
|------|------|---------|--------|
| Phase 1 | Skill 目录扫描与解析 | 1-2天 | 🔴 高 |
| Phase 2 | 输入解析器 - 双模式输入 | 1天 | 🔴 高 |
| Phase 3 | CLI 调用与实时输出 | 2-3天 | 🔴 高 |
| Phase 4 | 集成到 Claude Code | 1天 | 🟡 中 |
| Phase 5 | 优化与 Windows 集成 | 1-2天 | 🟢 低 |
| Phase 6 | 测试与发布 | 1天 | 🔴 高 |

**总计**: 6-9 个工作日

**快速可用版本**（Phase 1-2）: 2-3天
**完整功能版本**（Phase 1-4）: 5-7天
**生产就绪版本**（Phase 1-6）: 6-9天

---

## 进度追踪 (Progress Log)

| 日期 | 阶段 | 任务 | 状态 | 备注 |
|------|------|------|------|------|
| 2026-01-28 | - | 项目初始化 | ✅ 完成 | 基础结构搭建 |
| 2026-01-28 | - | 核心功能（基础版） | ✅ 完成 | YAML 配置、Shell 执行 |
| 2026-01-28 | - | UI 开发（基础版） | ✅ 完成 | 搜索、列表、设置 |
| 2026-01-29 | - | 快捷键自定义 | ✅ 完成 | 动态更新功能 |
| 2026-01-29 | - | 完整实施计划 | ✅ 完成 | 本文档更新 |
| 待定 | Phase 1 | Skill 目录扫描 | ⏳ 待开始 | |
| 待定 | Phase 2 | 输入解析器 | ⏳ 待开始 | |
| 待定 | Phase 3 | CLI 实时输出 | ⏳ 待开始 | |
| 待定 | Phase 4 | Claude Code 集成 | ⏳ 待开始 | |
| 待定 | Phase 5 | 性能优化 | ⏳ 待开始 | |
| 待定 | Phase 6 | 测试与发布 | ⏳ 待开始 | |

---

## 验收标准 (Acceptance Criteria)

### 功能完整性
- ✅ 所有核心功能已实现
- ✅ 与 macOS 版本功能对等
- ✅ 优化功能已添加

### 质量标准
- ✅ 所有测试用例通过
- ✅ 无已知 bug
- ✅ 性能满足要求（1000+ skills 不卡顿）

### 用户体验
- ✅ 流畅的使用流程
- ✅ 清晰的错误提示
- ✅ 完善的文档

---

## 潜在挑战与解决方案

### 1. Windows 路径处理

**挑战**: 路径分隔符（`\` vs `/`）、长路径限制

**解决方案**:
- 使用 Tauri 的 `path` API 而非字符串拼接
- 启用 Windows 长路径支持（注册表）

### 2. Claude CLI 不可用

**挑战**: 用户未安装 claude CLI 或不在 PATH 中

**解决方案**:
```rust
// 在 execute_claude_skill 中添加检测
let which_result = shell.command("where").args(["claude"]).output().await;
if which_result.status.success() == false {
    return Err("未找到 claude CLI，请先安装: npm install -g @anthropic-ai/claude-code".to_string());
}
```

### 3. 实时输出性能

**挑战**: 大量输出数据导致 UI 卡顿

**解决方案**:
- 虚拟滚动（react-window）
- 限制输出缓冲区（最多 1000 行）
- 实现"输出折叠"功能

### 4. 进程管理

**挑战**: 进程泄漏、僵尸进程

**解决方案**:
- 使用 `tokio::process::Command` 的自动清理
- 实现进程超时机制（默认 5 分钟）
- 应用退出时清理所有子进程

---

## 快速开始 (Quick Start)

### 开发环境

```bash
# 1. 安装依赖
npm install

# 2. 启动开发服务器
npm run tauri dev

# 3. 修改代码后自动热重载
```

### 生产构建

```bash
# 构建独立 exe 文件
npm run tauri build

# 输出位置
src-tauri/target/release/skill-launcher.exe
```

### 安装 skill-launcher skill

```powershell
# 复制 skill 文件到 Claude Code skills 目录
mkdir $env:USERPROFILE\.claude\skills\skill-launcher
copy skills\skill-launcher\SKILL.md $env:USERPROFILE\.claude\skills\skill-launcher\SKILL.md
```

---

## 参考资料

- [macOS 版源码](https://github.com/gxj1134506645/SkillLauncher)
- [Tauri 2.0 文档](https://tauri.app/v1/guides/)
- [Claude Code 文档](https://docs.anthropic.com/claude-code)
- [微信公众号文章](https://mp.weixin.qq.com/s/78NxShInmZNTvYvvnJ3ZGQ)

---

## 下一步行动 (Next Steps)

### 立即开始：Phase 1 - Skill 目录扫描

1. **创建 `src/services/skillScanner.ts`**
   - 实现 `scanSkills()` 方法
   - 实现 `parseSkillDir()` 方法
   - 测试扫描 `~/.claude/skills/`

2. **修改 `src/hooks/useSkills.ts`**
   - 导入 SkillScanner
   - 替换 YAML 加载逻辑
   - 保留回退机制

3. **测试验证**
   - 确保能看到所有已安装的 skills
   - 验证解析失败时的容错处理

**预计完成时间**: 1-2天

---

## 许可证

MIT License

---

## 联系方式

- GitHub Issues: https://github.com/gxj1134506645/skillLauncher-windows/issues
- 微信公众号: FishTech Notes



### 4.1 Testing

- [ ] Unit tests for core functions
- [ ] Integration tests for Tauri commands
- [ ] UI component tests

### 4.2 Optimization

- [ ] Build optimization
- [ ] Startup performance
- [ ] Memory usage optimization

### 4.3 Release
  [ ] 完善的文档
