import React from 'react';
import { Link } from 'react-router-dom';
import { Play, BookOpen, Terminal, Shield, ArrowRight, Sparkles, Cpu, Zap } from 'lucide-react';

const HOODED_ASCII_ART = `
                .860000069990008=..
             :68000000066909900000=.
           .800000000000009900000099:.
         ;6000000999099000900099900998=
        =00000600009909000999900090000996;..
       =0000009009990009999990000000000000889988;
      .009000000099600999000900000000000000000000
     .099000000009996000090009000000000000000000000
     80000"        ~"9900060909900000000000000000000
    :3009"              "8000008000000000000000000000
    "00:                  "90000900000000000000000000
    "30.                    '"08900000000000000000000
     00.                     .00000"... 1900000000000
    .00'   .800;;;000000600000099"   "9009990.. 0
    "05..  8; ""900090000"              "00309"::"
    '966;  $$    "009t                  "099000:.
    .000.  106.  8066..                '"99000; 80.
    :009'9; '800--01'00.               .0000"  ""
    .00000002   ::" "0990006.        ;800
    000000669    80060et.;00008="    :9".."00000
   :900000.     00000899002"        :0080;""000
   ;A000"  .00000;  8;090t;0.9...  '09"   ;00000
  :00009:  000000000000;      00;"000009" :0000
 :000000   "8099" '0880"-     ;0900000000; '0000
 =00090'          0000-        "00"     "0000000
 :000;:           .000-        :00000.   .000000
  99:             ;00"         "000"       "0000
  89:             "0;          '00"          "00
  :;              ""           '0"            ""
`;

