import { create } from 'zustand';
import { createClient } from '@supabase/supabase-js';
import {
  DEFAULT_CATEGORIES,
  MIN_CATEGORIES_REQUIRED,
  evaluateBingoWin,
  generateBingoBoard,
  parseAndValidateCategories,
  rollWeightedGachaEffect,
} from '../utils/defaultCategories';

const STORAGE_KEY = 'BINGO_MEGA_WHEEL_STATE_V2';
const CHANNEL_NAME = 'bingo_mega_wheel_sync_channel_v2';

// Optional Supabase Realtime Configuration (automatically activates when env vars exist)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
export const supabaseClient =
  supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;

let broadcastChannel = null;
let supabaseRealtimeChannel = null;
let isApplyingRemoteUpdate = false;

function getInitialData() {
  if (typeof window !== 'undefined') {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (
          parsed &&
          Array.isArray(parsed.categories) &&
          parsed.categories.length >= MIN_CATEGORIES_REQUIRED &&
          Array.isArray(parsed.board) &&
          parsed.board.length === 25
        ) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to load state from localStorage:', e);
    }
  }

  const initialBoard = generateBingoBoard(DEFAULT_CATEGORIES);
  return {
    categories: DEFAULT_CATEGORIES,
    board: initialBoard, // Strictly 25 playable cells, NO Free Space
    drawnNumbers: [],
    currentSpin: null, // { id, targetNumber, targetName, effect, startedAt }
    isSpinning: false,
    showcaseEffect: 'WEIGHTED_RANDOM',
    audioEnabled: true,
    lastWinner: null,
    bingoWinState: evaluateBingoWin(initialBoard, []),
    celebrationDismissed: false,
  };
}

function broadcastStateSnapshot(state) {
  if (isApplyingRemoteUpdate || typeof window === 'undefined') return;

  const snapshot = {
    categories: state.categories,
    board: state.board,
    drawnNumbers: state.drawnNumbers,
    currentSpin: state.currentSpin,
    isSpinning: state.isSpinning,
    showcaseEffect: state.showcaseEffect,
    audioEnabled: state.audioEnabled,
    lastWinner: state.lastWinner,
    bingoWinState: state.bingoWinState,
    celebrationDismissed: state.celebrationDismissed,
    updatedAt: Date.now(),
  };

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
  } catch (err) {
    console.warn('LocalStorage sync error:', err);
  }

  if (broadcastChannel) {
    try {
      broadcastChannel.postMessage({ type: 'SYNC_STATE', payload: snapshot });
    } catch (err) {
      console.warn('BroadcastChannel postMessage error:', err);
    }
  }

  if (supabaseRealtimeChannel) {
    supabaseRealtimeChannel
      .send({
        type: 'broadcast',
        event: 'SYNC_STATE',
        payload: snapshot,
      })
      .catch(() => {});
  }
}

