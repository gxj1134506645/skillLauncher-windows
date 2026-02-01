$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$launchBat = Join-Path $scriptDir "launch.bat"

if (Test-Path -LiteralPath $launchBat) {
    Start-Process -FilePath $launchBat | Out-Null
    exit 0
}

Write-Host "launch.bat not found. Please reinstall Skill Launcher." -ForegroundColor Yellow
exit 1
