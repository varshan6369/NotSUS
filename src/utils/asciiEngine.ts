/**
 * ASCII Magic Real-Time Client-Side Conversion Engine
 * Converts image pixel matrices into customizable ASCII typography,
 * with true-color, dithering, character ramps, and FIGlet banner synthesis.
 */

export interface CharacterRamp {
  id: string;
  name: string;
  chars: string;
  description: string;
}

export const CHARACTER_RAMPS: CharacterRamp[] = [
  {
    id: 'standard',
    name: 'Standard Retro',
    chars: ' .:-=+*#%@',
    description: 'Classic 10-level brightness distribution'
  },
  {
    id: 'detailed',
    name: 'Detailed 70-Char',
    chars: ' `\'"^,:;Il!i><~+_-?][}{1)(|\\/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$',
    description: 'Ultra-fine tonal gradient for high fidelity'
  },
  {
    id: 'blocks',
    name: 'Solid Blocks',
    chars: ' ░▒▓█',
    description: 'Heavy architectural Unicode block elements'
  },
  {
    id: 'matrix',
    name: 'Matrix Katakana',
    chars: ' ｸｹｺｻｼｽｾｿﾀﾂﾃﾅﾆﾇﾈﾊﾋﾎﾏﾐﾑﾒﾓﾔﾕﾗﾘﾜｦｱｳｴｵ',
    description: 'Authentic cyberpunk cyber-rain glyphs'
  },
  {
    id: 'braille',
    name: 'Braille Matrix',
    chars: ' ⠁⠃⠇⡇⣇⣧⣷⣿',
    description: 'Modern high-density tactile dot clusters'
  },
  {
    id: 'binary',
    name: 'Binary Stream',
    chars: ' 01',
    description: 'Pure machine language binary grid'
  },
  {
    id: 'minimal',
    name: 'Minimal Clean',
    chars: ' .-+#',
    description: 'Clean typographic aesthetic for documentation'
  },
  {
    id: 'math',
    name: 'Math & Logic',
    chars: ' ·÷±≠≈≤≥∂∇∆∏∑',
    description: 'Scientific and mathematical operator mapping'
  }
];

export type DitherMode = 'none' | 'floyd-steinberg' | 'bayer4' | 'halftone';
export type ColorTheme = 'green' | 'amber' | 'cyber' | 'matrix' | 'truecolor' | 'mono';

export interface AsciiOptions {
  columns: number;
  charRamp: string;
  contrast: number; // -100 to 100
  brightness: number; // -100 to 100
  invert: boolean;
  aspectRatio: number; // usually 0.5 to 0.6 to compensate for tall font cells
  dither: DitherMode;
  colorTheme: ColorTheme;
}

export interface AsciiCell {
  char: string;
  r: number;
  g: number;
  b: number;
  brightness: number;
}

export interface AsciiResult {
  text: string;
  lines: string[];
  grid: AsciiCell[][];
  width: number;
  height: number;
  renderTimeMs: number;
}

// 4x4 Bayer Matrix for ordered dithering
const BAYER_4X4 = [
  [ 0,  8,  2, 10],
  [12,  4, 14,  6],
  [ 3, 11,  1,  9],
  [15,  7, 13,  5]
];

/**
 * Converts an Image object into an ASCII Result using an offscreen canvas
 */
