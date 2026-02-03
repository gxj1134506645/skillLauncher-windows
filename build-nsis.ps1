# NSIS Build Script for Skill Launcher
# 手动运行 NSIS 打包的脚本

$ErrorActionPreference = "Stop"

$projectRoot = "F:\codes\skillLauncher-windows"
$nsisPath = "C:\Program Files (x86)\NSIS"
$makensis = "$nsisPath\makensis.exe"
$nsiFile = "$projectRoot\src-tauri\target\release\nsis\x64\installer.nsi"
$outputFile = "$projectRoot\src-tauri\target\release\bundle\nsis\Skill Launcher_1.0.0_x64-setup.exe"

# 检查 makensis 是否存在
if (-not (Test-Path $makensis)) {
    Write-Host "ERROR: makensis.exe not found at $makensis" -ForegroundColor Red
    exit 1
}

# 检查 NSI 文件是否存在
if (-not (Test-Path $nsiFile)) {
    Write-Host "ERROR: NSI file not found at $nsiFile" -ForegroundColor Red
    Write-Host "Please run 'npm run tauri build' first to generate the NSI file." -ForegroundColor Yellow
    exit 1
}

# 确保输出目录存在
$outputDir = Split-Path $outputFile -Parent
if (-not (Test-Path $outputDir)) {
    New-Item -ItemType Directory -Path $outputDir -Force | Out-Null
}

Write-Host "Building NSIS installer..." -ForegroundColor Cyan
Write-Host "NSI file: $nsiFile" -ForegroundColor Gray
Write-Host "Output: $outputFile" -ForegroundColor Gray

# 运行 makensis
& $makensis $nsiFile

if ($LASTEXITCODE -eq 0 -or $LASTEXITCODE -eq 1033) {
    # 1033 means warnings but success
    Write-Host "`nNSIS installer built successfully!" -ForegroundColor Green

    # 复制到正确位置（如果需要）
    $builtFile = "$projectRoot\src-tauri\target\release\nsis\x64\installer.exe"
    if (Test-Path $builtFile) {
        Copy-Item $builtFile $outputFile -Force
        Write-Host "Installer copied to: $outputFile" -ForegroundColor Cyan
    }

    # 显示文件信息
    if (Test-Path $outputFile) {
        $fileInfo = Get-Item $outputFile
        Write-Host "`nFile: $($fileInfo.Name)" -ForegroundColor White
        Write-Host "Size: $([math]::Round($fileInfo.Length / 1MB, 2)) MB" -ForegroundColor White
    }
} else {
    Write-Host "`nNSIS build failed with exit code: $LASTEXITCODE" -ForegroundColor Red
    exit $LASTEXITCODE
}
