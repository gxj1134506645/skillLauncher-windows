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

; 安装部分 / Installation section
Section "Skill Launcher" SecApp
  SectionIn RO

  ; 安装主程序 / Install main application
  SetOutPath $INSTDIR
  File /r "${PROJECT_DIR}\src-tauri\target\release\*"

  ; 创建快捷方式 / Create shortcuts
  CreateShortcut "$DESKTOP\Skill Launcher.lnk" "$INSTDIR\skill-launcher.exe"
  CreateShortcut "$STARTMENU\Programs\Skill Launcher.lnk" "$INSTDIR\skill-launcher.exe"

  ; 注册表项 / Registry entries
  WriteRegStr HKCU "Software\SkillLauncher" "" $INSTDIR

  ; 安装 Claude Code skill / Install Claude Code skill
  CreateDirectory "$LOCALAPPDATA\.claude\skills\skill-launcher"

  ; 创建 skill.md / Create skill.md
  FileOpen $0 "$LOCALAPPDATA\.claude\skills\skill-launcher\skill.md" w
  FileWrite $0 "---$\r$\n"
  FileWrite $0 "command: \"launch.bat\"$\r$\n"
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
  FileWrite $0 "应用窗口会弹出，显示所有可用的 skills。$\r$\n"
  FileClose $0

  ; 创建 launch.bat（自动查找 exe）/ Create launch.bat with auto-detection
  FileOpen $1 "$LOCALAPPDATA\.claude\skills\skill-launcher\launch.bat" w
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
  FileWrite $1 "start \"\" \"%%EXE_PATH%%\"$\r$\n"
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
  RMDir /r "$LOCALAPPDATA\.claude\skills\skill-launcher"

  ; 删除注册表项 / Delete registry
  DeleteRegKey HKCU "Software\SkillLauncher"
SectionEnd
