import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Play,
  HelpCircle,
  AlertTriangle,
  Terminal,
  Shield,
  Download
} from 'lucide-react';
import { fetchTool } from '../services/api';
import { ASCIIViewer } from '../components/ASCIIViewer';
import { useToast } from '../components/Toast';
import type { PublicTool } from '../types/tool';

export const ToolDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [tool, setTool] = useState<PublicTool | null>(null);
  const [loading, setLoading] = useState(true);
  const [launching, setLaunching] = useState(false);
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

  // Run in Terminal: triggers local host process spawn and launcher dispatch
  const handleRunInTerminal = async () => {
    if (!tool) return;
    setLaunching(true);
    try {
      // 1. Trigger host OS terminal spawn if server is running on the local PC
      fetch(`/api/tools/${tool.slug}/spawn`, { method: 'POST' })
        .then((r) => r.json())
        .then((data) => {
          if (data.success) {
            showToast('TERMINAL SPAWNED ON LOCAL PC', 'success');
          }
        })
        .catch(() => {});

      // 2. Dispatch launcher file for direct execution
      const res = await fetch(`/api/tools/${tool.slug}/run`);
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${tool.slug}-launcher.zip`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.error(err);
      showToast('ERROR LAUNCHING TERMINAL PROCESS', 'error');
    } finally {
      setLaunching(false);
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

      {/* Main Grid: Left Column (ASCII Artwork Preview) & Right Column (Info + Actions) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Heading, Info, and Full Monospace ASCII Frame (NO RAW CODE SHOWN) */}
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

            {/* Clean metadata without pill boxes */}
            <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-[#666666] pt-1">
              <span className="text-[#999999]">{tool.category}</span>
              <span>·</span>
              <span className="text-[#999999]">v{tool.version}</span>
              <span>·</span>
              <span className="text-[#20D989]">Runs in Local Terminal</span>
              {tool.tags && tool.tags.length > 0 && (
                <>
                  <span>·</span>
                  <span>{tool.tags.join(', ')}</span>
                </>
              )}
            </div>
          </div>

          {/* ASCII Artwork Preview Window matching mockup */}
          <div className="mt-4">
            <ASCIIViewer
              art={tool.asciiPreview}
              title={tool.title}
              maxHeight="max-h-[560px]"
              showControls={true}
            />
          </div>
        </div>

        {/* Right Column: Tool Information Card & How to Run Card */}
        <div className="lg:col-span-4 space-y-6">
          {/* Tool Information Card matching mockup */}
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
              Launches directly in your computer's terminal. Double-click the launcher to open Windows Command Prompt and run the utility.
            </p>

            {/* PRIMARY ACTION: [ RUN IN TERMINAL ] */}
            <div className="space-y-3 pt-2">
              <button
                onClick={handleRunInTerminal}
                disabled={launching || isBroken}
                className="w-full flex items-center justify-center gap-2.5 py-3.5 px-4 bg-[#20D989] hover:bg-[#1bb874] text-black font-mono text-sm font-bold tracking-wider rounded transition-all shadow-[0_0_20px_rgba(32,217,137,0.2)] active:scale-[0.99] disabled:opacity-50 cursor-pointer"
              >
                <Terminal className="w-4 h-4 text-black" />
                <span>{launching ? 'PREPARING LAUNCHER...' : 'Run in Terminal →'}</span>
              </button>

              <div className="flex items-center justify-center gap-1.5 text-[11px] font-mono text-[#666666]">
                <Shield className="w-3.5 h-3.5 text-[#20D989]" />
                <span>Runs securely on your PC terminal. Zero code exposed.</span>
              </div>
            </div>
          </div>

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
                <span>Click the <strong>Run in Terminal</strong> button</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full border border-[#20D989] text-[#20D989] flex items-center justify-center text-[10px] shrink-0 font-bold">
                  2
                </span>
                <span>Extract the downloaded launcher package</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full border border-[#20D989] text-[#20D989] flex items-center justify-center text-[10px] shrink-0 font-bold">
                  3
                </span>
                <span>Double-click <strong>run.bat</strong> to open Windows Command Prompt</span>
              </div>
            </div>

            {/* Security note */}
            <div className="pt-4 border-t border-[#1C1C1C] text-[11px] font-mono text-[#666666] leading-relaxed">
              Execution runs 100% locally on your computer inside your own terminal. Raw code is not displayed or exported in the web browser.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
