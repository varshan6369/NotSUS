import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Upload,
  Image as ImageIcon,
  Type,
  Download,
  Copy,
  Check,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  Sliders,
  RotateCcw,
  Sparkles,
  Layers,
  FileText,
  Code,
  Share2,
  Eye,
  Columns,
  RefreshCw,
  Terminal,
  Zap,
  Palette
} from 'lucide-react';
import {
  convertImageToAscii,
  CHARACTER_RAMPS,
  SAMPLE_ARTWORKS,
  renderFigletBanner,
  generatePythonScript,
  type AsciiOptions,
  type AsciiResult,
  type ColorTheme,
  type DitherMode
} from '../utils/asciiEngine';
import { useToast } from '../components/Toast';

export const AsciiStudio: React.FC = () => {
  const { showToast } = useToast();

  // Active studio mode: image conversion vs text banner generator
  const [studioMode, setStudioMode] = useState<'image' | 'text'>('image');

  // Image Conversion State
  const [selectedImage, setSelectedImage] = useState<string>(SAMPLE_ARTWORKS[0].url);
  const [loadedImgElement, setLoadedImgElement] = useState<HTMLImageElement | null>(null);
  const [customRamp, setCustomRamp] = useState<string>('');
  const [selectedRampId, setSelectedRampId] = useState<string>('standard');
  const [copied, setCopied] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // Conversion Options
  const [options, setOptions] = useState<AsciiOptions>({
    columns: 90,
    charRamp: CHARACTER_RAMPS[0].chars,
    contrast: 15,
    brightness: 0,
    invert: false,
    aspectRatio: 0.55,
    dither: 'none',
    colorTheme: 'green'
  });

  // Canvas Display & Post-Processing State
  const [zoom, setZoom] = useState<number>(1);
  const [showScanlines, setShowScanlines] = useState<boolean>(true);
  const [showBloom, setShowBloom] = useState<boolean>(true);
  const [showGlitch, setShowGlitch] = useState<boolean>(false);
  const [compareMode, setCompareMode] = useState<boolean>(false);
  const [comparePosition, setComparePosition] = useState<number>(50); // percentage 0-100
  const [asciiResult, setAsciiResult] = useState<AsciiResult | null>(null);

  // Text Banner State
  const [bannerText, setBannerText] = useState<string>('ASCII MAGIC');
  const [bannerFont, setBannerFont] = useState<string>('block');
  const [bannerTheme, setBannerTheme] = useState<ColorTheme>('green');

  // Canvas references for image loading and export
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);

  // Load image whenever selectedImage changes
  useEffect(() => {
    setIsProcessing(true);
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      setLoadedImgElement(img);
      setIsProcessing(false);
    };
    img.onerror = () => {
      setIsProcessing(false);
      showToast('FAILED TO LOAD SAMPLE IMAGE', 'error');
    };
    img.src = selectedImage;
  }, [selectedImage]);

  // Re-run conversion when image or options change
  useEffect(() => {
    if (!loadedImgElement) return;
    const res = convertImageToAscii(loadedImgElement, options);
    setAsciiResult(res);
  }, [loadedImgElement, options]);

  // Handle character ramp selection
  const handleSelectRamp = (rampId: string) => {
    setSelectedRampId(rampId);
    if (rampId === 'custom') {
      setOptions((prev) => ({ ...prev, charRamp: customRamp || ' .:-=+*#%@' }));
    } else {
      const found = CHARACTER_RAMPS.find((r) => r.id === rampId);
      if (found) {
        setOptions((prev) => ({ ...prev, charRamp: found.chars }));
      }
    }
  };

  // Handle image upload from file system
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setSelectedImage(result);
      showToast(`IMAGE LOADED: ${file.name.toUpperCase()}`, 'success');
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Drag and drop handler
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setSelectedImage(result);
        showToast('CUSTOM IMAGE LOADED VIA DROPZONE', 'success');
      };
      reader.readAsDataURL(file);
    }
  };

  // Copy Plaintext to Clipboard
  const handleCopyText = async () => {
    const textToCopy = studioMode === 'image'
      ? (asciiResult?.text || '')
      : renderFigletBanner(bannerText, bannerFont);

    if (!textToCopy) return;

    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      showToast('ASCII ART COPIED TO CLIPBOARD', 'success');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      showToast('FAILED TO COPY TEXT', 'error');
    }
  };

  // Download Plaintext .TXT file
  const handleDownloadTxt = () => {
    const textContent = studioMode === 'image'
      ? (asciiResult?.text || '')
      : renderFigletBanner(bannerText, bannerFont);

    if (!textContent) return;

    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ascii-magic-${Date.now()}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast('DOWNLOADED .TXT FILE', 'success');
  };

  // Download High-Resolution Graphic PNG render of the ASCII art
  const handleExportPng = () => {
    if (!asciiResult && studioMode === 'image') return;

    const lines = studioMode === 'image'
      ? (asciiResult?.lines || [])
      : renderFigletBanner(bannerText, bannerFont).split('\n');

    if (lines.length === 0) return;

    const charWidth = 9;
    const lineHeight = 14;
    const padding = 30;
    const maxLineLength = Math.max(...lines.map((l) => l.length));

    const canvas = document.createElement('canvas');
    canvas.width = maxLineLength * charWidth + padding * 2;
    canvas.height = lines.length * lineHeight + padding * 2;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Background fill
    ctx.fillStyle = '#050505';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.font = '12px "JetBrains Mono", monospace';
    ctx.textBaseline = 'top';

    const themeColor = options.colorTheme === 'amber'
      ? '#FFBD2E'
      : options.colorTheme === 'cyber'
      ? '#00E5FF'
      : options.colorTheme === 'mono'
      ? '#F2F2F2'
      : '#20D989';

    if (options.colorTheme === 'truecolor' && asciiResult?.grid) {
      // Truecolor export
      for (let y = 0; y < asciiResult.grid.length; y++) {
        const row = asciiResult.grid[y];
        for (let x = 0; x < row.length; x++) {
          const cell = row[x];
          ctx.fillStyle = `rgb(${cell.r}, ${cell.g}, ${cell.b})`;
          ctx.fillText(cell.char, padding + x * charWidth, padding + y * lineHeight);
        }
      }
    } else {
      ctx.fillStyle = themeColor;
      for (let y = 0; y < lines.length; y++) {
        ctx.fillText(lines[y], padding, padding + y * lineHeight);
      }
    }

    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `ascii-magic-render-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('HIGH-RES PNG EXPORTED', 'success');
  };

  // Export HTML with styled monospace elements
  const handleExportHtml = () => {
    let bodyContent = '';
    const theme = options.colorTheme;

    if (theme === 'truecolor' && asciiResult?.grid) {
      bodyContent = asciiResult.grid
        .map((row) =>
          row
            .map((c) => `<span style="color:rgb(${c.r},${c.g},${c.b})">${c.char === ' ' ? '&nbsp;' : c.char}</span>`)
            .join('')
        )
        .join('<br>\n');
    } else {
      const lines = studioMode === 'image'
        ? (asciiResult?.lines || [])
        : renderFigletBanner(bannerText, bannerFont).split('\n');
      bodyContent = lines.map((l) => l.replace(/ /g, '&nbsp;')).join('<br>\n');
    }

    const htmlString = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>ASCII Magic Export</title>
  <style>
    body {
      background-color: #050505;
      color: ${theme === 'amber' ? '#FFBD2E' : theme === 'cyber' ? '#00E5FF' : '#20D989'};
      font-family: 'JetBrains Mono', monospace;
      font-size: 11px;
      line-height: 1.05;
      padding: 30px;
      margin: 0;
      white-space: pre;
    }
  </style>
</head>
<body>
${bodyContent}
</body>
</html>`;

    const blob = new Blob([htmlString], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ascii-magic-${Date.now()}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast('EXPORTED STANDALONE HTML FILE', 'success');
  };

  // Copy Recipe Configuration string (JSON)
  const handleCopyRecipe = async () => {
    const recipe = {
      app: 'ascii-magic',
      version: '2.0.0',
      timestamp: new Date().toISOString(),
      mode: studioMode,
      options: options,
      rampId: selectedRampId,
      banner: { text: bannerText, font: bannerFont }
    };
    try {
      await navigator.clipboard.writeText(JSON.stringify(recipe, null, 2));
      showToast('STYLE RECIPE JSON COPIED TO CLIPBOARD', 'success');
    } catch {
      showToast('FAILED TO COPY RECIPE', 'error');
    }
  };

  // Export as executable Python Script (.py)
  const handleExportPython = () => {
    const textContent = studioMode === 'image'
      ? (asciiResult?.text || '')
      : renderFigletBanner(bannerText, bannerFont);

    if (!textContent) return;

    const title = studioMode === 'image'
      ? 'ASCII Magic Artwork'
      : `Banner: ${bannerText}`;

    const pyScript = generatePythonScript(
      textContent,
      title,
      options.colorTheme,
      studioMode === 'image' ? asciiResult?.grid : undefined
    );

    const blob = new Blob([pyScript], { type: 'text/x-python;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ascii_art_${Date.now()}.py`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast('EXPORTED RUNNABLE PYTHON SCRIPT (.PY) — RUN "python <file>.py"', 'success');
  };

  // Copy Python Code directly to clipboard
  const handleCopyPython = async () => {
    const textContent = studioMode === 'image'
      ? (asciiResult?.text || '')
      : renderFigletBanner(bannerText, bannerFont);

    if (!textContent) return;

    const title = studioMode === 'image'
      ? 'ASCII Magic Artwork'
      : `Banner: ${bannerText}`;

    const pyScript = generatePythonScript(
      textContent,
      title,
      options.colorTheme,
      studioMode === 'image' ? asciiResult?.grid : undefined
    );

    try {
      await navigator.clipboard.writeText(pyScript);
      showToast('RUNNABLE PYTHON SCRIPT COPIED TO CLIPBOARD', 'success');
    } catch {
      showToast('FAILED TO COPY PYTHON SCRIPT', 'error');
    }
  };

  // Dynamic Theme Colors
  const getThemeColorClass = () => {
    if (options.colorTheme === 'amber') return 'text-[#FFBD2E] glow-amber';
    if (options.colorTheme === 'cyber') return 'text-[#00E5FF] glow-cyber';
    if (options.colorTheme === 'matrix') return 'text-[#00FF66] glow-green';
    if (options.colorTheme === 'mono') return 'text-[#F2F2F2]';
    return 'text-[#20D989] glow-green';
  };

  return (
    <div className="min-h-screen bg-[#050505] text-[#F2F2F2] flex flex-col font-mono select-none">
      {/* STUDIO TOP CONTROL BAR */}
      <div className="h-14 border-b border-[#242424] bg-[#0A0A0A]/95 backdrop-blur-md px-4 flex items-center justify-between shrink-0 z-30">
        {/* Left: Mode Switcher */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 p-1 bg-[#121212] border border-[#242424] rounded-lg">
            <button
              onClick={() => setStudioMode('image')}
              className={`flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded transition-all ${
                studioMode === 'image'
                  ? 'bg-[#20D989] text-black shadow-[0_0_12px_rgba(32,217,137,0.3)]'
                  : 'text-[#888888] hover:text-[#FFFFFF]'
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span>Image to ASCII</span>
            </button>

            <button
              onClick={() => setStudioMode('text')}
              className={`flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded transition-all ${
                studioMode === 'text'
                  ? 'bg-[#20D989] text-black shadow-[0_0_12px_rgba(32,217,137,0.3)]'
                  : 'text-[#888888] hover:text-[#FFFFFF]'
              }`}
            >
              <Type className="w-3.5 h-3.5" />
              <span>Text FIGlet Studio</span>
            </button>
          </div>
        </div>

        {/* Center: Canvas Controls (Zoom, Compare, Scanlines, Bloom) */}
        <div className="hidden lg:flex items-center gap-2">
          {/* Zoom controls */}
          <div className="flex items-center gap-1 bg-[#121212] border border-[#242424] rounded px-1.5 py-0.5 text-xs text-[#888888]">
            <button
              onClick={() => setZoom((z) => Math.max(0.5, +(z - 0.25).toFixed(2)))}
              className="p-1 hover:text-[#20D989] transition-colors"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span
              onClick={() => setZoom(1)}
              className="px-2 py-0.5 cursor-pointer hover:text-white"
              title="Reset Zoom"
            >
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={() => setZoom((z) => Math.min(2.5, +(z + 0.25).toFixed(2)))}
              className="p-1 hover:text-[#20D989] transition-colors"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Compare Slider Toggle (Image mode) */}
          {studioMode === 'image' && (
            <button
              onClick={() => setCompareMode(!compareMode)}
              className={`flex items-center gap-1.5 px-2.5 py-1 text-xs border rounded transition-colors ${
                compareMode
                  ? 'bg-[#20D989]/20 border-[#20D989] text-[#20D989]'
                  : 'bg-[#121212] border-[#242424] text-[#888888] hover:text-[#F2F2F2]'
              }`}
            >
              <Columns className="w-3.5 h-3.5" />
              <span>Compare Split</span>
            </button>
          )}

          {/* CRT Scanline Toggle */}
          <button
            onClick={() => setShowScanlines(!showScanlines)}
            className={`flex items-center gap-1.5 px-2.5 py-1 text-xs border rounded transition-colors ${
              showScanlines
                ? 'bg-[#20D989]/20 border-[#20D989] text-[#20D989]'
                : 'bg-[#121212] border-[#242424] text-[#888888] hover:text-[#F2F2F2]'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>CRT Scanlines</span>
          </button>

          {/* Phosphor Bloom Toggle */}
          <button
            onClick={() => setShowBloom(!showBloom)}
            className={`flex items-center gap-1.5 px-2.5 py-1 text-xs border rounded transition-colors ${
              showBloom
                ? 'bg-[#20D989]/20 border-[#20D989] text-[#20D989]'
                : 'bg-[#121212] border-[#242424] text-[#888888] hover:text-[#F2F2F2]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Phosphor Bloom</span>
          </button>
        </div>

        {/* Right: Export & Copy Suite */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyText}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#20D989] hover:bg-[#1bb874] text-black text-xs font-bold rounded shadow-[0_0_12px_rgba(32,217,137,0.3)] transition-all cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'COPIED!' : 'COPY TEXT'}</span>
          </button>

          {/* Export as Runnable Python .PY button */}
          <button
            onClick={handleExportPython}
            title="Export Runnable Python Script (.py) — When run, prints the art in your PC terminal!"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0D1A12] hover:bg-[#142A1D] border border-[#20D989] text-[#20D989] text-xs font-bold rounded shadow-[0_0_10px_rgba(32,217,137,0.2)] transition-all cursor-pointer"
          >
            <Terminal className="w-3.5 h-3.5 text-[#20D989]" />
            <span>EXPORT .PY</span>
          </button>

          {/* Export Dropdown Options */}
          <div className="flex items-center gap-1">
            <button
              onClick={handleDownloadTxt}
              title="Download .TXT"
              className="p-1.5 bg-[#121212] hover:bg-[#1A1A1A] border border-[#242424] hover:border-[#666666] text-[#CCCCCC] rounded transition-colors"
            >
              <FileText className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={handleExportPng}
              title="Export High-Res PNG Image"
              className="p-1.5 bg-[#121212] hover:bg-[#1A1A1A] border border-[#242424] hover:border-[#666666] text-[#CCCCCC] rounded transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={handleExportHtml}
              title="Export HTML"
              className="p-1.5 bg-[#121212] hover:bg-[#1A1A1A] border border-[#242424] hover:border-[#666666] text-[#CCCCCC] rounded transition-colors"
            >
              <Code className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={handleCopyRecipe}
              title="Copy Style Recipe JSON"
              className="p-1.5 bg-[#121212] hover:bg-[#1A1A1A] border border-[#242424] hover:border-[#666666] text-[#CCCCCC] rounded transition-colors"
            >
              <Share2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* MAIN WORKSPACE: 3-COLUMN STUDIO LAYOUT */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
        {/* LEFT RAIL: PRESETS, UPLOAD & STYLES (col-span-3) */}
        <div className="lg:col-span-3 border-r border-[#242424] bg-[#080808] p-4 overflow-y-auto space-y-6">
          {studioMode === 'image' ? (
            <>
              {/* Dropzone & Upload */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-[#F2F2F2] flex items-center gap-1.5">
                  <Upload className="w-3.5 h-3.5 text-[#20D989]" />
                  <span>UPLOAD SOURCE IMAGE</span>
                </span>

                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className="border border-dashed border-[#20D989]/40 hover:border-[#20D989] bg-[#0B0F0C] rounded-lg p-5 text-center cursor-pointer transition-all cyber-box-glow group"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <Upload className="w-6 h-6 text-[#20D989] mx-auto mb-2 group-hover:scale-110 transition-transform" />
                  <p className="text-xs font-semibold text-[#F2F2F2]">
                    Drop an image here or click to browse
                  </p>
                  <p className="text-[10px] text-[#666666] mt-1">
                    Supports PNG, JPG, WEBP, GIF · 100% Client-side
                  </p>
                </div>
              </div>

              {/* Sample Artworks */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-[#999999] uppercase tracking-wider block">
                  Built-in Sample Artworks
                </span>
                <div className="grid grid-cols-3 gap-2">
                  {SAMPLE_ARTWORKS.map((sample) => (
                    <button
                      key={sample.id}
                      onClick={() => setSelectedImage(sample.url)}
                      className={`relative rounded border overflow-hidden transition-all group ${
                        selectedImage === sample.url
                          ? 'border-[#20D989] shadow-[0_0_8px_rgba(32,217,137,0.4)] ring-1 ring-[#20D989]'
                          : 'border-[#242424] opacity-70 hover:opacity-100 hover:border-[#555555]'
                      }`}
                    >
                      <img
                        src={sample.url}
                        alt={sample.title}
                        className="w-full h-14 object-cover group-hover:scale-105 transition-transform"
                      />
                      <span className="absolute bottom-0 inset-x-0 bg-black/80 text-[9px] text-[#F2F2F2] py-0.5 px-1 truncate text-center">
                        {sample.title}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Character Ramps Selection */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-[#999999] uppercase tracking-wider block">
                  Character Ramps (Charsets)
                </span>

                <div className="space-y-1.5">
                  {CHARACTER_RAMPS.map((ramp) => (
                    <button
                      key={ramp.id}
                      onClick={() => handleSelectRamp(ramp.id)}
                      className={`w-full text-left p-2 rounded border transition-colors flex items-center justify-between text-xs ${
                        selectedRampId === ramp.id
                          ? 'bg-[#0E1511] border-[#20D989] text-[#20D989]'
                          : 'bg-[#0D0D0D] border-[#202020] text-[#888888] hover:text-[#FFFFFF] hover:border-[#333333]'
                      }`}
                    >
                      <div className="truncate mr-2">
                        <div className="font-semibold text-xs">{ramp.name}</div>
                        <div className="text-[10px] text-[#666666] truncate">{ramp.chars}</div>
                      </div>
                      <span className="text-[10px] text-[#555555] shrink-0 font-mono">
                        {ramp.chars.length} chars
                      </span>
                    </button>
                  ))}

                  {/* Custom Ramp Input */}
                  <div className="p-2 border border-[#242424] bg-[#0A0A0A] rounded space-y-1">
                    <span className="text-[11px] text-[#AAAAAA] block font-semibold">
                      Custom Character Ramp:
                    </span>
                    <input
                      type="text"
                      placeholder="e.g. .:-=+*#%@"
                      value={customRamp}
                      onChange={(e) => {
                        setCustomRamp(e.target.value);
                        setSelectedRampId('custom');
                        setOptions((prev) => ({ ...prev, charRamp: e.target.value || ' ' }));
                      }}
                      className="w-full bg-[#050505] border border-[#242424] focus:border-[#20D989] rounded px-2 py-1 text-xs text-[#20D989] outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Color Themes */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-[#999999] uppercase tracking-wider block">
                  Color Modes
                </span>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {[
                    { id: 'green', label: 'Phosphor Green', color: '#20D989' },
                    { id: 'amber', label: 'Amber Gold', color: '#FFBD2E' },
                    { id: 'cyber', label: 'Cyber Neon', color: '#00E5FF' },
                    { id: 'truecolor', label: 'True Color (RGB)', color: 'linear-gradient(45deg,#ff007f,#00e5ff)' },
                    { id: 'matrix', label: 'Matrix Dark', color: '#00FF66' },
                    { id: 'mono', label: 'Monochrome', color: '#FFFFFF' }
                  ].map((theme) => (
                    <button
                      key={theme.id}
                      onClick={() => setOptions((o) => ({ ...o, colorTheme: theme.id as ColorTheme }))}
                      className={`flex items-center gap-2 p-2 rounded border transition-colors ${
                        options.colorTheme === theme.id
                          ? 'bg-[#141414] border-[#20D989] text-[#F2F2F2]'
                          : 'bg-[#0D0D0D] border-[#202020] text-[#777777] hover:text-[#FFFFFF]'
                      }`}
                    >
                      <span
                        className="w-3 h-3 rounded-full shrink-0"
                        style={{ background: theme.color }}
                      />
                      <span className="truncate text-[11px]">{theme.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </>
          ) : (
            /* TEXT BANNER GENERATOR CONTROLS */
            <div className="space-y-4">
              <div className="space-y-1.5">
                <span className="text-xs font-bold text-[#F2F2F2]">BANNER TEXT PROMPT</span>
                <input
                  type="text"
                  value={bannerText}
                  onChange={(e) => setBannerText(e.target.value)}
                  placeholder="TYPE TEXT..."
                  className="w-full bg-[#050505] border border-[#242424] focus:border-[#20D989] rounded p-2.5 text-xs text-[#20D989] uppercase tracking-wider outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <span className="text-xs font-bold text-[#999999] uppercase">BANNER FONT</span>
                <div className="space-y-1">
                  {['block', 'slant'].map((f) => (
                    <button
                      key={f}
                      onClick={() => setBannerFont(f)}
                      className={`w-full text-left px-3 py-2 text-xs rounded border uppercase font-bold transition-colors ${
                        bannerFont === f
                          ? 'bg-[#0E1511] border-[#20D989] text-[#20D989]'
                          : 'bg-[#0D0D0D] border-[#202020] text-[#888888] hover:text-[#FFFFFF]'
                      }`}
                    >
                      {f.toUpperCase()} FONT STYLE
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <span className="text-xs font-bold text-[#999999] uppercase">BANNER COLOR</span>
                <div className="grid grid-cols-2 gap-2">
                  {(['green', 'amber', 'cyber', 'mono'] as ColorTheme[]).map((theme) => (
                    <button
                      key={theme}
                      onClick={() => setBannerTheme(theme)}
                      className={`p-2 text-xs rounded border uppercase font-medium ${
                        bannerTheme === theme
                          ? 'border-[#20D989] text-[#20D989] bg-[#101010]'
                          : 'border-[#242424] text-[#777777] bg-[#0A0A0A]'
                      }`}
                    >
                      {theme}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* CENTER INTERACTIVE CANVAS VIEWPORT (col-span-6) */}
        <div
          ref={canvasContainerRef}
          className="lg:col-span-6 bg-[#030303] flex flex-col justify-between overflow-hidden relative"
        >
          {/* Main Visual Viewport */}
          <div
            className={`flex-1 overflow-auto p-6 flex items-center justify-center relative ${
              showScanlines ? 'crt-scanlines' : ''
            } ${showBloom ? 'crt-beam-overlay' : ''}`}
          >
            {studioMode === 'image' ? (
              asciiResult ? (
                <div
                  className="relative transition-transform duration-100 ease-out select-text"
                  style={{ transform: `scale(${zoom})`, transformOrigin: 'center center' }}
                >
                  {/* Compare Mode: Split View slider */}
                  {compareMode && loadedImgElement ? (
                    <div className="relative overflow-hidden border border-[#242424] rounded shadow-2xl">
                      {/* Underlying Source Image */}
                      <img
                        src={selectedImage}
                        alt="Original source"
                        className="block max-w-full max-h-[580px] object-contain opacity-90"
                      />

                      {/* Overlaid ASCII Canvas with clip-path based on slider */}
                      <div
                        className="absolute inset-0 overflow-hidden bg-black/90 pointer-events-none"
                        style={{ clipPath: `inset(0 0 0 ${comparePosition}%)` }}
                      >
                        <pre
                          className={`ascii-canvas text-[9px] leading-[1.0] ${getThemeColorClass()} p-2`}
                        >
                          {asciiResult.text}
                        </pre>
                      </div>

                      {/* Interactive Drag Handle line */}
                      <div
                        className="absolute top-0 bottom-0 w-0.5 bg-[#20D989] shadow-[0_0_10px_#20D989] pointer-events-none"
                        style={{ left: `${comparePosition}%` }}
                      />
                    </div>
                  ) : options.colorTheme === 'truecolor' && asciiResult.grid ? (
                    /* True-Color Rendering: Spans with individual character colors */
                    <div className="font-mono text-[9px] leading-[1.05] whitespace-pre select-text p-4">
                      {asciiResult.grid.map((row, y) => (
                        <div key={y} className="flex leading-none">
                          {row.map((cell, x) => (
                            <span
                              key={x}
                              style={{ color: `rgb(${cell.r}, ${cell.g}, ${cell.b})` }}
                            >
                              {cell.char}
                            </span>
                          ))}
                        </div>
                      ))}
                    </div>
                  ) : (
                    /* High-Performance Monochrome / Phosphor Preformatted Canvas */
                    <pre
                      className={`ascii-canvas text-[9px] sm:text-[10px] leading-[1.05] select-text p-4 ${getThemeColorClass()}`}
                    >
                      {asciiResult.text}
                    </pre>
                  )}
                </div>
              ) : (
                <div className="text-center font-mono text-xs text-[#666666] animate-pulse">
                  PROCESSING IMAGE THROUGH ASCII MAGIC ENGINE...
                </div>
              )
            ) : (
              /* Text FIGlet Banner Viewport */
              <div
                className="select-text text-center transition-transform"
                style={{ transform: `scale(${zoom})` }}
              >
                <pre
                  className={`ascii-canvas text-xs sm:text-sm md:text-base leading-tight select-text ${
                    bannerTheme === 'amber'
                      ? 'text-[#FFBD2E] glow-amber'
                      : bannerTheme === 'cyber'
                      ? 'text-[#00E5FF] glow-cyber'
                      : bannerTheme === 'mono'
                      ? 'text-[#F2F2F2]'
                      : 'text-[#20D989] glow-green'
                  }`}
                >
                  {renderFigletBanner(bannerText, bannerFont)}
                </pre>
              </div>
            )}
          </div>

          {/* Bottom Telemetry & Compare Controls Bar */}
          <div className="h-10 border-t border-[#1C1C1C] bg-[#070707] px-4 flex items-center justify-between text-[11px] text-[#666666] shrink-0">
            {compareMode ? (
              <div className="flex items-center gap-3 w-full">
                <span className="text-[#20D989] font-bold">COMPARE SPLIT:</span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={comparePosition}
                  onChange={(e) => setComparePosition(parseInt(e.target.value, 10))}
                  className="flex-1 accent-[#20D989]"
                />
                <span className="w-12 text-right">{comparePosition}%</span>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1.5 text-[#20D989]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#20D989] animate-pulse" />
                    <span>ASCII ENGINE: NOMINAL</span>
                  </span>
                  {asciiResult && (
                    <span>
                      RESOLUTION: {asciiResult.width} × {asciiResult.height} ({asciiResult.width * asciiResult.height} chars)
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-4">
                  {asciiResult && <span>RENDER TIME: {asciiResult.renderTimeMs}ms</span>}
                  <span>ZOOM: {Math.round(zoom * 100)}%</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* RIGHT DOCK: REAL-TIME SLIDERS & FINE TUNING (col-span-3) */}
        <div className="lg:col-span-3 border-l border-[#242424] bg-[#080808] p-4 overflow-y-auto space-y-6">
          <div className="flex items-center justify-between pb-2 border-b border-[#1C1C1C]">
            <span className="text-xs font-bold text-[#F2F2F2] flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-[#20D989]" />
              <span>TUNING &amp; FILTERS</span>
            </span>
            <button
              onClick={() =>
                setOptions({
                  columns: 90,
                  charRamp: CHARACTER_RAMPS[0].chars,
                  contrast: 15,
                  brightness: 0,
                  invert: false,
                  aspectRatio: 0.55,
                  dither: 'none',
                  colorTheme: 'green'
                })
              }
              className="text-[10px] text-[#666666] hover:text-[#20D989] flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          </div>

          {/* Grid Columns / Width Slider */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#AAAAAA]">GRID WIDTH (COLUMNS)</span>
              <span className="text-[#20D989] font-bold">{options.columns} cols</span>
            </div>
            <input
              type="range"
              min="30"
              max="180"
              step="5"
              value={options.columns}
              onChange={(e) =>
                setOptions((o) => ({ ...o, columns: parseInt(e.target.value, 10) }))
              }
              className="w-full"
            />
            <div className="flex justify-between text-[10px] text-[#555555]">
              <span>30 (Compact)</span>
              <span>180 (Ultra HD)</span>
            </div>
          </div>

          {/* Line Height / Aspect Compensation */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#AAAAAA]">ASPECT COMPENSATOR</span>
              <span className="text-[#20D989] font-bold">{options.aspectRatio.toFixed(2)}x</span>
            </div>
            <input
              type="range"
              min="0.40"
              max="0.75"
              step="0.01"
              value={options.aspectRatio}
              onChange={(e) =>
                setOptions((o) => ({ ...o, aspectRatio: parseFloat(e.target.value) }))
              }
              className="w-full"
            />
            <div className="flex justify-between text-[10px] text-[#555555]">
              <span>Tight (0.40)</span>
              <span>Expanded (0.75)</span>
            </div>
          </div>

          {/* Contrast Slider */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#AAAAAA]">CONTRAST ENHANCER</span>
              <span className="text-[#20D989] font-bold">
                {options.contrast > 0 ? `+${options.contrast}` : options.contrast}
              </span>
            </div>
            <input
              type="range"
              min="-100"
              max="100"
              value={options.contrast}
              onChange={(e) =>
                setOptions((o) => ({ ...o, contrast: parseInt(e.target.value, 10) }))
              }
              className="w-full"
            />
          </div>

          {/* Brightness Slider */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#AAAAAA]">BRIGHTNESS TUNER</span>
              <span className="text-[#20D989] font-bold">
                {options.brightness > 0 ? `+${options.brightness}` : options.brightness}
              </span>
            </div>
            <input
              type="range"
              min="-100"
              max="100"
              value={options.brightness}
              onChange={(e) =>
                setOptions((o) => ({ ...o, brightness: parseInt(e.target.value, 10) }))
              }
              className="w-full"
            />
          </div>

          {/* Dithering Algorithms */}
          <div className="space-y-2 pt-2 border-t border-[#1C1C1C]">
            <span className="text-xs font-bold text-[#AAAAAA] uppercase block">
              Dithering &amp; Diffusion
            </span>
            <div className="grid grid-cols-2 gap-1.5 text-xs">
              {[
                { id: 'none', label: 'Off / Direct' },
                { id: 'floyd-steinberg', label: 'Floyd-Steinberg' },
                { id: 'bayer4', label: 'Bayer 4×4' },
                { id: 'halftone', label: 'Halftone Dot' }
              ].map((d) => (
                <button
                  key={d.id}
                  onClick={() => setOptions((o) => ({ ...o, dither: d.id as DitherMode }))}
                  className={`p-1.5 rounded border text-[11px] text-center transition-colors ${
                    options.dither === d.id
                      ? 'bg-[#141414] border-[#20D989] text-[#20D989] font-bold'
                      : 'bg-[#0A0A0A] border-[#202020] text-[#777777] hover:text-[#CCCCCC]'
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          {/* Invert Brightness Polarity */}
          <div className="pt-2 border-t border-[#1C1C1C]">
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-xs text-[#AAAAAA]">INVERT POLARITY (DARK/LIGHT)</span>
              <input
                type="checkbox"
                checked={options.invert}
                onChange={(e) => setOptions((o) => ({ ...o, invert: e.target.checked }))}
                className="accent-[#20D989] w-4 h-4 cursor-pointer"
              />
            </label>
          </div>

          {/* Quick Preset Buttons */}
          <div className="pt-2 border-t border-[#1C1C1C] space-y-2">
            <span className="text-[11px] font-bold text-[#666666] uppercase block">
              Quick Stylizer Presets
            </span>
            <div className="grid grid-cols-2 gap-1.5 text-xs">
              <button
                onClick={() =>
                  setOptions({
                    columns: 110,
                    charRamp: CHARACTER_RAMPS[1].chars, // detailed
                    contrast: 30,
                    brightness: -5,
                    invert: false,
                    aspectRatio: 0.55,
                    dither: 'floyd-steinberg',
                    colorTheme: 'green'
                  })
                }
                className="p-1.5 bg-[#0D0D0D] hover:bg-[#161616] border border-[#242424] rounded text-[11px] text-[#20D989]"
              >
                Cyber High-Def
              </button>

              <button
                onClick={() =>
                  setOptions({
                    columns: 80,
                    charRamp: CHARACTER_RAMPS[2].chars, // blocks
                    contrast: 40,
                    brightness: 10,
                    invert: false,
                    aspectRatio: 0.55,
                    dither: 'bayer4',
                    colorTheme: 'amber'
                  })
                }
                className="p-1.5 bg-[#0D0D0D] hover:bg-[#161616] border border-[#242424] rounded text-[11px] text-amber-400"
              >
                Retro Amber Block
              </button>

              <button
                onClick={() =>
                  setOptions({
                    columns: 95,
                    charRamp: CHARACTER_RAMPS[3].chars, // matrix katakana
                    contrast: 20,
                    brightness: 0,
                    invert: false,
                    aspectRatio: 0.55,
                    dither: 'none',
                    colorTheme: 'matrix'
                  })
                }
                className="p-1.5 bg-[#0D0D0D] hover:bg-[#161616] border border-[#242424] rounded text-[11px] text-[#00FF66]"
              >
                Matrix Rain Grid
              </button>

              <button
                onClick={() =>
                  setOptions({
                    columns: 100,
                    charRamp: CHARACTER_RAMPS[0].chars,
                    contrast: 25,
                    brightness: 0,
                    invert: false,
                    aspectRatio: 0.55,
                    dither: 'none',
                    colorTheme: 'truecolor'
                  })
                }
                className="p-1.5 bg-[#0D0D0D] hover:bg-[#161616] border border-[#242424] rounded text-[11px] text-pink-400"
              >
                Full TrueColor RGB
              </button>
            </div>
          </div>

          {/* Export as Runnable Python Code (.py) */}
          <div className="pt-3 border-t border-[#1C1C1C] space-y-2">
            <span className="text-[11px] font-bold text-[#20D989] uppercase flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-[#20D989]" />
              <span>RUNNABLE PYTHON CODE (.PY)</span>
            </span>
            <p className="text-[10px] text-[#666666] leading-relaxed">
              Export as a standalone Python file. When executed in your terminal (<code className="text-[#20D989]">python ascii_art.py</code>), it directly prints this artwork with full ANSI and TrueColor support!
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleExportPython}
                className="flex items-center justify-center gap-1.5 py-2 px-3 bg-[#0E1511] hover:bg-[#14221A] border border-[#20D989]/50 hover:border-[#20D989] text-[#20D989] text-xs font-bold rounded transition-all cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Save .py File</span>
              </button>
              <button
                onClick={handleCopyPython}
                className="flex items-center justify-center gap-1.5 py-2 px-3 bg-[#121212] hover:bg-[#1C1C1C] border border-[#242424] text-[#CCCCCC] hover:text-[#FFFFFF] text-xs rounded transition-all cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copy .py Code</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
