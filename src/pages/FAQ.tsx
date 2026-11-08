import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp, Terminal, Shield, AlertTriangle } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

const FAQ_DATA: FAQItem[] = [
  {
    category: 'EXECUTION',
    question: 'How do the utilities run directly in the web browser?',
    answer:
      'ASCII Launcher embeds a custom virtual terminal emulator with real-time ANSI rendering, keyboard command handling, and in-memory execution. You can type input, configure options, and generate ASCII banners instantly with zero latency.'
  },
  {
    category: 'DOWNLOADS',
    question: 'Can I download the raw files to my computer?',
    answer:
      'No. The utilities are designed to execute strictly in-memory inside the web application sandbox. No files, binaries, or archives are stored on your disk.'
  },
  {
    category: 'REQUIREMENTS',
    question: 'Do I need Python or extra software installed?',
    answer:
      'No external software is required. The web terminal provides full standalone execution right inside your browser on any modern device (Windows, Mac, Linux, or mobile).'
  },
  {
    category: 'SECURITY',
    question: 'Is in-browser execution safe?',
    answer:
      'Yes. Because code execution happens entirely within the browser memory and client environment, your local operating system files and network remain completely untouched.'
  },
  {
    category: 'FEATURES',
    question: 'What commands are supported in the terminal?',
    answer:
      'Each utility supports interactive prompts. You can type words to generate ASCII banners, or use universal commands such as "help", "clear" (to clear the screen), and "restart" (to reboot the session).'
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
