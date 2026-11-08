import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Wrench,
  CheckCircle,
  AlertTriangle,
  ShieldCheck,
  Download,
  PlusCircle,
  PackageCheck,
  ArrowRight
} from 'lucide-react';
import { fetchTools, toggleTool } from '../../services/api';
import { useToast } from '../../components/Toast';
import type { Tool } from '../../types/tool';

export const AdminOverview: React.FC = () => {
  const [tools, setTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  const loadData = () => {
    fetchTools()
      .then((data) => setTools(data as Tool[]))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const totalTools = tools.length;
  const activeTools = tools.filter((t) => t.status === 'active' && !t.main?.broken).length;
  const backupEnabledCount = tools.filter((t) => t.backup?.enabled).length;
  const brokenCount = tools.filter((t) => t.status === 'broken' || t.main?.broken).length;
  const totalDownloads = tools.reduce((acc, t) => acc + (t.downloadCount || 0), 0);

  const handleToggleBackup = async (id: string) => {
    try {
      await toggleTool(id, 'backupEnabled');
      showToast('BACKUP STATUS UPDATED', 'success');
      loadData();
    } catch {
      showToast('FAILED TO TOGGLE BACKUP', 'error');
    }
  };

  return (
    <div className="space-y-8 font-mono max-w-6xl">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#242424]">
        <div>
          <h1 className="text-2xl font-bold text-[#F2F2F2]">System Overview</h1>
          <p className="text-xs text-[#666666] mt-1">
            Real-time status of packaged utilities, redundancy coverage, and download metrics.
          </p>
        </div>
        <Link
          to="/admin/tools/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#20D989] hover:bg-[#1bb874] text-black text-xs font-bold rounded transition-colors"
        >
          <PlusCircle className="w-4 h-4" />
          <span>CREATE NEW TOOL</span>
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[#0A0A0A] border border-[#242424] rounded-lg p-4 space-y-1">
          <div className="flex items-center justify-between text-xs text-[#666666]">
            <span>TOTAL TOOLS</span>
            <Wrench className="w-4 h-4 text-[#999999]" />
          </div>
          <div className="text-2xl font-bold text-[#F2F2F2] tabular-nums">{totalTools}</div>
          <div className="text-[11px] text-[#666666]">Packaged in database</div>
        </div>

        <div className="bg-[#0A0A0A] border border-[#242424] rounded-lg p-4 space-y-1">
          <div className="flex items-center justify-between text-xs text-[#666666]">
            <span>ACTIVE UTILITIES</span>
            <CheckCircle className="w-4 h-4 text-[#20D989]" />
          </div>
          <div className="text-2xl font-bold text-[#20D989] tabular-nums">{activeTools}</div>
          <div className="text-[11px] text-[#666666]">Ready for public run</div>
        </div>

        <div className="bg-[#0A0A0A] border border-[#242424] rounded-lg p-4 space-y-1">
          <div className="flex items-center justify-between text-xs text-[#666666]">
            <span>BACKUP ENABLED</span>
            <ShieldCheck className="w-4 h-4 text-[#20D989]" />
          </div>
          <div className="text-2xl font-bold text-[#F2F2F2] tabular-nums">{backupEnabledCount}</div>
          <div className="text-[11px] text-[#666666]">Dual-script redundancy</div>
        </div>

        <div className="bg-[#0A0A0A] border border-[#242424] rounded-lg p-4 space-y-1">
          <div className="flex items-center justify-between text-xs text-[#666666]">
            <span>BROKEN / FLAGGED</span>
            <AlertTriangle className="w-4 h-4 text-[#FF5555]" />
          </div>
          <div className="text-2xl font-bold text-[#FF5555] tabular-nums">{brokenCount}</div>
          <div className="text-[11px] text-[#666666]">Requires package audit</div>
        </div>
      </div>

      {/* Quick Launch & Quick Table */}
      <div className="border border-[#242424] bg-[#0A0A0A] rounded-lg overflow-hidden">
        <div className="px-5 py-4 border-b border-[#242424] flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-[#F2F2F2]">
            <span>RECENT TOOLS DIRECTORY</span>
          </div>
          <Link to="/admin/tools" className="text-xs text-[#20D989] hover:underline flex items-center gap-1">
            <span>Manage All Tools</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0D0D0D] text-[#666666] border-b border-[#242424]">
              <tr>
                <th className="px-5 py-3 font-medium">TITLE</th>
                <th className="px-5 py-3 font-medium">CATEGORY</th>
                <th className="px-5 py-3 font-medium">VERSION</th>
                <th className="px-5 py-3 font-medium">MAIN PACKAGE</th>
                <th className="px-5 py-3 font-medium">BACKUP</th>
                <th className="px-5 py-3 font-medium">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1C1C1C]">
              {tools.slice(0, 5).map((tool) => (
                <tr key={tool.id} className="hover:bg-[#121212] transition-colors">
                  <td className="px-5 py-3.5 font-bold text-[#F2F2F2]">
                    <Link to={`/admin/tools/${tool.id}/edit`} className="hover:text-[#20D989]">
                      {tool.title}
                    </Link>
                  </td>
                  <td className="px-5 py-3.5 text-[#999999]">{tool.category}</td>
                  <td className="px-5 py-3.5 text-[#999999]">v{tool.version}</td>
                  <td className="px-5 py-3.5">
                    {tool.main?.broken ? (
                      <span className="text-[#FF5555]">Flagged Broken</span>
                    ) : tool.main?.available ? (
                      <span className="text-[#20D989]">Configured</span>
                    ) : (
                      <span className="text-[#666666]">Incomplete</span>
                    )}
                  </td>
                  <td className="px-5 py-3.5">
                    <button
                      onClick={() => handleToggleBackup(tool.id)}
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-colors ${
                        tool.backup?.enabled
                          ? 'bg-[#20D989]/20 text-[#20D989] border border-[#20D989]/40'
                          : 'bg-[#181818] text-[#666666] border border-[#242424]'
                      }`}
                    >
                      {tool.backup?.enabled ? 'ENABLED' : 'DISABLED'}
                    </button>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <Link
                        to={`/admin/tools/${tool.id}/edit`}
                        className="text-[#999999] hover:text-[#20D989]"
                      >
                        Edit
                      </Link>
                      <Link
                        to={`/tools/${tool.slug}`}
                        target="_blank"
                        className="text-[#666666] hover:text-[#F2F2F2]"
                      >
                        Preview
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
