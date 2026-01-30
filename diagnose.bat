@echo off
echo ========================================
echo Skill Launcher Path Diagnostic Tool
echo ========================================
echo.

echo Current directory: %CD%
echo Script location: %~dp0
echo.

echo Testing relative paths...
echo.

REM Test if we can find the exe from current location
cd "%~dp0"
echo Checking: ..\..\src-tauri\target\release\skill-launcher.exe
if exist "..\..\src-tauri\target\release\skill-launcher.exe" (
    echo [FOUND] Exe file exists at relative path
    echo Full path: %~dp0..\..\src-tauri\target\release\skill-launcher.exe
) else (
    echo [NOT FOUND] Exe file not found at relative path
)
echo.

echo Checking: ..\src-tauri\target\release\skill-launcher.exe
if exist "..\src-tauri\target\release\skill-launcher.exe" (
    echo [FOUND] Exe file exists at parent relative path
) else (
    echo [NOT FOUND] Exe file not found at parent relative path
)
echo.

echo Checking: F:\codes\skillLauncher-windows\src-tauri\target\release\skill-launcher.exe
if exist "F:\codes\skillLauncher-windows\src-tauri\target\release\skill-launcher.exe" (
    echo [FOUND] Exe file exists at absolute path
) else (
    echo [NOT FOUND] Exe file not found at absolute path
)
echo.

echo ========================================
echo.
pause
