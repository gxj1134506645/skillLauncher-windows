---
name: skill-launcher
description: GUI skill picker for Claude Code (project skills first)
---

# Skill Launcher Windows

This skill opens the Skill Launcher GUI on Windows.
It shows project-level skills first, then falls back to user-level skills.

## Instructions

When the user invokes this skill, perform the following steps:

1. **Run the GUI launcher**
   ```powershell
   pwsh -NoProfile -ExecutionPolicy Bypass -File skill-launcher.ps1
   ```

2. **Pick a skill**
   - Search by name
   - Click to copy the skill name to clipboard

## Usage

Search order (priority):
1. `./skills`
2. `./.codex/skills`
3. `./.claude/skills`
4. `~/.claude/skills`

Notes:
- If a skill name appears in multiple locations, the first match wins.
- Set `SKILL_LAUNCHER_PROJECT_ROOT` to override the project root.

## Repository

https://github.com/gxj1134506645/skillLauncher-windows
