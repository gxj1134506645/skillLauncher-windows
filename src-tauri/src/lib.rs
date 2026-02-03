use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;
use std::sync::Mutex;
use tauri::Manager;

pub mod skills;

pub use skills::*;

/// Project info state
/// 项目信息状态
#[derive(Default)]
struct ProjectState {
    root_path: Mutex<Option<String>>,
}

#[derive(Default)]
struct TargetWindowState {
    hwnd: Mutex<Option<i64>>,
}

/// Generate a unique mutex name for a project path
/// 为项目路径生成唯一的互斥量名称
fn get_project_mutex_name(project_root: &str) -> String {
    // Use hash of project path to create a valid mutex name
    // 使用项目路径的 hash 创建有效的互斥量名称
    use std::hash::{Hash, Hasher};
    let mut hasher = std::collections::hash_map::DefaultHasher::new();
    project_root.hash(&mut hasher);
    let hash = hasher.finish();
    format!("Global\\SkillLauncher_Project_{:X}", hash)
}

/// Check if a window for this project already exists and activate it
/// 检查该项目的窗口是否已存在并激活它
fn check_and_activate_existing_window(project_root: &str) -> bool {
    #[cfg(windows)]
    {
        use std::process::Command;

        // Extract project name from path for matching window title
        // 从路径提取项目名用于匹配窗口标题
        let project_name = if let Some(last_sep) = project_root.rfind(['\\', '/']) {
            &project_root[last_sep + 1..]
        } else {
            project_root
        };

        let expected_title = format!("Skill Launcher - {}", project_name);

        // Try to activate existing window using PowerShell
        // 使用 PowerShell 尝试激活现有窗口
        let script = format!(
            r#"
Add-Type @"
  using System;
  using System.Runtime.InteropServices;
  public class Win32 {{
    [DllImport("user32.dll")] public static extern bool EnumWindows(EnumWindowsProc enumProc, IntPtr lParam);
    [DllImport("user32.dll")] public static extern bool GetWindowText(IntPtr hWnd, System.Text.StringBuilder lpString, int nMaxCount);
    [DllImport("user32.dll")] public static extern bool ShowWindow(IntPtr hWnd, int nCmdShow);
    [DllImport("user32.dll")] public static extern bool SetForegroundWindow(IntPtr hWnd);
    [DllImport("user32.dll")] public static extern bool IsWindowVisible(IntPtr hWnd);
    [DllImport("user32.dll")] public static extern bool IsIconic(IntPtr hWnd);
    public delegate bool EnumWindowsProc(IntPtr hWnd, IntPtr lParam);
  }}
"@

$targetTitle = "{}"
$found = $false

[Win32]::EnumWindows({{
    param($hWnd, $lParam)
    $title = New-Object System.Text.StringBuilder(256)
    if ([Win32]::GetWindowText($hWnd, $title, 256)) {{
        $windowTitle = $title.ToString()
        if ($windowTitle -eq $targetTitle) {{
            # Restore if minimized
            if ([Win32]::IsIconic($hWnd)) {{
                [Win32]::ShowWindow($hWnd, 9) | Out-Null  # SW_RESTORE
            }}
            # Bring to front
            [Win32]::ShowWindow($hWnd, 5) | Out-Null  # SW_SHOW
            [Win32]::SetForegroundWindow($hWnd) | Out-Null
            $script:found = $true
            return $false
        }}
    }}
    return $true
}}, 0)

if ($found) {{ exit 0 }} else {{ exit 1 }}
"#,
            expected_title
        );

        println!("🔍 检查窗口: {}", expected_title);

        match Command::new("powershell")
            .args(["-NoProfile", "-Command", &script])
            .output()
        {
            Ok(output) => {
                let success = output.status.success();
                if success {
                    println!("✅ 找到并激活已有窗口");
                } else {
                    println!("🔍 未找到已有窗口，将创建新窗口");
                }
                success
            },
            Err(e) => {
                println!("⚠️ 检查窗口时出错: {}", e);
                false
            }
        }
    }

    #[cfg(not(windows))]
    false
}

