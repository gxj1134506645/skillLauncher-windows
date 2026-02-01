param(
    [string]$ProjectRoot = $env:SKILL_LAUNCHER_PROJECT_ROOT
)

function Start-GuiLauncher {
    $exeCandidates = @()

    if ($env:SKILL_LAUNCHER_EXE -and (Test-Path -LiteralPath $env:SKILL_LAUNCHER_EXE)) {
        $exeCandidates += $env:SKILL_LAUNCHER_EXE
    }

    if ($env:SKILL_LAUNCHER_PATH) {
        $devExe = Join-Path $env:SKILL_LAUNCHER_PATH "src-tauri\\target\\release\\skill-launcher.exe"
        if (Test-Path -LiteralPath $devExe) {
            $exeCandidates += $devExe
        }
    }

    $localAppData = $env:LOCALAPPDATA
    if (-not $localAppData) {
        $localAppData = Join-Path $env:USERPROFILE "AppData\\Local"
    }

    $exeCandidates += @(
        (Join-Path $localAppData "Programs\\skill-launcher\\skill-launcher.exe"),
        (Join-Path $localAppData "Skill Launcher\\skill-launcher.exe"),
        (Join-Path $env:ProgramFiles "Skill Launcher\\skill-launcher.exe"),
        (Join-Path ${env:ProgramFiles(x86)} "Skill Launcher\\skill-launcher.exe"),
        (Join-Path $localAppData "skill-launcher\\skill-launcher.exe"),
        (Join-Path $env:USERPROFILE "skillLauncher-windows\\src-tauri\\target\\release\\skill-launcher.exe")
    )

    $exePath = $exeCandidates | Where-Object { $_ -and (Test-Path -LiteralPath $_) } | Select-Object -First 1
    if ($exePath) {
        Start-Process -FilePath $exePath | Out-Null
        Write-Host "GUI launched: $exePath" -ForegroundColor Green
        return $true
    }

    Write-Host "GUI not found. Falling back to terminal mode." -ForegroundColor Yellow
    return $false
}

if ($env:SKILL_LAUNCHER_MODE -eq "gui") {
    if (Start-GuiLauncher) { exit 0 }
}

function Get-FrontMatterValue {
    param(
        [string]$Content,
        [string]$Key
    )

    if ($Content -match "(?s)^---\s*(.*?)\s*---") {
        $frontMatter = $Matches[1]
        foreach ($line in $frontMatter -split "`n") {
            if ($line -match "^\s*$Key\s*:\s*(.+)\s*$") {
                return $Matches[1].Trim()
            }
        }
    }

    return $null
}

function Get-FirstParagraph {
    param([string]$Content)

    if ($Content -match "(?s)^---.*?---\s*(.*)$") {
        $Content = $Matches[1]
    }

    $paragraph = ($Content -split "(`r?`n){2,}")[0]
    $paragraph = $paragraph -replace "`r", ""
    $paragraph = $paragraph -replace "`n", " "
    $paragraph = $paragraph.Trim()

    if ($paragraph.Length -gt 120) {
        return $paragraph.Substring(0, 120)
    }

    return $paragraph
}

function Get-SkillsFromDir {
    param(
        [string]$DirPath,
        [string]$Scope
    )

    $items = @()
    if (-not (Test-Path -LiteralPath $DirPath)) {
        return $items
    }

    Get-ChildItem -LiteralPath $DirPath -Directory -Force | ForEach-Object {
        if ($_.Name.StartsWith(".")) { return }
        $skillMd = Join-Path $_.FullName "SKILL.md"
        if (-not (Test-Path -LiteralPath $skillMd)) { return }

        $content = Get-Content -LiteralPath $skillMd -Raw -ErrorAction SilentlyContinue
        if (-not $content) { return }

        $displayName = Get-FrontMatterValue -Content $content -Key "name"
        $description = Get-FrontMatterValue -Content $content -Key "description"
        if (-not $description) {
            $description = Get-FirstParagraph -Content $content
        }

        $items += [pscustomobject]@{
            Name = $_.Name
            DisplayName = $displayName
            Description = $description
            Path = $_.FullName
            Scope = $Scope
        }
    }

    return $items
}

if ([string]::IsNullOrWhiteSpace($ProjectRoot)) {
    $ProjectRoot = (Get-Location).Path
}

$userHome = $env:USERPROFILE

$searchDirs = @(
    @{ Path = (Join-Path $ProjectRoot "skills"); Scope = "project:skills" },
    @{ Path = (Join-Path $ProjectRoot ".codex\\skills"); Scope = "project:.codex" },
    @{ Path = (Join-Path $ProjectRoot ".claude\\skills"); Scope = "project:.claude" },
    @{ Path = (Join-Path $userHome ".claude\\skills"); Scope = "user:claude" }
)

$skillMap = @{}

foreach ($dir in $searchDirs) {
    $found = Get-SkillsFromDir -DirPath $dir.Path -Scope $dir.Scope
    foreach ($skill in $found) {
        if (-not $skillMap.ContainsKey($skill.Name)) {
            $skillMap[$skill.Name] = $skill
        }
    }
}

$skills = $skillMap.Values | Sort-Object Name

if (-not $skills -or $skills.Count -eq 0) {
    Write-Host "No skills found. Check project or user skill directories." -ForegroundColor Yellow
    exit 1
}

while ($true) {
    $query = Read-Host "Search skills (empty=all, q=quit)"
    if ($query -match "^(q|quit|exit)$") { break }

    if ([string]::IsNullOrWhiteSpace($query)) {
        $filtered = $skills
    } else {
        $q = $query.ToLowerInvariant()
        $filtered = $skills | Where-Object {
            $_.Name.ToLowerInvariant().Contains($q) -or
            ($_.DisplayName -and $_.DisplayName.ToLowerInvariant().Contains($q)) -or
            ($_.Description -and $_.Description.ToLowerInvariant().Contains($q))
        }
    }

    if (-not $filtered -or $filtered.Count -eq 0) {
        Write-Host "No skills found for query: $query" -ForegroundColor DarkYellow
        continue
    }

    $i = 0
    foreach ($skill in $filtered) {
        $label = if ($skill.DisplayName) { $skill.DisplayName } else { $skill.Name }
        Write-Host ("[{0}] /{1} - {2} ({3})" -f $i, $skill.Name, $label, $skill.Scope)
        $i++
    }

    $pick = Read-Host "Select number"
    $parsedIndex = 0
    if (-not [int]::TryParse($pick, [ref]$parsedIndex)) {
        Write-Host "Invalid selection." -ForegroundColor DarkYellow
        continue
    }

    $index = $parsedIndex
    if ($index -lt 0 -or $index -ge $filtered.Count) {
        Write-Host "Selection out of range." -ForegroundColor DarkYellow
        continue
    }

    $selected = $filtered[$index]
    $cmd = "/$($selected.Name)"
    Set-Clipboard -Value $cmd
    Write-Host "Selected: $cmd (copied to clipboard)" -ForegroundColor Green
    break
}
