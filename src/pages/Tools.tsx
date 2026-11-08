import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, ArrowRight, AlertTriangle, ShieldCheck, Tag } from 'lucide-react';
import { fetchTools } from '../services/api';
import type { PublicTool, ToolCategory } from '../types/tool';

const CATEGORIES: ('All' | ToolCategory)[] = ['All', 'Utility', 'Animation', 'System', 'Creative'];

export const Tools: React.FC = () => {
  const [tools, setTools] = useState<PublicTool[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'All' | ToolCategory>('All');

  useEffect(() => {
    fetchTools()
      .then((data) => setTools(data as PublicTool[]))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const filteredTools = tools.filter((tool) => {
    const matchesCategory = selectedCategory === 'All' || tool.category === selectedCategory;
    const matchesSearch =
      tool.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (tool.tags && tool.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
      {/* Page Header */}
      <div className="mb-10 space-y-3">
        <div className="flex items-center gap-2 font-mono text-xs text-[#20D989] tracking-wider uppercase">
          <span>&gt; REPOSITORY INDEX</span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#20D989] animate-pulse" />
        </div>
        <h1 className="font-mono text-3xl sm:text-4xl font-bold text-[#F2F2F2] tracking-tight">
          Tools Library<span className="text-[#20D989]">_</span>
        </h1>
        <p className="font-mono text-sm text-[#999999] max-w-2xl">
          Browse interactive console utilities. Inspect their artwork and execute them live in the web browser terminal with zero downloads.
        </p>
      </div>

      {/* Search and Category Filter Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between mb-8 pb-6 border-b border-[#242424]">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#666666]" />
          <input
            type="text"
            placeholder="Search utilities by title, tag, or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#0A0A0A] border border-[#242424] focus:border-[#20D989] rounded px-10 py-2.5 font-mono text-xs text-[#F2F2F2] placeholder-[#666666] outline-none transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 font-mono text-xs text-[#666666] hover:text-[#F2F2F2]"
            >
              CLEAR
            </button>
          )}
        </div>

        {/* Category Segmented Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 font-mono text-xs tracking-wider uppercase rounded transition-colors whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-[#20D989] text-black font-semibold'
                  : 'bg-[#0A0A0A] text-[#999999] hover:text-[#F2F2F2] border border-[#242424]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Loading Skeletons */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="h-72 bg-[#0A0A0A] border border-[#242424] rounded-lg animate-pulse p-6 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="h-4 bg-[#181818] rounded w-1/3" />
                <div className="h-6 bg-[#181818] rounded w-3/4" />
                <div className="h-24 bg-[#141414] rounded w-full" />
              </div>
              <div className="h-8 bg-[#181818] rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : filteredTools.length === 0 ? (
        /* Empty State */
        <div className="text-center py-16 border border-dashed border-[#242424] rounded-lg bg-[#080808] p-8">
          <AlertTriangle className="w-10 h-10 text-[#666666] mx-auto mb-3" />
          <h3 className="font-mono text-base font-semibold text-[#F2F2F2]">NO UTILITIES FOUND</h3>
          <p className="font-mono text-xs text-[#666666] mt-1 max-w-sm mx-auto">
            No tools matched your current search criteria or category filter.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('All');
            }}
            className="mt-4 px-4 py-2 font-mono text-xs uppercase bg-[#0A0A0A] border border-[#242424] text-[#20D989] hover:border-[#20D989] rounded transition-colors"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        /* Tools Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTools.map((tool) => {
            const isBroken = tool.status === 'broken' || tool.main?.broken;
            return (
              <div
                key={tool.id}
                className="flex flex-col justify-between border border-[#242424] hover:border-[#20D989]/50 bg-[#0A0A0A] rounded-lg p-5 transition-all duration-200 group hover:shadow-[0_0_15px_rgba(32,217,137,0.06)]"
              >
                <div>
                  {/* Top Metadata: Unboxed Text with Separators */}
                  <div className="flex items-center justify-between text-xs font-mono text-[#666666] mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-[#20D989] font-medium">{tool.category}</span>
                      <span>·</span>
                      <span>v{tool.version}</span>
                    </div>

                    {isBroken ? (
                      <span className="flex items-center gap-1 text-[#FF5555] text-[11px]">
                        <AlertTriangle className="w-3 h-3" />
                        Broken
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-[#20D989] text-[11px]">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#20D989]" />
                        Active
                      </span>
                    )}
                  </div>

                  {/* Tool Title */}
                  <h3 className="font-mono text-lg font-bold text-[#F2F2F2] group-hover:text-[#20D989] transition-colors mb-2">
                    {tool.title}
                  </h3>

                  {/* Description */}
                  <p className="font-mono text-xs text-[#999999] line-clamp-2 leading-relaxed mb-4">
                    {tool.description}
                  </p>

                  {/* ASCII Miniature Preview */}
                  <div className="bg-[#050505] border border-[#1C1C1C] rounded p-3 mb-4 overflow-hidden h-28 relative crt-scanlines">
                    <pre className="ascii-canvas text-[8px] leading-[1.05] text-[#20D989]/70 select-none">
                      {tool.asciiPreview.split('\n').slice(0, 10).join('\n')}
                    </pre>
                  </div>
                </div>

                {/* Footer of Card */}
                <div className="pt-3 border-t border-[#1C1C1C] flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[11px] font-mono text-[#20D989]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#20D989] animate-pulse" />
                    <span>Live Web Console</span>
                  </div>

                  <Link
                    to={`/tools/${tool.slug}`}
                    className="flex items-center gap-1.5 font-mono text-xs font-semibold text-[#F2F2F2] group-hover:text-[#20D989] transition-colors"
                  >
                    <span>VIEW TOOL</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
