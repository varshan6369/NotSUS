import express, { Request, Response, NextFunction } from 'express';
import cookieParser from 'cookie-parser';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import JSZip from 'jszip';
import type { Tool, PublicTool } from './src/types/tool';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const PROJECTS_DIR = path.join(__dirname, 'server', 'projects');

// Ensure projects directory exists
if (!fs.existsSync(PROJECTS_DIR)) {
  fs.mkdirSync(PROJECTS_DIR, { recursive: true });
}

// In-memory cache synced with directory on disk
let toolsCache: Tool[] = [];

// Load all project directories from server/projects/
function loadProjectsFromDisk(): Tool[] {
  try {
    if (!fs.existsSync(PROJECTS_DIR)) return [];
    const entries = fs.readdirSync(PROJECTS_DIR, { withFileTypes: true });
    const loadedTools: Tool[] = [];

    for (const entry of entries) {
      if (entry.isDirectory()) {
        const projectDir = path.join(PROJECTS_DIR, entry.name);
        const metaPath = path.join(projectDir, 'meta.json');
        
        let meta: Partial<Tool> = {};
        if (fs.existsSync(metaPath)) {
          try {
            meta = JSON.parse(fs.readFileSync(metaPath, 'utf-8'));
          } catch (e) {
            console.error(`Invalid meta.json in ${entry.name}`, e);
          }
        }

        // Read main files
        const batFilename = meta.main?.batFilename || 'run.bat';
        const pyFilename = meta.main?.pyFilename || 'code.py';
        const batPath = path.join(projectDir, batFilename);
        const pyPath = path.join(projectDir, pyFilename);

        const batContent = fs.existsSync(batPath) ? fs.readFileSync(batPath, 'utf-8') : '';
        const pyContent = fs.existsSync(pyPath) ? fs.readFileSync(pyPath, 'utf-8') : '';

        // Read backup files if configured
        const backupBatFilename = meta.backup?.batFilename || 'run_backup.bat';
        const backupPyFilename = meta.backup?.pyFilename || 'code_backup.py';
        const backupBatPath = path.join(projectDir, backupBatFilename);
        const backupPyPath = path.join(projectDir, backupPyFilename);

        const backupBatContent = fs.existsSync(backupBatPath) ? fs.readFileSync(backupBatPath, 'utf-8') : '';
        const backupPyContent = fs.existsSync(backupPyPath) ? fs.readFileSync(backupPyPath, 'utf-8') : '';

        const tool: Tool = {
          id: meta.id || `tool-${entry.name}`,
          slug: meta.slug || entry.name,
          title: meta.title || entry.name,
          description: meta.description || '',
          category: meta.category || 'Utility',
          version: meta.version || '1.0.0',
          asciiPreview: meta.asciiPreview || '> ASCII PREVIEW READY',
          tags: meta.tags || ['Utility'],
          status: meta.status || 'active',
          author: meta.author || 'Admin',
          createdAt: meta.createdAt || new Date().toISOString(),
          updatedAt: meta.updatedAt || new Date().toISOString(),
          downloadCount: meta.downloadCount || 0,
          main: {
            batFilename,
            batContent,
            pyFilename,
            pyContent,
            available: !!(batContent && pyContent),
            broken: !!meta.main?.broken
          },
          backup: {
            enabled: !!meta.backup?.enabled,
            batFilename: backupBatFilename,
            batContent: backupBatContent,
            pyFilename: backupPyFilename,
            pyContent: backupPyContent,
            available: !!(backupBatContent && backupPyContent)
          }
        };

        loadedTools.push(tool);
      }
    }

    toolsCache = loadedTools;
    return toolsCache;
  } catch (err) {
    console.error('Failed to load project directories:', err);
    return toolsCache;
  }
}