/// Setup Claude Code skill on first run
/// 首次运行时配置 Claude Code skill
fn setup_claude_skill() -> Result<(), String> {
    println!("🔧 Checking Claude Code skill configuration...");

    const SKILL_MD_CONTENT: &str = include_str!("../../skills/skill-launcher/skill.md");

    let home = dirs::home_dir().unwrap_or_else(|| PathBuf::from("."));
    let skills_dir = home.join(".claude").join("skills");
    let skill_dir = skills_dir.join("skill-launcher");

    let skill_md = skill_dir.join("SKILL.md");

    // Only install SKILL.md, no need for bat/ps1 scripts anymore
    // 只安装 SKILL.md，不再需要 bat/ps1 脚本
    let should_write_skill = match fs::read_to_string(&skill_md) {
        Ok(existing) => !existing.contains("\"C:\\\\Program Files\\\\Skill Launcher\\\\skill-launcher.exe\""),
        Err(_) => true,
    };

    if !should_write_skill {
        println!("✅ Claude Code skill already configured");
        return Ok(());
    }

    // Create directory if not exists
    fs::create_dir_all(&skill_dir).map_err(|e| format!("Failed to create skill directory: {}", e))?;

    println!("📝 Installing Claude Code SKILL.md...");
    fs::write(&skill_md, SKILL_MD_CONTENT).map_err(|e| format!("Failed to write SKILL.md: {}", e))?;

    println!("✅ Claude Code skill configured successfully!");
    println!("📍 Location: {}", skill_dir.display());

    Ok(())
}

/// Get project name from path for window title
/// 从路径获取项目名用于窗口标题
fn get_project_name(path: &str) -> String {
    // Handle "." or "./" as current directory
    if path == "." || path == "./" {
        if let Ok(dir) = std::env::current_dir() {
            if let Some(name) = dir.file_name() {
                if let Some(name_str) = name.to_str() {
                    return name_str.to_string();
                }
                return name.to_string_lossy().to_string();
            }
        }
        return "Global".to_string();
    }

    if let Some(last_sep) = path.rfind(['\\', '/']) {
        let name = &path[last_sep + 1..];
        if !name.is_empty() {
            return name.to_string();
        }
    }
    "Global".to_string()
}

/// Shortcut configuration from frontend
/// 前端传来的快捷键配置
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ShortcutConfig {
    pub ctrl: Option<bool>,
    pub alt: Option<bool>,
    pub shift: Option<bool>,
    pub win: Option<bool>,
    pub key: String,
}

/// Application settings
/// 应用设置
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AppSettings {
    pub shortcut: ShortcutConfig,
}

impl Default for AppSettings {
    fn default() -> Self {
        Self {
            shortcut: ShortcutConfig {
                ctrl: Some(true),
                alt: Some(true),
                shift: None,
                win: None,
                key: "Space".to_string(),
            },
        }
    }
}

/// Get settings file path
/// 获取设置文件路径
fn get_settings_path() -> PathBuf {
    let home = dirs::home_dir().unwrap_or_else(|| PathBuf::from("."));
    home.join(".skill-launcher").join("settings.json")
}

/// Load settings from file
/// 从文件加载设置
fn load_settings() -> AppSettings {
    let path = get_settings_path();
    if path.exists() {
        match fs::read_to_string(&path) {
            Ok(content) => {
                match serde_json::from_str(&content) {
                    Ok(settings) => return settings,
                    Err(e) => eprintln!("Failed to parse settings: {}", e),
                }
            }
            Err(e) => eprintln!("Failed to read settings file: {}", e),
        }
    }
    AppSettings::default()
}

/// Save settings to file
/// 保存设置到文件
fn save_settings(settings: &AppSettings) -> Result<(), String> {
    let path = get_settings_path();

    if let Some(parent) = path.parent() {
        fs::create_dir_all(parent).map_err(|e| e.to_string())?;
    }

    let content = serde_json::to_string_pretty(settings).map_err(|e| e.to_string())?;
    fs::write(&path, content).map_err(|e| e.to_string())?;

    Ok(())
}