export const useBingoStore = create((set, get) => {
  const initial = getInitialData();

  return {
    ...initial,
    syncMode: supabaseClient ? 'SUPABASE_REALTIME + BROADCAST_CHANNEL' : 'BROADCAST_CHANNEL + STORAGE',

    /**
     * Parses and validates raw text or CSV input (enforcing minimum 25 categories, no upper bound,
     * auto-indexing 1..N) and updates the global state & 5x5 grid.
     */
    updateCategoriesFromText: (rawText, regenerateGrid = true) => {
      const validation = parseAndValidateCategories(rawText);
      if (!validation.valid) {
        return validation;
      }

      const newCategories = validation.categories;
      const state = get();

      // If regenerateGrid is false, check whether all current 25 board numbers still exist in 1..N
      const canKeepCurrentBoard =
        !regenerateGrid &&
        state.board.every((cell) => cell.number <= newCategories.length);

      const nextBoard = canKeepCurrentBoard
        ? state.board.map((cell) => {
            const found = newCategories[cell.number - 1];
            return { ...cell, name: found ? found.name : cell.name };
          })
        : generateBingoBoard(newCategories);

      const nextDrawn = canKeepCurrentBoard
        ? state.drawnNumbers.filter((n) => n <= newCategories.length)
        : [];
      const nextWinState = evaluateBingoWin(nextBoard, nextDrawn);

      set({
        categories: newCategories,
        board: nextBoard,
        drawnNumbers: nextDrawn,
        currentSpin: canKeepCurrentBoard ? state.currentSpin : null,
        isSpinning: false,
        lastWinner: canKeepCurrentBoard ? state.lastWinner : null,
        bingoWinState: nextWinState,
        celebrationDismissed: false,
      });
      broadcastStateSnapshot(get());
      return { valid: true, error: null, count: newCategories.length };
    },

    // Shuffle a brand new 5x5 Number-Only Bingo Grid sampled from the 1..N category pool
    shuffleBingoBoard: () => {
      const state = get();
      const nextBoard = generateBingoBoard(state.categories);
      const nextWinState = evaluateBingoWin(nextBoard, state.drawnNumbers);

      set({
        board: nextBoard,
        bingoWinState: nextWinState,
        celebrationDismissed: false,
      });
      broadcastStateSnapshot(get());
    },

    // Set Showcase Mode Gacha animation effect ('WEIGHTED_RANDOM' or one of the 10 effects)
    setShowcaseEffect: (effectId) => {
      set({ showcaseEffect: effectId });
      broadcastStateSnapshot(get());
    },

    // Toggle Audio
    toggleAudio: () => {
      set((s) => ({ audioEnabled: !s.audioEnabled }));
      broadcastStateSnapshot(get());
    },

    // Trigger a Gacha Spin from Host Dashboard (using Weighted Randomizer or forced Showcase Mode)
    triggerSpin: (forcedTargetNumber = null) => {
      const state = get();
      if (state.isSpinning) return null;

      const drawnSet = new Set(state.drawnNumbers);
      const undrawnCategories = state.categories.filter((c) => !drawnSet.has(c.number));

      if (undrawnCategories.length === 0) {
        return null;
      }

      let targetCat = null;
      if (forcedTargetNumber !== null) {
        targetCat =
          undrawnCategories.find((c) => c.number === Number(forcedTargetNumber)) ||
          state.categories.find((c) => c.number === Number(forcedTargetNumber)) ||
          undrawnCategories[Math.floor(Math.random() * undrawnCategories.length)];
      } else {
        targetCat = undrawnCategories[Math.floor(Math.random() * undrawnCategories.length)];
      }

      const chosenEffect =
        state.showcaseEffect === 'WEIGHTED_RANDOM'
          ? rollWeightedGachaEffect()
          : state.showcaseEffect;

      const spinPayload = {
        id: `spin_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        targetNumber: targetCat.number,
        targetName: targetCat.name,
        effect: chosenEffect,
        startedAt: Date.now(),
      };

      set({
        currentSpin: spinPayload,
        isSpinning: true,
      });
      broadcastStateSnapshot(get());
      return spinPayload;
    },

    // Called when the 3D Wheel finishes its GSAP timeline animation
    completeSpin: (spinId) => {
      const state = get();
      if (!state.currentSpin || state.currentSpin.id !== spinId) return;

      const targetNum = state.currentSpin.targetNumber;
      const nextDrawn = state.drawnNumbers.includes(targetNum)
        ? state.drawnNumbers
        : [...state.drawnNumbers, targetNum];

      const prevWinCount = state.bingoWinState?.winningLines?.length || 0;
      const nextWinState = evaluateBingoWin(state.board, nextDrawn);
      const hasNewWinLine = nextWinState.winningLines.length > prevWinCount;

      set({
        isSpinning: false,
        drawnNumbers: nextDrawn,
        lastWinner: {
          number: state.currentSpin.targetNumber,
          name: state.currentSpin.targetName,
          effect: state.currentSpin.effect,
          completedAt: Date.now(),
        },
        bingoWinState: nextWinState,
        celebrationDismissed: hasNewWinLine ? false : state.celebrationDismissed,
      });
      broadcastStateSnapshot(get());
    },

    // Manually toggle a number as drawn/undrawn (for Host override or testing Bingo lines)
    toggleNumberManual: (number) => {
      const state = get();
      const exists = state.drawnNumbers.includes(number);
      const nextDrawn = exists
        ? state.drawnNumbers.filter((n) => n !== number)
        : [...state.drawnNumbers, number];

      const prevWinCount = state.bingoWinState?.winningLines?.length || 0;
      const nextWinState = evaluateBingoWin(state.board, nextDrawn);
      const hasNewWinLine = nextWinState.winningLines.length > prevWinCount;
      const cat = state.categories.find((c) => c.number === number);

      set({
        drawnNumbers: nextDrawn,
        bingoWinState: nextWinState,
        lastWinner:
          !exists && cat
            ? {
                number: cat.number,
                name: cat.name,
                effect: 'MANUAL_OVERRIDE',
                completedAt: Date.now(),
              }
            : state.lastWinner,
        celebrationDismissed: hasNewWinLine ? false : state.celebrationDismissed,
      });
      broadcastStateSnapshot(get());
    },

    // Dismiss full-screen Bingo modal while keeping winning grid lines highlighted
    dismissCelebration: () => {
      set({ celebrationDismissed: true });
      broadcastStateSnapshot(get());
    },

    // Clear all drawn numbers and reset current round
    clearBoard: () => {
      const state = get();
      const nextWinState = evaluateBingoWin(state.board, []);
      set({
        drawnNumbers: [],
        currentSpin: null,
        isSpinning: false,
        lastWinner: null,
        bingoWinState: nextWinState,
        celebrationDismissed: false,
      });
      broadcastStateSnapshot(get());
    },

    // Apply incoming remote state from Host -> Projector Broadcast
    applyRemoteSnapshot: (snapshot) => {
      if (!snapshot) return;
      isApplyingRemoteUpdate = true;
      set({
        categories: snapshot.categories,
        board: snapshot.board,
        drawnNumbers: snapshot.drawnNumbers,
        currentSpin: snapshot.currentSpin,
        isSpinning: snapshot.isSpinning,
        showcaseEffect: snapshot.showcaseEffect,
        audioEnabled: snapshot.audioEnabled,
        lastWinner: snapshot.lastWinner,
        bingoWinState: snapshot.bingoWinState,
        celebrationDismissed: snapshot.celebrationDismissed ?? false,
      });
      isApplyingRemoteUpdate = false;
    },
  };
});

/**
 * Initializes Dual-Screen Real-Time Synchronization:
 * 1. BroadcastChannel API (instant tab-to-tab / projector window sync)
 * 2. window 'storage' event fallback
 * 3. Supabase Realtime Channel (cross-device Host tablet -> Projector PC sync)
 */
export function initRealtimeSync() {
  if (typeof window === 'undefined') return () => {};

  if (!broadcastChannel && 'BroadcastChannel' in window) {
    broadcastChannel = new BroadcastChannel(CHANNEL_NAME);
    broadcastChannel.onmessage = (event) => {
      if (event.data?.type === 'SYNC_STATE') {
        useBingoStore.getState().applyRemoteSnapshot(event.data.payload);
      }
    };
  }

  const handleStorageEvent = (event) => {
    if (event.key === STORAGE_KEY && event.newValue) {
      try {
        const parsed = JSON.parse(event.newValue);
        useBingoStore.getState().applyRemoteSnapshot(parsed);
      } catch (e) {
        console.warn('Storage parse error:', e);
      }
    }
  };
  window.addEventListener('storage', handleStorageEvent);

  if (supabaseClient && !supabaseRealtimeChannel) {
    supabaseRealtimeChannel = supabaseClient.channel('bingo_mega_wheel_room_v2', {
      config: { broadcast: { self: false } },
    });

    supabaseRealtimeChannel
      .on('broadcast', { event: 'SYNC_STATE' }, ({ payload }) => {
        useBingoStore.getState().applyRemoteSnapshot(payload);
      })
      .subscribe();
  }

  return () => {
    window.removeEventListener('storage', handleStorageEvent);
  };
}