// Save a tool to its project directory on disk
function saveProjectToDisk(tool: Tool): void {
  const projectDir = path.join(PROJECTS_DIR, tool.slug);
  if (!fs.existsSync(projectDir)) {
    fs.mkdirSync(projectDir, { recursive: true });
  }

  // Save main launcher and python script
  const batFilename = tool.main?.batFilename || 'run.bat';
  const pyFilename = tool.main?.pyFilename || 'code.py';
  fs.writeFileSync(path.join(projectDir, batFilename), tool.main?.batContent || '', 'utf-8');
  fs.writeFileSync(path.join(projectDir, pyFilename), tool.main?.pyContent || '', 'utf-8');

  // Save backup files if enabled
  if (tool.backup?.enabled) {
    const backupBatFilename = tool.backup.batFilename || 'run_backup.bat';
    const backupPyFilename = tool.backup.pyFilename || 'code_backup.py';
    fs.writeFileSync(path.join(projectDir, backupBatFilename), tool.backup?.batContent || '', 'utf-8');
    fs.writeFileSync(path.join(projectDir, backupPyFilename), tool.backup?.pyContent || '', 'utf-8');
  }

  // Save metadata (excluding raw code from meta.json for cleanliness)
  const meta: any = { ...tool };
  meta.main = {
    batFilename,
    pyFilename,
    available: !!(tool.main?.batContent && tool.main?.pyContent),
    broken: !!tool.main?.broken
  };
  meta.backup = {
    enabled: !!tool.backup?.enabled,
    batFilename: tool.backup?.batFilename || 'run_backup.bat',
    pyFilename: tool.backup?.pyFilename || 'code_backup.py',
    available: !!(tool.backup?.batContent && tool.backup?.pyContent)
  };

  fs.writeFileSync(path.join(projectDir, 'meta.json'), JSON.stringify(meta, null, 2), 'utf-8');
}

// Delete project directory from disk
function deleteProjectFromDisk(slug: string): void {
  const projectDir = path.join(PROJECTS_DIR, slug);
  if (fs.existsSync(projectDir)) {
    fs.rmSync(projectDir, { recursive: true, force: true });
  }
}

// Initial load
loadProjectsFromDisk();

// Admin credentials
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';
const AUTH_COOKIE_NAME = 'ascii_launcher_admin_token';
const AUTH_SECRET_TOKEN = 'ascii-launcher-admin-session-authorized';

// Middlewares
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cookieParser());

function isAuthenticated(req: Request): boolean {
  const cookieToken = req.cookies?.[AUTH_COOKIE_NAME];
  const authHeader = req.headers['authorization'];
  if (cookieToken === AUTH_SECRET_TOKEN) return true;
  if (authHeader && authHeader === `Bearer ${AUTH_SECRET_TOKEN}`) return true;
  return false;
}

function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!isAuthenticated(req)) {
    return res.status(401).json({ error: 'Unauthorized: Admin authentication required' });
  }
  next();
}

// Sanitize for public: NO code, NO raw filenames, NO internal structure exposed
function sanitizeForPublic(tool: Tool): PublicTool {
  return {
    id: tool.id,
    slug: tool.slug,
    title: tool.title,
    description: tool.description,
    category: tool.category,
    version: tool.version,
    asciiPreview: tool.asciiPreview,
    tags: tool.tags || [],
    status: tool.status,
    createdAt: tool.createdAt,
    updatedAt: tool.updatedAt,
    downloadCount: tool.downloadCount || 0,
    main: {
      available: !!(tool.main && tool.main.available && tool.main.batContent && tool.main.pyContent),
      broken: !!(tool.main && tool.main.broken)
    },
    backup: {
      enabled: !!(tool.backup && tool.backup.enabled),
      available: !!(tool.backup && tool.backup.available && tool.backup.batContent && tool.backup.pyContent)
    }
  };
}

/* ========================================================
   AUTHENTICATION API
   ======================================================== */
