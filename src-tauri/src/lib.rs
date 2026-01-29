use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;
use tauri::Manager;

pub mod skills;

pub use skills::*;

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

    tauri::Builder::default()
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
            skills::scan_skills_directory
        ])
        // Setup application
        // 设置应用
        .setup(move |app| {
            // Get main window
            // 获取主窗口
            let window = app.get_webview_window("main").unwrap();

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
