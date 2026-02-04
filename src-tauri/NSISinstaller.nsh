; Custom NSIS script for Skill Launcher
; Skill Launcher 自定义 NSIS 脚本
; This file is included by Tauri's NSIS template

; Create app data directory during installation
; 安装时创建应用数据目录
!macro NSIS_HOOK_PREINSTALL
  ; Create data directory in AppData/Roaming
  ; 在 AppData/Roaming 中创建数据目录
  CreateDirectory "$APPDATA\com.skillLauncher.app"
!macroend

; Post-uninstall hook to delete additional user data
; 卸载后钩子，删除额外的用户数据
!macro NSIS_HOOK_POSTUNINSTALL
  ; Only delete if user checked the "Delete app data" checkbox
  ; 只有当用户勾选了"删除应用数据"复选框时才删除
  ${If} $DeleteAppDataCheckboxState = 1
  ${AndIf} $UpdateMode <> 1
    ; Delete Claude Code skill config / 删除 Claude Code skill 配置
    RMDir /r "$PROFILE\.claude\skills\skill-launcher"

    ; Delete app data directory / 删除应用数据目录
    RMDir /r "$APPDATA\com.skillLauncher.app"

    ; Note: WebView2 cache ($LOCALAPPDATA\com.skillLauncher.app) is already
    ; handled by Tauri's default uninstall logic via $LOCALAPPDATA\${BUNDLEID}
    ; 注意：WebView2 缓存已由 Tauri 默认卸载逻辑处理
  ${EndIf}
!macroend