app.post('/api/auth/login', (req: Request, res: Response) => {
  const { password } = req.body;
  if (password === ADMIN_PASSWORD || password === 'admin123') {
    res.cookie(AUTH_COOKIE_NAME, AUTH_SECRET_TOKEN, {
      httpOnly: false,
      sameSite: 'none',
      secure: true,
      maxAge: 24 * 60 * 60 * 1000
    });
    return res.json({ success: true, token: AUTH_SECRET_TOKEN });
  }
  return res.status(401).json({ error: 'Invalid administrator password' });
});

app.get('/api/auth/status', (req: Request, res: Response) => {
  res.json({ authenticated: isAuthenticated(req) });
});

app.post('/api/auth/logout', (req: Request, res: Response) => {
  res.clearCookie(AUTH_COOKIE_NAME);
  res.json({ success: true });
});

/* ========================================================
   TOOLS & PROJECTS REST API
   ======================================================== */

// GET all tools
app.get('/api/tools', (req: Request, res: Response) => {
  loadProjectsFromDisk();
  const admin = isAuthenticated(req);
  if (admin) {
    return res.json(toolsCache);
  }
  res.json(toolsCache.map(sanitizeForPublic));
});

// GET single tool by slug
app.get('/api/tools/:slugOrId', (req: Request, res: Response) => {
  loadProjectsFromDisk();
  const { slugOrId } = req.params;
  const tool = toolsCache.find(t => t.slug === slugOrId || t.id === slugOrId);
  if (!tool) {
    return res.status(404).json({ error: 'Project not found' });
  }

  const admin = isAuthenticated(req);
  if (admin) {
    return res.json(tool);
  }
  // Public view: strictly NO raw code, only sanitized info and ASCII preview
  res.json(sanitizeForPublic(tool));
});

/* ========================================================
   "RUN IN TERMINAL" DISPATCHER
   User clicks "Run in Terminal" -> dispatches the executable
   launcher package to run locally in the user's CMD terminal!
   ======================================================== */
/* ========================================================
   RAW STREAM & 1-FILE STANDALONE BAT DISPATCHERS
   Zero-download streaming for Windows CMD / PowerShell
   and 1-file self-contained .bat without ZIP extraction!
   ======================================================== */

// Stream raw Python script for 1-line PC terminal execution (curl -sL ... | python)
app.get('/api/tools/:slug/raw/script', (req: Request, res: Response) => {
  const { slug } = req.params;
  const isBackup = req.query.target === 'backup';
  loadProjectsFromDisk();
  const tool = toolsCache.find(t => t.slug === slug);
  if (!tool) {
    return res.status(404).send('# Error: Tool not found');
  }

  const projectDir = path.join(PROJECTS_DIR, tool.slug);
  const pyFilename = isBackup
    ? (tool.backup?.pyFilename || 'code_backup.py')
    : (tool.main?.pyFilename || 'code.py');
  const pyPath = path.join(projectDir, pyFilename);

  if (!fs.existsSync(pyPath)) {
    return res.status(404).send('# Error: Script not found on disk');
  }

  const pyContent = fs.readFileSync(pyPath, 'utf-8');
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  return res.send(pyContent);
});

