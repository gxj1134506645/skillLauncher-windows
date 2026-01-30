@echo off
REM Skill Launcher - Automatic Claude Code Skill Configuration
REM Skill Launcher - 自动配置 Claude Code Skill

echo ========================================
echo Skill Launcher - Configure Claude Code Skill
echo ========================================
echo.

REM Check if running with administrator privileges
REM 检查是否有管理员权限
net session >nul 2>&1
if %errorLevel% == 0 (
    echo [INFO] Running with administrator privileges
) else (
    echo [INFO] Running without administrator privileges
)
echo.

REM Set Claude Code skills directory
REM 设置 Claude Code skills 目录
set SKILLS_DIR=%USERPROFILE%\.claude\skills
set SKILL_LAUNCHER_DIR=%SKILLS_DIR%\skill-launcher

REM Create directories if they don't exist
REM 如果目录不存在则创建
if not exist "%SKILLS_DIR%" (
    echo [CREATE] Creating Claude Code skills directory: %SKILLS_DIR%
    mkdir "%SKILLS_DIR%"
)

if exist "%SKILL_LAUNCHER_DIR%" (
    echo [UPDATE] Removing existing skill installation...
    rmdir /s /q "%SKILL_LAUNCHER_DIR%"
)

echo [CREATE] Creating skill directory: %SKILL_LAUNCHER_DIR%
mkdir "%SKILL_LAUNCHER_DIR%"

REM Copy skill.md
REM 复制 skill.md
echo [INSTALL] Installing skill.md...
copy "%~dp0skill.md" "%SKILL_LAUNCHER_DIR%\skill.md" >nul
if errorlevel 1 (
    echo [ERROR] Failed to copy skill.md
    echo Please ensure skill.md exists in the current directory
    pause
    exit /b 1
)

REM Create launch.bat with auto-detection
REM 创建具有自动检测功能的 launch.bat
echo [CREATE] Creating launch.bat with auto-detection...

(
echo @echo off
echo REM Universal launcher for Skill Launcher
echo REM Skill Launcher 通用启动脚本
echo.
echo set "EXE_PATH="
echo.
echo if exist "%%LOCALAPPDATA%%\Programs\skill-launcher\skill-launcher.exe" ^(
echo     set "EXE_PATH=%%LOCALAPPDATA%%\Programs\skill-launcher\skill-launcher.exe"
echo     goto :launch
echo ^)
echo.
echo if exist "%%PROGRAMFILES%%\Skill Launcher\skill-launcher.exe" ^(
echo     set "EXE_PATH=%%PROGRAMFILES%%\Skill Launcher\skill-launcher.exe"
echo     goto :launch
echo ^)
echo.
echo if exist "%%PROGRAMFILES^(X86^)%%\Skill Launcher\skill-launcher.exe" ^(
echo     set "EXE_PATH=%%PROGRAMFILES^(X86^)%%\Skill Launcher\skill-launcher.exe"
echo     goto :launch
echo ^)
echo.
echo if exist "%%LOCALAPPDATA%%\skill-launcher\skill-launcher.exe" ^(
echo     set "EXE_PATH=%%LOCALAPPDATA%%\skill-launcher\skill-launcher.exe"
echo     goto :launch
echo ^)
echo.
echo if not "%%SKILL_LAUNCHER_PATH%%"=="" ^(
echo     if exist "%%SKILL_LAUNCHER_PATH%%\src-tauri\target\release\skill-launcher.exe" ^(
echo         set "EXE_PATH=%%SKILL_LAUNCHER_PATH%%\src-tauri\target\release\skill-launcher.exe"
echo         goto :launch
echo     ^)
echo ^)
echo.
echo echo Error: Skill Launcher not found!
echo echo Please install Skill Launcher from:
echo echo https://github.com/gxj1134506645/skillLauncher-windows/releases
echo timeout /t 3
echo exit /b 1
echo.
echo :launch
echo start "" "%%EXE_PATH%%"
echo exit /b 0
) > "%SKILL_LAUNCHER_DIR%\launch.bat"

echo.
echo ========================================
echo Installation Complete!
echo ========================================
echo.
echo Skill installed to: %SKILL_LAUNCHER_DIR%
echo.
echo Next steps:
echo   1. Restart Claude Code CLI completely
echo   2. Type: /skill-launcher
echo   3. Press Enter to launch the app
echo.
echo ========================================
echo.
echo Press any key to exit...
pause >nul
