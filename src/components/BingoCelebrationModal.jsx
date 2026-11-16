import React, { useEffect, useState } from 'react';
import Confetti from 'react-confetti';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Sparkles, X } from 'lucide-react';
import { useBingoStore } from '../store/useBingoStore';
import { useSoundEffects } from '../hooks/useSoundEffects';

export default function BingoCelebrationModal() {
  const bingoWinState = useBingoStore((s) => s.bingoWinState);
  const celebrationDismissed = useBingoStore((s) => s.celebrationDismissed);
  const dismissCelebration = useBingoStore((s) => s.dismissCelebration);
  const audioEnabled = useBingoStore((s) => s.audioEnabled);

  const { playBingoFanfare } = useSoundEffects(audioEnabled);

  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1920,
    height: typeof window !== 'undefined' ? window.innerHeight : 1080,
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isVisible = Boolean(bingoWinState?.isBingo && !celebrationDismissed);
  const lineCount = bingoWinState?.winningLines?.length || 0;

  useEffect(() => {
    if (isVisible && lineCount > 0) {
      playBingoFanfare();
    }
  }, [isVisible, lineCount]);

  return (
    <AnimatePresence>
      {isVisible && (
        <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-auto">
          {/* Full-screen React Confetti */}
          <Confetti
            width={windowSize.width}
            height={windowSize.height}
            numberOfPieces={420}
            recycle={true}
            gravity={0.18}
            colors={['#6fffe9', '#ff4b4b', '#5bc0be', '#ffffff', '#fbbf24']}
          />

          {/* Backdrop Blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={dismissCelebration}
            className="absolute inset-0 bg-[#0b132b]/80 backdrop-blur-md"
          />

          {/* Celebration Banner Card */}
          <motion.div
            initial={{ scale: 0.65, opacity: 0, y: 40 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 20 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            className="relative z-10 max-w-2xl w-full mx-6 p-8 md:p-10 rounded-3xl bg-gradient-to-b from-[#131f42]/95 to-[#0b132b]/95 border-2 border-[#6fffe9] shadow-neon-cyan-strong text-center"
          >
            <button
              type="button"
              onClick={dismissCelebration}
              className="absolute top-5 right-5 p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition"
              title="Dismiss Overlay"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-[#6fffe9]/20 border border-[#6fffe9] shadow-neon-cyan mb-5">
              <Trophy className="w-11 h-11 text-[#6fffe9] animate-bounce" />
            </div>

            <div className="flex items-center justify-center gap-2 text-xs font-mono font-bold uppercase tracking-[0.35em] text-[#6fffe9] mb-2">
              <Sparkles className="w-4 h-4" />
              GRAND STAGE VICTORY
              <Sparkles className="w-4 h-4" />
            </div>

            <h2 className="text-5xl md:text-7xl font-black tracking-tight text-white drop-shadow-[0_0_25px_rgba(111,255,233,0.85)] mb-4">
              MEGA BINGO!
            </h2>

            <p className="text-lg md:text-xl text-slate-200 font-medium mb-6">
              The 5x5 Matrix has locked{' '}
              <span className="text-[#6fffe9] font-extrabold">
                {lineCount} winning {lineCount === 1 ? 'line' : 'lines'}
              </span>
              !
            </p>

            {/* Winning Line Badges */}
            <div className="flex flex-wrap items-center justify-center gap-2.5 mb-8">
              {bingoWinState?.winningLines?.map((line) => (
                <span
                  key={line.id}
                  className="px-4 py-1.5 rounded-xl font-mono text-sm font-black bg-[#6fffe9] text-[#0b132b] shadow-neon-cyan"
                >
                  {line.id} ({line.type})
                </span>
              ))}
            </div>

            <button
              type="button"
              onClick={dismissCelebration}
              className="px-8 py-3.5 rounded-2xl font-black text-base tracking-wider uppercase bg-gradient-to-r from-[#6fffe9] to-teal-300 text-[#0b132b] shadow-neon-cyan hover:brightness-110 transition"
            >
              Continue Broadcast & Inspect Board
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