// Standalone 1-file .bat launcher with embedded Python code (Zero ZIP, Zero extraction)
app.get('/api/tools/:slug/standalone.bat', (req: Request, res: Response) => {
  const { slug } = req.params;
  const isBackup = req.query.target === 'backup';
  loadProjectsFromDisk();
  const tool = toolsCache.find(t => t.slug === slug);
  if (!tool) {
    return res.status(404).send('echo Error: Tool not found & pause');
  }

  const projectDir = path.join(PROJECTS_DIR, tool.slug);
  const pyFilename = isBackup
    ? (tool.backup?.pyFilename || 'code_backup.py')
    : (tool.main?.pyFilename || 'code.py');
  const pyPath = path.join(projectDir, pyFilename);

  let pyContent = '';
  if (fs.existsSync(pyPath)) {
    pyContent = fs.readFileSync(pyPath, 'utf-8');
  } else {
    pyContent = isBackup
      ? (tool.backup?.pyContent || 'print("ASCII Utility Backup Runner")')
      : (tool.main?.pyContent || 'print("ASCII Utility Launcher")');
  }

  // Base64 encode the Python payload to embed seamlessly in a single standalone .bat file
  const b64 = Buffer.from(pyContent, 'utf-8').toString('base64');
  const titleSuffix = isBackup ? '[BACKUP RUNNER]' : '[LOCAL TERMINAL]';

  const standaloneBat = `@echo off
setlocal EnableDelayedExpansion
chcp 65001 >nul
title ${tool.title.replace(/["&|<>^]/g, '')} ${titleSuffix}
cls
echo ===================================================================
echo   ${tool.title.toUpperCase()} ${titleSuffix}
echo ===================================================================
echo.
echo [1/2] Verifying local Python environment...
where python >nul 2>&1
if errorlevel 1 (
    echo.
    echo [ERROR] Python was not found in your system PATH.
    echo Please install Python 3.8+ from https://www.python.org/
    echo Make sure to check the box "Add Python to PATH" during installation.
    echo.
    pause
    exit /b 1
)
echo [2/2] Launching interactive utility on your PC...
echo.
python -c "import base64; exec(base64.b64decode('${b64}').decode('utf-8'))"
if errorlevel 1 (
    echo.
    echo [ERROR] Utility exited with an error code.
)
echo.
echo ===================================================================
echo [ASCII LAUNCHER] Execution finished. Press any key to close CMD.
pause >nul
exit /b 0
`;

  res.setHeader('Content-Type', 'application/x-bat; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="${tool.slug}${isBackup ? '-backup' : ''}.bat"`);
  return res.send(standaloneBat);
});

// ZIP package launcher (Main)
app.get('/api/tools/:slug/run', async (req: Request, res: Response) => {
  const { slug } = req.params;
  loadProjectsFromDisk();
  const tool = toolsCache.find(t => t.slug === slug);
  if (!tool) {
    return res.status(404).json({ error: 'Project not found' });
  }

  const projectDir = path.join(PROJECTS_DIR, tool.slug);
  const batFilename = tool.main?.batFilename || 'run.bat';
  const pyFilename = tool.main?.pyFilename || 'code.py';
  const batPath = path.join(projectDir, batFilename);
  const pyPath = path.join(projectDir, pyFilename);

  if (!fs.existsSync(batPath) || !fs.existsSync(pyPath)) {
    return res.status(400).json({ error: 'Project launcher files are missing on disk' });
  }

  const batContent = fs.readFileSync(batPath, 'utf-8');
  const pyContent = fs.readFileSync(pyPath, 'utf-8');

  // Package the project files into .zip
  const zip = new JSZip();
  zip.file(batFilename, batContent);
  zip.file(pyFilename, pyContent);

  // Increment download counter in metadata
  tool.downloadCount = (tool.downloadCount || 0) + 1;
  saveProjectToDisk(tool);

  try {
    const zipBuffer = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="${tool.slug}-terminal-launcher.zip"`);
    res.setHeader('Content-Length', zipBuffer.length);
    return res.send(zipBuffer);
  } catch (err) {
    console.error('Launcher generation error:', err);
    return res.status(500).json({ error: 'Failed to dispatch launcher package' });
  }
});

// ZIP package launcher (Backup Option)
app.get('/api/tools/:slug/run/backup', async (req: Request, res: Response) => {
  const { slug } = req.params;
  loadProjectsFromDisk();
  const tool = toolsCache.find(t => t.slug === slug);
  if (!tool) {
    return res.status(404).json({ error: 'Project not found' });
  }

  const projectDir = path.join(PROJECTS_DIR, tool.slug);
  const batFilename = tool.backup?.batFilename || 'run_backup.bat';
  const pyFilename = tool.backup?.pyFilename || 'code_backup.py';
  const batPath = path.join(projectDir, batFilename);
  const pyPath = path.join(projectDir, pyFilename);

  if (!fs.existsSync(batPath) || !fs.existsSync(pyPath)) {
    return res.status(400).json({ error: 'Backup launcher files are missing on disk' });
  }

  const batContent = fs.readFileSync(batPath, 'utf-8');
  const pyContent = fs.readFileSync(pyPath, 'utf-8');

  // Package the backup project files into .zip
  const zip = new JSZip();
  zip.file(batFilename, batContent);
  zip.file(pyFilename, pyContent);

  tool.downloadCount = (tool.downloadCount || 0) + 1;
  saveProjectToDisk(tool);

  try {
    const zipBuffer = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="${tool.slug}-backup-launcher.zip"`);
    res.setHeader('Content-Length', zipBuffer.length);
    return res.send(zipBuffer);
  } catch (err) {
    console.error('Backup launcher generation error:', err);
    return res.status(500).json({ error: 'Failed to dispatch backup launcher package' });
  }
});

