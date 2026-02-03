$nsisPath = "C:\Program Files (x86)\NSIS"
$currentPath = [Environment]::GetEnvironmentVariable("Path", "User")

if ($currentPath -notlike "*$nsisPath*") {
    [Environment]::SetEnvironmentVariable("Path", "$currentPath;$nsisPath", "User")
    Write-Host "NSIS added to PATH successfully!" -ForegroundColor Green
    Write-Host "Please close and reopen your terminal for changes to take effect."
} else {
    Write-Host "NSIS is already in PATH."
}