export function convertImageToAscii(
  img: HTMLImageElement,
  options: AsciiOptions
): AsciiResult {
  const startTime = performance.now();

  const cols = Math.max(20, Math.min(250, options.columns));
  const aspect = options.aspectRatio || 0.55;
  const rows = Math.max(10, Math.round((img.height / img.width) * cols * aspect));

  // Create offscreen canvas for pixel extraction
  const canvas = document.createElement('canvas');
  canvas.width = cols;
  canvas.height = rows;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });

  if (!ctx) {
    return {
      text: '',
      lines: [],
      grid: [],
      width: 0,
      height: 0,
      renderTimeMs: 0
    };
  }

  // Draw image scaled down to grid size
  ctx.drawImage(img, 0, 0, cols, rows);
  const imgData = ctx.getImageData(0, 0, cols, rows);
  const data = imgData.data;

  // Pre-calculate contrast and brightness multipliers
  const contrastFactor = (259 * (options.contrast + 255)) / (255 * (259 - options.contrast));
  const brightnessOffset = options.brightness * 1.28; // -128 to +128
  const chars = options.charRamp && options.charRamp.length > 0 ? options.charRamp : ' .:-=+*#%@';
  const rampLen = chars.length;

  // 2D grid of processed brightness for optional error diffusion
  const lumGrid: number[][] = [];
  const colorGrid: { r: number; g: number; b: number }[][] = [];

  for (let y = 0; y < rows; y++) {
    lumGrid[y] = [];
    colorGrid[y] = [];
    for (let x = 0; x < cols; x++) {
      const idx = (y * cols + x) * 4;
      let r = data[idx];
      let g = data[idx + 1];
      let b = data[idx + 2];
      const a = data[idx + 3];

      // Apply brightness & contrast
      r = Math.min(255, Math.max(0, contrastFactor * (r - 128) + 128 + brightnessOffset));
      g = Math.min(255, Math.max(0, contrastFactor * (g - 128) + 128 + brightnessOffset));
      b = Math.min(255, Math.max(0, contrastFactor * (b - 128) + 128 + brightnessOffset));

      // Perceived luminance (Rec. 709)
      let lum = (0.2126 * r + 0.7152 * g + 0.0722 * b) * (a / 255);

      if (options.invert) {
        lum = 255 - lum;
      }

      lumGrid[y][x] = lum;
      colorGrid[y][x] = { r, g, b };
    }
  }

  // Apply Floyd-Steinberg error diffusion if selected
  if (options.dither === 'floyd-steinberg') {
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const oldVal = lumGrid[y][x];
        const step = 255 / (rampLen - 1);
        const quantized = Math.round(oldVal / step) * step;
        lumGrid[y][x] = quantized;
        const err = oldVal - quantized;

        if (x + 1 < cols) lumGrid[y][x + 1] += (err * 7) / 16;
        if (x - 1 >= 0 && y + 1 < rows) lumGrid[y + 1][x - 1] += (err * 3) / 16;
        if (y + 1 < rows) lumGrid[y + 1][x] += (err * 5) / 16;
        if (x + 1 < cols && y + 1 < rows) lumGrid[y + 1][x + 1] += (err * 1) / 16;
      }
    }
  }

  // Synthesize ASCII Grid
  const resultGrid: AsciiCell[][] = [];
  const lines: string[] = [];

  for (let y = 0; y < rows; y++) {
    resultGrid[y] = [];
    let lineStr = '';

    for (let x = 0; x < cols; x++) {
      let lum = lumGrid[y][x];

      // Apply Bayer 4x4 matrix if selected
      if (options.dither === 'bayer4') {
        const threshold = (BAYER_4X4[y % 4][x % 4] / 16 - 0.5) * 32;
        lum = Math.min(255, Math.max(0, lum + threshold));
      } else if (options.dither === 'halftone') {
        const distFromCenter = Math.hypot((x % 3) - 1, (y % 3) - 1);
        lum = lum * (1 - distFromCenter * 0.25);
      }

      // Map to character
      const normalized = Math.min(1, Math.max(0, lum / 255));
      const charIndex = Math.min(rampLen - 1, Math.floor(normalized * rampLen));
      const char = chars[charIndex] || ' ';

      const color = colorGrid[y][x];
      resultGrid[y][x] = {
        char,
        r: color.r,
        g: color.g,
        b: color.b,
        brightness: lum
      };
      lineStr += char;
    }
    lines.push(lineStr);
  }

  const renderTimeMs = Math.round(performance.now() - startTime);

  return {
    text: lines.join('\n'),
    lines,
    grid: resultGrid,
    width: cols,
    height: rows,
    renderTimeMs
  };
}

/**
 * Text FIGlet banner font maps
 */
export const FIGLET_FONTS: Record<string, Record<string, string[]>> = {
  block: {
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
    '-': ['       ', '       ', '███████', '       ', '       ', '       '],
    '_': ['       ', '       ', '       ', '       ', '███████', '       ']
  },
  slant: {
    A: ['    ___   ', '   /   |  ', '  / /| |  ', ' / ___ |  ', '/_/  |_|  '],
    B: ['    ____  ', '   / __ ) ', '  / __  | ', ' / /_/ /  ', '/_____/   '],
    C: ['   ______ ', '  / ____/ ', ' / /      ', '/ /___    ', '\\____/    '],
    D: ['    ____  ', '   / __ \\ ', '  / / / / ', ' / /_/ /  ', '/_____/   '],
    E: ['    _____ ', '   / ____/', '  / __/   ', ' / /___   ', '/_____/   '],
    M: ['    __  ___', '   /  |/  /', '  / /|_/ / ', ' / /  / /  ', '/_/  /_/   '],
    O: ['   ____   ', '  / __ \\  ', ' / / / /  ', '/ /_/ /   ', '\\____/    '],
    S: ['   _____  ', '  / ___/  ', '  \\__ \\   ', ' ___/ /   ', '/____/    '],
    T: ['  ______  ', ' /_  __/  ', '  / /     ', ' / /      ', '/_/       '],
    ' ': ['    ', '    ', '    ', '    ', '    ']
  }
};

