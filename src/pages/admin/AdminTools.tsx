import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  PlusCircle,
  Edit2,
  Trash2,
  ExternalLink,
  Shield,
  ShieldOff,
  AlertTriangle,
  CheckCircle,
  Search,
  Filter
} from 'lucide-react';
import { fetchTools, deleteTool, toggleTool } from '../../services/api';
import { useToast } from '../../components/Toast';
import type { Tool } from '../../types/tool';

export const AdminTools: React.FC = () => {
  const [tools, setTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [toolToDelete, setToolToDelete] = useState<Tool | null>(null);
  const { showToast } = useToast();

  const loadTools = () => {
    fetchTools()
      .then((data) => setTools(data as Tool[]))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadTools();
  }, []);

  const handleToggleBackup = async (tool: Tool) => {
    try {
      await toggleTool(tool.id, 'backupEnabled');
      showToast(`BACKUP ${!tool.backup?.enabled ? 'ENABLED' : 'DISABLED'} FOR ${tool.title.toUpperCase()}`, 'success');
      loadTools();
    } catch {
      showToast('FAILED TO TOGGLE BACKUP STATUS', 'error');
    }
  };

  const handleToggleBroken = async (tool: Tool) => {
    try {
      await toggleTool(tool.id, 'mainBroken');
      showToast(`TOOL ${!tool.main?.broken ? 'FLAGGED BROKEN' : 'MARKED NOMINAL'}`, 'warning');
      loadTools();
    } catch {
      showToast('FAILED TO UPDATE STATUS', 'error');
    }
  };

  const confirmDelete = async () => {
    if (!toolToDelete) return;
    try {
      await deleteTool(toolToDelete.id);
      showToast(`DELETED ${toolToDelete.title.toUpperCase()}`, 'info');
      setToolToDelete(null);
      loadTools();
    } catch (err: any) {
      showToast(err.message || 'FAILED TO DELETE TOOL', 'error');
    }
  };

  const filtered = tools.filter(
    (t) =>
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.slug.toLowerCase().includes(search.toLowerCase()) ||
      t.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 font-mono max-w-6xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#242424]">
        <div>
          <h1 className="text-2xl font-bold text-[#F2F2F2]">Manage Utilities</h1>
          <p className="text-xs text-[#666666] mt-1">
            Configure metadata, package scripts, backup availability, and tool status.
          </p>
        </div>

        <Link
          to="/admin/tools/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#20D989] hover:bg-[#1bb874] text-black text-xs font-bold rounded transition-colors"
        >
          <PlusCircle className="w-4 h-4" />
          <span>NEW TOOL</span>
        </Link>
      </div>

      {/* Filter / Search Bar */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#666666]" />
          <input
            type="text"
            placeholder="Filter utilities..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#0A0A0A] border border-[#242424] focus:border-[#20D989] rounded pl-9 pr-4 py-2 text-xs text-[#F2F2F2] outline-none"
          />
        </div>
        <div className="text-xs text-[#666666]">
          Total: <strong className="text-[#F2F2F2]">{filtered.length}</strong> items
        </div>
      </div>

      {/* Tools Table */}
      <div className="border border-[#242424] bg-[#0A0A0A] rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0D0D0D] text-[#666666] border-b border-[#242424]">
              <tr>
                <th className="px-4 py-3 font-medium">TOOL TITLE / SLUG</th>
                <th className="px-4 py-3 font-medium">CATEGORY</th>
                <th className="px-4 py-3 font-medium">VERSION</th>
                <th className="px-4 py-3 font-medium">MAIN INTEGRITY</th>
                <th className="px-4 py-3 font-medium">BACKUP</th>
                <th className="px-4 py-3 font-medium">STATUS</th>
                <th className="px-4 py-3 font-medium text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1C1C1C]">
              {filtered.map((tool) => {
                const isMainConfigured = !!(tool.main?.batContent && tool.main?.pyContent);
                const isBroken = tool.main?.broken || tool.status === 'broken';

                return (
                  <tr key={tool.id} className="hover:bg-[#121212] transition-colors">
                    {/* Title & Slug */}
                    <td className="px-4 py-3.5">
                      <div className="font-bold text-[#F2F2F2]">{tool.title}</div>
                      <div className="text-[11px] text-[#20D989] font-mono">projects/{tool.slug}/</div>
                    </td>

                    {/* Category */}
                    <td className="px-4 py-3.5 text-[#999999]">{tool.category}</td>

                    {/* Version */}
                    <td className="px-4 py-3.5 text-[#999999]">v{tool.version}</td>

                    {/* Main Integrity */}
                    <td className="px-4 py-3.5">
                      {isBroken ? (
                        <span className="text-[#FF5555] flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5" /> Broken
                        </span>
                      ) : isMainConfigured ? (
                        <span className="text-[#20D989] flex items-center gap-1">
                          <CheckCircle className="w-3.5 h-3.5" /> Ready
                        </span>
                      ) : (
                        <span className="text-amber-400">Missing Files</span>
                      )}
                    </td>

                    {/* Backup Toggle */}
                    <td className="px-4 py-3.5">
                      <button
                        onClick={() => handleToggleBackup(tool)}
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-semibold border transition-colors ${
                          tool.backup?.enabled
                            ? 'bg-[#20D989]/10 border-[#20D989]/50 text-[#20D989]'
                            : 'bg-[#141414] border-[#242424] text-[#666666] hover:text-[#999999]'
                        }`}
                        title="Click to toggle backup availability"
                      >
                        {tool.backup?.enabled ? <Shield className="w-3 h-3" /> : <ShieldOff className="w-3 h-3" />}
                        <span>{tool.backup?.enabled ? 'ENABLED' : 'DISABLED'}</span>
                      </button>
                    </td>

                    {/* Overall Status */}
                    <td className="px-4 py-3.5">
                      <button
                        onClick={() => handleToggleBroken(tool)}
                        className={`text-[11px] uppercase underline cursor-pointer ${
                          isBroken ? 'text-[#FF5555]' : 'text-[#999999] hover:text-[#F2F2F2]'
                        }`}
                        title="Click to toggle broken flag"
                      >
                        {isBroken ? 'FLAGGED BROKEN' : 'ACTIVE'}
                      </button>
                    </td>

                    {/* Action buttons */}
                    <td className="px-4 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/tools/${tool.slug}`}
                          target="_blank"
                          className="p-1.5 text-[#666666] hover:text-[#F2F2F2] rounded hover:bg-[#1A1A1A]"
                          title="Preview in Public Portal"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                        <Link
                          to={`/admin/tools/${tool.id}/edit`}
                          className="p-1.5 text-[#20D989] hover:text-[#1bb874] rounded hover:bg-[#1A1A1A]"
                          title="Edit Tool & Packages"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </Link>
                        <button
                          onClick={() => setToolToDelete(tool)}
                          className="p-1.5 text-[#FF5555] hover:text-[#ff7777] rounded hover:bg-[#1A1A1A]"
                          title="Delete Tool"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {toolToDelete && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="border border-[#FF5555]/50 bg-[#0A0A0A] rounded-lg p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-[#FF5555]">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="text-base font-bold">CONFIRM DELETION</h3>
            </div>
            <p className="text-xs text-[#999999] leading-relaxed">
              Are you sure you want to permanently delete{' '}
              <strong className="text-[#F2F2F2]">{toolToDelete.title}</strong>? All associated package launchers, Python scripts, and download records will be purged.
            </p>
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#1C1C1C]">
              <button
                onClick={() => setToolToDelete(null)}
                className="px-4 py-2 border border-[#242424] text-xs text-[#999999] hover:text-[#F2F2F2] rounded"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-[#FF5555] hover:bg-[#ff4444] text-black font-bold text-xs rounded"
              >
                DELETE TOOL
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