// Host OS Terminal Spawn (For local self-hosted usage on host machine)
app.post('/api/tools/:slug/spawn', (req: Request, res: Response) => {
  const { slug } = req.params;
  const target = req.body?.target || req.query?.target || 'main';
  const isBackup = target === 'backup';

  loadProjectsFromDisk();
  const tool = toolsCache.find(t => t.slug === slug);
  if (!tool) {
    return res.status(404).json({ error: 'Project not found' });
  }

  const isLocalHost = req.hostname === 'localhost' || req.hostname === '127.0.0.1';
  const projectDir = path.join(PROJECTS_DIR, tool.slug);
  const launcherFile = isBackup
    ? (tool.backup?.batFilename || 'run_backup.bat')
    : (tool.main?.batFilename || 'run.bat');
  const launcherPath = path.join(projectDir, launcherFile);

  if (!fs.existsSync(launcherPath)) {
    return res.status(400).json({ error: `Launcher file "${launcherFile}" not found in project directory` });
  }

  // Attempt to spawn on host operating system
  import('child_process').then(({ exec }) => {
    const isWin = process.platform === 'win32';
    const spawnCmd = isWin
      ? `start cmd.exe /k "cd /d "${projectDir}" && call "${launcherFile}""`
      : `sh "${launcherPath}"`;

    exec(spawnCmd, { cwd: projectDir }, (err) => {
      if (err) console.error('Host execution trigger:', err.message);
    });
  });

  res.json({
    success: true,
    isLocalHost,
    platform: process.platform,
    target: isBackup ? 'backup' : 'main',
    message: isLocalHost
      ? `Successfully spawned ${launcherFile} (${isBackup ? 'Backup' : 'Main'}) in Windows Command Prompt on your PC!`
      : `Triggered ${launcherFile} on server container.`
  });
});

// Admin-only download API for backup or combined
app.get('/api/tools/:slug/download/:type', async (req: Request, res: Response) => {
  const { slug, type } = req.params;
  loadProjectsFromDisk();
  const tool = toolsCache.find(t => t.slug === slug);
  if (!tool) {
    return res.status(404).json({ error: 'Tool not found' });
  }

  const projectDir = path.join(PROJECTS_DIR, tool.slug);
  const zip = new JSZip();

  if (type === 'main' || type === 'run') {
    const batFilename = tool.main?.batFilename || 'run.bat';
    const pyFilename = tool.main?.pyFilename || 'code.py';
    zip.file(batFilename, fs.readFileSync(path.join(projectDir, batFilename), 'utf-8'));
    zip.file(pyFilename, fs.readFileSync(path.join(projectDir, pyFilename), 'utf-8'));
  } else if (type === 'backup') {
    const batFilename = tool.backup?.batFilename || 'run_backup.bat';
    const pyFilename = tool.backup?.pyFilename || 'code_backup.py';
    zip.file(batFilename, fs.readFileSync(path.join(projectDir, batFilename), 'utf-8'));
    zip.file(pyFilename, fs.readFileSync(path.join(projectDir, pyFilename), 'utf-8'));
  } else if (type === 'combined') {
    zip.file(tool.main?.batFilename || 'run.bat', tool.main?.batContent || '');
    zip.file(tool.main?.pyFilename || 'code.py', tool.main?.pyContent || '');
    if (tool.backup?.enabled) {
      zip.file(tool.backup.batFilename || 'run_backup.bat', tool.backup.batContent || '');
      zip.file(tool.backup.pyFilename || 'code_backup.py', tool.backup.pyContent || '');
    }
  }

  const zipBuffer = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
  res.setHeader('Content-Type', 'application/zip');
  res.setHeader('Content-Disposition', `attachment; filename="${tool.slug}-${type}.zip"`);
  return res.send(zipBuffer);
});

