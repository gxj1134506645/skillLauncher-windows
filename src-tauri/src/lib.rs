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

            // Register global shortcut (Ctrl+Shift+Space)
            // 注册全局快捷键 (Ctrl+Shift+Space)
            #[cfg(desktop)]
            {
                use tauri_plugin_global_shortcut::{Code, GlobalShortcutExt, Modifiers, Shortcut};

                let shortcut = Shortcut::new(
                    Some(Modifiers::CONTROL | Modifiers::SHIFT),
                    Code::Space,
                );

                let window_clone = window.clone();
                app.global_shortcut().on_shortcut(shortcut, move |_app, _shortcut, _event| {
                    // Toggle window visibility
                    // 切换窗口可见性
                    if window_clone.is_visible().unwrap_or(false) {
                        let _ = window_clone.hide();
                    } else {
                        let _ = window_clone.show();
                        let _ = window_clone.set_focus();
                    }
                })?;

                // Register the shortcut
                // 注册快捷键
                app.global_shortcut().register(shortcut)?;
            }

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
