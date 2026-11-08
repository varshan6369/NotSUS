# Local PC Direct Execution & 1-Click BAT Architecture Plan

A tailored execution model for ASCII Launcher when self-hosted on a local PC, enabling direct Command Prompt popups and standalone 1-click `.bat` runners without requiring ZIP extraction.

---

## User Review & Critical Decisions

> [!IMPORTANT]
> **Confirmed Execution Choices from Phase 1:**
> 1. **Local Self-Hosted Host Execution**: Because ASCII Launcher is hosted locally on the user's PC, the Node.js server can directly spawn the native Windows Command Prompt window on the desktop.
> 2. **Single 1-Click Runnable BAT**: For browser-initiated launches, the server delivers a single `.bat` file with zero ZIP extraction. Double-clicking this single file immediately executes the Python tool in Command Prompt.
> 3. **Zero Code Exposure on Web**: Public visitors never see raw Python code or file internals on the website.

---

## 1. Architecture & Execution Mechanisms

```
┌────────────────────────────────────────────────────────────────────────┐
│                        ASCII LAUNCHER WEB UI                           │
├────────────────────────────────────────────────────────────────────────┤
│  [ ▶ LAUNCH TERMINAL ON PC ]             [ ⚡ 1-CLICK RUNNABLE .BAT ]  │
└───────────────────┬──────────────────────────────────┬─────────────────┘
                    │ POST /api/tools/:slug/spawn      │ GET /api/tools/:slug/run.bat
                    ▼                                  ▼
┌──────────────────────────────────────┐  ┌──────────────────────────────┐
│       NODE.JS LOCAL BACKEND          │  │     BROWSER FILE DISPATCH    │
│  - Executes native process on host   │  │  - Delivers standalone .bat  │
│  - Spawns Windows CMD window         │  │  - Zero ZIP extraction       │
│  - Sets working directory to project │  │  - Embedded self-contained   │
└───────────────────┬──────────────────┘  └──────────────┬───────────────┘
                    │                                    │
                    ▼                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                   LOCAL DESKTOP WINDOWS COMMAND PROMPT                 │
│  - Terminal window opens immediately on the user's desktop             │
│  - Runs python code.py directly with live interactive prompt           │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Technical Implementation Details

### A. Direct Host Terminal Spawn (`POST /api/tools/:slug/spawn`)
- When the user clicks **[ ▶ Launch Terminal on PC ]**:
  - The client issues a request to `/api/tools/:slug/spawn`.
  - The local Node.js Express server uses Node's `child_process.exec` or `child_process.spawn`.
  - On Windows:
    ```typescript
    const batPath = path.join(PROJECTS_DIR, slug, tool.main.batFilename);
    const projectDir = path.join(PROJECTS_DIR, slug);
    exec(`start cmd.exe /k "cd /d "${projectDir}" && call "${batPath}""`);
    ```
  - On Linux/macOS fallback: Spawns the system terminal emulator (`x-terminal-emulator`, `gnome-terminal`, or `open -a Terminal`).
  - Terminal window pops up directly on the user's monitor!

### B. Single Standalone 1-Click `.bat` Runner (`GET /api/tools/:slug/run.bat`)
- When the user clicks **[ ⚡ 1-Click BAT Launcher ]**:
  - Delivers a single, self-extracting/self-running `.bat` file (no `.zip`!).
  - The `.bat` script contains an embedded base64 or heredoc payload of `code.py`.
  - When double-clicked:
    1. Writes the Python script to a clean temp directory (`%TEMP%\ascii_launcher_<slug>\code.py`).
    2. Opens Windows Command Prompt in color mode (`chcp 65001`).
    3. Executes `python code.py`.
    4. Pauses on finish so the user can read the output.
  - Zero ZIP extraction required.

### C. Admin Project Management (`/admin`)
- Project directories preserved under `server/projects/<slug>/`.
- Admin can upload or edit `run.bat` and `code.py`.
- Admin has a **[ Test Launch on Host PC ]** button to test the desktop terminal popup directly from the dashboard.
- Admin can delete projects, cleanly removing the folder from disk.

---

## 3. Step-by-Step Delivery Plan

1. **Step 1: Backend Local Terminal Spawn API**
   - Add `POST /api/tools/:slug/spawn` to `server.ts` to trigger native desktop terminal launch.
   - Add `GET /api/tools/:slug/run.bat` delivering a single standalone `.bat` file with embedded Python code.

2. **Step 2: Frontend Tool Detail Page Upgrade**
   - Provide the dual 1-click execution actions:
     - Primary: **[ ▶ Launch Terminal on PC ]** (0-click local desktop popup).
     - Secondary: **[ ⚡ Download 1-Click .BAT ]** (single runnable file, zero zip extraction).
   - Display clear guidance without revealing any raw code.

3. **Step 3: Admin Dashboard Integration**
   - Add "Test Launch on PC" in the admin dashboard so administrators can immediately verify that the batch script pops up the terminal window.

4. **Step 4: Verification & Final Audit**
   - Verify both execution pathways and run compile/lint checks.
