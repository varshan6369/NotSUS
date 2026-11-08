import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  PackageCheck,
  Download,
  AlertTriangle,
  CheckCircle,
  FileCode,
  ShieldCheck,
  FileText,
  ExternalLink
} from 'lucide-react';
import { fetchTools } from '../../services/api';
import { downloadPackage } from '../../services/packageDownloader';
import { useToast } from '../../components/Toast';
import type { Tool } from '../../types/tool';

export const AdminPackages: React.FC = () => {
  const [tools, setTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    fetchTools()
      .then((data) => setTools(data as Tool[]))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handleTestDownload = async (slug: string, type: 'main' | 'backup' | 'combined') => {
    try {
      const res = await downloadPackage(slug, type);
      if (res.success) {
        showToast(`ADMIN TEST DOWNLOAD: ${res.message}`, 'success');
      } else {
        showToast(res.message, 'error');
      }
    } catch {
      showToast('FAILED TO DISPATCH PACKAGE', 'error');
    }
  };

  return (
    <div className="space-y-6 font-mono max-w-6xl">
      {/* Header */}
      <div className="pb-4 border-b border-[#242424]">
        <h1 className="text-2xl font-bold text-[#F2F2F2]">Package Management &amp; Audit</h1>
        <p className="text-xs text-[#666666] mt-1">
          Verify package integrity, inspect internal filenames, and test ZIP archive generation.
        </p>
      </div>

      {/* Package Integrity Table */}
      <div className="border border-[#242424] bg-[#0A0A0A] rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0D0D0D] text-[#666666] border-b border-[#242424]">
              <tr>
                <th className="px-5 py-3 font-medium">TOOL</th>
                <th className="px-5 py-3 font-medium">MAIN PACKAGE FILES</th>
                <th className="px-5 py-3 font-medium">BACKUP PACKAGE FILES</th>
                <th className="px-5 py-3 font-medium">HEALTH AUDIT</th>
                <th className="px-5 py-3 font-medium text-right">TEST ZIP ARCHIVES</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1C1C1C]">
              {tools.map((tool) => {
                const hasMainBat = !!tool.main?.batContent;
                const hasMainPy = !!tool.main?.pyContent;
                const mainComplete = hasMainBat && hasMainPy;

                const backupEnabled = !!tool.backup?.enabled;
                const hasBackupBat = !!tool.backup?.batContent;
                const hasBackupPy = !!tool.backup?.pyContent;
                const backupComplete = !backupEnabled || (hasBackupBat && hasBackupPy);

                const isHealthy = mainComplete && backupComplete && !tool.main?.broken;

                return (
                  <tr key={tool.id} className="hover:bg-[#121212] transition-colors">
                    {/* Tool Info */}
                    <td className="px-5 py-4">
                      <div className="font-bold text-[#F2F2F2]">{tool.title}</div>
                      <div className="text-[11px] text-[#20D989] font-mono">projects/{tool.slug}/</div>
                      <div className="text-[10px] text-[#666666]">v{tool.version} · {tool.category}</div>
                    </td>

                    {/* Main Package Files (Visible ONLY to Admin) */}
                    <td className="px-5 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-[11px]">
                          <span className={hasMainBat ? 'text-[#20D989]' : 'text-[#FF5555]'}>●</span>
                          <span className="text-[#999999]">{tool.main?.batFilename || 'run.bat'}</span>
                          <span className="text-[10px] text-[#555555]">
                            ({tool.main?.batContent?.length || 0} bytes)
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px]">
                          <span className={hasMainPy ? 'text-[#20D989]' : 'text-[#FF5555]'}>●</span>
                          <span className="text-[#999999]">{tool.main?.pyFilename || 'code.py'}</span>
                          <span className="text-[10px] text-[#555555]">
                            ({tool.main?.pyContent?.length || 0} bytes)
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Backup Package Files */}
                    <td className="px-5 py-4">
                      {backupEnabled ? (
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 text-[11px]">
                            <span className={hasBackupBat ? 'text-[#20D989]' : 'text-[#FF5555]'}>●</span>
                            <span className="text-[#999999]">{tool.backup?.batFilename || 'run_backup.bat'}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-[11px]">
                            <span className={hasBackupPy ? 'text-[#20D989]' : 'text-[#FF5555]'}>●</span>
                            <span className="text-[#999999]">{tool.backup?.pyFilename || 'code_backup.py'}</span>
                          </div>
                        </div>
                      ) : (
                        <span className="text-[11px] text-[#555555] italic">Backup Disabled</span>
                      )}
                    </td>

                    {/* Health Status */}
                    <td className="px-5 py-4">
                      {isHealthy ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-[#20D989]/10 text-[#20D989] border border-[#20D989]/30">
                          <CheckCircle className="w-3 h-3" /> VERIFIED
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-[#FF5555]/10 text-[#FF5555] border border-[#FF5555]/30">
                          <AlertTriangle className="w-3 h-3" /> INCOMPLETE
                        </span>
                      )}
                    </td>

                    {/* Test ZIP Download Actions */}
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {mainComplete && (
                          <button
                            onClick={() => handleTestDownload(tool.slug, 'main')}
                            className="px-2.5 py-1 text-[11px] bg-[#0E0E0E] hover:bg-[#181818] border border-[#242424] hover:border-[#20D989] text-[#20D989] rounded flex items-center gap-1"
                            title="Download Main ZIP"
                          >
                            <Download className="w-3 h-3" />
                            <span>Main ZIP</span>
                          </button>
                        )}

                        {backupEnabled && hasBackupBat && hasBackupPy && (
                          <button
                            onClick={() => handleTestDownload(tool.slug, 'backup')}
                            className="px-2.5 py-1 text-[11px] bg-[#0E0E0E] hover:bg-[#181818] border border-[#242424] hover:border-[#20D989] text-[#999999] hover:text-[#F2F2F2] rounded flex items-center gap-1"
                            title="Download Backup ZIP"
                          >
                            <Download className="w-3 h-3" />
                            <span>Backup ZIP</span>
                          </button>
                        )}

                        <Link
                          to={`/admin/tools/${tool.id}/edit`}
                          className="px-2 py-1 text-[11px] text-[#666666] hover:text-[#20D989] hover:underline"
                        >
                          Configure
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
