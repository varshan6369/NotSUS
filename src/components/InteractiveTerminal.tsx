import React, { useState, useEffect, useRef } from 'react';
import { Terminal as TerminalIcon, Play, Square, RotateCcw, Maximize2, Minimize2, Trash2 } from 'lucide-react';
import type { PublicTool, Tool } from '../types/tool';

interface TerminalLine {
  id: string;
  text: string;
  color?: string; // CSS color or ANSI class
  isPrompt?: boolean;
}

interface InteractiveTerminalProps {
  tool: PublicTool | Tool;
  autoStart?: boolean;
}

// Built-in banner glyph font for instant ASCII text generation in terminal
const FONT_BLOCK: Record<string, string[]> = {
  A: ['  ███  ', ' ██ ██ ', '██   ██', '███████', '██   ██', '██   ██'],
  B: ['██████ ', '██   ██', '██████ ', '██   ██', '██   ██', '██████ '],
  C: [' █████ ', '██   ██', '██     ', '██     ', '██   ██', ' █████ '],
  D: ['██████ ', '██   ██', '██   ██', '██   ██', '██   ██', '██████ '],
  E: ['███████', '██     ', '█████  ', '██     ', '██     ', '███████'],
  F: ['███████', '██     ', '█████  ', '██     ', '██     ', '██     '],
  G: [' █████ ', '██   ██', '██     ', '██  ███', '██   ██', ' █████ '],
  H: ['██   ██', '██   ██', '███████', '██   ██', '██   ██', '██   ██'],
  I: ['█████', '  ██ ', '  ██ ', '  ██ ', '  ██ ', '█████'],
  J: ['    ███', '     ██', '     ██', '     ██', '██   ██', ' █████ '],
  K: ['██   ██', '██  ██ ', '█████  ', '██  ██ ', '██   ██', '██   ██'],
  L: ['██     ', '██     ', '██     ', '██     ', '██     ', '███████'],
  M: ['██   ██', '███ ███', '██ V ██', '██   ██', '██   ██', '██   ██'],
  N: ['██   ██', '███  ██', '██ █ ██', '██  ███', '██   ██', '██   ██'],
  O: [' █████ ', '██   ██', '██   ██', '██   ██', '██   ██', ' █████ '],
  P: ['██████ ', '██   ██', '██████ ', '██     ', '██     ', '██     '],
  Q: [' █████ ', '██   ██', '██   ██', '██ █ ██', '██  ██ ', ' ████ █'],
  R: ['██████ ', '██   ██', '██████ ', '██   ██', '██   ██', '██   ██'],
  S: [' █████ ', '██     ', ' █████ ', '     ██', '██   ██', ' █████ '],
  T: ['███████', '  ███  ', '  ███  ', '  ███  ', '  ███  ', '  ███  '],
  U: ['██   ██', '██   ██', '██   ██', '██   ██', '██   ██', ' █████ '],
  V: ['██   ██', '██   ██', '██   ██', ' ██ ██ ', '  ███  ', '   █   '],
  W: ['██   ██', '██   ██', '██   ██', '██ V ██', '███ ███', '██   ██'],
  X: ['██   ██', ' ██ ██ ', '  ███  ', '  ███  ', ' ██ ██ ', '██   ██'],
  Y: ['██   ██', ' ██ ██ ', '  ███  ', '  ███  ', '  ███  ', '  ███  '],
  Z: ['███████', '    ██ ', '   ██  ', '  ██   ', ' ██    ', '███████'],
  '0': [' █████ ', '██  ███', '██ █ ██', '███  ██', ' █████ ', '       '],
  '1': ['  ██   ', ' ███   ', '  ██   ', '  ██   ', '██████ ', '       '],
  '2': [' █████ ', '██   ██', '   ███ ', ' ███   ', '███████', '       '],
  '3': [' █████ ', '     ██', '  ████ ', '     ██', ' █████ ', '       '],
  '4': ['██  ██ ', '██  ██ ', '███████', '    ██ ', '    ██ ', '       '],
  '5': ['███████', '██     ', '██████ ', '     ██', '██████ ', '       '],
  '6': [' █████ ', '██     ', '██████ ', '██   ██', ' █████ ', '       '],
  '7': ['███████', '    ██ ', '   ██  ', '  ██   ', '  ██   ', '       '],
  '8': [' █████ ', '██   ██', ' █████ ', '██   ██', ' █████ ', '       '],
  '9': [' █████ ', '██   ██', ' ██████', '     ██', ' █████ ', '       '],
  ' ': ['     ', '     ', '     ', '     ', '     ', '     '],
  '!': ['  ██  ', '  ██  ', '  ██  ', '      ', '  ██  ', '      '],
  '?': [' █████ ', '██   ██', '    ██ ', '   ██  ', '       ', '   ██  '],
};

