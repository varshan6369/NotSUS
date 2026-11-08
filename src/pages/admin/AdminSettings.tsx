import React, { useState } from 'react';
import {
  Download,
  Upload,
  Database,
  FileJson,
  Shield,
  CheckCircle2,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';
import { exportTools, importTools } from '../../services/api';
import { useToast } from '../../components/Toast';
import type { Tool } from '../../types/tool';

export const AdminSettings: React.FC = () => {
  const [importJson, setImportJson] = useState('');
  const [importMode, setImportMode] = useState<'merge' | 'replace'>('merge');
  const [importing, setImporting] = useState(false);
  const [previewTools, setPreviewTools] = useState<Tool[] | null>(null);
  const { showToast } = useToast();

  const handleExport = async () => {
    try {
      const data = await exportTools();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ascii-launcher-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast('DATABASE BACKUP JSON EXPORTED', 'success');
    } catch {
      showToast('FAILED TO EXPORT DATA', 'error');
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (Array.isArray(parsed)) {
          setPreviewTools(parsed);
          setImportJson(JSON.stringify(parsed, null, 2));
          showToast(`VALID BACKUP LOADED: ${parsed.length} UTILITIES FOUND`, 'info');
        } else {
          showToast('INVALID JSON: EXPECTED AN ARRAY OF TOOLS', 'error');
        }
      } catch {
        showToast('FAILED TO PARSE JSON FILE', 'error');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleConfirmImport = async () => {
    if (!previewTools || previewTools.length === 0) {
      showToast('NO TOOLS READY TO IMPORT', 'warning');
      return;
    }

    setImporting(true);
    try {
      const res = await importTools(previewTools, importMode);
      showToast(`IMPORT SUCCESSFUL: ${res.count} UTILITIES ACTIVE`, 'success');
      setPreviewTools(null);
      setImportJson('');
    } catch (err: any) {
      showToast(err.message || 'IMPORT FAILED', 'error');
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="space-y-8 font-mono max-w-4xl">
      {/* Header */}
      <div className="pb-4 border-b border-[#242424]">
        <h1 className="text-2xl font-bold text-[#F2F2F2]">Settings &amp; Repository Backups</h1>
        <p className="text-xs text-[#666666] mt-1">
          Export full system configurations and import verified JSON repository archives.
        </p>
      </div>

      {/* Export Section */}
      <div className="border border-[#242424] bg-[#0A0A0A] rounded-lg p-6 space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b border-[#1C1C1C]">
          <Download className="w-5 h-5 text-[#20D989]" />
          <div>
            <h2 className="text-sm font-bold text-[#F2F2F2]">Export System Backup (JSON)</h2>
            <p className="text-xs text-[#666666]">
              Downloads all utility metadata, Python source files, and launcher configurations into an offline JSON archive.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <span className="text-xs text-[#999999]">Includes active tools, scripts, and download statistics.</span>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-[#0E0E0E] hover:bg-[#181818] border border-[#20D989] text-[#20D989] text-xs font-bold rounded transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>EXPORT BACKUP JSON</span>
          </button>
        </div>
      </div>

      {/* Import Section */}
      <div className="border border-[#242424] bg-[#0A0A0A] rounded-lg p-6 space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b border-[#1C1C1C]">
          <Upload className="w-5 h-5 text-[#20D989]" />
          <div>
            <h2 className="text-sm font-bold text-[#F2F2F2]">Import Repository Backup</h2>
            <p className="text-xs text-[#666666]">
              Restore previously exported tool configurations or migrate tools between servers.
            </p>
          </div>
        </div>

        {/* Upload File Button or Paste JSON */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-[#0E0E0E] hover:bg-[#181818] border border-[#242424] hover:border-[#666666] text-xs text-[#F2F2F2] rounded">
              <Upload className="w-4 h-4 text-[#20D989]" />
              <span>Select Backup JSON File</span>
              <input
                type="file"
                accept=".json"
                onChange={handleFileSelect}
                className="hidden"
              />
            </label>

            {/* Mode selection */}
            <div className="flex items-center gap-2 text-xs">
              <span className="text-[#666666]">Mode:</span>
              <label className="flex items-center gap-1 text-[#999999] cursor-pointer">
                <input
                  type="radio"
                  name="importMode"
                  value="merge"
                  checked={importMode === 'merge'}
                  onChange={() => setImportMode('merge')}
                  className="accent-[#20D989]"
                />
                <span>Merge / Update</span>
              </label>
              <label className="flex items-center gap-1 text-[#999999] cursor-pointer ml-2">
                <input
                  type="radio"
                  name="importMode"
                  value="replace"
                  checked={importMode === 'replace'}
                  onChange={() => setImportMode('replace')}
                  className="accent-[#FF5555]"
                />
                <span className="text-[#FF5555]">Replace All</span>
              </label>
            </div>
          </div>

          <textarea
            value={importJson}
            onChange={(e) => {
              setImportJson(e.target.value);
              try {
                const parsed = JSON.parse(e.target.value);
                if (Array.isArray(parsed)) setPreviewTools(parsed);
              } catch {
                setPreviewTools(null);
              }
            }}
            placeholder="Or paste JSON array here..."
            rows={6}
            className="w-full bg-[#050505] border border-[#242424] rounded p-3 text-xs text-[#20D989] font-mono outline-none"
          />

          {previewTools && (
            <div className="p-4 bg-[#080808] border border-[#20D989]/30 rounded space-y-3">
              <div className="flex items-center justify-between text-xs text-[#20D989] font-bold">
                <span>PREVIEW: {previewTools.length} UTILITIES READY TO IMPORT</span>
                <span className="uppercase text-[10px] text-[#999999]">MODE: {importMode}</span>
              </div>
              <ul className="text-xs text-[#999999] max-h-32 overflow-y-auto space-y-1 list-disc pl-5">
                {previewTools.map((t, i) => (
                  <li key={i}>
                    <strong className="text-[#F2F2F2]">{t.title}</strong> (/{t.slug}) - v{t.version}
                  </li>
                ))}
              </ul>
              <button
                onClick={handleConfirmImport}
                disabled={importing}
                className="w-full py-2.5 bg-[#20D989] hover:bg-[#1bb874] text-black text-xs font-bold uppercase rounded shadow-[0_0_15px_rgba(32,217,137,0.2)] cursor-pointer disabled:opacity-50"
              >
                {importing ? 'IMPORTING...' : `CONFIRM IMPORT (${previewTools.length} TOOLS)`}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