/// Convert ShortcutConfig to tauri Shortcut
/// 将 ShortcutConfig 转换为 tauri Shortcut
#[cfg(desktop)]
fn config_to_shortcut(config: &ShortcutConfig) -> tauri_plugin_global_shortcut::Shortcut {
    use tauri_plugin_global_shortcut::{Code, Modifiers, Shortcut};

    let mut modifiers = Modifiers::empty();
    if config.ctrl.unwrap_or(false) {
        modifiers |= Modifiers::CONTROL;
    }
    if config.alt.unwrap_or(false) {
        modifiers |= Modifiers::ALT;
    }
    if config.shift.unwrap_or(false) {
        modifiers |= Modifiers::SHIFT;
    }
    if config.win.unwrap_or(false) {
        modifiers |= Modifiers::SUPER;
    }

    let code = match config.key.as_str() {
        "Space" => Code::Space,
        "KeyA" => Code::KeyA,
        "KeyB" => Code::KeyB,
        "KeyC" => Code::KeyC,
        "KeyD" => Code::KeyD,
        "KeyE" => Code::KeyE,
        "KeyF" => Code::KeyF,
        "KeyG" => Code::KeyG,
        "KeyH" => Code::KeyH,
        "KeyI" => Code::KeyI,
        "KeyJ" => Code::KeyJ,
        "KeyK" => Code::KeyK,
        "KeyL" => Code::KeyL,
        "KeyM" => Code::KeyM,
        "KeyN" => Code::KeyN,
        "KeyO" => Code::KeyO,
        "KeyP" => Code::KeyP,
        "KeyQ" => Code::KeyQ,
        "KeyR" => Code::KeyR,
        "KeyS" => Code::KeyS,
        "KeyT" => Code::KeyT,
        "KeyU" => Code::KeyU,
        "KeyV" => Code::KeyV,
        "KeyW" => Code::KeyW,
        "KeyX" => Code::KeyX,
        "KeyY" => Code::KeyY,
        "KeyZ" => Code::KeyZ,
        "Digit0" => Code::Digit0,
        "Digit1" => Code::Digit1,
        "Digit2" => Code::Digit2,
        "Digit3" => Code::Digit3,
        "Digit4" => Code::Digit4,
        "Digit5" => Code::Digit5,
        "Digit6" => Code::Digit6,
        "Digit7" => Code::Digit7,
        "Digit8" => Code::Digit8,
        "Digit9" => Code::Digit9,
        "F1" => Code::F1,
        "F2" => Code::F2,
        "F3" => Code::F3,
        "F4" => Code::F4,
        "F5" => Code::F5,
        "F6" => Code::F6,
        "F7" => Code::F7,
        "F8" => Code::F8,
        "F9" => Code::F9,
        "F10" => Code::F10,
        "F11" => Code::F11,
        "F12" => Code::F12,
        "Backquote" => Code::Backquote,
        "Backslash" => Code::Backslash,
        "Semicolon" => Code::Semicolon,
        "Quote" => Code::Quote,
        "Comma" => Code::Comma,
        "Period" => Code::Period,
        "Slash" => Code::Slash,
        "BracketLeft" => Code::BracketLeft,
        "BracketRight" => Code::BracketRight,
        "Minus" => Code::Minus,
        "Equal" => Code::Equal,
        "Enter" => Code::Enter,
        "Tab" => Code::Tab,
        "Escape" => Code::Escape,
        _ => Code::Space,
    };

    let mods = if modifiers.is_empty() { None } else { Some(modifiers) };
    Shortcut::new(mods, code)
}

/// Health check command
/// 健康检查命令
#[tauri::command]
fn health_check() -> String {
    "ok".to_string()
}

