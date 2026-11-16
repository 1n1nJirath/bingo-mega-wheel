# 🎰 Bingo Mega Wheel // General Use Edition

A premium, high-performance web application designed for live events, party hosting, and large 10-foot projector displays.

## 🚀 Key Features

- **Dual-Screen Architecture**:
  - `/host`: Comprehensive Game Master control dashboard. Upload categories, force showcase Gacha animations, manually override cells, trigger spins, and control sound.
  - `/broadcast`: UI-free, 10-foot cinema display designed for TV / stage projectors. Renders the vertical 3D slot-machine reel and the live Bingo matrix.
- **Strict Business & Game Rules**:
  - Minimum 25 categories required (no upper bound, auto-indexed 1 to N).
  - Strictly 25 playable cells in a 5x5 matrix (NO Free Space).
  - **Number-Only Grid**: Projector grid renders strictly numbers (e.g. `42`, `7`).
  - **Category + Number Wheel**: 3D Slot reel renders `Category Name (Number)` (e.g. `Marine Biology (42)`).
- **10 Cinematic Gacha Timings & Easing Effects**:
  1. **Normal**: Smooth ease-out.
  2. **Speedster**: High-velocity spin with a sudden mechanical brake stop.
  3. **Bounce**: Overshoots by 2 slots and springs back.
  4. **Slide**: Stops 3 slots early, pauses, then slides into target.
  5. **Tease**: Stops precariously on slot edge before snapping to center.
  6. **Snail**: Extremely slow, suspenseful ease-out.
  7. **Glitch**: 3-slot chromatic reality warp before lock.
  8. **Fake Out**: Stops on adjacent decoy for 1 sec, then drops to real winner.
  9. **Arrow Troll**: Wheel stops short; Target Arrow moves to adjacent slot and drags the winner down!
  10. **Arrow Chase**: Wheel stops correctly; Target Arrow runs away, and wheel spins another revolution to catch it!
- **Real-Time Dual-Screen Sync**:
  - Instant sub-millisecond local sync via `BroadcastChannel` API and `localStorage`.
  - Optional cross-device sync via Supabase Realtime (`VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY`).
- **Sound Engine**:
  - Procedural Web Audio API synthesizer for zero-latency mechanical ticks, glitches, whooshes, and victory fanfare.

## 🛠 Tech Stack

- **Frontend**: React 18 + Vite + React Router v6
- **Styling**: Tailwind CSS (Cinematic Dark Mode + Glassmorphism)
- **Animation**: GSAP 3.12 (3D Slot Drum & Timelines) + Framer Motion (Modals & Transitions)
- **State**: Zustand
- **Celebration**: Canvas Confetti / React Confetti
- **Deployment**: Vercel SPA Ready

## 📦 Local Development

```bash
npm install
npm run dev
```

Open:
- `/broadcast` on the projector / presentation screen
- `/host` on the Game Master laptop / tablet