export const Home: React.FC = () => {
  return (
    <div className="min-h-[calc(100vh-8rem)] flex flex-col justify-between">
      {/* Hero Section matching ASCII_Launcher_Terminal_Hero_d670aad1.png */}
      <section className="relative overflow-hidden py-12 md:py-20 lg:py-24 border-b border-[#242424]">
        {/* Subtle decorative crosshairs matching mockup */}
        <div className="absolute top-12 left-8 text-[#333333] font-mono text-xs select-none">+</div>
        <div className="absolute top-12 right-8 text-[#333333] font-mono text-xs select-none">+</div>
        <div className="absolute bottom-12 right-12 text-[#333333] font-mono text-xs select-none">+</div>
        <div className="absolute bottom-12 left-12 text-[#333333] font-mono text-xs select-none">+</div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Content */}
            <div className="lg:col-span-6 space-y-6">
              {/* Terminal prompt status */}
              <div className="flex items-center gap-2 font-mono text-xs text-[#20D989] tracking-widest uppercase">
                <span>&gt; SYSTEM ONLINE</span>
                <span className="term-cursor" />
              </div>

              {/* Main Headline */}
              <div className="space-y-2">
                <h1 className="font-mono text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#F2F2F2]">
                  ASCII Launcher<span className="text-[#20D989]">_</span>
                </h1>
                <p className="font-mono text-xl sm:text-2xl text-[#999999] tracking-wide">
                  Explore. Launch. Run.
                </p>
              </div>

              {/* Description */}
              <p className="font-mono text-sm sm:text-base text-[#666666] max-w-xl leading-relaxed">
                A collection of carefully selected ASCII utilities.
                Browse tools, preview their artwork, and run them live directly in your browser's terminal — completely in-memory with zero downloads.
              </p>

              {/* Hero Action Buttons matching mockup */}
              <div className="flex flex-wrap items-center gap-4 pt-4">
                <Link
                  to="/app"
                  className="flex items-center gap-2.5 px-6 py-3 bg-[#20D989] hover:bg-[#1bb874] text-black font-mono text-sm font-bold tracking-wider uppercase transition-all duration-200 rounded shadow-[0_0_20px_rgba(32,217,137,0.3)] hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Sparkles className="w-4 h-4 fill-current" />
                  <span>Launch ASCII Studio (/app)</span>
                </Link>

                <Link
                  to="/tools"
                  className="flex items-center gap-2.5 px-6 py-3 bg-transparent text-[#20D989] border border-[#20D989] hover:bg-[#20D989] hover:text-black font-mono text-sm font-semibold tracking-wider uppercase transition-all duration-200 rounded shadow-[0_0_15px_rgba(32,217,137,0.1)]"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>Browse PC Tools</span>
                </Link>
              </div>

              {/* Quick Trust Badges */}
              <div className="pt-8 border-t border-[#181818] grid grid-cols-3 gap-4 text-xs font-mono text-[#666666]">
                <div>
                  <span className="text-[#20D989] block font-semibold text-sm">IN-BROWSER</span>
                  <span>Instant live terminal</span>
                </div>
                <div>
                  <span className="text-[#F2F2F2] block font-semibold text-sm">ZERO DOWNLOAD</span>
                  <span>Runs securely in-memory</span>
                </div>
                <div>
                  <span className="text-[#999999] block font-semibold text-sm">INTERACTIVE</span>
                  <span>Real-time keyboard input</span>
                </div>
              </div>
            </div>

            {/* Right Content: Large ASCII Hooded Figure */}
            <div className="lg:col-span-6 relative flex justify-center">
              <div className="w-full max-w-lg border border-[#242424] bg-[#0A0A0A]/80 rounded-lg p-6 relative overflow-hidden crt-scanlines group hover:border-[#20D989]/40 transition-colors">
                {/* Subtle corner crosshairs */}
                <div className="absolute top-2 left-2 text-[#444444] font-mono text-[10px]">+</div>
                <div className="absolute top-2 right-2 text-[#444444] font-mono text-[10px]">+</div>
                <div className="absolute bottom-2 left-2 text-[#444444] font-mono text-[10px]">+</div>
                <div className="absolute bottom-2 right-2 text-[#444444] font-mono text-[10px]">+</div>

                <div className="overflow-x-auto">
                  <pre className="ascii-canvas text-[9px] sm:text-[10px] md:text-[11px] leading-[1.08] text-[#20D989]/75 group-hover:text-[#20D989] transition-colors select-none text-center">
                    {HOODED_ASCII_ART}
                  </pre>
                </div>

                <div className="mt-4 pt-3 border-t border-[#181818] flex items-center justify-between text-[11px] font-mono text-[#666666]">
                  <span className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#20D989]" />
                    ASCII TERMINAL CANVAS
                  </span>
                  <Link to="/tools/ascii-generator" className="text-[#20D989] hover:underline flex items-center gap-1">
                    <span>RUN ONLINE</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Highlights Section */}
      <section className="py-16 bg-[#080808]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="font-mono text-2xl font-bold text-[#F2F2F2] tracking-tight">
              Curated Web Terminal Utilities
            </h2>
            <p className="font-mono text-sm text-[#666666] mt-2">
              Every tool executes immediately in the browser console. No downloads, no installations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 bg-[#0A0A0A] border border-[#242424] hover:border-[#20D989]/40 rounded transition-colors group">
              <div className="w-10 h-10 border border-[#242424] group-hover:border-[#20D989] flex items-center justify-center text-[#20D989] mb-4 rounded bg-[#060606]">
                <Terminal className="w-5 h-5" />
              </div>
              <h3 className="font-mono text-base font-semibold text-[#F2F2F2] mb-2">
                Live Interactive Terminal
              </h3>
              <p className="font-mono text-xs text-[#666666] leading-relaxed">
                Interact with utilities directly using an embedded ANSI terminal with real-time prompt, keyboard events, and instant character rendering.
              </p>
            </div>

            <div className="p-6 bg-[#0A0A0A] border border-[#242424] hover:border-[#20D989]/40 rounded transition-colors group">
              <div className="w-10 h-10 border border-[#242424] group-hover:border-[#20D989] flex items-center justify-center text-[#20D989] mb-4 rounded bg-[#060606]">
                <Shield className="w-5 h-5" />
              </div>
              <h3 className="font-mono text-base font-semibold text-[#F2F2F2] mb-2">
                Protected In-Memory Execution
              </h3>
              <p className="font-mono text-xs text-[#666666] leading-relaxed">
                Zero files are saved to your local storage or disk. Everything runs in ephemeral browser memory within a secure sandbox.
              </p>
            </div>

            <div className="p-6 bg-[#0A0A0A] border border-[#242424] hover:border-[#20D989]/40 rounded transition-colors group">
              <div className="w-10 h-10 border border-[#242424] group-hover:border-[#20D989] flex items-center justify-center text-[#20D989] mb-4 rounded bg-[#060606]">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="font-mono text-base font-semibold text-[#F2F2F2] mb-2">
                Zero Latency
              </h3>
              <p className="font-mono text-xs text-[#666666] leading-relaxed">
                Instant execution with zero setup. Simply click any tool, type into the console, and see live ASCII synthesis and animation.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