/// Get project root path
/// 获取项目根路径
#[tauri::command]
fn get_project_root(state: tauri::State<ProjectState>) -> Option<String> {
    state.root_path.lock().ok()?.clone()
}

/// Send command to Claude Code CLI window
/// 发送命令到 Claude Code CLI 窗口
#[tauri::command]
async fn send_to_claude_cli(
    command: String,
    target_hwnd: Option<i64>,
    state: tauri::State<'_, TargetWindowState>,
) -> Result<(), String> {
    use std::process::Command;

    println!("正在发送命令到 Claude Code CLI: {}", command);

    let mut hwnd = target_hwnd;
    if hwnd.is_some() {
        if let Ok(mut guard) = state.hwnd.lock() {
            *guard = hwnd;
        }
    } else if let Ok(guard) = state.hwnd.lock() {
        hwnd = *guard;
    }

    let hwnd_value = hwnd.unwrap_or(0);

    let script = format!(
        r#"
Add-Type @"
  using System;
  using System.Runtime.InteropServices;
  public class Win32 {{
    [DllImport("user32.dll")] public static extern bool ShowWindow(IntPtr hWnd, int nCmdShow);
    [DllImport("user32.dll")] public static extern bool SetForegroundWindow(IntPtr hWnd);
    [DllImport("user32.dll")] public static extern bool IsWindow(IntPtr hWnd);
    [DllImport("user32.dll")] public static extern IntPtr GetForegroundWindow();
    [DllImport("user32.dll")] public static extern bool IsWindowVisible(IntPtr hWnd);
  }}
"@

$targetHwnd = {hwnd_value}
$found = $false
if ($targetHwnd -ne 0) {{
    $hwndPtr = [IntPtr]$targetHwnd
    if ([Win32]::IsWindow($hwndPtr)) {{
        [Win32]::ShowWindow($hwndPtr, 5) | Out-Null
        [Win32]::SetForegroundWindow($hwndPtr) | Out-Null
        $found = $true
    }}
}}

Set-Clipboard -Value "{cmd}"

Start-Sleep -Milliseconds 300

if (-not $found) {{
    $processes = Get-Process | Where-Object {{
        $_.MainWindowTitle -ne "" -and `
        ($_.ProcessName -match "WindowsTerminal" -or `
         $_.ProcessName -match "pwsh" -or `
         $_.ProcessName -match "powershell" -or `
         $_.ProcessName -match "Code")
    }}

    foreach ($proc in $processes) {{
        if ($proc.MainWindowTitle -ne "") {{
            Write-Host "Found window: $($proc.ProcessName) - $($proc.MainWindowTitle)"
            [Win32]::SetForegroundWindow($proc.MainWindowHandle) | Out-Null
            Start-Sleep -Milliseconds 200
            $found = $true
            break
        }}
    }}

    if (-not $found) {{
        Write-Host "No terminal window found, trying Alt+Tab"
        $wshell = New-Object -ComObject WScript.Shell
        $wshell.SendKeys("%(+{{TAB}})")
        Start-Sleep -Milliseconds 200
    }}
}}

$wshell = New-Object -ComObject WScript.Shell
$wshell.SendKeys("^(v)")

Write-Host "Command sent: {cmd}"
"#,
        cmd = command,
        hwnd_value = hwnd_value
    );

    let output = Command::new("powershell")
        .args(["-NoProfile", "-Command", &script])
        .output()
        .map_err(|e| format!("执行 PowerShell 失败: {}", e))?;

    if !output.status.success() {
        let stderr = String::from_utf8_lossy(&output.stderr);
        return Err(format!("PowerShell 错误: {}", stderr));
    }

    let stdout = String::from_utf8_lossy(&output.stdout);
    println!("✅ 命令已发送: {}", stdout);
    Ok(())
}

