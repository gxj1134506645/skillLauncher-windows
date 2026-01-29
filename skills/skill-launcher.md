---
name: skill-launcher
description: Launch SkillLauncher Windows - A quick launcher for Claude Code Skills
---

# Skill Launcher Windows

This skill launches the SkillLauncher Windows application.

## Instructions

When the user invokes this skill, perform the following steps:

1. **Check if SkillLauncher is installed**
   - Look for the executable at common locations:
     - `%USERPROFILE%\skillLauncher-windows\src-tauri\target\release\skill-launcher.exe`
     - `%LOCALAPPDATA%\skill-launcher\skill-launcher.exe`

2. **If installed, launch it**
   ```powershell
   Start-Process "skill-launcher.exe"
   ```

3. **If not installed, guide the user**
   Tell the user:

   > SkillLauncher Windows is not installed. To install:
   >
   > 1. Clone the repository:
   >    ```
   >    git clone https://github.com/gxj1134506645/skillLauncher-windows.git
   >    ```
   > 2. Install dependencies:
   >    ```
   >    cd skillLauncher-windows
   >    npm install
   >    ```
   > 3. Build the application:
   >    ```
   >    npm run tauri build
   >    ```
   > 4. The executable will be at `src-tauri/target/release/skill-launcher.exe`

## Usage

After launching, use:
- `Ctrl+Shift+P` to toggle the launcher window
- Type to search skills
- Arrow keys to navigate
- Enter to execute
- Escape to hide

## Repository

https://github.com/gxj1134506645/skillLauncher-windows
