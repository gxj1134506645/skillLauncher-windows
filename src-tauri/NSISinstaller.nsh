; Custom NSIS script for Skill Launcher
; Skill Launcher 自定义 NSIS 脚本

!include "MUI2.nsh"
!include "FileFunc.nsh"

; 安装位置 / Installation directory
InstallDir "$LOCALAPPDATA\Programs\skill-launcher"

; 安装页面 / Installation pages
!insertmacro MUI_PAGE_WELCOME
!insertmacro MUI_PAGE_LICENSE
!insertmacro MUI_PAGE_DIRECTORY
!insertmacro MUI_PAGE_INSTFILES
!insertmacro MUI_PAGE_FINISH

!insertmacro MUI_UNPAGE_WELCOME
!insertmacro MUI_UNPAGE_CONFIRM
!insertmacro MUI_UNPAGE_INSTFILES
!insertmacro MUI_UNPAGE_FINISH

Function .onInit
  ; If installed before, set install dir from registry
  ReadRegStr $0 HKCU "Software\SkillLauncher" ""
  StrCmp $0 "" +2
  StrCpy $INSTDIR $0
FunctionEnd

; 安装部分 / Installation section
Section "Skill Launcher" SecApp
  SectionIn RO

  ; 安装主程序 / Install main application
  StrCpy $1 0
  IfFileExists "$LOCALAPPDATA\Programs\skill-launcher\skill-launcher.exe" 0 +2
  StrCpy $1 1
  IfFileExists "$LOCALAPPDATA\Skill Launcher\skill-launcher.exe" 0 +2
  StrCpy $1 1
  IfFileExists "$PROGRAMFILES\Skill Launcher\skill-launcher.exe" 0 +2
  StrCpy $1 1
  IfFileExists "$PROGRAMFILES(X86)\Skill Launcher\skill-launcher.exe" 0 +2
  StrCpy $1 1

  StrCmp $1 1 0 +4
  MessageBox MB_ICONQUESTION|MB_YESNO "检测到已安装的 Skill Launcher。是否覆盖安装？" IDYES +2 IDNO cancel
  RMDir /r "$LOCALAPPDATA\Programs\skill-launcher"
  RMDir /r "$LOCALAPPDATA\Skill Launcher"
  RMDir /r "$PROGRAMFILES\Skill Launcher"
  RMDir /r "$PROGRAMFILES(X86)\Skill Launcher"
  cancel:
  SetOutPath $INSTDIR
  File /r "${PROJECT_DIR}\src-tauri\target\release\*"

  ; 创建快捷方式 / Create shortcuts
  CreateShortcut "$DESKTOP\Skill Launcher.lnk" "$INSTDIR\skill-launcher.exe"
  CreateShortcut "$STARTMENU\Programs\Skill Launcher.lnk" "$INSTDIR\skill-launcher.exe"

  ; 注册表项 / Registry entries
  WriteRegStr HKCU "Software\SkillLauncher" "" $INSTDIR

  ; 安装 Claude Code skill / Install Claude Code skill
  RMDir /r "$PROFILE\.claude\skills\skill-launcher"
  CreateDirectory "$PROFILE\.claude\skills\skill-launcher"

  ; 创建 SKILL.md / Create SKILL.md
  FileOpen $0 "$PROFILE\.claude\skills\skill-launcher\SKILL.md" w
  FileWrite $0 "---$\r$\n"
  FileWrite $0 "name: skill-launcher$\r$\n"
  FileWrite $0 "description: Launch the Skill Launcher GUI to browse skills and copy the skill name to clipboard.$\r$\n"
  FileWrite $0 "command: \"cmd /c launch.bat\"$\r$\n"
  FileWrite $0 "---$\r$\n"
  FileWrite $0 "$\r$\n"
  FileWrite $0 "# Skill Launcher for Windows$\r$\n"
  FileWrite $0 "$\r$\n"
  FileWrite $0 "快速启动 Claude Code Skills 的 Windows 应用。$\r$\n"
  FileWrite $0 "$\r$\n"
  FileWrite $0 "## 使用方法$\r$\n"
  FileWrite $0 "$\r$\n"
  FileWrite $0 "安装完成后，在 Claude Code CLI 中输入:$\r$\n"
  FileWrite $0 "  /skill-launcher$\r$\n"
  FileWrite $0 "$\r$\n"
  FileWrite $0 "应用窗口会弹出，显示所有可用的 skills，点击即可复制名称到剪贴板。$\r$\n"
  FileClose $0

  ; 创建 launch.bat（自动查找 exe）/ Create launch.bat with auto-detection
  FileOpen $1 "$PROFILE\.claude\skills\skill-launcher\launch.bat" w
  FileWrite $1 "@echo off$\r$\n"
  FileWrite $1 "REM Auto-find and launch Skill Launcher$\r$\n"
  FileWrite $1 "$\r$\n"
  FileWrite $1 "set \"EXE_PATH=\"$\r$\n"
  FileWrite $1 "$\r$\n"
  FileWrite $1 "if exist \"%%LOCALAPPDATA%%\\Programs\\skill-launcher\\skill-launcher.exe\" ($\r$\n"
  FileWrite $1 "    set \"EXE_PATH=%%LOCALAPPDATA%%\\Programs\\skill-launcher\\skill-launcher.exe\"$\r$\n"
  FileWrite $1 "    goto :launch$\r$\n"
  FileWrite $1 ")$\r$\n"
  FileWrite $1 "$\r$\n"
  FileWrite $1 "if exist \"%%PROGRAMFILES%%\\Skill Launcher\\skill-launcher.exe\" ($\r$\n"
  FileWrite $1 "    set \"EXE_PATH=%%PROGRAMFILES%%\\Skill Launcher\\skill-launcher.exe\"$\r$\n"
  FileWrite $1 "    goto :launch$\r$\n"
  FileWrite $1 ")$\r$\n"
  FileWrite $1 "$\r$\n"
  FileWrite $1 "echo Error: Skill Launcher not found!$\r$\n"
  FileWrite $1 "timeout /t 3$\r$\n"
  FileWrite $1 "exit /b 1$\r$\n"
  FileWrite $1 "$\r$\n"
  FileWrite $1 ":launch$\r$\n"
  FileWrite $1 "REM Capture current foreground window handle to target the correct CLI window$\r$\n"
  FileWrite $1 "set \"TARGET_HWND=\"$\r$\n"
  FileWrite $1 "for /f %%i in ('powershell -NoProfile -Command \"$def='using System; using System.Runtime.InteropServices; public class Win32 { [DllImport(^\"user32.dll^\" )] public static extern IntPtr GetForegroundWindow(); }'; Add-Type -TypeDefinition $def -ErrorAction SilentlyContinue; [Win32]::GetForegroundWindow().ToInt64()\"') do set \"TARGET_HWND=%%i\"$\r$\n"
  FileWrite $1 "if defined TARGET_HWND (start \"\" \"%%EXE_PATH%%\" --target-hwnd %%TARGET_HWND%%) else start \"\" \"%%EXE_PATH%%\"$\r$\n"
  FileWrite $1 "exit /b 0$\r$\n"
  FileClose $1

SectionEnd

; 卸载部分 / Uninstallation section
Section "Uninstall"
  ; 删除文件 / Delete files
  RMDir /r $INSTDIR

  ; 删除快捷方式 / Delete shortcuts
  Delete "$DESKTOP\Skill Launcher.lnk"
  Delete "$STARTMENU\Programs\Skill Launcher.lnk"

  ; 删除 skill 文件 / Delete skill files
  RMDir /r "$PROFILE\.claude\skills\skill-launcher"

  ; 删除注册表项 / Delete registry
  DeleteRegKey HKCU "Software\SkillLauncher"
SectionEnd