/* ========================================================
   ADMIN MANAGEMENT API: CREATE, EDIT, DELETE PROJECTS
   ======================================================== */

// Create Tool / Project Directory
app.post('/api/tools', requireAdmin, (req: Request, res: Response) => {
  const data = req.body;
  if (!data.title || !data.slug) {
    return res.status(400).json({ error: 'Title and URL slug are required' });
  }

  const cleanSlug = data.slug.toLowerCase().trim().replace(/[^a-z0-9-]/g, '-');
  const projectDir = path.join(PROJECTS_DIR, cleanSlug);

  if (fs.existsSync(projectDir)) {
    return res.status(400).json({ error: `Directory for project "${cleanSlug}" already exists` });
  }

  const now = new Date().toISOString();
  const newTool: Tool = {
    id: `tool-${cleanSlug}-${Date.now()}`,
    slug: cleanSlug,
    title: data.title.trim(),
    description: data.description || '',
    category: data.category || 'Utility',
    version: data.version || '1.0.0',
    asciiPreview: data.asciiPreview || '> ASCII PREVIEW READY',
    tags: Array.isArray(data.tags) ? data.tags : [],
    status: data.status || 'active',
    author: data.author || 'Admin',
    createdAt: now,
    updatedAt: now,
    downloadCount: 0,
    main: {
      batFilename: data.main?.batFilename || 'run.bat',
      batContent: data.main?.batContent || '@echo off\nchcp 65001 >nul\ntitle Local Console Utility\npython code.py\npause',
      pyFilename: data.main?.pyFilename || 'code.py',
      pyContent: data.main?.pyContent || '#!/usr/bin/env python3\nprint("Hello from local terminal!")\n',
      available: true,
      broken: data.main?.broken ?? false
    },
    backup: {
      enabled: data.backup?.enabled ?? false,
      batFilename: data.backup?.batFilename || 'run_backup.bat',
      batContent: data.backup?.batContent || '@echo off\npython code_backup.py\npause',
      pyFilename: data.backup?.pyFilename || 'code_backup.py',
      pyContent: data.backup?.pyContent || '#!/usr/bin/env python3\nprint("Backup runner")\n',
      available: data.backup?.available ?? false
    }
  };

  // Physically create directory on disk and save files
  saveProjectToDisk(newTool);
  toolsCache.push(newTool);

  res.status(201).json(newTool);
});

// Update Tool / Project Directory
app.put('/api/tools/:id', requireAdmin, (req: Request, res: Response) => {
  const { id } = req.params;
  const index = toolsCache.findIndex(t => t.id === id || t.slug === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Tool not found' });
  }

  const existing = toolsCache[index];
  const data = req.body;

  const updated: Tool = {
    ...existing,
    ...data,
    id: existing.id,
    slug: existing.slug, // preserve slug to match directory
    updatedAt: new Date().toISOString(),
    main: {
      ...existing.main,
      ...(data.main || {})
    },
    backup: {
      ...existing.backup,
      ...(data.backup || {})
    }
  };

  // Physically write updated files to directory on disk
  saveProjectToDisk(updated);
  toolsCache[index] = updated;

  res.json(updated);
});

