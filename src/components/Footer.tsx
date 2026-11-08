import React from 'react';
import { Terminal } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-[#242424] bg-[#050505] py-5 px-4 sm:px-6 lg:px-8 mt-auto">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-xs text-[#666666]">
        {/* Left tagline matching mockups */}
        <div className="flex items-center gap-2">
          <Terminal className="w-3.5 h-3.5 text-[#20D989]" />
          <span>v1.0.0</span>
          <span className="text-[#333333]">|</span>
          <span className="text-[#999999]">Built for the ASCII community.</span>
        </div>

        {/* Right credit matching mockups */}
        <div className="flex items-center gap-2">
          <span className="text-[#20D989]">&gt;</span>
          <span>Made with</span>
          <span className="text-[#20D989]">💚</span>
          <span className="text-[#333333]">·</span>
          <span className="text-[#666666]">In-browser web terminal</span>
        </div>
      </div>
    </footer>
  );
};
