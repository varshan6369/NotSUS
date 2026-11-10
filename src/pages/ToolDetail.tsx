import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  HelpCircle,
  AlertTriangle,
  Terminal,
  Shield,
  Download,
  RotateCcw,
  Copy,
  Check,
  Cpu,
  Package,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';
import { fetchTool } from '../services/api';
import { ASCIIViewer } from '../components/ASCIIViewer';
import { InteractiveTerminal } from '../components/InteractiveTerminal';
import { useToast } from '../components/Toast';
import type { PublicTool } from '../types/tool';

export const ToolDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [tool, setTool] = useState<PublicTool | null>(null);
  const [loading, setLoading] = useState(true);
  const [launching, setLaunching] = useState(false);
  const [activeView, setActiveView] = useState<'preview' | 'terminal'>('preview');
  const [copiedCmd, setCopiedCmd] = useState(false);
  const [terminalShell, setTerminalShell] = useState<'cmd' | 'powershell'>('cmd');
  const [spawningLocal, setSpawningLocal] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    fetchTool(slug)
      .then((data) => setTool(data as PublicTool))
      .catch((err) => {
        console.error(err);
        setTool(null);
      })
      .finally(() => setLoading(false));
  }, [slug]);

  const originUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const cmdCommand = `curl -sL ${originUrl}/api/tools/${slug}/raw/script | python`;
  const psCommand = `irm ${originUrl}/api/tools/${slug}/raw/script | python`;
  const activeCommand = terminalShell === 'cmd' ? cmdCommand : psCommand;

  // Install & Run Package as .ZIP (Main or Backup)
  const handleDownloadZip = async (type: 'main' | 'backup' = 'main') => {
    if (!tool) return;
    setLaunching(true);
    try {
      const endpoint = type === 'backup'
        ? `/api/tools/${tool.slug}/run/backup`
        : `/api/tools/${tool.slug}/run`;

      const res = await fetch(endpoint);
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = type === 'backup'
          ? `${tool.slug}-backup-launcher.zip`
          : `${tool.slug}-terminal-launcher.zip`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        showToast(
          type === 'backup'
            ? 'BACKUP LAUNCHER (.ZIP) DOWNLOADED — EXTRACT & RUN'
            : 'LAUNCHER PACKAGE (.ZIP) DOWNLOADED — EXTRACT & RUN run.bat',
          'success'
        );
      } else {
        showToast('ERROR DOWNLOADING PACKAGE', 'error');
      }

      // Also attempt host spawn if running self-hosted on local PC
      fetch(`/api/tools/${tool.slug}/spawn`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target: type })
      })
        .then((r) => r.json())
        .then((data) => {
          if (data.isLocalHost) {
            showToast('TERMINAL SPAWNED ON YOUR LOCAL PC!', 'success');
          }
        })
        .catch(() => {});
    } catch (err) {
      console.error(err);
      showToast('FAILED TO DOWNLOAD LAUNCHER PACKAGE', 'error');
    } finally {
      setLaunching(false);
    }
  };

  const handleCopyCommand = async () => {
    try {
      await navigator.clipboard.writeText(activeCommand);
      setCopiedCmd(true);
      showToast('1-LINE COMMAND COPIED TO CLIPBOARD', 'success');
      setTimeout(() => setCopiedCmd(false), 2500);
    } catch {
      showToast('FAILED TO COPY COMMAND', 'error');
    }
  };

  // Host OS Spawn trigger
  const handleSpawnOnHost = async (target: 'main' | 'backup' = 'main') => {
    if (!tool) return;
    setSpawningLocal(true);
    try {
      const res = await fetch(`/api/tools/${tool.slug}/spawn`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target })
      });
      const data = await res.json();
      if (data.isLocalHost) {
        showToast(
          `SPAWNED ${target.toUpperCase()} LAUNCHER IN WINDOWS CMD!`,
          'success'
        );
      } else {
        showToast('EXECUTED ON HOST ENVIRONMENT', 'info');
      }
    } catch (err) {
      console.error(err);
      showToast('UNABLE TO REACH LOCAL HOST SPAWNER', 'error');
    } finally {
      setSpawningLocal(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 animate-pulse space-y-8 font-mono">
        <div className="h-6 bg-[#141414] rounded w-32" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-4">
            <div className="h-10 bg-[#141414] rounded w-2/3" />
            <div className="h-96 bg-[#0E0E0E] rounded-lg" />
          </div>
          <div className="lg:col-span-4 space-y-4">
            <div className="h-64 bg-[#0E0E0E] rounded-lg" />
            <div className="h-48 bg-[#0E0E0E] rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  if (!tool) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-24 text-center font-mono">
        <AlertTriangle className="w-12 h-12 text-[#FF5555] mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-[#F2F2F2]">UTILITY NOT FOUND</h2>
        <p className="text-xs text-[#666666] mt-2 mb-6">
          The requested ASCII utility slug does not exist or has been relocated.
        </p>
        <Link
          to="/tools"
          className="inline-flex items-center gap-2 px-4 py-2 text-xs bg-[#0A0A0A] border border-[#242424] text-[#20D989] hover:border-[#20D989] rounded"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Repository</span>
        </Link>
      </div>
    );
  }

  const isBroken = tool.status === 'broken' || tool.main?.broken;
  const hasBackup = tool.backup && tool.backup.enabled && tool.backup.available;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Breadcrumb matching mockup */}
      <div className="mb-6">
        <Link
          to="/tools"
          className="inline-flex items-center gap-2 font-mono text-xs text-[#999999] hover:text-[#20D989] transition-colors"
        >
          <ArrowLeft className="w-4 h-4 text-[#20D989]" />
          <span>Back to Tools</span>
        </Link>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Heading, Info, and Full Monospace ASCII Frame / Web Terminal */}
        <div className="lg:col-span-8 space-y-6">
          <div className="space-y-3">
            {/* Category kicker matching mockup [ SYSTEM TOOL ] */}
            <div className="flex items-center gap-2 font-mono text-xs font-semibold text-[#20D989]">
              <span>[ {tool.category.toUpperCase()} TOOL ]</span>
            </div>

            {/* Title with Terminal Prompt Cursor */}
            <h1 className="font-mono text-3xl sm:text-4xl lg:text-5xl font-bold text-[#F2F2F2] tracking-tight">
              {tool.title} <span className="text-[#20D989] term-cursor" />
            </h1>

            {/* Description matching mockup */}
            <p className="font-mono text-sm sm:text-base text-[#999999] leading-relaxed max-w-2xl">
              {tool.description}
            </p>

            {/* Clean metadata */}
            <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-[#666666] pt-1">
              <span className="text-[#999999]">{tool.category}</span>
              <span>·</span>
              <span className="text-[#999999]">v{tool.version}</span>
              <span>·</span>
              <span className="text-[#20D989]">Runs in Local PC Terminal</span>
              {hasBackup && (
                <>
                  <span>·</span>
                  <span className="text-amber-400">Backup Option Available</span>
                </>
              )}
              {tool.tags && tool.tags.length > 0 && (
                <>
                  <span>·</span>
                  <span>{tool.tags.join(', ')}</span>
                </>
              )}
            </div>
          </div>

          {/* View Mode Toggle: Static ASCII Art vs Interactive Terminal */}
          <div className="flex items-center justify-between border-b border-[#242424] pb-2 pt-2">
            <div className="flex items-center gap-2 font-mono text-xs">
              <button
                onClick={() => setActiveView('preview')}
                className={`flex items-center gap-2 px-3 py-1.5 font-semibold rounded transition-colors ${
                  activeView === 'preview'
                    ? 'bg-[#20D989] text-black shadow-[0_0_10px_rgba(32,217,137,0.2)]'
                    : 'bg-[#0E0E0E] text-[#999999] hover:text-[#F2F2F2] border border-[#242424]'
                }`}
              >
                <Cpu className="w-3.5 h-3.5" />
                <span>ASCII ARTWORK PREVIEW</span>
              </button>

              <button
                onClick={() => setActiveView('terminal')}
                className={`flex items-center gap-2 px-3 py-1.5 font-semibold rounded transition-colors ${
                  activeView === 'terminal'
                    ? 'bg-[#20D989] text-black shadow-[0_0_10px_rgba(32,217,137,0.2)]'
                    : 'bg-[#0E0E0E] text-[#999999] hover:text-[#F2F2F2] border border-[#242424]'
                }`}
              >
                <Terminal className="w-3.5 h-3.5" />
                <span>WEB TERMINAL TESTER</span>
              </button>
            </div>

            <span className="text-[11px] font-mono text-[#666666] hidden sm:inline">
              {activeView === 'terminal' ? 'Interactive Web Console' : 'Monospace ASCII Canvas'}
            </span>
          </div>

          {/* Canvas or Terminal Display */}
          <div className="mt-2">
            {activeView === 'terminal' ? (
              <InteractiveTerminal tool={tool} autoStart={true} />
            ) : (
              <ASCIIViewer
                art={tool.asciiPreview}
                title={tool.title}
                maxHeight="max-h-[560px]"
                showControls={true}
              />
            )}
          </div>
        </div>

        {/* Right Column: Actions, Backup Runner & PC Instructions */}
        <div className="lg:col-span-4 space-y-6">
          {/* Main Action Card */}
          <div className="border border-[#242424] bg-[#0A0A0A] rounded-lg p-6 space-y-6">
            <div className="flex items-center gap-2 font-mono text-sm font-semibold text-[#F2F2F2] pb-4 border-b border-[#1C1C1C]">
              <HelpCircle className="w-4 h-4 text-[#20D989]" />
              <span>Tool Information</span>
            </div>

            {/* Attributes table */}
            <div className="space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[#666666]">Version</span>
                <span className="text-[#F2F2F2] font-medium">v{tool.version}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#666666]">Category</span>
                <span className="text-[#F2F2F2] font-medium">{tool.category}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#666666]">Target Terminal</span>
                <span className="text-[#20D989] font-medium">Local Windows CMD</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#666666]">Status</span>
                {isBroken ? (
                  <span className="flex items-center gap-1.5 text-[#FF5555] font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#FF5555]" />
                    Broken / Maintenance
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 text-[#20D989] font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#20D989]" />
                    Active
                  </span>
                )}
              </div>
            </div>

            <p className="font-mono text-xs text-[#666666] leading-relaxed pt-3 border-t border-[#1C1C1C]">
              Installs as a ready-to-run ZIP package. Double-click <strong>run.bat</strong> inside the folder to launch Windows Command Prompt and execute the utility directly on your PC.
            </p>

            {/* PRIMARY ACTION: [ INSTALL & RUN (.ZIP) ] */}
            <div className="space-y-3 pt-2">
              <button
                onClick={() => handleDownloadZip('main')}
                disabled={launching || isBroken}
                className="w-full flex items-center justify-center gap-2.5 py-3.5 px-4 bg-[#20D989] hover:bg-[#1bb874] text-black font-mono text-sm font-bold tracking-wider rounded transition-all shadow-[0_0_20px_rgba(32,217,137,0.2)] active:scale-[0.99] disabled:opacity-50 cursor-pointer"
              >
                <Download className="w-4 h-4 text-black" />
                <span>{launching ? 'PREPARING ZIP...' : 'Install & Run (.zip) →'}</span>
              </button>

              <div className="flex items-center justify-center gap-1.5 text-[11px] font-mono text-[#666666]">
                <Shield className="w-3.5 h-3.5 text-[#20D989]" />
                <span>Extract ZIP on your PC &amp; run run.bat. Zero code exposed.</span>
              </div>
            </div>
          </div>

          {/* BACKUP RUN OPTION CARD */}
          {hasBackup && (
            <div className="border border-amber-500/30 bg-[#0F0C06] rounded-lg p-6 space-y-4 font-mono">
              <div className="flex items-center justify-between pb-3 border-b border-amber-500/20">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
                  <RotateCcw className="w-4 h-4" />
                  <span>Backup Run Option</span>
                </div>
                <span className="text-[10px] text-amber-400/90 font-semibold uppercase">
                  Redundancy Ready
                </span>
              </div>

              <p className="text-xs text-[#AAAAAA] leading-relaxed">
                A secondary fallback runner configured in the tool directory. Use this if the main launcher needs maintenance or you prefer the backup script.
              </p>

              <button
                onClick={() => handleDownloadZip('backup')}
                disabled={launching}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-amber-500 hover:bg-amber-400 text-black font-mono text-xs font-bold tracking-wider rounded transition-all shadow-[0_0_15px_rgba(245,158,11,0.2)] cursor-pointer"
              >
                <Download className="w-4 h-4 text-black" />
                <span>Run Backup Package (.zip)</span>
              </button>

              <div className="flex items-center justify-between pt-1 text-[11px] text-[#777777]">
                <span>Files: run_backup.bat + code_backup.py</span>
                <button
                  onClick={() => handleSpawnOnHost('backup')}
                  className="text-amber-400 hover:underline flex items-center gap-1"
                >
                  <Terminal className="w-3 h-3" />
                  <span>Spawn Backup</span>
                </button>
              </div>
            </div>
          )}

          {/* How to Run Card matching mockup */}
          <div className="border border-[#242424] bg-[#0A0A0A] rounded-lg p-6 space-y-4">
            <div className="flex items-center gap-2 font-mono text-sm font-semibold text-[#F2F2F2] pb-3 border-b border-[#1C1C1C]">
              <HelpCircle className="w-4 h-4 text-[#20D989]" />
              <span>How to Run in Terminal ?</span>
            </div>

            {/* Quick 3-step numbered list matching mockup */}
            <div className="space-y-3 font-mono text-xs text-[#999999]">
              <div className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full border border-[#20D989] text-[#20D989] flex items-center justify-center text-[10px] shrink-0 font-bold">
                  1
                </span>
                <span>Click <strong>Install &amp; Run (.zip)</strong> to download the package</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full border border-[#20D989] text-[#20D989] flex items-center justify-center text-[10px] shrink-0 font-bold">
                  2
                </span>
                <span>Extract the downloaded ZIP folder on your computer</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full border border-[#20D989] text-[#20D989] flex items-center justify-center text-[10px] shrink-0 font-bold">
                  3
                </span>
                <span>Double-click <strong>run.bat</strong> (or <strong>run_backup.bat</strong>) to open Command Prompt</span>
              </div>
            </div>

            {/* 1-Line Terminal Command Option */}
            <div className="pt-4 border-t border-[#1C1C1C] space-y-2">
              <span className="text-[11px] font-mono text-[#666666] block">
                Or run without extracting via 1-line command:
              </span>
              <div className="relative bg-[#050505] border border-[#242424] rounded p-2.5 font-mono text-[10px] text-[#20D989] overflow-x-auto select-all flex items-center justify-between">
                <span className="truncate pr-8">{activeCommand}</span>
                <button
                  onClick={handleCopyCommand}
                  className="p-1 hover:text-white shrink-0 ml-2"
                  title="Copy Command"
                >
                  {copiedCmd ? <Check className="w-3 h-3 text-[#20D989]" /> : <Copy className="w-3 h-3 text-[#888888]" />}
                </button>
              </div>
            </div>

            {/* Security note */}
            <div className="pt-2 text-[11px] font-mono text-[#666666] leading-relaxed">
              Execution runs 100% locally on your computer inside your own terminal. Raw code is not displayed or exported in the web browser.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
