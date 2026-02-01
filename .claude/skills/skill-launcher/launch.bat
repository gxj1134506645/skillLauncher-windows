@echo off
REM Terminal skill launcher entrypoint (PowerShell)

setlocal
set "SCRIPT_DIR=%~dp0"
set "PS_SCRIPT=%SCRIPT_DIR%launch.ps1"

powershell -NoProfile -ExecutionPolicy Bypass -File "%PS_SCRIPT%"
exit /b %ERRORLEVEL%
