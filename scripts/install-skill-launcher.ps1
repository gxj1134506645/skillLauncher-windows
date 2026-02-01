param(
    [string]$ProjectRoot = (Get-Location).Path
)

$dest = Join-Path $ProjectRoot ".claude\\skills\\skill-launcher"
New-Item -ItemType Directory -Force -Path $dest | Out-Null

Copy-Item -Force ".\\skills\\skill-launcher\\skill.md" (Join-Path $dest "SKILL.md")
Copy-Item -Force ".\\skills\\skill-launcher\\launch.ps1" (Join-Path $dest "launch.ps1")
Copy-Item -Force ".\\skills\\skill-launcher\\launch.bat" (Join-Path $dest "launch.bat")

Write-Host "Installed project skill to: $dest" -ForegroundColor Green
Write-Host "Restart Claude Code CLI, then run: /skill-launcher" -ForegroundColor Yellow
