import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp, Terminal, Shield, AlertTriangle } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

const FAQ_DATA: FAQItem[] = [
  {
    category: 'INSTALLATION',
    question: 'How do I install and run the tools as a .ZIP package on my PC?',
    answer:
      'Click the "Install & Run (.zip)" button on any utility page to download the launcher package. Extract the downloaded .zip file into a folder on your computer, then double-click "run.bat". It automatically opens Windows Command Prompt and runs the ASCII utility locally on your computer.'
  },
  {
    category: 'BACKUP OPTION',
    question: 'What is the Backup Run option?',
    answer:
      'Each utility can have an independent secondary backup launcher (run_backup.bat) and fallback script (code_backup.py). When the administrator enables the backup option, a dedicated "Run Backup Package (.zip)" button appears on the tool page, allowing users to download or run the redundant fallback edition.'
  },
  {
    category: 'PC EXECUTION',
    question: 'Why does the tool run in Command Prompt on my computer instead of silently in the background?',
    answer:
      'The sole purpose of the launcher is to execute utilities directly on your PC inside your own terminal (Windows Command Prompt, PowerShell, or bash). Double-clicking run.bat gives you a dedicated console window with full interactive support, color rendering, and hotkeys.'
  },
  {
    category: 'WEB TERMINAL',
    question: 'Can I also test tools directly in the browser?',
    answer:
      'Yes! You can switch to the "WEB TERMINAL TESTER" tab on any tool page to test and interact with the utility immediately in-browser without having to unzip files first.'
  },
  {
    category: '1-LINE COMMAND',
    question: 'Can I run tools in my terminal without downloading a .ZIP?',
    answer:
      'Yes. Copy the 1-line command displayed on the tool page (e.g. "curl -sL <url>/api/tools/<slug>/raw/script | python") and paste it into Command Prompt or PowerShell to stream and execute it directly in memory.'
  }
];

export const FAQ: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-10">
      <div className="space-y-3">
        <div className="flex items-center gap-2 font-mono text-xs text-[#20D989] tracking-wider uppercase">
          <span>&gt; DOCUMENTATION &amp; FAQ</span>
        </div>
        <h1 className="font-mono text-3xl sm:text-4xl font-bold text-[#F2F2F2] tracking-tight">
          Frequently Asked Questions<span className="text-[#20D989]">_</span>
        </h1>
        <p className="font-mono text-sm text-[#999999]">
          Clear explanations regarding local terminal execution, security model, and package extraction.
        </p>
      </div>

      <div className="space-y-4">
        {FAQ_DATA.map((item, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div
              key={idx}
              className="border border-[#242424] bg-[#0A0A0A] rounded-lg overflow-hidden transition-colors"
            >
              <button
                onClick={() => setOpenIndex(isOpen ? null : idx)}
                className="w-full text-left px-5 py-4 flex items-center justify-between font-mono text-sm font-semibold text-[#F2F2F2] hover:text-[#20D989] transition-colors"
              >
                <span className="flex items-center gap-3">
                  <span className="text-xs text-[#20D989] font-normal">[{item.category}]</span>
                  <span>{item.question}</span>
                </span>
                {isOpen ? (
                  <ChevronUp className="w-4 h-4 text-[#20D989] shrink-0" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-[#666666] shrink-0" />
                )}
              </button>

              {isOpen && (
                <div className="px-5 pb-5 pt-1 text-xs font-mono text-[#999999] leading-relaxed border-t border-[#181818]">
                  <p>{item.answer}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
