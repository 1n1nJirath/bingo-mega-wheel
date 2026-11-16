import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Play,
  RotateCcw,
  Shuffle,
  Volume2,
  VolumeX,
  Upload,
  Sparkles,
  ExternalLink,
  CheckCircle2,
  Sliders,
  Database,
  AlertCircle,
} from 'lucide-react';
import { useBingoStore } from '../store/useBingoStore';
import {
  GACHA_EFFECTS,
  MIN_CATEGORIES_REQUIRED,
  formatWheelLabel,
} from '../utils/defaultCategories';
import { useSoundEffects } from '../hooks/useSoundEffects';
import BingoGrid from '../components/BingoGrid';

export default function HostDashboard() {
  const categories = useBingoStore((s) => s.categories);
  const drawnNumbers = useBingoStore((s) => s.drawnNumbers);
  const isSpinning = useBingoStore((s) => s.isSpinning);
  const currentSpin = useBingoStore((s) => s.currentSpin);
  const lastWinner = useBingoStore((s) => s.lastWinner);
  const showcaseEffect = useBingoStore((s) => s.showcaseEffect);
  const audioEnabled = useBingoStore((s) => s.audioEnabled);
  const bingoWinState = useBingoStore((s) => s.bingoWinState);

  const triggerSpin = useBingoStore((s) => s.triggerSpin);
  const clearBoard = useBingoStore((s) => s.clearBoard);
  const shuffleBingoBoard = useBingoStore((s) => s.shuffleBingoBoard);
  const setShowcaseEffect = useBingoStore((s) => s.setShowcaseEffect);
  const toggleAudio = useBingoStore((s) => s.toggleAudio);
  const updateCategoriesFromText = useBingoStore((s) => s.updateCategoriesFromText);
  const toggleNumberManual = useBingoStore((s) => s.toggleNumberManual);

  const { unlockAudio } = useSoundEffects(audioEnabled);

  const [rawText, setRawText] = useState('');
  const [regenerateOnApply, setRegenerateOnApply] = useState(true);
  const [savedNotice, setSavedNotice] = useState(false);
  const [validationError, setValidationError] = useState(null);

  // Sync textarea with current 1..N categories
  useEffect(() => {
    const formatted = categories.map((c) => `${c.number}, ${c.name}`).join('\n');
    setRawText(formatted);
  }, [categories]);

  const handleCsvUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = String(event.target?.result || '');
      setRawText(content);
      const res = updateCategoriesFromText(content, regenerateOnApply);
      if (!res.valid) {
        setValidationError(res.error);
        setSavedNotice(false);
      } else {
        setValidationError(null);
        setSavedNotice(true);
        setTimeout(() => setSavedNotice(false), 3000);
      }
    };
    reader.readAsText(file);
  };

  const handleApplyCategories = () => {
    const res = updateCategoriesFromText(rawText, regenerateOnApply);
    if (!res.valid) {
      setValidationError(res.error);
      setSavedNotice(false);
    } else {
      setValidationError(null);
      setSavedNotice(true);
      setTimeout(() => setSavedNotice(false), 3000);
    }
  };

  const handleSpinClick = () => {
    unlockAudio();
    triggerSpin();
  };

  const drawnSet = new Set(drawnNumbers);
  const totalCategories = categories.length;
  const remainingCount = totalCategories - drawnNumbers.length;

  // Live line counter in textarea for instant feedback
  const liveLineCount = rawText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean).length;

  return (
    <div
      onClick={() => unlockAudio()}
      className="min-h-screen bg-[#0b132b] text-white p-4 md:p-6 lg:p-8"
    >
      {/* Top Host Header */}
      <header className="max-w-[1600px] mx-auto flex flex-wrap items-center justify-between gap-4 px-6 py-4 mb-6 rounded-2xl bg-[#0e1117]/85 backdrop-blur-xl border border-white/10 shadow-glass">
        <div className="flex items-center gap-4">
          <div className="p-2.5 rounded-xl bg-[#6fffe9]/15 border border-[#6fffe9]/40 text-[#6fffe9] shadow-neon-cyan">
            <Sliders className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-mono uppercase tracking-[0.25em] text-[#6fffe9]">
              GAME MASTER CONTROL PANEL // /host
            </div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight">
              BINGO MEGA WHEEL — HOST CONSOLE
            </h1>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Audio Toggle */}
          <button
            type="button"
            onClick={toggleAudio}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-mono text-xs font-bold border transition ${
              audioEnabled
                ? 'bg-[#6fffe9]/15 border-[#6fffe9] text-[#6fffe9] shadow-neon-cyan'
                : 'bg-white/5 border-white/15 text-slate-400'
            }`}
          >
            {audioEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            {audioEnabled ? 'AUDIO: ON' : 'AUDIO: MUTED'}
          </button>

          {/* Launch Projector Broadcast View */}
          <Link
            to="/broadcast"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-mono text-xs font-black uppercase tracking-wider bg-gradient-to-r from-[#6fffe9] to-teal-300 text-[#0b132b] shadow-neon-cyan hover:brightness-110 transition"
          >
            <span>OPEN PROJECTOR VIEW (/broadcast)</span>
            <ExternalLink className="w-4 h-4" />
          </Link>
        </div>
      </header>

      <div className="max-w-[1600px] mx-auto grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* LEFT COLUMN (7 cols): Master Spin Controls + Showcase Mode Selector + Dynamic 1..N Category Upload */}
        <div className="xl:col-span-7 flex flex-col gap-6">
          {/* 1. Master State Tracker & Spin Trigger Card */}
          <div className="p-6 rounded-3xl bg-[#0e1117]/85 backdrop-blur-xl border border-white/10 shadow-glass">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
              <div>
                <span className="text-xs font-mono uppercase tracking-widest text-slate-400">
                  MASTER STATE TRACKER
                </span>
                <h2 className="text-xl font-black text-white">
                  Spin Trigger & 5x5 Board Synchronization
                </h2>
              </div>

              <div className="flex items-center gap-3 font-mono text-xs">
                <span className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-slate-300">
                  POOL (1..N): <strong className="text-white">{totalCategories}</strong>
                </span>
                <span className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-slate-300">
                  DRAWN:{' '}
                  <strong className="text-[#6fffe9]">
                    {drawnNumbers.length}/{totalCategories}
                  </strong>
                </span>
                <span className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-slate-300">
                  REMAINING: <strong className="text-[#ff4b4b]">{remainingCount}</strong>
                </span>
              </div>
            </div>

            {/* Primary Spin & Reset Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
              <button
                type="button"
                disabled={isSpinning || remainingCount === 0}
                onClick={handleSpinClick}
                className={`sm:col-span-7 py-5 px-6 rounded-2xl font-black text-xl tracking-wider uppercase flex items-center justify-center gap-3 transition-all ${
                  isSpinning
                    ? 'bg-[#ff4b4b]/30 border-2 border-[#ff4b4b] text-[#ff4b4b] shadow-neon-red cursor-wait'
                    : remainingCount === 0
                    ? 'bg-white/5 border border-white/10 text-slate-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-[#ff4b4b] to-rose-600 text-white shadow-neon-red-strong hover:scale-[1.01] active:scale-[0.99]'
                }`}
              >
                <Play className={`w-7 h-7 fill-current ${isSpinning ? 'animate-spin' : ''}`} />
                {isSpinning
                  ? `SPINNING (${currentSpin?.effect})...`
                  : remainingCount === 0
                  ? `ALL ${totalCategories} CATEGORIES DRAWN`
                  : 'TRIGGER MEGA SPIN'}
              </button>

              <button
                type="button"
                disabled={isSpinning}
                onClick={shuffleBingoBoard}
                className="sm:col-span-3 py-4 px-4 rounded-2xl font-bold text-sm bg-white/5 hover:bg-white/10 border border-white/15 text-slate-200 flex items-center justify-center gap-2 transition disabled:opacity-40"
                title="Sample a new 5x5 Number-Only Grid (25 cells) from the 1..N pool"
              >
                <Shuffle className="w-4 h-4 text-[#6fffe9]" />
                <span>New 5x5 Grid</span>
              </button>

              <button
                type="button"
                onClick={clearBoard}
                className="sm:col-span-2 py-4 px-4 rounded-2xl font-bold text-sm bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-300 flex items-center justify-center gap-2 transition"
                title="Clear all drawn numbers and reset round"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Reset</span>
              </button>
            </div>

            {/* Live Telemetry Readout */}
            <div className="mt-5 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-4 text-sm">
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono uppercase text-slate-400">LAST WHEEL OUTPUT:</span>
                {lastWinner ? (
                  <span className="px-3 py-1 rounded-lg bg-[#6fffe9]/15 border border-[#6fffe9]/40 text-[#6fffe9] font-bold">
                    {formatWheelLabel(lastWinner)} [{lastWinner.effect}]
                  </span>
                ) : (
                  <span className="text-slate-500 italic">None yet</span>
                )}
              </div>

              <span className="text-xs font-mono text-slate-400">
                GRID MODE: <strong className="text-[#6fffe9]">25 CELLS (NO FREE SPACE)</strong>
              </span>
            </div>
          </div>

          {/* 2. Showcase Mode Selector (Weighted Randomizer + 10 Exact Gacha Effects) */}
          <div className="p-6 rounded-3xl bg-[#0e1117]/85 backdrop-blur-xl border border-white/10 shadow-glass">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[#6fffe9]">
                  <Sparkles className="w-4 h-4" />
                  SHOWCASE MODE // WEIGHTED GACHA ENGINE (10 EFFECTS)
                </div>
                <h2 className="text-lg font-extrabold text-white mt-0.5">
                  Force Specific Animation or Use Weighted Randomizer
                </h2>
              </div>
              <span className="text-xs font-mono px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-slate-300">
                ACTIVE: <strong className="text-[#6fffe9]">{showcaseEffect}</strong>
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {GACHA_EFFECTS.map((effect) => {
                const isSelected = showcaseEffect === effect.id;
                return (
                  <button
                    key={effect.id}
                    type="button"
                    onClick={() => setShowcaseEffect(effect.id)}
                    className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'bg-[#6fffe9]/15 border-[#6fffe9] shadow-neon-cyan'
                        : 'bg-[#0b132b]/70 border-white/10 hover:border-white/25'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className="font-extrabold text-sm text-white">{effect.name}</span>
                      <span
                        className={`text-[10px] font-mono font-black px-2 py-0.5 rounded bg-gradient-to-r ${effect.color} text-slate-950 shrink-0`}
                      >
                        {effect.badge}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 leading-snug">{effect.description}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Data Entry: Dynamic Category Pool Upload (Min 25, No Max Limit, 1..N Auto-Assignment) */}
          <div className="p-6 rounded-3xl bg-[#0e1117]/85 backdrop-blur-xl border border-white/10 shadow-glass">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-3">
              <div>
                <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[#6fffe9]">
                  <Database className="w-4 h-4" />
                  CATEGORY POOL UPLOAD // MIN {MIN_CATEGORIES_REQUIRED} CATEGORIES (NO MAX LIMIT)
                </div>
                <h2 className="text-lg font-extrabold text-white mt-0.5">
                  Auto-Assigns Unique Integers (1 to N)
                </h2>
              </div>

              <div className="flex items-center gap-3">
                <span
                  className={`px-3 py-1 rounded-lg font-mono text-xs font-bold border ${
                    liveLineCount >= MIN_CATEGORIES_REQUIRED
                      ? 'bg-[#6fffe9]/10 border-[#6fffe9]/40 text-[#6fffe9]'
                      : 'bg-[#ff4b4b]/15 border-[#ff4b4b] text-[#ff4b4b]'
                  }`}
                >
                  LINES DETECTED: {liveLineCount} (MIN {MIN_CATEGORIES_REQUIRED})
                </span>

                <label className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-xs font-mono font-bold text-[#6fffe9] cursor-pointer transition">
                  <Upload className="w-4 h-4" />
                  <span>UPLOAD .CSV / .TXT</span>
                  <input
                    type="file"
                    accept=".csv,.txt"
                    onChange={handleCsvUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            <p className="text-xs text-slate-400 mb-3">
              Enter at least <strong>25 categories</strong> (one per line, no maximum limit). The
              system automatically assigns unique integers <code className="text-[#6fffe9]">1..N</code>
              , renders <code className="text-[#6fffe9]">Category Name (Number)</code> on the 3D
              Wheel, and displays <strong>only Numbers</strong> on the 5x5 Bingo Grid.
            </p>

            {validationError && (
              <div className="mb-3 p-3.5 rounded-xl bg-[#ff4b4b]/15 border border-[#ff4b4b] text-xs font-mono text-[#ff4b4b] flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{validationError}</span>
              </div>
            )}

            <textarea
              rows={8}
              value={rawText}
              onChange={(e) => {
                setRawText(e.target.value);
                if (validationError) setValidationError(null);
              }}
              placeholder="Marine Biology&#10;Quantum Mechanics&#10;Astrophysics..."
              className="w-full p-4 rounded-2xl bg-[#080c14] border border-white/15 focus:border-[#6fffe9] focus:outline-none font-mono text-xs text-slate-200 leading-relaxed"
            />

            <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
              <label className="flex items-center gap-2 text-xs font-mono text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={regenerateOnApply}
                  onChange={(e) => setRegenerateOnApply(e.target.checked)}
                  className="rounded accent-[#6fffe9] w-4 h-4"
                />
                <span>Sample New 25-Cell Bingo Grid & Reset Round on Apply</span>
              </label>

              <div className="flex items-center gap-3">
                {savedNotice && (
                  <span className="flex items-center gap-1.5 text-xs font-mono text-[#6fffe9]">
                    <CheckCircle2 className="w-4 h-4" />
                    Synced {categories.length} Categories (1..{categories.length})!
                  </span>
                )}
                <button
                  type="button"
                  onClick={handleApplyCategories}
                  className="px-6 py-2.5 rounded-xl font-mono text-xs font-black uppercase tracking-wider bg-[#6fffe9] text-[#0b132b] shadow-neon-cyan hover:brightness-110 transition"
                >
                  Validate & Sync Categories
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN (5 cols): Live Number-Only 5x5 Matrix Mirror + 1..N Master Pool Tracker */}
        <div className="xl:col-span-5 flex flex-col gap-6">
          {/* Live Interactive 5x5 Number-Only Matrix Mirror */}
          <div className="p-5 rounded-3xl bg-[#0e1117]/85 backdrop-blur-xl border border-white/10 shadow-glass">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-mono uppercase tracking-widest text-[#6fffe9]">
                PROJECTOR 5x5 NUMBER-ONLY GRID (CLICK CELL TO TOGGLE)
              </span>
              {bingoWinState?.isBingo && (
                <span className="px-2.5 py-0.5 rounded bg-[#6fffe9] text-[#0b132b] font-mono text-xs font-black">
                  BINGO ACTIVE!
                </span>
              )}
            </div>
            <div className="h-[520px]">
              <BingoGrid interactive={true} />
            </div>
          </div>

          {/* All 1..N Categories Master State Tracker */}
          <div className="p-6 rounded-3xl bg-[#0e1117]/85 backdrop-blur-xl border border-white/10 shadow-glass">
            <div className="flex items-center justify-between mb-3">
              <div>
                <span className="text-xs font-mono uppercase tracking-widest text-slate-400">
                  MASTER CATEGORY POOL (1 TO {totalCategories})
                </span>
                <h3 className="text-base font-extrabold text-white">
                  Left-Click: Toggle Drawn | Right-Click: Force Spin to Target
                </h3>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[320px] overflow-y-auto pr-1">
              {categories.map((cat) => {
                const isDrawn = drawnSet.has(cat.number);
                return (
                  <button
                    key={cat.number}
                    type="button"
                    title="Left-Click: Toggle Drawn | Right-Click: Force Wheel Spin to this item"
                    onClick={() => toggleNumberManual(cat.number)}
                    onContextMenu={(e) => {
                      e.preventDefault();
                      unlockAudio();
                      triggerSpin(cat.number);
                    }}
                    className={`px-3 py-2 rounded-xl border font-mono text-xs font-bold flex items-center justify-between gap-2 text-left transition ${
                      isDrawn
                        ? 'bg-[#6fffe9] text-[#0b132b] border-[#6fffe9] shadow-neon-cyan'
                        : 'bg-[#0b132b]/80 text-slate-300 border-white/10 hover:border-[#ff4b4b]'
                    }`}
                  >
                    <span className="truncate">{formatWheelLabel(cat)}</span>
                    <span className="text-[10px] uppercase px-1.5 py-0.5 rounded bg-black/20 shrink-0">
                      {isDrawn ? 'DRAWN' : 'READY'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