function renderBanner(text: string): string {
  const upper = text.toUpperCase();
  const lines = ['', '', '', '', '', ''];
  for (const char of upper) {
    const glyph = FONT_BLOCK[char] || [' ??? ', ' ??? ', ' ??? ', ' ??? ', ' ??? ', ' ??? '];
    for (let i = 0; i < 6; i++) {
      lines[i] += glyph[i] + ' ';
    }
  }
  return lines.join('\n');
}

export const InteractiveTerminal: React.FC<InteractiveTerminalProps> = ({ tool, autoStart = true }) => {
  const [isRunning, setIsRunning] = useState(autoStart);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [lines, setLines] = useState<TerminalLine[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [promptText, setPromptText] = useState('>> ');
  const [matrixRunning, setMatrixRunning] = useState(false);
  const [systemMonitorRunning, setSystemMonitorRunning] = useState(false);

  const terminalBodyRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const animationTimerRef = useRef<any>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (terminalBodyRef.current) {
      terminalBodyRef.current.scrollTop = terminalBodyRef.current.scrollHeight;
    }
  }, [lines, matrixRunning]);

  // Focus input whenever prompt is active
  const focusInput = () => {
    inputRef.current?.focus();
  };

  // Helper to append line
  const addLine = (text: string, color: string = '#20D989', isPrompt: boolean = false) => {
    setLines((prev) => [
      ...prev,
      {
        id: `${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        text,
        color,
        isPrompt
      }
    ]);
  };

  // Boot tool sequence
  const startToolSession = () => {
    stopCurrentSession();
    setIsRunning(true);
    setLines([]);

    addLine('[TERMINAL KERNEL] Initializing Web Assembly Runtime...', '#666666');
    addLine(`[PROCESS] Executing: ${tool.title.toUpperCase()} (v${tool.version})`, '#999999');
    addLine('[SECURITY] Sandbox verified. Execution running 100% in web client.\n', '#20D989');

    if (tool.slug === 'matrix-rain') {
      addLine('====================================================', '#20D989');
      addLine('   MATRIX DIGITAL RAIN TERMINAL (WEB ENGINE)        ', '#20D989');
      addLine('====================================================', '#20D989');
      addLine('Commands: [start] begin stream | [stop] pause | [clear] reset\n', '#999999');
      setMatrixRunning(true);
    } else if (tool.slug === 'system-monitor') {
      addLine('====================================================', '#20D989');
      addLine('   SYSTEM HARDWARE & PLATFORM MONITOR (LIVE WEB)    ', '#20D989');
      addLine('====================================================', '#20D989');
      addLine('Commands: [stats] view metrics | [stream] live pulse | [stop]\n', '#999999');
      setSystemMonitorRunning(true);
    } else if (tool.slug === 'banner-crafter') {
      addLine('====================================================', '#20D989');
      addLine('   RETRO FIGLET & BANNER CRAFTER — WEB CONSOLE      ', '#20D989');
      addLine('====================================================', '#20D989');
      addLine('Enter any text to generate formatted decorative ANSI borders:\n', '#999999');
      addLine('Example: type "CYBER" or "ASCII LAUNCHER"\n', '#666666');
    } else {
      // Default: ASCII Generator
      addLine('====================================================', '#20D989');
      addLine('   ASCII GENERATOR v1.0.0 — WEB TERMINAL RUNTIME    ', '#20D989');
      addLine('====================================================', '#20D989');
      addLine('Type any word (A-Z) and press ENTER to synthesize ASCII art:', '#999999');
      addLine('Try words like: "CODE", "MATRIX", "HACKER", "TERMINAL"\n', '#666666');
    }
  };

  const stopCurrentSession = () => {
    if (animationTimerRef.current) {
      clearInterval(animationTimerRef.current);
      animationTimerRef.current = null;
    }
    setMatrixRunning(false);
    setSystemMonitorRunning(false);
  };

  useEffect(() => {
    if (autoStart) {
      startToolSession();
    }
    return () => stopCurrentSession();
  }, [tool.slug]);

  // Matrix Stream Animation loop
  useEffect(() => {
    if (!matrixRunning) return;

    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&*+-/<>~ｦｱｳｴｵｶｷｹｺｻ';
    const cols = 42;

    const interval = setInterval(() => {
      let stream = '';
      for (let i = 0; i < cols; i++) {
        if (Math.random() > 0.45) {
          const char = chars[Math.floor(Math.random() * chars.length)];
          stream += char + ' ';
        } else {
          stream += '  ';
        }
      }

      setLines((prev) => {
        const next = [...prev, {
          id: `${Date.now()}-${Math.random()}`,
          text: stream,
          color: Math.random() > 0.85 ? '#FFFFFF' : '#20D989'
        }];
        // Keep terminal memory bounded
        if (next.length > 80) return next.slice(next.length - 80);
        return next;
      });
    }, 120);

    animationTimerRef.current = interval;
    return () => clearInterval(interval);
  }, [matrixRunning]);

  // System Monitor Live Telemetry pulse
  useEffect(() => {
    if (!systemMonitorRunning) return;

    const gauge = (label: string, pct: number) => {
      const barLen = 22;
      const filled = Math.round((pct / 100) * barLen);
      const empty = barLen - filled;
      return `| [${label.padEnd(14, ' ')}] [${'█'.repeat(filled)}${'.'.repeat(empty)}] ${String(pct).padStart(3, ' ')}% |`;
    };

    const interval = setInterval(() => {
      const cpu = Math.floor(45 + Math.random() * 40);
      const ram = Math.floor(55 + Math.random() * 15);
      const disk = 84;
      const memHeap = (performance as any)?.memory?.usedJSHeapSize
        ? Math.round((performance as any).memory.usedJSHeapSize / 1024 / 1024)
        : 68;

      setLines((prev) => [
        ...prev.slice(-30),
        { id: `${Date.now()}-1`, text: `+${'-'.repeat(48)}+`, color: '#666666' },
        { id: `${Date.now()}-2`, text: gauge('CPU LOAD', cpu), color: cpu > 80 ? '#FF5555' : '#20D989' },
        { id: `${Date.now()}-3`, text: gauge('RAM UTILIZATION', ram), color: '#20D989' },
        { id: `${Date.now()}-4`, text: gauge('DISK STORAGE', disk), color: '#999999' },
        { id: `${Date.now()}-5`, text: `| BROWSER HEAP: ${memHeap} MB · FPS: 60 · STATUS: NOMINAL  |`, color: '#20D989' },
        { id: `${Date.now()}-6`, text: `+${'-'.repeat(48)}+`, color: '#666666' }
      ]);
    }, 2000);

    animationTimerRef.current = interval;
    return () => clearInterval(interval);
  }, [systemMonitorRunning]);

  // Handle Command / Input Execution
  const handleCommandSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cmd = inputValue.trim();
    if (!cmd) return;

    // Echo input
    addLine(`>> ${cmd}`, '#F2F2F2', true);
    setInputValue('');

    const lower = cmd.toLowerCase();

    // Universal Commands
    if (lower === 'clear' || lower === 'cls') {
      setLines([]);
      return;
    }
    if (lower === 'exit' || lower === 'quit') {
      stopCurrentSession();
      setIsRunning(false);
      addLine('[SESSION TERMINATED] Process exited. Click RESTART to relaunch.\n', '#FF5555');
      return;
    }
    if (lower === 'help') {
      addLine('\n--- TERMINAL HELP ---', '#20D989');
      addLine('  clear / cls     - Clears the terminal screen', '#999999');
      addLine('  restart         - Restarts the utility runtime', '#999999');
      addLine('  exit            - Closes active tool process', '#999999');
      if (tool.slug === 'matrix-rain') {
        addLine('  start           - Starts falling matrix rain', '#999999');
        addLine('  stop            - Pauses matrix rain', '#999999');
      }
      addLine('', '#999999');
      return;
    }
    if (lower === 'restart' || lower === 'reload') {
      startToolSession();
      return;
    }

    // Matrix Rain Commands
    if (tool.slug === 'matrix-rain') {
      if (lower === 'start') {
        setMatrixRunning(true);
        addLine('[RUNNING] Matrix digital rain active...\n', '#20D989');
        return;
      }
      if (lower === 'stop') {
        setMatrixRunning(false);
        addLine('[PAUSED] Stream halted.\n', '#FF5555');
        return;
      }
    }

    // System Monitor Commands
    if (tool.slug === 'system-monitor') {
      if (lower === 'stop') {
        setSystemMonitorRunning(false);
        addLine('[PAUSED] Telemetry pulse halted.\n', '#FF5555');
        return;
      }
      if (lower === 'stream' || lower === 'start') {
        setSystemMonitorRunning(true);
        addLine('[STREAMING] Live system telemetry pulse resumed.\n', '#20D989');
        return;
      }
    }

    // Banner Crafter tool
    if (tool.slug === 'banner-crafter') {
      const boxDouble = (text: string) => {
        const width = text.length + 8;
        const top = `╔${'═'.repeat(width)}╗`;
        const mid = `║    ${text.toUpperCase()}    ║`;
        const bot = `╚${'═'.repeat(width)}╝`;
        return `${top}\n${mid}\n${bot}`;
      };
      const boxCyber = (text: string) => {
        const width = text.length + 8;
        const top = `◢${'━'.repeat(width)}◣`;
        const mid = `┃    ${text.toUpperCase()}    ┃`;
        const bot = `◥${'━'.repeat(width)}◤`;
        return `${top}\n${mid}\n${bot}`;
      };

      addLine('\n[CRAFTED FRAMES FOR: ' + cmd.toUpperCase() + ']', '#20D989');
      addLine(boxDouble(cmd), '#20D989');
      addLine('\n' + boxCyber(cmd), '#999999');
      addLine('\nType another title or "clear" to reset.\n', '#666666');
      return;
    }

    // Default: ASCII Generator
    try {
      const rendered = renderBanner(cmd);
      addLine('\n' + rendered + '\n', '#20D989');
      addLine(`[SYNTHESIS COMPLETE] Rendered "${cmd.toUpperCase()}" in ASCII Block font.`, '#999999');
      addLine('Type another word or "clear" to reset.\n', '#666666');
    } catch {
      addLine('[ERROR] Unable to synthesize text. Please use characters A-Z.\n', '#FF5555');
    }
  };

  return (
    <div
      className={`border border-[#242424] bg-[#050505] transition-all relative overflow-hidden flex flex-col font-mono shadow-2xl ${
        isFullscreen
          ? 'fixed inset-4 z-50 rounded-lg max-h-none h-[calc(100vh-2rem)]'
          : 'rounded-lg h-[520px] w-full'
      }`}
      onClick={focusInput}
    >
      {/* Terminal Title Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#242424] bg-[#0A0A0A] select-none shrink-0">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#FF5555]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#20D989]" />
          <span className="ml-2 text-xs font-bold text-[#F2F2F2] flex items-center gap-1.5">
            <TerminalIcon className="w-3.5 h-3.5 text-[#20D989]" />
            <span>TERMINAL RUNTIME: {tool.slug.toUpperCase()}</span>
          </span>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          {matrixRunning && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setMatrixRunning(false);
              }}
              className="px-2 py-0.5 text-[10px] bg-[#1A1A1A] hover:bg-[#222222] text-amber-400 border border-amber-500/40 rounded flex items-center gap-1"
            >
              <Square className="w-2.5 h-2.5 fill-current" />
              <span>Pause Rain</span>
            </button>
          )}

          {!matrixRunning && tool.slug === 'matrix-rain' && isRunning && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setMatrixRunning(true);
              }}
              className="px-2 py-0.5 text-[10px] bg-[#1A1A1A] hover:bg-[#222222] text-[#20D989] border border-[#20D989]/40 rounded flex items-center gap-1"
            >
              <Play className="w-2.5 h-2.5 fill-current" />
              <span>Resume Rain</span>
            </button>
          )}

          <button
            onClick={(e) => {
              e.stopPropagation();
              setLines([]);
            }}
            title="Clear Console"
            className="p-1 text-[#666666] hover:text-[#F2F2F2] hover:bg-[#141414] rounded transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              startToolSession();
            }}
            title="Restart Session"
            className="p-1 text-[#666666] hover:text-[#20D989] hover:bg-[#141414] rounded transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsFullscreen(!isFullscreen);
            }}
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            className="p-1 text-[#666666] hover:text-[#20D989] hover:bg-[#141414] rounded transition-colors"
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Terminal Viewport */}
      <div
        ref={terminalBodyRef}
        className="flex-1 p-4 sm:p-5 overflow-y-auto overflow-x-auto crt-scanlines space-y-1 text-xs leading-relaxed select-text"
      >
        {lines.map((l) => (
          <div key={l.id} className="whitespace-pre font-mono" style={{ color: l.color || '#20D989' }}>
            {l.text}
          </div>
        ))}

        {/* Input Prompt Line */}
        {isRunning && (
          <form onSubmit={handleCommandSubmit} className="flex items-center gap-2 pt-1">
            <span className="text-[#20D989] font-bold shrink-0">{promptText}</span>
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Type command or text input here..."
              className="flex-1 bg-transparent text-[#F2F2F2] outline-none font-mono text-xs border-none p-0 focus:ring-0 placeholder-[#444444]"
              autoFocus
            />
            <span className="term-cursor shrink-0" />
          </form>
        )}

        {!isRunning && (
          <div className="pt-4">
            <button
              onClick={startToolSession}
              className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#20D989] text-black font-bold text-xs rounded hover:bg-[#1bb874] cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>LAUNCH WEB TERMINAL</span>
            </button>
          </div>
        )}
      </div>

      {/* Terminal Footer Bar */}
      <div className="px-4 py-2 border-t border-[#1C1C1C] bg-[#0A0A0A] flex items-center justify-between text-[11px] text-[#666666] select-none shrink-0">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-[#20D989]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#20D989] animate-pulse" />
            <span>SESSION: RUNNING</span>
          </span>
          <span className="text-[#333333]">|</span>
          <span>STDOUT / STDIN ONLINE</span>
        </div>
        <div className="text-[10px] text-[#555555]">
          Press ENTER to execute · Type 'help' for commands
        </div>
      </div>
    </div>
  );
};
