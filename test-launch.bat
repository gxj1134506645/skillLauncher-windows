@echo off
REM Test script for skill-launcher
echo Skill Launcher Test Script
echo.
echo Checking exe file...
set EXE_PATH=F:\codes\skillLauncher-windows\src-tauri\target\release\skill-launcher.exe

if exist "%EXE_PATH%" (
    echo [OK] Exe file found at: %EXE_PATH%
    echo.
    echo Starting Skill Launcher...
    start "" "%EXE_PATH%"
    echo [OK] Launch command executed
    echo.
    echo Check if the application window appears.
) else (
    echo [ERROR] Exe file not found at: %EXE_PATH%
    echo.
    echo Current directory: %CD%
    echo.
    pause
)
