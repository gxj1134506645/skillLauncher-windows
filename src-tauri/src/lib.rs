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
                project_root = Some(arg[15..].to_string());
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

    // Determine window title
    // 确定窗口标题
    let window_title = if let Some(ref root) = project_root {
        let project_name = get_project_name(root);
        format!("Skill Launcher - {}", project_name)
    } else {
        "Skill Launcher".to_string()
    };

    println!("🚀 Starting Skill Launcher...");
    if let Some(ref root) = project_root {
        println!("📁 Project root: {}", root);
    }
    println!("📝 Window title: {}", window_title);

    tauri::Builder::default()
        .manage(ProjectState {
            root_path: Mutex::new(project_root.clone()),
        })
        .manage(TargetWindowState {
            hwnd: Mutex::new(target_hwnd),
        })
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_fs::init())
        .invoke_handler(tauri::generate_handler![
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

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
