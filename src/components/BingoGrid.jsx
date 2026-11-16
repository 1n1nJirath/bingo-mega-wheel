import React from 'react';
import { motion } from 'framer-motion';
import { Trophy } from 'lucide-react';
import { useBingoStore } from '../store/useBingoStore';

const BINGO_LETTERS = ['B', 'I', 'N', 'G', 'O'];

export default function BingoGrid({ interactive = false }) {
  const board = useBingoStore((s) => s.board);
  const drawnNumbers = useBingoStore((s) => s.drawnNumbers);
  const lastWinner = useBingoStore((s) => s.lastWinner);
  const bingoWinState = useBingoStore((s) => s.bingoWinState);
  const toggleNumberManual = useBingoStore((s) => s.toggleNumberManual);

  const drawnSet = new Set(drawnNumbers);
  const winningTileSet = new Set(bingoWinState?.winningTileIndices || []);
  const winningLines = bingoWinState?.winningLines || [];

  return (
    <div className="flex flex-col h-full w-full select-none">
      {/* Top Grid Header */}
      <div className="flex items-center justify-between px-5 py-3.5 mb-3 rounded-2xl bg-[#0b132b]/80 backdrop-blur-xl border border-white/10 shadow-glass">
        <div className="flex items-center gap-3">
          <Trophy
            className={`w-6 h-6 ${
              bingoWinState?.isBingo
                ? 'text-[#6fffe9] drop-shadow-[0_0_12px_rgba(111,255,233,0.9)] animate-bounce'
                : 'text-slate-400'
            }`}
          />
          <div>
            <div className="text-[11px] font-mono uppercase tracking-[0.25em] text-slate-400">
              5x5 NUMBER-ONLY MATRIX // 25 PLAYABLE CELLS
            </div>
            <div className="text-lg font-extrabold tracking-tight text-white">
              {bingoWinState?.isBingo ? (
                <span className="text-[#6fffe9] drop-shadow-[0_0_12px_rgba(111,255,233,0.8)]">
                  BINGO ACHIEVED! ({winningLines.length}{' '}
                  {winningLines.length === 1 ? 'LINE' : 'LINES'} COMPLETE)
                </span>
              ) : (
                <span>BINGO NUMBER GRID</span>
              )}
            </div>
          </div>
        </div>

        {/* Winning Line Pills */}
        <div className="flex items-center gap-2">
          {winningLines.length > 0 ? (
            winningLines.map((line) => (
              <span
                key={line.id}
                className="px-3 py-1 rounded-lg text-xs font-mono font-black bg-[#6fffe9] text-[#0b132b] shadow-neon-cyan"
              >
                {line.id}
              </span>
            ))
          ) : (
            <span className="text-xs font-mono text-slate-400 px-3 py-1 rounded-lg bg-white/5 border border-white/10">
              LINES: 0 / 12
            </span>
          )}
        </div>
      </div>

      {/* Main 5x5 Number-Only Grid Container */}
      <div className="flex-1 flex flex-col p-4 rounded-3xl bg-[#0b132b]/75 backdrop-blur-xl border-2 border-white/15 shadow-glass">
        {/* B - I - N - G - O Column Headers */}
        <div className="grid grid-cols-5 gap-3 mb-3">
          {BINGO_LETTERS.map((letter) => (
            <div
              key={letter}
              className="py-1.5 rounded-xl bg-white/5 border border-white/10 text-center font-black text-xl md:text-2xl tracking-widest text-[#6fffe9] drop-shadow-[0_0_8px_rgba(111,255,233,0.45)]"
            >
              {letter}
            </div>
          ))}
        </div>

        {/* Strictly 25 Playable Number-Only Cells (NO Free Space) */}
        <div className="flex-1 grid grid-cols-5 grid-rows-5 gap-3">
          {board.map((cell) => {
            const isDrawn = drawnSet.has(cell.number);
            const isWinningTile = winningTileSet.has(cell.index);
            const isLatestDraw = lastWinner?.number === cell.number;

            return (
              <motion.button
                key={`${cell.index}_${cell.number}`}
                type="button"
                disabled={!interactive}
                onClick={() => {
                  if (interactive) {
                    toggleNumberManual(cell.number);
                  }
                }}
                initial={{ scale: 0.92, opacity: 0 }}
                animate={{
                  scale: isLatestDraw ? [1, 1.08, 1] : 1,
                  opacity: 1,
                }}
                transition={{ duration: 0.35 }}
                className={`relative flex items-center justify-center rounded-2xl border-2 transition-all duration-300 overflow-hidden ${
                  interactive ? 'cursor-pointer hover:scale-[1.03]' : 'cursor-default'
                } ${
                  isWinningTile
                    ? 'bg-[#6fffe9]/30 border-[#6fffe9] shadow-neon-cyan-strong text-[#6fffe9]'
                    : isLatestDraw
                    ? 'bg-[#ff4b4b]/30 border-[#ff4b4b] shadow-neon-red-strong text-white'
                    : isDrawn
                    ? 'bg-[#6fffe9]/18 border-[#6fffe9] shadow-neon-cyan text-[#6fffe9]'
                    : 'bg-[#0e1117]/85 border-white/10 text-slate-300 hover:border-white/25'
                }`}
              >
                {/* Radial glow on active cells */}
                {isDrawn && (
                  <div
                    className={`absolute inset-0 pointer-events-none opacity-35 ${
                      isLatestDraw
                        ? 'bg-[radial-gradient(circle_at_center,#ff4b4b_0%,transparent_75%)]'
                        : 'bg-[radial-gradient(circle_at_center,#6fffe9_0%,transparent_75%)]'
                    }`}
                  />
                )}

                {/* CRITICAL UI DATA RENDERING RULE:
                    The Bingo Grid MUST display ONLY the Numbers (e.g., "42", "7") */}
                <span
                  className={`relative z-10 font-mono font-black tracking-tight text-3xl sm:text-4xl md:text-5xl lg:text-6xl ${
                    isWinningTile
                      ? 'text-white drop-shadow-[0_0_18px_rgba(111,255,233,0.95)]'
                      : isLatestDraw
                      ? 'text-white drop-shadow-[0_0_18px_rgba(255,75,75,0.95)]'
                      : isDrawn
                      ? 'text-[#6fffe9] drop-shadow-[0_0_14px_rgba(111,255,233,0.85)]'
                      : 'text-slate-400'
                  }`}
                >
                  {cell.number}
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
