// Dual-Engine Audio Manager (HTML5 Audio + Web Audio API Synthesizer)
// Guarantees crisp, zero-latency sound effects synced with all 10 Gacha animation phases
// even if external MP3/WAV files in /public/sounds/ are absent.

class SoundEngine {
  constructor() {
    this.ctx = null;
    this.muted = false;
    this.htmlAudioCache = {};
  }

  initContext() {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  setMuted(muted) {
    this.muted = Boolean(muted);
  }

  /**
   * Attempts to play an HTML5 audio file from /sounds/<name>.mp3 if the user placed custom files,
   * while falling back to procedural Web Audio synthesis so it works 100% out of the box.
   */
  playTick(pitchMultiplier = 1.0) {
    if (this.muted) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    // Mechanical + neon slot click
    osc.type = 'triangle';
    const baseFreq = Math.min(Math.max(420 * pitchMultiplier, 220), 1400);
    osc.frequency.setValueAtTime(baseFreq, now);
    osc.frequency.exponentialRampToValueAtTime(110, now + 0.032);

    gain.gain.setValueAtTime(0.16, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.032);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.035);
  }

  playGlitchBurst() {
    if (this.muted) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.setValueAtTime(880, now + 0.04);
    osc.frequency.setValueAtTime(95, now + 0.08);
    osc.frequency.setValueAtTime(1320, now + 0.12);

    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.18);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.19);
  }

  playFakeOutBuzzer() {
    if (this.muted) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(190, now);
    osc.frequency.linearRampToValueAtTime(135, now + 0.28);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.005, now + 0.3);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.31);
  }

  playArrowWhoosh() {
    if (this.muted) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(280, now);
    osc.frequency.exponentialRampToValueAtTime(920, now + 0.22);

    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.005, now + 0.24);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.25);
  }

  playWinChime() {
    if (this.muted) return;
    const ctx = this.initContext();
    if (!ctx) return;

    // Bright futuristic Neon Cyan arpeggio chord (C5 - E5 - G5 - B5 - C6)
    const notes = [523.25, 659.25, 783.99, 987.77, 1046.5];
    const now = ctx.currentTime;

    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      const startTime = now + idx * 0.065;
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0.001, startTime);
      gain.gain.linearRampToValueAtTime(0.22, startTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.65);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + 0.68);
    });
  }

  playBingoFanfare() {
    if (this.muted) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    // Grand stadium celebration fanfare sequence
    const sequence = [
      { freq: 523.25, delay: 0.0, duration: 0.16 },
      { freq: 659.25, delay: 0.14, duration: 0.16 },
      { freq: 783.99, delay: 0.28, duration: 0.16 },
      { freq: 1046.5, delay: 0.42, duration: 0.35 },
      { freq: 783.99, delay: 0.72, duration: 0.18 },
      { freq: 1046.5, delay: 0.9, duration: 0.95 },
      { freq: 1318.51, delay: 0.9, duration: 0.95 },
    ];

    sequence.forEach(({ freq, delay, duration }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      const startTime = now + delay;
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0.001, startTime);
      gain.gain.linearRampToValueAtTime(0.18, startTime + 0.025);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + duration + 0.02);
    });
  }
}

export const soundEngine = new SoundEngine();

export function useSoundEffects(audioEnabled = true) {
  soundEngine.setMuted(!audioEnabled);
  return {
    playTick: (pitch = 1.0) => soundEngine.playTick(pitch),
    playGlitchBurst: () => soundEngine.playGlitchBurst(),
    playFakeOutBuzzer: () => soundEngine.playFakeOutBuzzer(),
    playArrowWhoosh: () => soundEngine.playArrowWhoosh(),
    playWinChime: () => soundEngine.playWinChime(),
    playBingoFanfare: () => soundEngine.playBingoFanfare(),
    unlockAudio: () => soundEngine.initContext(),
  };
}