/// Tauri command to update shortcut settings
/// Tauri 命令：更新快捷键设置
#[tauri::command]
fn update_shortcut(shortcut: ShortcutConfig, app_handle: tauri::AppHandle) -> Result<(), String> {
    let settings = AppSettings { shortcut: shortcut.clone() };
    save_settings(&settings)?;

    #[cfg(desktop)]
    {
        use tauri_plugin_global_shortcut::GlobalShortcutExt;

        println!("正在更新全局快捷键...");

        if let Err(e) = app_handle.global_shortcut().unregister_all() {
            eprintln!("警告: 注销快捷键失败: {}", e);
        } else {
            println!("✓ 已注销旧快捷键");
        }

        let new_shortcut = config_to_shortcut(&shortcut);
        let shortcut_str = format!(
            "{}{}{}{}{}",
            if shortcut.ctrl.unwrap_or(false) { "Ctrl+" } else { "" },
            if shortcut.alt.unwrap_or(false) { "Alt+" } else { "" },
            if shortcut.shift.unwrap_or(false) { "Shift+" } else { "" },
            if shortcut.win.unwrap_or(false) { "Win+" } else { "" },
            shortcut.key
        );

        let window = app_handle.get_webview_window("main").unwrap();
        let window_clone = window.clone();
        let handler = move |_app: &tauri::AppHandle, _shortcut: &tauri_plugin_global_shortcut::Shortcut, _event: tauri_plugin_global_shortcut::ShortcutEvent| {
            println!("快捷键被触发！");
            if window_clone.is_visible().unwrap_or(false) {
                let _ = window_clone.hide();
            } else {
                let _ = window_clone.show();
                let _ = window_clone.set_focus();
            }
        };

        if let Err(e) = app_handle.global_shortcut().on_shortcut(new_shortcut, handler) {
            eprintln!("❌ 错误: 无法设置快捷键处理器: {}", e);
            return Err(format!("无法设置快捷键处理器: {}", e));
        }

        if let Err(e) = app_handle.global_shortcut().register(new_shortcut) {
            eprintln!("❌ 错误: 无法注册快捷键 {}: {}", shortcut_str, e);
            return Err(format!("无法注册快捷键: {}", e));
        }

        println!("✅ 成功: 快捷键已更新 - {}", shortcut_str);
    }

    Ok(())
}

