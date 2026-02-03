---
name: skill-launcher
display_name: 技能启动器
description: Launch the Skill Launcher GUI to browse skills and copy the skill name to clipboard. Direct execution - no code search needed.
command: "\"C:\\Program Files\\Skill Launcher\\skill-launcher.exe\" --project-root ."
---

# Skill Launcher for Windows

## IMPORTANT - How to Handle This Skill

When user invokes `/skill-launcher`:

1. **DO NOT** search for any code
2. **DO NOT** try to "understand" the implementation
3. **DO NOT** read any files

**JUST execute this command directly:**

```bash
powershell -NoProfile -Command "Start-Process 'C:\\Program Files\\Skill Launcher\\skill-launcher.exe' -ArgumentList '--project-root', '.'"
```

That's it. The GUI will open and handle everything else.

## What This Does

- Opens a GUI window showing all available skills
- User can click any skill name to copy it to clipboard
- No further action needed from you
