@echo off
REM Skill Launcher Windows Startup Script
REM Skill Launcher Windows 启动脚本

REM Get the project root directory (parent of skills directory)
set PROJECT_ROOT=%~dp0..\

REM Set the path to the executable
set EXE_PATH=%PROJECT_ROOT%src-tauri\target\release\skill-launcher.exe

REM Check if the executable exists
if exist "%EXE_PATH%" (
    start "" "%EXE_PATH%"
) else (
    echo Error: Skill Launcher executable not found at:
    echo %EXE_PATH%
    echo.
    echo Please run: npm run tauri build
    pause
)
