import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Save,
  Upload,
  Code2,
  FileText,
  Zap,
  Shield,
  ShieldCheck,
  AlertCircle,
  Eye,
  Check,
  FileCode,
  Loader2
} from 'lucide-react';
import { fetchAdminTool, fetchTool, createTool, updateTool, generateBat } from '../../services/api';
import { ASCIIViewer } from '../../components/ASCIIViewer';
import { useToast } from '../../components/Toast';
import type { Tool, ToolCategory, ToolStatus } from '../../types/tool';

export const ToolEditor: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id);
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<ToolCategory>('Utility');
  const [version, setVersion] = useState('1.0.0');
  const [tags, setTags] = useState('ASCII, Utility');
  const [status, setStatus] = useState<ToolStatus>('active');
  const [asciiPreview, setAsciiPreview] = useState('> ASCII PREVIEW READY');

  // Main Package Files
  const [mainBatFilename, setMainBatFilename] = useState('run.bat');
  const [mainBatContent, setMainBatContent] = useState(
    '@echo off\nchcp 65001 >nul\ntitle ASCII Utility [Local Console]\npython code.py\npause'
  );
  const [mainPyFilename, setMainPyFilename] = useState('code.py');
  const [mainPyContent, setMainPyContent] = useState(
    '#!/usr/bin/env python3\nprint("===================================")\nprint("  ASCII Utility running locally!")\nprint("===================================")\n'
  );

  // Backup Package Files
  const [backupEnabled, setBackupEnabled] = useState(false);
  const [backupBatFilename, setBackupBatFilename] = useState('run_backup.bat');
  const [backupBatContent, setBackupBatContent] = useState(
    '@echo off\ntitle Backup Runner\npython code_backup.py\npause'
  );
  const [backupPyFilename, setBackupPyFilename] = useState('code_backup.py');
  const [backupPyContent, setBackupPyContent] = useState(
    '#!/usr/bin/env python3\nprint("Running backup fallback utility...")\n'
  );

  // Active package editor tab
  const [activeTab, setActiveTab] = useState<'main' | 'backup' | 'ascii'>('main');

  useEffect(() => {
    if (isEditing && id) {
      setLoading(true);
      setError(null);
      fetchAdminTool(id)
        .catch(() => fetchTool(id) as Promise<Tool>)
        .then((tool) => {
          if (!tool) return;
          setTitle(tool.title || '');
          setSlug(tool.slug || '');
          setDescription(tool.description || '');
          setCategory(tool.category || 'Utility');
          setVersion(tool.version || '1.0.0');
          setTags((tool.tags || []).join(', '));
          setStatus(tool.status || 'active');
          setAsciiPreview(tool.asciiPreview || '> ASCII PREVIEW READY');

          const safeBatName = tool.main?.batFilename || 'run.bat';
          const safePyName = tool.main?.pyFilename || 'code.py';
          setMainBatFilename(safeBatName);
          setMainPyFilename(safePyName);
          setMainBatContent(
            tool.main?.batContent ||
            `@echo off\nchcp 65001 >nul\ntitle ${tool.title || 'ASCII Utility'} [Local Console]\npython ${safePyName}\npause`
          );
          setMainPyContent(
            tool.main?.pyContent ||
            `#!/usr/bin/env python3\nprint("===================================")\nprint("  ${tool.title || 'ASCII Utility'} running locally!")\nprint("===================================")\n`
          );

          if (tool.backup) {
            setBackupEnabled(tool.backup.enabled || false);
            const safeBackupBat = tool.backup.batFilename || 'run_backup.bat';
            const safeBackupPy = tool.backup.pyFilename || 'code_backup.py';
            setBackupBatFilename(safeBackupBat);
            setBackupPyFilename(safeBackupPy);
            setBackupBatContent(
              tool.backup.batContent ||
              `@echo off\ntitle ${tool.title || 'ASCII Utility'} [BACKUP RUNNER]\npython ${safeBackupPy}\npause`
            );
            setBackupPyContent(
              tool.backup.pyContent ||
              `#!/usr/bin/env python3\nprint("Running backup fallback utility for ${tool.title || 'ASCII Utility'}...")\n`
            );
          }
        })
        .catch((err) => {
          console.error('Error loading tool:', err);
          setError(err.message || 'Failed to load tool data');
        })
        .finally(() => setLoading(false));
    }
  }, [id, isEditing]);

  // Auto-slug when creating
  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!isEditing) {
      setSlug(
        val
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '')
      );
    }
  };

  // File Upload Helper (reads file as text)
  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: 'mainBat' | 'mainPy' | 'backupBat' | 'backupPy'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (type === 'mainBat') {
        setMainBatFilename(file.name);
        setMainBatContent(content);
        showToast(`MAIN LAUNCHER UPLOADED: ${file.name}`, 'success');
      } else if (type === 'mainPy') {
        setMainPyFilename(file.name);
        setMainPyContent(content);
        showToast(`MAIN SCRIPT UPLOADED: ${file.name}`, 'success');
      } else if (type === 'backupBat') {
        setBackupBatFilename(file.name);
        setBackupBatContent(content);
        showToast(`BACKUP LAUNCHER UPLOADED: ${file.name}`, 'success');
      } else if (type === 'backupPy') {
        setBackupPyFilename(file.name);
        setBackupPyContent(content);
        showToast(`BACKUP SCRIPT UPLOADED: ${file.name}`, 'success');
      }
    };
    reader.readAsText(file);
    e.target.value = ''; // reset input
  };

  // Auto BAT Generator
  const handleAutoGenerateBat = async () => {
    try {
      const generated = await generateBat(title || 'ASCII Utility', mainPyFilename || 'code.py');
      setMainBatContent(generated.batContent);
      setMainBatFilename(generated.batFilename);
      showToast('STANDARD WINDOWS CMD LAUNCHER GENERATED', 'success');
    } catch {
      showToast('FAILED TO GENERATE LAUNCHER', 'error');
    }
  };

  const handleSave = async (e?: React.FormEvent | React.MouseEvent) => {
    if (e && typeof e.preventDefault === 'function') {
      e.preventDefault();
    }

    const cleanTitle = title.trim();
    if (!cleanTitle) {
      setError('Please provide a Tool Title');
      showToast('TOOL TITLE IS REQUIRED', 'warning');
      return;
    }

    let cleanSlug = slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/^-+|-+$/g, '');
    if (!cleanSlug) {
      cleanSlug = cleanTitle.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/^-+|-+$/g, '') || `utility-${Date.now().toString().slice(-4)}`;
      setSlug(cleanSlug);
    }

    // Auto-generate scripts if blank to prevent validation errors
    let finalMainBat = mainBatContent.trim();
    if (!finalMainBat) {
      finalMainBat = `@echo off\nchcp 65001 >nul\ntitle ${cleanTitle} [Local Console]\npython ${mainPyFilename || 'code.py'}\npause`;
      setMainBatContent(finalMainBat);
    }

    let finalMainPy = mainPyContent.trim();
    if (!finalMainPy) {
      finalMainPy = `#!/usr/bin/env python3\nprint("===================================")\nprint("  ${cleanTitle} running locally!")\nprint("===================================")\n`;
      setMainPyContent(finalMainPy);
    }

    let finalBackupBat = backupBatContent.trim();
    let finalBackupPy = backupPyContent.trim();
    if (backupEnabled) {
      if (!finalBackupBat) {
        finalBackupBat = `@echo off\ntitle ${cleanTitle} [BACKUP RUNNER]\npython ${backupPyFilename || 'code_backup.py'}\npause`;
        setBackupBatContent(finalBackupBat);
      }
      if (!finalBackupPy) {
        finalBackupPy = `#!/usr/bin/env python3\nprint("Running backup utility for ${cleanTitle}...")\n`;
        setBackupPyContent(finalBackupPy);
      }
    }

    setSaving(true);
    setError(null);

    const payload: Partial<Tool> = {
      title: cleanTitle,
      slug: cleanSlug,
      description: description.trim(),
      category,
      version: version.trim() || '1.0.0',
      tags: tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
      status,
      asciiPreview: asciiPreview.trim() || '> ASCII UTILITY READY',
      main: {
        batFilename: mainBatFilename.trim() || 'run.bat',
        batContent: finalMainBat,
        pyFilename: mainPyFilename.trim() || 'code.py',
        pyContent: finalMainPy,
        available: true,
        broken: status === 'broken'
      },
      backup: {
        enabled: backupEnabled,
        batFilename: backupBatFilename.trim() || 'run_backup.bat',
        batContent: finalBackupBat,
        pyFilename: backupPyFilename.trim() || 'code_backup.py',
        pyContent: finalBackupPy,
        available: backupEnabled
      }
    };

    try {
      if (isEditing && id) {
        await updateTool(id, payload);
        showToast(`UPDATED: ${cleanTitle.toUpperCase()}`, 'success');
      } else {
        await createTool(payload);
        showToast(`CREATED: ${cleanTitle.toUpperCase()}`, 'success');
      }
      navigate('/admin/tools');
    } catch (err: any) {
      console.error('Save tool error:', err);
      const errMsg = err.message || 'Failed to save utility package';
      setError(errMsg);
      showToast(errMsg, 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center font-mono text-xs text-[#20D989]">
        <span className="inline-flex items-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin" />
          LOADING TOOL CONFIGURATION...
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-mono max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#242424]">
        <div className="flex items-center gap-3">
          <Link
            to="/admin/tools"
            className="p-1.5 text-[#999999] hover:text-[#20D989] border border-[#242424] rounded"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-[#F2F2F2]">
              {isEditing ? `Edit Utility: ${title}` : 'Create New ASCII Utility'}
            </h1>
            <p className="text-xs text-[#666666]">
              Upload the exact batch launcher and Python script executed locally on users' computers.
            </p>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#20D989] hover:bg-[#1bb874] text-black text-xs font-bold uppercase rounded shadow-[0_0_15px_rgba(32,217,137,0.2)] disabled:opacity-50 cursor-pointer"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          <span>{saving ? 'SAVING...' : 'SAVE TOOL'}</span>
        </button>
      </div>

      {error && (
        <div className="p-3 bg-[#1A0A0A] border border-[#FF5555] rounded text-[#FF5555] text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Metadata Form Section */}
      <div className="border border-[#242424] bg-[#0A0A0A] rounded-lg p-5 space-y-4">
        <h2 className="text-xs font-bold text-[#F2F2F2] uppercase tracking-wider pb-2 border-b border-[#1C1C1C]">
          01. Basic Metadata
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs text-[#999999]">TOOL TITLE *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="e.g. ASCII Text Generator"
              className="w-full bg-[#050505] border border-[#242424] focus:border-[#20D989] rounded px-3 py-2 text-xs text-[#F2F2F2] outline-none"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs text-[#999999]">URL SLUG *</label>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="e.g. ascii-text-generator"
              className="w-full bg-[#050505] border border-[#242424] focus:border-[#20D989] rounded px-3 py-2 text-xs text-[#F2F2F2] outline-none"
              required
            />
          </div>

          <div className="space-y-1 md:col-span-2">
            <label className="text-xs text-[#999999]">SHORT DESCRIPTION</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Explain what the tool does when run in the local terminal..."
              rows={2}
              className="w-full bg-[#050505] border border-[#242424] focus:border-[#20D989] rounded px-3 py-2 text-xs text-[#F2F2F2] outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs text-[#999999]">CATEGORY</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as ToolCategory)}
              className="w-full bg-[#050505] border border-[#242424] focus:border-[#20D989] rounded px-3 py-2 text-xs text-[#F2F2F2] outline-none"
            >
              <option value="Utility">Utility</option>
              <option value="Animation">Animation</option>
              <option value="System">System</option>
              <option value="Creative">Creative</option>
              <option value="Security">Security</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs text-[#999999]">VERSION</label>
            <input
              type="text"
              value={version}
              onChange={(e) => setVersion(e.target.value)}
              placeholder="1.0.0"
              className="w-full bg-[#050505] border border-[#242424] focus:border-[#20D989] rounded px-3 py-2 text-xs text-[#F2F2F2] outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs text-[#999999]">TAGS (COMMA SEPARATED)</label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="ASCII, Banner, Terminal"
              className="w-full bg-[#050505] border border-[#242424] focus:border-[#20D989] rounded px-3 py-2 text-xs text-[#F2F2F2] outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs text-[#999999]">TOOL STATUS</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as ToolStatus)}
              className="w-full bg-[#050505] border border-[#242424] focus:border-[#20D989] rounded px-3 py-2 text-xs text-[#F2F2F2] outline-none"
            >
              <option value="active">Active (Available for download)</option>
              <option value="maintenance">Maintenance</option>
              <option value="broken">Broken (Shows warning flag)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Package Tabs */}
      <div className="border border-[#242424] bg-[#0A0A0A] rounded-lg overflow-hidden">
        {/* Tab Switcher */}
        <div className="flex border-b border-[#242424] bg-[#0D0D0D]">
          <button
            type="button"
            onClick={() => setActiveTab('main')}
            className={`flex-1 py-3 text-xs font-bold tracking-wider uppercase transition-colors border-r border-[#242424] ${
              activeTab === 'main'
                ? 'bg-[#0A0A0A] text-[#20D989] border-b-2 border-b-[#20D989]'
                : 'text-[#666666] hover:text-[#F2F2F2]'
            }`}
          >
            02. Main Package Files
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('backup')}
            className={`flex-1 py-3 text-xs font-bold tracking-wider uppercase transition-colors border-r border-[#242424] ${
              activeTab === 'backup'
                ? 'bg-[#0A0A0A] text-[#20D989] border-b-2 border-b-[#20D989]'
                : 'text-[#666666] hover:text-[#F2F2F2]'
            }`}
          >
            03. Place Backup Files (Backup Run Option)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('ascii')}
            className={`flex-1 py-3 text-xs font-bold tracking-wider uppercase transition-colors ${
              activeTab === 'ascii'
                ? 'bg-[#0A0A0A] text-[#20D989] border-b-2 border-b-[#20D989]'
                : 'text-[#666666] hover:text-[#F2F2F2]'
            }`}
          >
            04. ASCII Artwork Canvas
          </button>
        </div>

        {/* TAB 1: MAIN PACKAGE */}
        {activeTab === 'main' && (
          <div className="p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#1C1C1C]">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-bold text-[#F2F2F2]">
                    PROJECT FILES (run.bat &amp; code.py)
                  </h3>
                  <span className="text-[11px] font-mono text-[#20D989] bg-[#060606] border border-[#20D989]/40 px-2 py-0.5 rounded">
                    server/projects/{slug || 'project-name'}/
                  </span>
                </div>
                <p className="text-[11px] text-[#666666] mt-1">
                  Saved into this project's directory. Public users click [Run in Terminal] to execute this .bat file in their Command Prompt.
                </p>
              </div>

              <button
                type="button"
                onClick={handleAutoGenerateBat}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#060606] text-[#20D989] border border-[#20D989]/40 hover:border-[#20D989] text-[11px] font-semibold rounded"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Auto-Generate Launcher BAT</span>
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Main Launcher Executable */}
              <div className="space-y-3 border border-[#1C1C1C] rounded p-4 bg-[#080808]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileCode className="w-4 h-4 text-[#20D989]" />
                    <span className="text-xs font-bold text-[#F2F2F2]">Primary Launcher (.bat / .sh / any)</span>
                  </div>

                  <label className="cursor-pointer inline-flex items-center gap-1.5 text-[11px] text-[#20D989] hover:underline">
                    <Upload className="w-3 h-3" />
                    <span>Upload File</span>
                    <input
                      type="file"
                      accept="*"
                      onChange={(e) => handleFileUpload(e, 'mainBat')}
                      className="hidden"
                    />
                  </label>
                </div>

                <div className="space-y-1">
                  <span className="text-[11px] text-[#666666]">File Name in Directory:</span>
                  <input
                    type="text"
                    value={mainBatFilename}
                    onChange={(e) => setMainBatFilename(e.target.value)}
                    className="w-full bg-[#050505] border border-[#242424] rounded px-3 py-1.5 text-xs text-[#20D989]"
                    placeholder="e.g. run.bat, launch.sh, start.cmd"
                  />
                </div>

                <div className="space-y-1">
                  <span className="text-[11px] text-[#666666]">Launcher / Runner Content:</span>
                  <textarea
                    value={mainBatContent}
                    onChange={(e) => setMainBatContent(e.target.value)}
                    rows={12}
                    className="w-full bg-[#050505] border border-[#242424] rounded p-3 text-xs text-[#20D989] font-mono leading-relaxed outline-none"
                  />
                </div>
              </div>

              {/* Main Code / Script Asset */}
              <div className="space-y-3 border border-[#1C1C1C] rounded p-4 bg-[#080808]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Code2 className="w-4 h-4 text-[#20D989]" />
                    <span className="text-xs font-bold text-[#F2F2F2]">Script / Program Code (.py / any)</span>
                  </div>

                  <label className="cursor-pointer inline-flex items-center gap-1.5 text-[11px] text-[#20D989] hover:underline">
                    <Upload className="w-3 h-3" />
                    <span>Upload Code</span>
                    <input
                      type="file"
                      accept="*"
                      onChange={(e) => handleFileUpload(e, 'mainPy')}
                      className="hidden"
                    />
                  </label>
                </div>

                <div className="space-y-1">
                  <span className="text-[11px] text-[#666666]">File Name in Directory:</span>
                  <input
                    type="text"
                    value={mainPyFilename}
                    onChange={(e) => setMainPyFilename(e.target.value)}
                    className="w-full bg-[#050505] border border-[#242424] rounded px-3 py-1.5 text-xs text-[#20D989]"
                    placeholder="e.g. code.py, main.py, app.js"
                  />
                </div>

                <div className="space-y-1">
                  <span className="text-[11px] text-[#666666]">Program Source Code:</span>
                  <textarea
                    value={mainPyContent}
                    onChange={(e) => setMainPyContent(e.target.value)}
                    rows={12}
                    className="w-full bg-[#050505] border border-[#242424] rounded p-3 text-xs text-[#F2F2F2] font-mono leading-relaxed outline-none"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: BACKUP PACKAGE (BACKUP RUN OPTION) */}
        {activeTab === 'backup' && (
          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-[#1C1C1C]">
              <div>
                <h3 className="text-xs font-bold text-[#F2F2F2]">
                  BACKUP FILES REPOSITORY (SECONDARY RUN OPTION)
                </h3>
                <p className="text-[11px] text-[#666666] mt-0.5">
                  Place your backup launcher (.bat) and backup script (.py) here. When enabled, users see the dedicated [Run Backup Package (.zip)] option on the tool page.
                </p>
              </div>

              <label className="flex items-center gap-2 cursor-pointer bg-[#050505] border border-[#242424] px-3 py-1.5 rounded">
                <input
                  type="checkbox"
                  checked={backupEnabled}
                  onChange={(e) => setBackupEnabled(e.target.checked)}
                  className="accent-[#20D989] w-4 h-4 cursor-pointer"
                />
                <span className="text-xs font-bold text-[#20D989]">ENABLE BACKUP RUN OPTION</span>
              </label>
            </div>

            {backupEnabled ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Backup Launcher */}
                <div className="space-y-3 border border-[#1C1C1C] rounded p-4 bg-[#080808]">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#F2F2F2]">Backup Launcher</span>
                    <label className="cursor-pointer inline-flex items-center gap-1.5 text-[11px] text-[#20D989] hover:underline">
                      <Upload className="w-3 h-3" />
                      <span>Upload File</span>
                      <input
                        type="file"
                        accept="*"
                        onChange={(e) => handleFileUpload(e, 'backupBat')}
                        className="hidden"
                      />
                    </label>
                  </div>

                  <input
                    type="text"
                    value={backupBatFilename}
                    onChange={(e) => setBackupBatFilename(e.target.value)}
                    className="w-full bg-[#050505] border border-[#242424] rounded px-3 py-1.5 text-xs text-[#20D989]"
                  />

                  <textarea
                    value={backupBatContent}
                    onChange={(e) => setBackupBatContent(e.target.value)}
                    rows={10}
                    className="w-full bg-[#050505] border border-[#242424] rounded p-3 text-xs text-[#20D989] font-mono leading-relaxed outline-none"
                  />
                </div>

                {/* Backup Script */}
                <div className="space-y-3 border border-[#1C1C1C] rounded p-4 bg-[#080808]">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#F2F2F2]">Backup Script</span>
                    <label className="cursor-pointer inline-flex items-center gap-1.5 text-[11px] text-[#20D989] hover:underline">
                      <Upload className="w-3 h-3" />
                      <span>Upload File</span>
                      <input
                        type="file"
                        accept="*"
                        onChange={(e) => handleFileUpload(e, 'backupPy')}
                        className="hidden"
                      />
                    </label>
                  </div>

                  <input
                    type="text"
                    value={backupPyFilename}
                    onChange={(e) => setBackupPyFilename(e.target.value)}
                    className="w-full bg-[#050505] border border-[#242424] rounded px-3 py-1.5 text-xs text-[#20D989]"
                  />

                  <textarea
                    value={backupPyContent}
                    onChange={(e) => setBackupPyContent(e.target.value)}
                    rows={10}
                    className="w-full bg-[#050505] border border-[#242424] rounded p-3 text-xs text-[#F2F2F2] font-mono leading-relaxed outline-none"
                  />
                </div>
              </div>
            ) : (
              <div className="p-8 text-center border border-dashed border-[#242424] rounded text-xs text-[#666666]">
                Backup redundancy is currently disabled for this tool. Toggle the checkbox above to upload backup files.
              </div>
            )}
          </div>
        )}

        {/* TAB 3: ASCII CANVAS */}
        {activeTab === 'ascii' && (
          <div className="p-6 space-y-6">
            <div className="pb-3 border-b border-[#1C1C1C]">
              <h3 className="text-xs font-bold text-[#F2F2F2]">ASCII ARTWORK PREVIEW</h3>
              <p className="text-[11px] text-[#666666]">
                Paste preformatted ASCII art. Whitespace and monospace line breaks are strictly preserved.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-[#999999]">
                  <span>Raw ASCII Input:</span>
                  <button
                    type="button"
                    onClick={() =>
                      setAsciiPreview(
                        ' +---------------------------------------+\n | [ASCII UTILITY ONLINE]                |\n | READY FOR LOCAL CONSOLE EXECUTION     |\n +---------------------------------------+'
                      )
                    }
                    className="text-[#20D989] text-[11px] hover:underline"
                  >
                    Insert Box Template
                  </button>
                </div>
                <textarea
                  value={asciiPreview}
                  onChange={(e) => setAsciiPreview(e.target.value)}
                  rows={16}
                  className="w-full bg-[#050505] border border-[#242424] rounded p-3 text-xs text-[#20D989] font-mono leading-[1.1] outline-none whitespace-pre overflow-x-auto"
                />
              </div>

              <div className="space-y-2">
                <span className="text-xs text-[#999999]">Live Public View Render:</span>
                <ASCIIViewer art={asciiPreview} maxHeight="max-h-[360px]" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-[#242424]">
        <Link
          to="/admin/tools"
          className="px-4 py-2 border border-[#242424] text-xs text-[#999999] hover:text-[#F2F2F2] rounded"
        >
          Cancel
        </Link>

        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-2.5 bg-[#20D989] hover:bg-[#1bb874] text-black text-xs font-bold uppercase rounded shadow-[0_0_15px_rgba(32,217,137,0.2)] disabled:opacity-50 cursor-pointer"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          <span>{saving ? 'SAVING...' : 'SAVE UTILITY & ASSETS'}</span>
        </button>
      </div>
    </div>
  );
};
