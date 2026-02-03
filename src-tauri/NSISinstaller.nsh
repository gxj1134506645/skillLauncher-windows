; Custom NSIS script for Skill Launcher
; Skill Launcher 自定义 NSIS 脚本

!include "MUI2.nsh"
!include "FileFunc.nsh"

; 安装位置 / Installation directory
InstallDir "$LOCALAPPDATA\Programs\skill-launcher"
; Use Tauri's default output path (do not override OutFile).

; 安装页面 / Installation pages
!insertmacro MUI_PAGE_WELCOME
; License page requires a file; omit to avoid build failure.
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
  ; Only include the built app and resources to keep the installer small and reliable.
  File "..\..\skill-launcher.exe"
  File /r "..\..\resources\*"

  ; 创建快捷方式 / Create shortcuts
  CreateShortcut "$DESKTOP\Skill Launcher.lnk" "$INSTDIR\skill-launcher.exe"
  CreateShortcut "$STARTMENU\Programs\Skill Launcher.lnk" "$INSTDIR\skill-launcher.exe"

  ; 注册表项 / Registry entries
  WriteRegStr HKCU "Software\SkillLauncher" "" $INSTDIR

  ; 安装 Claude Code skill / Install Claude Code skill
  RMDir /r "$PROFILE\.claude\skills\skill-launcher"
  CreateDirectory "$PROFILE\.claude\skills\skill-launcher"

  ; 创建 SKILL.md / Create SKILL.md (direct exe command, no intermediate scripts)
  FileOpen $0 "$PROFILE\.claude\skills\skill-launcher\SKILL.md" w
  FileWrite $0 "---$\r$\n"
  FileWrite $0 "name: skill-launcher$\r$\n"
  FileWrite $0 "description: Launch the Skill Launcher GUI to browse skills and copy the skill name to clipboard.$\r$\n"
  FileWrite $0 "command: $\"\\\"C:\\\\Program Files\\\\Skill Launcher\\\\skill-launcher.exe\\\" --project-root .$\"$\r$\n"
  FileWrite $0 "---$\r$\n"
  FileWrite $0 "$\r$\n"
  FileWrite $0 "# Skill Launcher for Windows$\r$\n"
  FileWrite $0 "$\r$\n"
  FileWrite $0 "Launch the Skill Launcher GUI when user inputs `/skill-launcher`.$\r$\n"
  FileWrite $0 "$\r$\n"
  FileWrite $0 "Notes:$\r$\n"
  FileWrite $0 "- The window displays both project-level and user-level skills.$\r$\n"
  FileWrite $0 "- Click any skill name to copy it to clipboard.$\r$\n"
  FileWrite $0 "- Each project gets its own window, and the same project reuses the existing window.$\r$\n"
  FileClose $0

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
