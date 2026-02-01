use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;
use std::sync::Mutex;
use tauri::Manager;

pub mod skills;

pub use skills::*;

#[derive(Default)]
struct TargetWindowState {
    hwnd: Mutex<Option<i64>>,
}

/// Setup Claude Code skill on first run
/// 首次运行时配置 Claude Code skill
fn setup_claude_skill() -> Result<(), String> {
    println!("🔧 Checking Claude Code skill configuration...");

    const SKILL_MD_CONTENT: &str = include_str!("../../skills/skill-launcher/skill.md");
    const LAUNCH_BAT_CONTENT: &str = include_str!("../../skills/skill-launcher/launch.bat");
    const LAUNCH_PS1_CONTENT: &str = include_str!("../../skills/skill-launcher/launch.ps1");

    // Get Claude skills directory
    // 获取 Claude skills 目录（优先项目级）
    let skills_dir = if let Ok(root) = std::env::var("SKILL_LAUNCHER_PROJECT_ROOT") {
        let root_path = PathBuf::from(root);
        if root_path.exists() {
            root_path.join(".claude").join("skills")
        } else {
            let home = dirs::home_dir().unwrap_or_else(|| PathBuf::from("."));
            home.join(".claude").join("skills")
        }
    } else {
        let home = dirs::home_dir().unwrap_or_else(|| PathBuf::from("."));
        home.join(".claude").join("skills")
    };
    let skill_dir = skills_dir.join("skill-launcher");
    let legacy_skill_md = skill_dir.join("skill.md");
    let legacy_launch_simple = skill_dir.join("launch-simple.bat");
    let legacy_launch_universal = skill_dir.join("launch-universal.bat");

    // Check if already configured
    // 检查是否已配置
    let skill_md = skill_dir.join("SKILL.md");
    let launch_bat = skill_dir.join("launch.bat");
    let launch_ps1 = skill_dir.join("launch.ps1");

    let mut needs_reinstall = false;
    if legacy_skill_md.exists() || legacy_launch_simple.exists() || legacy_launch_universal.exists() {
        needs_reinstall = true;
    }

    let should_write_skill = match fs::read_to_string(&skill_md) {
        Ok(existing) => !existing.to_lowercase().contains("command:"),
        Err(_) => true,
    };

    if should_write_skill {
        needs_reinstall = true;
    }

    let should_write_launch = match fs::read_to_string(&launch_bat) {
        Ok(existing) => !existing.contains("Skill Launcher Windows Startup Script"),
        Err(_) => true,
    };

    let should_write_launch_ps1 = match fs::read_to_string(&launch_ps1) {
        Ok(existing) => !existing.contains("launch.bat"),
        Err(_) => true,
    };

    if needs_reinstall && skill_dir.exists() {
        fs::remove_dir_all(&skill_dir)
            .map_err(|e| format!("Failed to remove old skill directory: {}", e))?;
    }

    // Create directories if they don't exist
    // 如果目录不存在则创建
    fs::create_dir_all(&skill_dir).map_err(|e| format!("Failed to create skill directory: {}", e))?;

    let mut wrote_any = false;

    if needs_reinstall || should_write_skill {
        println!("📝 Installing Claude Code SKILL.md...");
        fs::write(&skill_md, SKILL_MD_CONTENT).map_err(|e| format!("Failed to write SKILL.md: {}", e))?;
        wrote_any = true;
    }

    if needs_reinstall || should_write_launch {
        println!("📝 Installing Claude Code launch.bat...");
        fs::write(&launch_bat, LAUNCH_BAT_CONTENT).map_err(|e| format!("Failed to write launch.bat: {}", e))?;
        wrote_any = true;
    }

    if needs_reinstall || should_write_launch_ps1 {
        println!("📝 Installing Claude Code launch.ps1...");
        fs::write(&launch_ps1, LAUNCH_PS1_CONTENT).map_err(|e| format!("Failed to write launch.ps1: {}", e))?;
        wrote_any = true;
    }

    if !wrote_any {
        println!("✅ Claude Code skill already configured");
        return Ok(());
    }

    println!("✅ Claude Code skill configured successfully!");
    println!("📍 Location: {}", skill_dir.display());
    println!("ℹ️  Restart Claude Code CLI to use /skill-launcher command");

    Ok(())
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

    // Create directory if not exists / 如果目录不存在则创建
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

    // Parse key code / 解析键码
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
        _ => Code::Space, // Default to Space / 默认为空格键
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

    // 使用 PowerShell 将命令发送到终端窗口
    // 使用 Add-Type 引入 Windows API 来激活特定窗口
    // Use PowerShell with Windows API to activate specific window
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

# 优先使用传入的窗口句柄 / Prefer provided window handle
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

# 设置剪贴板 / Set clipboard
Set-Clipboard -Value "{cmd}"

# 等待剪贴板设置完成 / Wait for clipboard
Start-Sleep -Milliseconds 300

# 尝试找到并激活 Windows Terminal 或 PowerShell 窗口（回退方案）
# Try to find and activate Windows Terminal or PowerShell window (fallback)
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

# 发送 Ctrl+V 粘贴命令 / Send Ctrl+V to paste command
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

    // Re-register the shortcut / 重新注册快捷键
    #[cfg(desktop)]
    {
        use tauri_plugin_global_shortcut::GlobalShortcutExt;

        println!("正在更新全局快捷键...");

        // First, unregister all shortcuts / 先注销所有快捷键
        if let Err(e) = app_handle.global_shortcut().unregister_all() {
            eprintln!("警告: 注销快捷键失败: {}", e);
        } else {
            println!("✓ 已注销旧快捷键");
        }

        // Register new shortcut / 注册新快捷键
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
            // Toggle window visibility / 切换窗口可见性
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
    // Load settings / 加载设置
    let settings = load_settings();
    let mut target_hwnd: Option<i64> = None;

    // Parse CLI args for target window handle
    let mut args = std::env::args().peekable();
    while let Some(arg) = args.next() {
        if let Some(value) = arg.strip_prefix("--target-hwnd=") {
            target_hwnd = value.parse::<i64>().ok();
            continue;
        }
        if arg == "--target-hwnd" {
            if let Some(next) = args.peek() {
                target_hwnd = next.parse::<i64>().ok();
                let _ = args.next();
            }
        }
    }

    tauri::Builder::default()
        .manage(TargetWindowState {
            hwnd: Mutex::new(target_hwnd),
        })
        // Register shell plugin for executing commands
        // 注册 shell 插件用于执行命令
        .plugin(tauri_plugin_shell::init())
        // Register fs plugin for file operations
        // 注册 fs 插件用于文件操作
        .plugin(tauri_plugin_fs::init())
        // Register global shortcut plugin
        // 注册全局快捷键插件
        .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        // Register commands / 注册命令
        .invoke_handler(tauri::generate_handler![
            update_shortcut,
            health_check,
            skills::scan_skills_directory,
            send_to_claude_cli
        ])
        // Setup application
        // 设置应用
        .setup(move |app| {
            // Get main window
            // 获取主窗口
            let window = app.get_webview_window("main").unwrap();

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
                println!("配置: Ctrl+Shift+P");

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
                    // Toggle window visibility
                    // 切换窗口可见性
                    if window_clone.is_visible().unwrap_or(false) {
                        let _ = window_clone.hide();
                    } else {
                        let _ = window_clone.show();
                        let _ = window_clone.set_focus();
                    }
                };

                // Try to register the shortcut, log warning if failed
                // 尝试注册快捷键，失败时记录警告
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
                    println!("现在可以按 Ctrl+Shift+P 来显示/隐藏窗口");
                }
            }

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
