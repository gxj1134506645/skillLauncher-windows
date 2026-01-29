use tauri::Manager;

/// Initialize and run the Tauri application
/// 初始化并运行 Tauri 应用
#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
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
        // Setup application
        // 设置应用
        .setup(|app| {
            // Get main window
            // 获取主窗口
            let window = app.get_webview_window("main").unwrap();

            // Register global shortcut (Ctrl+Alt+Space)
            // 注册全局快捷键 (Ctrl+Alt+Space)
            #[cfg(desktop)]
            {
                use tauri_plugin_global_shortcut::{Code, GlobalShortcutExt, Modifiers, Shortcut};

                // Primary shortcut: Ctrl+; (Semicolon)
                // 主快捷键: Ctrl+; (分号)
                let shortcut = Shortcut::new(
                    Some(Modifiers::CONTROL),
                    Code::Semicolon,
                );

                let window_clone = window.clone();
                let handler = move |_app: &tauri::AppHandle, _shortcut: &Shortcut, _event: tauri_plugin_global_shortcut::ShortcutEvent| {
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
                if let Err(e) = app.global_shortcut().on_shortcut(shortcut, handler) {
                    eprintln!("Warning: Failed to set shortcut handler: {}", e);
                } else if let Err(e) = app.global_shortcut().register(shortcut) {
                    eprintln!("Warning: Failed to register shortcut Ctrl+;: {}", e);
                    eprintln!("The shortcut may be used by another application.");
                }
            }

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