export function renderFigletBanner(text: string, font: string = 'block'): string {
  const fontObj = FIGLET_FONTS[font] || FIGLET_FONTS.block;
  const upper = text.toUpperCase();
  const height = font === 'slant' ? 5 : 6;
  const lines = Array(height).fill('');

  for (const char of upper) {
    const glyph = fontObj[char] || fontObj[' '] || Array(height).fill('   ');
    for (let i = 0; i < height; i++) {
      lines[i] += (glyph[i] || '   ') + ' ';
    }
  }

  return lines.join('\n');
}

/**
 * Built-in High-Res Cyber Sample Artworks
 */
export const SAMPLE_ARTWORKS = [
  {
    id: 'samurai',
    title: 'Cyber Samurai',
    category: 'Cyberpunk',
    url: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=500&auto=format&fit=crop&q=80'
  },
  {
    id: 'hacker',
    title: 'Hacker in Hood',
    category: 'Terminal',
    url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=500&auto=format&fit=crop&q=80'
  },
  {
    id: 'skull',
    title: 'Retro Synth Skull',
    category: 'Retro',
    url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500&auto=format&fit=crop&q=80'
  },
  {
    id: 'matrix-girl',
    title: 'Matrix Girl',
    category: 'Sci-Fi',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80'
  },
  {
    id: 'falcon',
    title: 'Cyber Falcon',
    category: 'Animal',
    url: 'https://images.unsplash.com/photo-1611689342806-0863700ce1e4?w=500&auto=format&fit=crop&q=80'
  },
  {
    id: 'city',
    title: 'Neon Tokyo',
    category: 'Architecture',
    url: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=500&auto=format&fit=crop&q=80'
  }
];

/**
 * Generates an executable Python script (.py) that prints the ASCII artwork
 * in the user's terminal with full Unicode and ANSI/TrueColor support when executed.
 */
export function generatePythonScript(
  text: string,
  title: string = 'ASCII Magic Art',
  colorTheme: string = 'green',
  grid?: AsciiCell[][]
): string {
  const safeTitle = title.replace(/["\\]/g, '');

  // 1. TrueColor ANSI Terminal Support
  if (colorTheme === 'truecolor' && grid && grid.length > 0) {
    const linesWithAnsi = grid.map((row) => {
      let line = '';
      let prevColor = '';
      for (const cell of row) {
        const curColor = `\\033[38;2;${cell.r};${cell.g};${cell.b}m`;
        if (curColor !== prevColor) {
          line += curColor;
          prevColor = curColor;
        }
        line += cell.char;
      }
      return line + '\\033[0m';
    });

    const linesJson = JSON.stringify(linesWithAnsi, null, 2);

    return `#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
========================================================================
  ${safeTitle.toUpperCase()} — EXECUTABLE TERMINAL SCRIPT
  Generated by ASCII Magic Studio
  When executed, this prints the artwork in 24-bit TrueColor!
========================================================================
"""

import sys
import os

# Configure console for cross-platform UTF-8 Unicode display
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')
elif os.name == 'nt':
    os.system('chcp 65001 >nul 2>&1')

# Enable ANSI escape sequences on Windows Command Prompt
if os.name == 'nt':
    os.system('')

# 24-bit TrueColor RGB terminal lines
ART_LINES = ${linesJson}

def main():
    print()
    for line in ART_LINES:
        print(line)
    print()

if __name__ == '__main__':
    main()
`;
  }

  // 2. Themed ANSI Color Codes
  let ansiColor = '\\033[92m'; // Phosphor Green default
  if (colorTheme === 'amber') ansiColor = '\\033[93m';
  if (colorTheme === 'cyber') ansiColor = '\\033[96m';
  if (colorTheme === 'matrix') ansiColor = '\\033[32m';
  if (colorTheme === 'mono') ansiColor = '\\033[0m';

  // Escape any raw triple quotes inside the ASCII art
  const escapedArt = text.replace(/"""/g, '\\"\\"\\"');

  return `#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
========================================================================
  ${safeTitle.toUpperCase()} — EXECUTABLE TERMINAL SCRIPT
  Generated by ASCII Magic Studio
  When executed, this prints the artwork to your PC terminal!
========================================================================
"""

import sys
import os

# Configure console for cross-platform UTF-8 Unicode display (CMD, PowerShell, Bash)
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')
elif os.name == 'nt':
    os.system('chcp 65001 >nul 2>&1')

# Enable ANSI escape sequences on Windows Command Prompt
if os.name == 'nt':
    os.system('')

COLOR_THEME = "${ansiColor}"
COLOR_RESET = "\\033[0m"

ASCII_ART = r"""
${escapedArt}
"""

def main():
    print(COLOR_THEME + ASCII_ART + COLOR_RESET)

if __name__ == '__main__':
    main()
`;
}

