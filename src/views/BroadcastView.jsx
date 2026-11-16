import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Radio, Volume2, VolumeX, Settings, Maximize2, Play } from 'lucide-react';
import Wheel3D from '../components/Wheel3D';
import BingoGrid from '../components/BingoGrid';
import BingoCelebrationModal from '../components/BingoCelebrationModal';
import { useBingoStore } from '../store/useBingoStore';
import { useSoundEffects } from '../hooks/useSoundEffects';

export default function BroadcastView() {
  const categories = useBingoStore((s) => s.categories);
  const audioEnabled = useBingoStore((s) => s.audioEnabled);
  const toggleAudio = useBingoStore((s) => s.toggleAudio);
  const drawnNumbers = useBingoStore((s) => s.drawnNumbers);
  const syncMode = useBingoStore((s) => s.syncMode);
  const isSpinning = useBingoStore((s) => s.isSpinning);
  const triggerSpin = useBingoStore((s) => s.triggerSpin);

  const { unlockAudio } = useSoundEffects(audioEnabled);

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Allow pressing Space to trigger spin from projector view
      if (e.code === 'Space' && !e.repeat) {
        e.preventDefault();
        unlockAudio();
        triggerSpin();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [triggerSpin]);

  const handleFullscreen = () => {
    unlockAudio();
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.().catch(() => {});
    } else {
      document.exitFullscreen?.().catch(() => {});
    }
  };

  const handleSpinClick = (e) => {
    e.stopPropagation();
    unlockAudio();
    triggerSpin();
  };

  return (
    <div
      onClick={() => unlockAudio()}
      className="relative min-h-screen w-screen bg-[#0b132b] text-white flex flex-col justify-between p-4 md:p-6 lg:p-8 overflow-hidden select-none"
    >
      {/* Deep Space Ambient Neon Glows */}
      <div className="pointer-events-none fixed -top-40 -left-40 w-[520px] h-[520px] rounded-full bg-[#6fffe9]/10 blur-[140px]" />
      <div className="pointer-events-none fixed -bottom-40 -right-40 w-[520px] h-[520px] rounded-full bg-[#ff4b4b]/10 blur-[140px]" />

      {/* Minimal Top Broadcast Bar */}
      <header className="relative z-10 flex items-center justify-between px-6 py-3 mb-4 rounded-2xl bg-[#0e1117]/80 backdrop-blur-xl border border-white/10 shadow-glass">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[#ff4b4b]/15 border border-[#ff4b4b]/50">
            <Radio className="w-4 h-4 text-[#ff4b4b] animate-pulse" />
            <span className="text-xs font-mono font-black tracking-widest uppercase text-[#ff4b4b]">
              LIVE PROJECTOR BROADCAST
            </span>
          </div>

          <h1 className="text-xl md:text-2xl lg:text-3xl font-black tracking-tight text-white">
            BINGO <span className="text-[#6fffe9]">MEGA WHEEL</span>
          </h1>
        </div>

        {/* Right Telemetry + Discreet Utility Controls */}
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs font-mono text-slate-300">
            <span>DRAWN:</span>
            <span className="font-black text-[#6fffe9]">
              {drawnNumbers.length} / {categories.length}
            </span>
            <span className="text-white/20">|</span>
            <span>SYNC: {syncMode}</span>
          </div>

          <button
            type="button"
            onClick={toggleAudio}
            className={`p-2.5 rounded-xl border transition ${
              audioEnabled
                ? 'bg-[#6fffe9]/15 border-[#6fffe9]/50 text-[#6fffe9]'
                : 'bg-white/5 border-white/10 text-slate-400'
            }`}
            title={audioEnabled ? 'Audio Enabled (Click to Mute)' : 'Audio Muted'}
          >
            {audioEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </button>

          <button
            type="button"
            onClick={handleFullscreen}
            className="p-2.5 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 text-slate-300 hover:text-white transition"
            title="Toggle Projector Fullscreen"
          >
            <Maximize2 className="w-5 h-5" />
          </button>

          {/* Direct Spin Wheel Button on Projector */}
          <button
            type="button"
            disabled={isSpinning || drawnNumbers.length >= categories.length}
            onClick={handleSpinClick}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-mono text-xs font-black uppercase tracking-wider transition ${
              isSpinning
                ? 'bg-[#ff4b4b]/20 border border-[#ff4b4b] text-[#ff4b4b] shadow-neon-red cursor-wait'
                : 'bg-gradient-to-r from-[#ff4b4b] to-rose-600 text-white shadow-neon-red-strong hover:brightness-110 active:scale-95'
            }`}
            title="Trigger Spin (or press SPACE)"
          >
            <Play className={`w-3.5 h-3.5 fill-current ${isSpinning ? 'animate-spin' : ''}`} />
            <span>{isSpinning ? 'SPINNING...' : 'SPIN (SPACE)'}</span>
          </button>

          <Link
            to="/host"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 text-xs font-mono font-bold text-slate-300 hover:text-white transition"
            title="Open Host Dashboard in a new tab"
          >
            <Settings className="w-4 h-4 text-[#6fffe9]" />
            <span className="hidden sm:inline">HOST PANEL</span>
          </Link>
        </div>
      </header>

      {/* Main 10-Foot Dual-Column Broadcast Stage */}
      <main className="relative z-10 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
        {/* Left Column (5 cols): Glowing Vertical 3D Slot-Machine Scroll Wheel (Category Name + Number) */}
        <section className="lg:col-span-5 flex flex-col min-h-[540px] h-full">
          <Wheel3D />
        </section>

        {/* Right Column (7 cols): Glowing 5x5 Number-Only Bingo Grid */}
        <section className="lg:col-span-7 flex flex-col min-h-[540px] h-full">
          <BingoGrid interactive={false} />
        </section>
      </main>

      {/* Full-Screen Confetti & Victory Modal when Bingo is detected */}
      <BingoCelebrationModal />
    </div>
  );
}
