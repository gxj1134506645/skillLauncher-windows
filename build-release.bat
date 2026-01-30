@echo off
REM Skill Launcher Windows - Release Build Script

echo ========================================
echo   Skill Launcher Windows - Build Release
echo ========================================
echo.

REM Check if in project root
if not exist "package.json" (
    echo Error: Please run this script from project root
    pause
    exit /b 1
)

echo [1/4] Clean old build files...
if exist "dist" rmdir /s /q dist
if exist "src-tauri\target\release" rmdir /s /q src-tauri\target\release
echo OK: Clean complete
echo.

echo [2/4] Build frontend...
call npm run build
if errorlevel 1 (
    echo ERROR: Frontend build failed
    pause
    exit /b 1
)
echo OK: Frontend build complete
echo.

echo [3/4] Build Tauri app...
call npm run tauri build
if errorlevel 1 (
    echo ERROR: Tauri build failed
    pause
    exit /b 1
)
echo OK: Tauri build complete
echo.

echo [4/4] Copy installers to release directory...
if not exist "release" mkdir release
copy /Y "src-tauri\target\release\bundle\nsis\*.exe" release\
copy /Y "src-tauri\target\release\bundle\msi\*.msi" release\
echo OK: Installers copied to release directory
echo.

echo ========================================
echo   Build Success!
echo ========================================
echo.
echo Installer files:
echo   - NSIS: release\Skill Launcher_*_x64-setup.exe
echo   - MSI:  release\Skill Launcher_*_x64_en-US.msi
echo.
echo Next steps:
echo   1. Test installers
echo   2. Create Git tag: git tag -a v1.0.0 -m "Release v1.0.0"
echo   3. Push tag: git push origin v1.0.0
echo   4. Create Release on GitHub
echo.
pause
