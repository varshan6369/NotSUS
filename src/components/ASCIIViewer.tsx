import React, { useState } from 'react';
import { Copy, Check, Maximize2, Minimize2 } from 'lucide-react';
import { useToast } from './Toast';

interface ASCIIViewerProps {
  art: string;
  title?: string;
  color?: string; // default green
  maxHeight?: string;
  showControls?: boolean;
}

export const ASCIIViewer: React.FC<ASCIIViewerProps> = ({
  art,
  color = '#20D989',
  maxHeight = 'max-h-[500px]',
  showControls = true
}) => {
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const { showToast } = useToast();

  const handleCopy = () => {
    navigator.clipboard.writeText(art);
    setCopied(true);
    showToast('ASCII ART COPIED TO CLIPBOARD', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={`w-full border border-[#242424] bg-[#080808] transition-all relative overflow-hidden group ${
        expanded ? 'fixed inset-4 z-50 max-h-none flex flex-col' : 'rounded-lg'
      }`}
    >
      {/* Terminal Title Bar matching mockup */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#242424] bg-[#0A0A0A] select-none">
        {/* macOS / Terminal 3 dots */}
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#FF5F56] opacity-80" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E] opacity-80" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#27C93F] opacity-80" />
        </div>

        {/* Right Preview indicator & controls */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 font-mono text-xs text-[#20D989]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#20D989] animate-pulse" />
            <span>Preview</span>
          </div>

          {showControls && (
            <div className="flex items-center gap-1 ml-2 pl-2 border-l border-[#242424]">
              <button
                onClick={handleCopy}
                title="Copy ASCII Art"
                className="p-1 text-[#666666] hover:text-[#20D989] transition-colors rounded hover:bg-[#141414]"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-[#20D989]" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={() => setExpanded(!expanded)}
                title={expanded ? 'Minimize' : 'Maximize'}
                className="p-1 text-[#666666] hover:text-[#20D989] transition-colors rounded hover:bg-[#141414]"
              >
                {expanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ASCII Art Canvas Viewport */}
      <div
        className={`p-4 sm:p-6 overflow-x-auto overflow-y-auto crt-scanlines ${
          expanded ? 'flex-1' : maxHeight
        }`}
      >
        <pre
          className="ascii-canvas text-xs sm:text-[13px] leading-[1.12] tracking-tighter select-all"
          style={{ color: color || '#20D989' }}
        >
          {art || '( No ASCII preview available )'}
        </pre>
      </div>
    </div>
  );
};
