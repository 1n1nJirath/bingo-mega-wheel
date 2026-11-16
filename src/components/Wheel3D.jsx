import React, { useEffect, useRef, useState, useMemo } from 'react';
import gsap from 'gsap';
import { Sparkles, Zap, AlertTriangle, Crosshair } from 'lucide-react';
import { useBingoStore } from '../store/useBingoStore';
import { GACHA_EFFECTS, formatWheelLabel } from '../utils/defaultCategories';
import { useSoundEffects } from '../hooks/useSoundEffects';

const SLOT_HEIGHT = 86; // px height per slot card in the vertical reel
const VISIBLE_RADIUS = 4; // Renders 9 visible 3D cylinder slots around center (-4..+4)
const REEL_COPIES = 16; // 16 * N virtual slots for infinite-feel scrolling

export default function Wheel3D() {
  const categories = useBingoStore((s) => s.categories);
  const currentSpin = useBingoStore((s) => s.currentSpin);
  const isSpinning = useBingoStore((s) => s.isSpinning);
  const lastWinner = useBingoStore((s) => s.lastWinner);
  const drawnNumbers = useBingoStore((s) => s.drawnNumbers);
  const audioEnabled = useBingoStore((s) => s.audioEnabled);
  const completeSpin = useBingoStore((s) => s.completeSpin);

  const {
    playTick,
    playGlitchBurst,
    playFakeOutBuzzer,
    playArrowWhoosh,
    playWinChime,
  } = useSoundEffects(audioEnabled);

  // Continuous floating index inside the virtual reel
  const [scrollPos, setScrollPos] = useState(100);
  const [arrowOffsetY, setArrowOffsetY] = useState(0); // px vertical displacement of the Neon Target Arrow
  const [isGlitching, setIsGlitching] = useState(false);
  const [statusBanner, setStatusBanner] = useState(null);

  const animStateRef = useRef({ pos: 100, arrowY: 0 });
  const lastTickSlotRef = useRef(100);
  const activeTimelineRef = useRef(null);
  const processedSpinIdRef = useRef(null);

  // Build virtual reel array across dynamic 1..N categories
  const reelItems = useMemo(() => {
    const items = [];
    for (let copy = 0; copy < REEL_COPIES; copy++) {
      for (let i = 0; i < categories.length; i++) {
        items.push({
          virtualIndex: copy * categories.length + i,
          ...categories[i],
        });
      }
    }
    return items;
  }, [categories]);

  useEffect(() => {
    if (!currentSpin || currentSpin.id === processedSpinIdRef.current) return;
    processedSpinIdRef.current = currentSpin.id;

    if (activeTimelineRef.current) {
      activeTimelineRef.current.kill();
    }

    const totalCats = categories.length; // Dynamic N (>= 25)
    const targetZeroIdx = currentSpin.targetNumber - 1; // 0..N-1

    // Normalize starting position into copy #2 so we always have plenty of runway ahead
    const currentMod = ((Math.round(animStateRef.current.pos) % totalCats) + totalCats) % totalCats;
    const startIndex = 2 * totalCats + currentMod;
    // Target lands in copy #9 -> 7 full revolutions of high-speed vertical travel
    const baseTargetIndex = 9 * totalCats + targetZeroIdx;

    animStateRef.current.pos = startIndex;
    animStateRef.current.arrowY = 0;
    lastTickSlotRef.current = startIndex;
    setScrollPos(startIndex);
    setArrowOffsetY(0);
    setIsGlitching(false);
    setStatusBanner(null);

    const syncRender = () => {
      const currPos = animStateRef.current.pos;
      setScrollPos(currPos);
      setArrowOffsetY(animStateRef.current.arrowY);

      const currentSlotInt = Math.floor(currPos + 0.5);
      if (currentSlotInt !== lastTickSlotRef.current) {
        lastTickSlotRef.current = currentSlotInt;
        playTick(1.0);
      }
    };

    const finalizeSpin = () => {
      setIsGlitching(false);
      setStatusBanner(null);
      playWinChime();
      completeSpin(currentSpin.id);
    };

    const tl = gsap.timeline({
      onUpdate: syncRender,
      onComplete: finalizeSpin,
    });
    activeTimelineRef.current = tl;

    const effect = currentSpin.effect || 'NORMAL';

    switch (effect) {
      // 1. NORMAL: Smooth ease-out
      case 'NORMAL': {
        tl.to(animStateRef.current, {
          pos: baseTargetIndex,
          duration: 4.5,
          ease: 'power4.out',
        });
        break;
      }

      // 2. SPEEDSTER: Fast spin, sudden stop
      case 'SPEEDSTER': {
        setStatusBanner({ text: 'SPEEDSTER // SUDDEN BRAKE!', color: 'text-[#ff4b4b]' });
        tl.to(animStateRef.current, {
          pos: baseTargetIndex - 0.15,
          duration: 1.5,
          ease: 'none',
        }).to(animStateRef.current, {
          pos: baseTargetIndex,
          duration: 0.15,
          ease: 'back.out(4)',
        });
        break;
      }

      // 3. BOUNCE: Overshoot the target by 2 slots and bounce back
      case 'BOUNCE': {
        tl.to(animStateRef.current, {
          pos: baseTargetIndex + 2,
          duration: 3.3,
          ease: 'power3.out',
        })
          .call(() => setStatusBanner({ text: 'OVERSHOOT +2 // BOUNCING BACK!', color: 'text-amber-300' }))
          .to(animStateRef.current, {
            pos: baseTargetIndex,
            duration: 1.35,
            ease: 'elastic.out(1.15, 0.35)',
          });
        break;
      }

      // 4. SLIDE: Stop early (3 slots before target), then slide smoothly into the target
      case 'SLIDE': {
        tl.to(animStateRef.current, {
          pos: baseTargetIndex - 3,
          duration: 3.1,
          ease: 'power4.out',
        })
          .call(() => {
            setStatusBanner({ text: 'EARLY STOP (-3 SLOTS) // SLIDING IN...', color: 'text-[#6fffe9]' });
            playArrowWhoosh();
          })
          .to(
            animStateRef.current,
            {
              pos: baseTargetIndex,
              duration: 1.45,
              ease: 'power2.inOut',
            },
            '+=0.45'
          );
        break;
      }

      // 5. TEASE: Stop on the edge between slots, slowly snap to center
      case 'TEASE': {
        tl.to(animStateRef.current, {
          pos: baseTargetIndex - 0.5,
          duration: 3.5,
          ease: 'power4.out',
        })
          .call(() => setStatusBanner({ text: 'EDGE TEASE // BALANCING ON BORDER...', color: 'text-pink-400' }))
          .to(
            animStateRef.current,
            {
              pos: baseTargetIndex,
              duration: 1.25,
              ease: 'power2.inOut',
            },
            '+=0.65'
          );
        break;
      }

      // 6. SNAIL: Extremely slow, suspenseful ease-out
      case 'SNAIL': {
        tl.to(animStateRef.current, {
          pos: baseTargetIndex - 3.5,
          duration: 2.1,
          ease: 'power2.out',
        })
          .call(() => setStatusBanner({ text: 'SNAIL PACE // MAXIMUM SUSPENSE...', color: 'text-purple-300' }))
          .to(animStateRef.current, {
            pos: baseTargetIndex,
            duration: 4.9,
            ease: 'power1.out',
          });
        break;
      }

      // 7. GLITCH: Visual stutter/warp across 3 slots before snapping to target
      case 'GLITCH': {
        tl.to(animStateRef.current, {
          pos: baseTargetIndex - 3,
          duration: 2.6,
          ease: 'power3.out',
        })
          .call(() => {
            setIsGlitching(true);
            setStatusBanner({ text: 'SYSTEM GLITCH // 3-SLOT REALITY WARP', color: 'text-fuchsia-400' });
            playGlitchBurst();
          })
          .to(animStateRef.current, {
            pos: baseTargetIndex + 3,
            duration: 0.14,
            ease: 'steps(2)',
          })
          .call(() => playGlitchBurst())
          .to(animStateRef.current, {
            pos: baseTargetIndex - 2,
            duration: 0.14,
            ease: 'steps(2)',
          })
          .call(() => playGlitchBurst())
          .to(animStateRef.current, {
            pos: baseTargetIndex + 1,
            duration: 0.14,
            ease: 'steps(2)',
          })
          .to(animStateRef.current, {
            pos: baseTargetIndex,
            duration: 0.22,
            ease: 'back.out(3)',
          });
        break;
      }

      // 8. FAKE OUT: Stop completely at the wrong number, wait 1 sec, then drop to the correct one
      case 'FAKE_OUT': {
        tl.to(animStateRef.current, {
          pos: baseTargetIndex - 1,
          duration: 3.3,
          ease: 'power4.out',
        })
          .call(() => {
            setStatusBanner({ text: 'FAKE OUT // WAIT A SECOND!', color: 'text-orange-400' });
            playFakeOutBuzzer();
          })
          .to(
            animStateRef.current,
            {
              pos: baseTargetIndex,
              duration: 0.65,
              ease: 'bounce.out',
            },
            '+=1.0'
          );
        break;
      }

      // 9. ARROW TROLL: Wheel stops incorrectly. The target arrow moves to an adjacent slot and drags the correct item down to the center.
      case 'ARROW_TROLL': {
        // Stopping at baseTargetIndex + 1 places the true target (baseTargetIndex) 1 slot ABOVE center (-SLOT_HEIGHT px)
        tl.to(animStateRef.current, {
          pos: baseTargetIndex + 1,
          duration: 3.3,
          ease: 'power4.out',
        })
          .call(() => {
            setStatusBanner({
              text: 'ARROW TROLL // DRAGGING WINNER TO CENTER!',
              color: 'text-lime-300',
            });
            playArrowWhoosh();
          })
          // Target arrow climbs up to the adjacent slot (-SLOT_HEIGHT)
          .to(
            animStateRef.current,
            {
              arrowY: -SLOT_HEIGHT,
              duration: 0.48,
              ease: 'back.out(2)',
            },
            '+=0.35'
          )
          .call(() => playTick(1.4))
          // Target arrow drags the correct item down to the center!
          .to(
            animStateRef.current,
            {
              arrowY: 0,
              pos: baseTargetIndex,
              duration: 0.95,
              ease: 'power3.inOut',
            },
            '+=0.28'
          );
        break;
      }

      // 10. ARROW CHASE: Wheel stops correctly. The target arrow moves away, and the wheel spins again to catch it.
      case 'ARROW_CHASE': {
        const secondStopIndex = baseTargetIndex + totalCats; // 1 full revolution further so the same winning item catches the arrow!
        // Phase A: Wheel stops correctly at the target first!
        tl.to(animStateRef.current, {
          pos: baseTargetIndex,
          duration: 2.9,
          ease: 'power4.out',
        })
          .call(() => {
            setStatusBanner({
              text: 'ARROW CHASE // TARGET ARROW RAN AWAY!',
              color: 'text-rose-400',
            });
            playArrowWhoosh();
          })
          // Phase B: Target arrow suddenly runs away downward (+2 slots) after stopping!
          .to(
            animStateRef.current,
            {
              arrowY: SLOT_HEIGHT * 1.8,
              duration: 0.42,
              ease: 'back.out(2)',
            },
            '+=0.45'
          )
          .call(() => playArrowWhoosh())
          // Phase C: Wheel spins again for another full revolution while arrow returns to center lock!
          .to(animStateRef.current, {
            pos: secondStopIndex,
            arrowY: 0,
            duration: 1.85,
            ease: 'power3.inOut',
          });
        break;
      }

      default: {
        tl.to(animStateRef.current, {
          pos: baseTargetIndex,
          duration: 4.2,
          ease: 'power4.out',
        });
      }
    }

    return () => {
      if (activeTimelineRef.current) {
        activeTimelineRef.current.kill();
      }
    };
  }, [currentSpin]);

  // Calculate visible slots around current scrollPos
  const centerIndex = Math.round(scrollPos);
  const visibleSlots = [];
  for (let offset = -VISIBLE_RADIUS; offset <= VISIBLE_RADIUS; offset++) {
    const idx = centerIndex + offset;
    const item = reelItems[((idx % reelItems.length) + reelItems.length) % reelItems.length];
    const delta = idx - scrollPos; // continuous offset from center
    visibleSlots.push({
      key: idx,
      item,
      delta,
    });
  }

  const activeEffectMeta = GACHA_EFFECTS.find(
    (e) => e.id === (currentSpin?.effect || lastWinner?.effect)
  );
  const drawnSet = new Set(drawnNumbers);

  return (
    <div className="relative flex flex-col h-full w-full select-none">
      {/* Top Telemetry Header */}
      <div className="flex items-center justify-between px-5 py-3.5 mb-3 rounded-2xl bg-[#0b132b]/80 backdrop-blur-xl border border-white/10 shadow-glass">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className={`w-3.5 h-3.5 rounded-full shrink-0 ${
              isSpinning
                ? 'bg-[#ff4b4b] shadow-neon-red animate-ping'
                : 'bg-[#6fffe9] shadow-neon-cyan'
            }`}
          />
          <div className="min-w-0">
            <div className="text-[11px] font-mono uppercase tracking-[0.25em] text-slate-400">
              3D GACHA WHEEL // CATEGORY + NUMBER
            </div>
            <div className="text-lg font-extrabold tracking-tight text-white truncate">
              {isSpinning ? (
                <span className="text-[#ff4b4b] drop-shadow-[0_0_12px_rgba(255,75,75,0.8)]">
                  SPINNING 3D CYLINDER...
                </span>
              ) : lastWinner ? (
                <span className="text-[#6fffe9] drop-shadow-[0_0_12px_rgba(111,255,233,0.7)]">
                  {formatWheelLabel(lastWinner)}
                </span>
              ) : (
                <span className="text-slate-200">AWAITING HOST TRIGGER</span>
              )}
            </div>
          </div>
        </div>

        {/* Active Gacha Effect Badge */}
        {activeEffectMeta && (
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white/5 border border-white/15 shrink-0">
            <Zap className="w-4 h-4 text-[#6fffe9]" />
            <span className="text-xs font-mono uppercase tracking-wider text-slate-300">
              {activeEffectMeta.name}
            </span>
          </div>
        )}
      </div>

      {/* Main 3D Slot-Machine Viewport */}
      <div
        className={`relative flex-1 min-h-[480px] rounded-3xl bg-gradient-to-b from-[#080d1a] via-[#0b132b]/95 to-[#080d1a] border-2 transition-all duration-300 overflow-hidden shadow-glass ${
          isGlitching
            ? 'border-fuchsia-500 shadow-[0_0_50px_rgba(217,70,239,0.75)]'
            : isSpinning
            ? 'border-[#ff4b4b]/80 shadow-neon-red'
            : 'border-[#6fffe9]/50 shadow-neon-cyan'
        }`}
        style={{ perspective: '1100px' }}
      >
        {/* Ambient Cyber Grid Background */}
        <div
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            backgroundImage:
              'radial-gradient(circle at 50% 50%, rgba(111, 255, 233, 0.18) 0%, transparent 70%), linear-gradient(to bottom, transparent 49%, rgba(111, 255, 233, 0.08) 50%, transparent 51%)',
            backgroundSize: '100% 100%, 100% 32px',
          }}
        />

        {/* Top & Bottom Cinematic Vignette Masks */}
        <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-[#080d1a] via-[#080d1a]/80 to-transparent z-20 pointer-events-none" />
        <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#080d1a] via-[#080d1a]/80 to-transparent z-20 pointer-events-none" />

        {/* Dynamic Status Banner Overlay */}
        {statusBanner && (
          <div className="absolute top-5 inset-x-0 z-30 flex justify-center pointer-events-none">
            <div className="px-5 py-1.5 rounded-full bg-slate-950/90 border border-white/20 backdrop-blur-md shadow-2xl flex items-center gap-2 animate-bounce">
              <AlertTriangle className="w-4 h-4 text-[#ff4b4b]" />
              <span className={`text-sm font-mono font-extrabold tracking-widest uppercase ${statusBanner.color}`}>
                {statusBanner.text}
              </span>
            </div>
          </div>
        )}

        {/* Center Target Frame & Interactive Neon Arrows */}
        <div
          className="absolute inset-x-0 top-1/2 -translate-y-1/2 z-30 pointer-events-none flex items-center justify-between px-3"
          style={{
            height: `${SLOT_HEIGHT + 8}px`,
            transform: `translateY(calc(-50% + ${arrowOffsetY}px))`,
          }}
        >
          {/* Left Neon Target Arrow */}
          <div className="flex items-center -ml-1">
            <div
              className={`flex items-center gap-1 px-3 py-2 rounded-r-xl border-y border-r transition-colors duration-200 ${
                isSpinning
                  ? 'bg-[#ff4b4b]/25 border-[#ff4b4b] shadow-neon-red-strong'
                  : 'bg-[#6fffe9]/25 border-[#6fffe9] shadow-neon-cyan-strong'
              }`}
            >
              <Crosshair
                className={`w-6 h-6 ${
                  isSpinning ? 'text-[#ff4b4b] animate-spin' : 'text-[#6fffe9]'
                }`}
              />
              <div
                className={`w-0 h-0 border-y-[11px] border-y-transparent border-l-[16px] ${
                  isSpinning ? 'border-l-[#ff4b4b]' : 'border-l-[#6fffe9]'
                }`}
              />
            </div>
          </div>

          {/* Center Payline Glass Highlight Frame */}
          <div
            className={`flex-1 mx-2 h-full rounded-2xl border-2 transition-all duration-300 ${
              isSpinning
                ? 'border-[#ff4b4b] bg-[#ff4b4b]/5 shadow-[inset_0_0_25px_rgba(255,75,75,0.28)]'
                : 'border-[#6fffe9] bg-[#6fffe9]/10 shadow-[inset_0_0_30px_rgba(111,255,233,0.3)]'
            }`}
          />

          {/* Right Neon Target Arrow */}
          <div className="flex items-center -mr-1">
            <div
              className={`flex items-center gap-1 px-3 py-2 rounded-l-xl border-y border-l transition-colors duration-200 ${
                isSpinning
                  ? 'bg-[#ff4b4b]/25 border-[#ff4b4b] shadow-neon-red-strong'
                  : 'bg-[#6fffe9]/25 border-[#6fffe9] shadow-neon-cyan-strong'
              }`}
            >
              <div
                className={`w-0 h-0 border-y-[11px] border-y-transparent border-r-[16px] ${
                  isSpinning ? 'border-r-[#ff4b4b]' : 'border-r-[#6fffe9]'
                }`}
              />
              <Sparkles
                className={`w-6 h-6 ${
                  isSpinning ? 'text-[#ff4b4b]' : 'text-[#6fffe9]'
                }`}
              />
            </div>
          </div>
        </div>

        {/* 3D Revolving Cylinder Drum */}
        <div
          className="relative w-full h-full flex items-center justify-center"
          style={{ transformStyle: 'preserve-3d' }}
        >
          {visibleSlots.map(({ key, item, delta }) => {
            const rotateX = delta * -21; // degrees tilt on 3D drum
            const translateY = delta * (SLOT_HEIGHT * 0.92);
            const translateZ = -Math.abs(delta) * 42;
            const scale = Math.max(0.72, 1 - Math.abs(delta) * 0.075);
            const opacity = Math.max(0.12, 1 - Math.abs(delta) * 0.24);

            const isCenter = Math.abs(delta) < 0.38;
            const isAlreadyDrawn = drawnSet.has(item.number);

            // CRITICAL BUSINESS RULE:
            // "The 3D Spinning Wheel MUST display both the Category Name and the Number combined as a single string (e.g., 'Marine Biology (42)')"
            const combinedWheelText = formatWheelLabel(item);

            return (
              <div
                key={key}
                className="absolute inset-x-14 flex items-center justify-center px-6 rounded-2xl border backdrop-blur-md transition-colors duration-75"
                style={{
                  height: `${SLOT_HEIGHT - 8}px`,
                  transform: `translate3d(0, ${translateY}px, ${translateZ}px) rotateX(${rotateX}deg) scale(${scale})`,
                  opacity,
                  zIndex: Math.round(20 - Math.abs(delta) * 3),
                  backgroundColor: isCenter
                    ? isSpinning
                      ? 'rgba(255, 75, 75, 0.24)'
                      : 'rgba(111, 255, 233, 0.22)'
                    : 'rgba(17, 25, 48, 0.82)',
                  borderColor: isCenter
                    ? isSpinning
                      ? '#ff4b4b'
                      : '#6fffe9'
                    : 'rgba(255, 255, 255, 0.12)',
                }}
              >
                <span
                  className={`truncate font-black tracking-wide text-center ${
                    isCenter
                      ? 'text-2xl md:text-3xl lg:text-4xl text-white drop-shadow-[0_0_16px_rgba(111,255,233,0.65)]'
                      : 'text-xl md:text-2xl text-slate-300'
                  } ${isGlitching && isCenter ? 'translate-x-2 text-fuchsia-300' : ''}`}
                >
                  {combinedWheelText}
                </span>

                {isAlreadyDrawn && !isSpinning && (
                  <span className="ml-3 text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-[#6fffe9]/20 text-[#6fffe9] border border-[#6fffe9]/40 shrink-0">
                    DRAWN
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Recent Drawn History Strip */}
      <div className="mt-3 px-5 py-3 rounded-2xl bg-[#0b132b]/80 backdrop-blur-xl border border-white/10 flex items-center justify-between gap-4">
        <div className="text-xs font-mono uppercase tracking-widest text-slate-400 shrink-0">
          DRAWN ({drawnNumbers.length}/{categories.length}):
        </div>
        <div className="flex items-center gap-2 overflow-x-auto py-0.5 no-scrollbar">
          {drawnNumbers.length === 0 ? (
            <span className="text-xs font-mono text-slate-500 italic">
              No categories drawn yet...
            </span>
          ) : (
            [...drawnNumbers]
              .reverse()
              .slice(0, 8)
              .map((num, idx) => {
                const cat = categories.find((c) => c.number === num);
                return (
                  <div
                    key={num}
                    className={`px-3 py-1 rounded-lg font-mono text-xs font-extrabold shrink-0 border ${
                      idx === 0
                        ? 'bg-[#6fffe9] text-[#0b132b] border-[#6fffe9] shadow-neon-cyan'
                        : 'bg-white/5 text-slate-200 border-white/15'
                    }`}
                  >
                    {cat ? formatWheelLabel(cat) : `${num}`}
                  </div>
                );
              })
          )}
        </div>
      </div>
    </div>
  );
}