/// Initialize and run the Tauri application
/// 初始化并运行 Tauri 应用
#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    // Parse CLI arguments
    // 解析命令行参数
    let mut project_root: Option<String> = None;
    let mut target_hwnd: Option<i64> = None;

    let args: Vec<String> = std::env::args().collect();
    let mut i = 1;
    while i < args.len() {
        match args[i].as_str() {
            "--project-root" if i + 1 < args.len() => {
                project_root = Some(args[i + 1].clone());
                i += 2;
            }
            arg if arg.starts_with("--project-root=") => {
                project_root = Some(arg[14..].to_string());
                i += 1;
            }
            "--target-hwnd" if i + 1 < args.len() => {
                target_hwnd = args[i + 1].parse::<i64>().ok();
                i += 2;
            }
            arg if arg.starts_with("--target-hwnd=") => {
                target_hwnd = arg[14..].parse::<i64>().ok();
                i += 1;
            }
            _ => {
                i += 1;
            }
        }
    }

    // Check if this project already has a window open
    // 检查该项目的窗口是否已打开
    if let Some(ref root) = project_root {
        if check_and_activate_existing_window(root) {
            println!("✅ 已激活现有窗口，退出新实例");
            std::process::exit(0);
        }
    }

    // Load settings
    // 加载设置
    let settings = load_settings();

    // Determine window title
    // 确定窗口标题
    let window_title = if let Some(ref root) = project_root {
        let project_name = get_project_name(root);
        format!("Skill Launcher - {}", project_name)
    } else {
        "Skill Launcher".to_string()
    };

    // Build window label from project path for unique identification
    // 从项目路径构建窗口标签以实现唯一标识
    let window_label = if let Some(ref root) = project_root {
        use std::hash::{Hash, Hasher};
        let mut hasher = std::collections::hash_map::DefaultHasher::new();
        root.hash(&mut hasher);
        format!("main_{:X}", hasher.finish())
    } else {
        "main".to_string()
    };

    println!("🚀 Starting Skill Launcher...");
    if let Some(ref root) = project_root {
        println!("📁 Project root: {}", root);
    }
    println!("📋 Window label: {}", window_label);
    println!("📝 Window title: {}", window_title);

    // Note: Tauri 2.0 requires the window to be defined in tauri.conf.json
    // We'll update the title after the window is created
    // 注意：Tauri 2.0 要求在 tauri.conf.json 中定义窗口
    // 我们将在窗口创建后更新标题

    tauri::Builder::default()
        .manage(ProjectState {
            root_path: Mutex::new(project_root.clone()),
        })
        .manage(TargetWindowState {
            hwnd: Mutex::new(target_hwnd),
        })
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        .invoke_handler(tauri::generate_handler![
            update_shortcut,
            health_check,
            skills::scan_skills_directory,
            send_to_claude_cli,
            get_project_root,
        ])
        .setup(move |app| {
            let window = app.get_webview_window("main").unwrap();

            // Update window title with project name
            // 更新窗口标题显示项目名
            if let Err(e) = window.set_title(&window_title) {
                eprintln!("警告: 无法设置窗口标题: {}", e);
            }

            // Set environment variable for skills module
            // 为 skills 模块设置环境变量
            if let Some(ref root) = project_root {
                std::env::set_var("SKILL_LAUNCHER_PROJECT_ROOT", root);
            }

            // Auto-configure Claude Code skill on first run
            // 首次运行时自动配置 Claude Code skill
            if let Err(e) = setup_claude_skill() {
                eprintln!("⚠️ Warning: Failed to setup Claude Code skill: {}", e);
            }

            // Register global shortcut from settings
            // 从设置中注册全局快捷键
            #[cfg(desktop)]
            {
                use tauri_plugin_global_shortcut::GlobalShortcutExt;

                println!("正在注册全局快捷键...");

                let shortcut = config_to_shortcut(&settings.shortcut);
                let shortcut_str = format!(
                    "{}{}{}{}{}",
                    if settings.shortcut.ctrl.unwrap_or(false) { "Ctrl+" } else { "" },
                    if settings.shortcut.alt.unwrap_or(false) { "Alt+" } else { "" },
                    if settings.shortcut.shift.unwrap_or(false) { "Shift+" } else { "" },
                    if settings.shortcut.win.unwrap_or(false) { "Win+" } else { "" },
                    settings.shortcut.key
                );

                println!("快捷键字符串: {}", shortcut_str);

                let window_clone = window.clone();
                let handler = move |_app: &tauri::AppHandle, _shortcut: &tauri_plugin_global_shortcut::Shortcut, _event: tauri_plugin_global_shortcut::ShortcutEvent| {
                    println!("快捷键被触发！");
                    if window_clone.is_visible().unwrap_or(false) {
                        let _ = window_clone.hide();
                    } else {
                        let _ = window_clone.show();
                        let _ = window_clone.set_focus();
                    }
                };

                println!("步骤1: 设置快捷键处理器...");
                if let Err(e) = app.global_shortcut().on_shortcut(shortcut, handler) {
                    eprintln!("❌ 错误: 无法设置快捷键处理器: {}", e);
                } else {
                    println!("✓ 步骤1完成: 处理器已设置");
                }

                println!("步骤2: 注册快捷键...");
                if let Err(e) = app.global_shortcut().register(shortcut) {
                    eprintln!("❌ 错误: 无法注册快捷键 {}: {}", shortcut_str, e);
                    eprintln!("可能的原因:");
                    eprintln!("  1. 快捷键被其他程序占用");
                    eprintln!("  2. 快捷键格式不正确");
                    eprintln!("  3. 权限不足");
                } else {
                    println!("✅ 成功: 快捷键已注册 - {}", shortcut_str);
                    println!("现在可以按快捷键来显示/隐藏窗口");
                }
            }

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
