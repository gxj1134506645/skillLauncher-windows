@echo off
REM Skill Launcher Windows Startup Script (Universal Version)
REM Skill Launcher Windows 启动脚本（通用版本）

REM Search for skill-launcher.exe in common installation locations
REM 在常见安装位置搜索 skill-launcher.exe

set EXE_FOUND=0

REM Method 1: Check local app data (user installed)
REM 方法1: 检查用户应用数据目录（用户安装）
if exist "%LOCALAPPDATA%\Programs\skill-launcher\skill-launcher.exe" (
    start "" "%LOCALAPPDATA%\Programs\skill-launcher\skill-launcher.exe"
    set EXE_FOUND=1
    goto :end
)

REM Method 2: Check program files (system installed)
REM 方法2: 检查程序文件目录（系统安装）
if exist "%PROGRAMFILES%\Skill Launcher\skill-launcher.exe" (
    start "" "%PROGRAMFILES%\Skill Launcher\skill-launcher.exe"
    set EXE_FOUND=1
    goto :end
)

REM Method 3: Check Program Files (x86)
REM 方法3: 检查 Program Files (x86)
if exist "%PROGRAMFILES(X86)%\Skill Launcher\skill-launcher.exe" (
    start "" "%PROGRAMFILES(X86)%\Skill Launcher\skill-launcher.exe"
    set EXE_FOUND=1
    goto :end
)

REM Method 4: Check user profile
REM 方法4: 检查用户目录
if exist "%USERPROFILE%\AppData\Local\skill-launcher\skill-launcher.exe" (
    start "" "%USERPROFILE%\AppData\Local\skill-launcher\skill-launcher.exe"
    set EXE_FOUND=1
    goto :end
)

REM Method 5: Check environment variable (for developers)
REM 方法5: 检查环境变量（面向开发者）
if not "%SKILL_LAUNCHER_PATH%"=="" (
    if exist "%SKILL_LAUNCHER_PATH%\src-tauri\target\release\skill-launcher.exe" (
        start "" "%SKILL_LAUNCHER_PATH%\src-tauri\target\release\skill-launcher.exe"
        set EXE_FOUND=1
        goto :end
    )
)

REM If not found anywhere, show error
REM 如果在所有位置都找不到，显示错误
if %EXE_FOUND%==0 (
    echo ========================================
    echo Skill Launcher Not Found
    echo ========================================
    echo.
    echo Could not find Skill Launcher executable!
    echo.
    echo Please install Skill Launcher first:
    echo https://github.com/gxj1134506645/skillLauncher-windows/releases/latest
    echo.
    echo ========================================
    timeout /t 5
)

:end
