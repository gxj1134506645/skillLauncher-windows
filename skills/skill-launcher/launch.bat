@echo off
REM Universal launcher for Skill Launcher
REM Skill Launcher 通用启动脚本

REM Search in common installation locations
REM 在常见安装位置搜索

set "EXE_PATH="

REM Location 1: User's local app data (recommended for portable installs)
REM 位置1: 用户本地应用数据（推荐用于便携安装）
if exist "%LOCALAPPDATA%\Programs\skill-launcher\skill-launcher.exe" (
    set "EXE_PATH=%LOCALAPPDATA%\Programs\skill-launcher\skill-launcher.exe"
    goto :launch
)

REM Location 1.5: User's local app data (Tauri default install location)
REM 位置1.5: 用户本地应用数据（Tauri 默认安装位置）
if exist "%LOCALAPPDATA%\Skill Launcher\skill-launcher.exe" (
    set "EXE_PATH=%LOCALAPPDATA%\Skill Launcher\skill-launcher.exe"
    goto :launch
)

REM Location 2: Program Files
REM 位置2: 程序文件
if exist "%PROGRAMFILES%\Skill Launcher\skill-launcher.exe" (
    set "EXE_PATH=%PROGRAMFILES%\Skill Launcher\skill-launcher.exe"
    goto :launch
)

REM Location 3: Program Files (x86)
REM 位置3: Program Files (x86)
if exist "%PROGRAMFILES(X86)%\Skill Launcher\skill-launcher.exe" (
    set "EXE_PATH=%PROGRAMFILES(X86)%\Skill Launcher\skill-launcher.exe"
    goto :launch
)

REM Location 4: User AppData\Local
REM 位置4: 用户 AppData\Local
if exist "%LOCALAPPDATA%\skill-launcher\skill-launcher.exe" (
    set "EXE_PATH=%LOCALAPPDATA%\skill-launcher\skill-launcher.exe"
    goto :launch
)

REM Location 5: Check environment variable (for developers)
REM 位置5: 检查环境变量（面向开发者）
if not "%SKILL_LAUNCHER_PATH%"=="" (
    if exist "%SKILL_LAUNCHER_PATH%\src-tauri\target\release\skill-launcher.exe" (
        set "EXE_PATH=%SKILL_LAUNCHER_PATH%\src-tauri\target\release\skill-launcher.exe"
        goto :launch
    )
)

REM Location 6: Default developer build location
REM 位置6: 默认开发者构建位置
if exist "%USERPROFILE%\skillLauncher-windows\src-tauri\target\release\skill-launcher.exe" (
    set "EXE_PATH=%USERPROFILE%\skillLauncher-windows\src-tauri\target\release\skill-launcher.exe"
    goto :launch
)

REM If not found, show helpful error message
REM 如果未找到，显示友好的错误消息
echo ========================================
echo Skill Launcher Not Found
echo ========================================
echo.
echo Could not find skill-launcher.exe
echo.
echo Please install Skill Launcher from:
echo https://github.com/gxj1134506645/skillLauncher-windows/releases
echo.
echo Common installation locations:
echo   - %%LOCALAPPDATA%%\Programs\skill-launcher
echo   - %%LOCALAPPDATA%%\Skill Launcher
echo   - %%PROGRAMFILES%%\Skill Launcher
echo.
echo For developers, set environment variable:
echo   setx SKILL_LAUNCHER_PATH "your-project-path"
echo.
echo ========================================
timeout /t 5
exit /b 1

:launch
start "" "%EXE_PATH%"
exit /b 0
