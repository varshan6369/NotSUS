import React from 'react';
import { Terminal, Shield, Code, Cpu, ExternalLink } from 'lucide-react';

export const About: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-12 font-mono">
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-xs text-[#20D989] tracking-wider uppercase">
          <span>&gt; SYSTEM MANIFEST</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-[#F2F2F2] tracking-tight">
          About ASCII Launcher<span className="text-[#20D989]">_</span>
        </h1>
        <p className="text-sm text-[#999999] leading-relaxed">
          A dedicated portal for console utility distribution, combining retro terminal visual aesthetics with offline execution reliability.
        </p>
      </div>

      <div className="space-y-6 text-xs text-[#999999] leading-relaxed">
        <div className="border border-[#242424] bg-[#0A0A0A] p-6 rounded-lg space-y-3">
          <h2 className="text-sm font-bold text-[#F2F2F2] flex items-center gap-2">
            <Terminal className="w-4 h-4 text-[#20D989]" />
            <span>The ASCII Magic Philosophy</span>
          </h2>
          <p>
            ASCII Launcher draws direct inspiration from the minimalist, editor-like design language of ASCII Magic.
            We celebrate the enduring expressive power of monospace typography, phosphor green accents, and text-based art while prioritizing clean, distraction-free usability.
          </p>
        </div>

        <div className="border border-[#242424] bg-[#0A0A0A] p-6 rounded-lg space-y-3">
          <h2 className="text-sm font-bold text-[#F2F2F2] flex items-center gap-2">
            <Shield className="w-4 h-4 text-[#20D989]" />
            <span>Interactive Web Execution Architecture</span>
          </h2>
          <p>
            ASCII Launcher features a dedicated in-browser terminal runtime. Utilities execute directly inside ephemeral memory using an interactive ANSI console with real-time prompt, keyboard input, and ASCII banner rendering.
          </p>
          <p className="text-[#666666]">
            No files are downloaded to user disks. All execution happens in-memory with zero disk footprint.
          </p>
        </div>

        <div className="border border-[#242424] bg-[#0A0A0A] p-6 rounded-lg space-y-3">
          <h2 className="text-sm font-bold text-[#F2F2F2] flex items-center gap-2">
            <Cpu className="w-4 h-4 text-[#20D989]" />
            <span>System Architecture</span>
          </h2>
          <ul className="list-disc pl-5 space-y-1 text-[#666666]">
            <li>Built with React, TypeScript, Tailwind CSS, Express, and virtual ANSI terminal emulator.</li>
            <li>Zero local file downloads required; live interactive execution right on the web.</li>
            <li>Complete administrative control center for tool creation, code editing, and telemetry.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
