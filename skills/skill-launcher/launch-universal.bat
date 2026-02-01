@echo off
REM Skill Launcher Windows Startup Script (Universal Version)
REM Skill Launcher Windows 启动脚本（通用版本）

REM Search for skill-launcher.exe in common installation locations
REM 在常见安装位置搜索 skill-launcher.exe

set EXE_FOUND=0
set "LOCALAPPDATA_FALLBACK=%LOCALAPPDATA%"
if "%LOCALAPPDATA_FALLBACK%"=="" set "LOCALAPPDATA_FALLBACK=%USERPROFILE%\AppData\Local"

REM If already running, try to bring the existing window to front
REM 如果已在运行，尝试把现有窗口拉到前台
set "EXISTING_PID="
for /f %%i in ('powershell -NoProfile -Command "Get-Process skill-launcher -ErrorAction SilentlyContinue | Select-Object -First 1 -ExpandProperty Id"') do set "EXISTING_PID=%%i"
set "EXE_PATH_FROM_PROCESS="
for /f "delims=" %%i in ('powershell -NoProfile -Command "Get-Process skill-launcher -ErrorAction SilentlyContinue | Select-Object -First 1 -ExpandProperty Path"') do set "EXE_PATH_FROM_PROCESS=%%i"
if defined EXISTING_PID (
    powershell -NoProfile -Command "Add-Type -AssemblyName Microsoft.VisualBasic -ErrorAction SilentlyContinue; [Microsoft.VisualBasic.Interaction]::AppActivate(%EXISTING_PID%) | Out-Null"
    set "EXISTING_HWND="
    for /f %%i in ('powershell -NoProfile -Command "$p=Get-Process -Id %EXISTING_PID% -ErrorAction SilentlyContinue; if($p){$p.Refresh(); $p.MainWindowHandle}"') do set "EXISTING_HWND=%%i"
    if defined EXISTING_HWND (
        powershell -NoProfile -Command "$sig='[DllImport(\"user32.dll\")] public static extern bool SetForegroundWindow(IntPtr hWnd); [DllImport(\"user32.dll\")] public static extern bool ShowWindowAsync(IntPtr hWnd, int nCmdShow);'; Add-Type -Name Win32 -Namespace Native -MemberDefinition $sig -ErrorAction SilentlyContinue; [Native.Win32]::ShowWindowAsync([IntPtr]::new(%EXISTING_HWND%), 9) | Out-Null; [Native.Win32]::SetForegroundWindow([IntPtr]::new(%EXISTING_HWND%)) | Out-Null"
        if defined EXE_PATH_FROM_PROCESS start "" "%EXE_PATH_FROM_PROCESS%"
        exit /b 0
    )
)

REM Capture current foreground window handle to target the correct CLI window
REM 捕获当前前台窗口句柄，用于精准回填到正确的 CLI 窗口
set "TARGET_HWND="
for /f %%i in ('powershell -NoProfile -Command "$def='using System; using System.Runtime.InteropServices; public class Win32 { [DllImport(^\"user32.dll^\" )] public static extern IntPtr GetForegroundWindow(); }'; Add-Type -TypeDefinition $def -ErrorAction SilentlyContinue; [Win32]::GetForegroundWindow().ToInt64()"') do set "TARGET_HWND=%%i"

REM Method 0: Check project-local build (debug/release) in current working directory
REM 方法0: 优先检查当前项目目录下的本地构建（debug/release）
if exist "%CD%\src-tauri\target\debug\skill-launcher.exe" (
    if defined TARGET_HWND (start "" "%CD%\src-tauri\target\debug\skill-launcher.exe" --target-hwnd %TARGET_HWND%) else start "" "%CD%\src-tauri\target\debug\skill-launcher.exe"
    set EXE_FOUND=1
    goto :end
)
if exist "%CD%\src-tauri\target\release\skill-launcher.exe" (
    if defined TARGET_HWND (start "" "%CD%\src-tauri\target\release\skill-launcher.exe" --target-hwnd %TARGET_HWND%) else start "" "%CD%\src-tauri\target\release\skill-launcher.exe"
    set EXE_FOUND=1
    goto :end
)

REM Method 1: Check local app data (user installed)
REM 方法1: 检查用户应用数据目录（用户安装）
if exist "%LOCALAPPDATA_FALLBACK%\Programs\skill-launcher\skill-launcher.exe" (
    if defined TARGET_HWND (start "" "%LOCALAPPDATA_FALLBACK%\Programs\skill-launcher\skill-launcher.exe" --target-hwnd %TARGET_HWND%) else start "" "%LOCALAPPDATA_FALLBACK%\Programs\skill-launcher\skill-launcher.exe"
    set EXE_FOUND=1
    goto :end
)

REM Method 2: Check program files (system installed)
REM 方法2: 检查程序文件目录（系统安装）
if exist "%PROGRAMFILES%\Skill Launcher\skill-launcher.exe" (
    if defined TARGET_HWND (start "" "%PROGRAMFILES%\Skill Launcher\skill-launcher.exe" --target-hwnd %TARGET_HWND%) else start "" "%PROGRAMFILES%\Skill Launcher\skill-launcher.exe"
    set EXE_FOUND=1
    goto :end
)

REM Method 3: Check Program Files (x86)
REM 方法3: 检查 Program Files (x86)
if exist "%PROGRAMFILES(X86)%\Skill Launcher\skill-launcher.exe" (
    if defined TARGET_HWND (start "" "%PROGRAMFILES(X86)%\Skill Launcher\skill-launcher.exe" --target-hwnd %TARGET_HWND%) else start "" "%PROGRAMFILES(X86)%\Skill Launcher\skill-launcher.exe"
    set EXE_FOUND=1
    goto :end
)

REM Method 4: Check user profile
REM 方法4: 检查用户目录
if exist "%LOCALAPPDATA_FALLBACK%\skill-launcher\skill-launcher.exe" (
    if defined TARGET_HWND (start "" "%LOCALAPPDATA_FALLBACK%\skill-launcher\skill-launcher.exe" --target-hwnd %TARGET_HWND%) else start "" "%LOCALAPPDATA_FALLBACK%\skill-launcher\skill-launcher.exe"
    set EXE_FOUND=1
    goto :end
)

REM Method 5: Check environment variable (for developers)
REM 方法5: 检查环境变量（面向开发者）
if not "%SKILL_LAUNCHER_PATH%"=="" (
    if exist "%SKILL_LAUNCHER_PATH%\src-tauri\target\release\skill-launcher.exe" (
        if defined TARGET_HWND (start "" "%SKILL_LAUNCHER_PATH%\src-tauri\target\release\skill-launcher.exe" --target-hwnd %TARGET_HWND%) else start "" "%SKILL_LAUNCHER_PATH%\src-tauri\target\release\skill-launcher.exe"
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
