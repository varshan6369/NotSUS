import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Layers, ArrowRight, ShieldCheck, Download, Terminal } from 'lucide-react';
import { fetchTools } from '../services/api';
import type { PublicTool } from '../types/tool';

export const Library: React.FC = () => {
  const [tools, setTools] = useState<PublicTool[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTools()
      .then((data) => setTools(data as PublicTool[]))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const categories = ['Utility', 'Animation', 'Creative', 'System'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-12">
      {/* Header */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 font-mono text-xs text-[#20D989] tracking-wider uppercase">
          <span>&gt; CURATED COLLECTIONS</span>
        </div>
        <h1 className="font-mono text-3xl sm:text-4xl font-bold text-[#F2F2F2] tracking-tight">
          Tool Library<span className="text-[#20D989]">_</span>
        </h1>
        <p className="font-mono text-sm text-[#999999] max-w-2xl">
          Structured directory categorized by function. Every utility runs live directly in your browser terminal with zero downloads.
        </p>
      </div>

      {/* Categories sections */}
      {categories.map((cat) => {
        const catTools = tools.filter((t) => t.category === cat);
        if (catTools.length === 0 && !loading) return null;

        return (
          <div key={cat} className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#242424]">
              <div className="flex items-center gap-2">
                <span className="text-[#20D989] font-mono text-sm font-bold">[ {cat.toUpperCase()} ]</span>
                <span className="font-mono text-xs text-[#666666]">({catTools.length} tools)</span>
              </div>
              <Link
                to="/tools"
                className="font-mono text-xs text-[#999999] hover:text-[#20D989] transition-colors"
              >
                View in Search →
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {catTools.map((tool) => (
                <div
                  key={tool.id}
                  className="bg-[#0A0A0A] border border-[#242424] hover:border-[#20D989]/40 rounded-lg p-5 flex flex-col justify-between transition-all group"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between font-mono text-xs text-[#666666]">
                      <span>v{tool.version}</span>
                      {tool.backup?.enabled && (
                        <span className="flex items-center gap-1 text-[#20D989] text-[11px]">
                          <ShieldCheck className="w-3 h-3" /> Backup Ready
                        </span>
                      )}
                    </div>
                    <h3 className="font-mono text-base font-bold text-[#F2F2F2] group-hover:text-[#20D989] transition-colors">
                      {tool.title}
                    </h3>
                    <p className="font-mono text-xs text-[#999999] line-clamp-2">
                      {tool.description}
                    </p>
                  </div>

                  <div className="pt-4 mt-4 border-t border-[#1C1C1C] flex items-center justify-between">
                    <span className="font-mono text-[11px] text-[#20D989] flex items-center gap-1">
                      <Terminal className="w-3 h-3" /> Live Console
                    </span>
                    <Link
                      to={`/tools/${tool.slug}`}
                      className="inline-flex items-center gap-1 font-mono text-xs font-semibold text-[#20D989] hover:underline"
                    >
                      <span>Launch</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};