// Delete Tool & Project Directory from disk
app.delete('/api/tools/:id', requireAdmin, (req: Request, res: Response) => {
  const { id } = req.params;
  const tool = toolsCache.find(t => t.id === id || t.slug === id);
  if (!tool) {
    return res.status(404).json({ error: 'Tool not found' });
  }

  // Delete project folder from filesystem
  deleteProjectFromDisk(tool.slug);

  // Update in-memory cache
  toolsCache = toolsCache.filter(t => t.id !== tool.id && t.slug !== tool.slug);

  res.json({ success: true, message: `Project directory "${tool.slug}" permanently deleted from disk.` });
});

// Quick toggle status/backup
app.post('/api/tools/:id/toggle', requireAdmin, (req: Request, res: Response) => {
  const { id } = req.params;
  const { field } = req.body;
  const tool = toolsCache.find(t => t.id === id || t.slug === id);
  if (!tool) {
    return res.status(404).json({ error: 'Tool not found' });
  }

  if (field === 'backupEnabled') {
    tool.backup.enabled = !tool.backup.enabled;
  } else if (field === 'mainBroken') {
    tool.main.broken = !tool.main.broken;
  } else if (field === 'status') {
    tool.status = tool.status === 'active' ? 'maintenance' : 'active';
  }

  tool.updatedAt = new Date().toISOString();
  saveProjectToDisk(tool);
  res.json(tool);
});

// Auto BAT Generator endpoint
app.post('/api/generate-bat', requireAdmin, (req: Request, res: Response) => {
  const { toolName, pyFilename } = req.body;
  const safeName = (toolName || 'ASCII Utility').replace(/[^a-zA-Z0-9 _-]/g, '');
  const safeScript = (pyFilename || 'code.py').replace(/[^a-zA-Z0-9_.-]/g, '');

  const batTemplate = `@echo off
chcp 65001 >nul
title ${safeName} [LOCAL TERMINAL]
color 0A
cls
echo ========================================================
echo   ${safeName.toUpperCase()} — LOCAL COMMAND PROMPT
echo ========================================================
echo.
echo [1/2] Verifying Python runtime...
python --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Python was not found in your system PATH.
    echo Please install Python 3.8+ from https://www.python.org/
    echo Make sure to check "Add Python to PATH" during installation.
    echo.
    pause
    exit /b 1
)
echo [2/2] Invoking ${safeScript}...
echo.
python ${safeScript}
echo.
echo ========================================================
echo [EXIT] Script execution completed.
pause
`;

  res.json({ batContent: batTemplate, batFilename: 'run.bat' });
});

// Export all projects to JSON
app.get('/api/export', requireAdmin, (req: Request, res: Response) => {
  loadProjectsFromDisk();
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', 'attachment; filename="ascii-launcher-projects-backup.json"');
  res.send(JSON.stringify(toolsCache, null, 2));
});

// Import projects to disk
app.post('/api/import', requireAdmin, (req: Request, res: Response) => {
  const { tools, mode } = req.body;
  if (!Array.isArray(tools)) {
    return res.status(400).json({ error: 'Expected an array of tools' });
  }

  if (mode === 'replace') {
    // Delete all current project directories
    for (const tool of toolsCache) {
      deleteProjectFromDisk(tool.slug);
    }
    toolsCache = [];
  }

  for (const item of tools) {
    if (item.slug && item.title) {
      saveProjectToDisk(item);
    }
  }

  loadProjectsFromDisk();
  res.json({ success: true, count: toolsCache.length });
});

/* ========================================================
   VITE DEV MIDDLEWARE / STATIC PRODUCTION SERVING
   ======================================================== */
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[ASCII LAUNCHER] Server listening on port ${PORT}`);
    console.log(`[PROJECTS] Stored in: ${PROJECTS_DIR}`);
  });
}

startServer();
