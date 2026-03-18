'use client';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

const links = [
  { name: 'Home',        href: '/'            },
  { name: 'My Projects', href: '/my-projects' },
  { name: 'Services',    href: '/#services'   },
  { name: 'Contact',     href: '/#contact'    },
];

// ── Variants ──────────────────────────────────────────────────────────────────

const screenVariants = {
  hidden: { scaleY: 0, opacity: 0, y: -40 },
  visible: {
    scaleY: 1, opacity: 1, y: 0,
    transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
  },
};

const grainVariants = {
  animate: {
    opacity: [0.18, 0.3, 0.12, 0.22],
    transition: { duration: 1.6, repeat: Infinity, ease: 'easeInOut' as const },
  },
};

const flickerVariants = {
  animate: {
    opacity: [0.97, 1, 0.94, 1, 0.96, 1],
    transition: { duration: 3.5, repeat: Infinity, ease: 'easeInOut' as const },
  },
};

// Projector lamp sputtering — warm light flicker before menu locks in
const warmupKeyframes = {
  opacity: [0, 0.88, 0.18, 0.95, 0.05, 0.8, 0.32, 0.92, 0.52, 0.84, 0.7, 0.78, 0.72, 0.7],
  transition: {
    duration: 0.74,
    times:    [0, 0.04, 0.1, 0.18, 0.26, 0.36, 0.44, 0.54, 0.62, 0.7, 0.78, 0.86, 0.93, 1],
    ease: 'linear' as const,
  },
};

const menuBlinkVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: [0, 1, 0.88, 1, 0.92, 1],
    transition: { duration: 1.1, times: [0, 0.15, 0.3, 0.5, 0.7, 1], ease: 'easeInOut' as const },
  },
  stable: {
    opacity: [1, 0.98, 1, 0.99, 1],
    transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' as const },
  },
};

const listVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.15 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' as const } },
};

// ── Arrow icon ────────────────────────────────────────────────────────────────

const ArrowIcon = ({ direction }: { direction: 'up' | 'down' }) => (
  <svg
    className={`h-5 w-5 transition-transform ${direction === 'down' ? 'rotate-0' : 'rotate-180'}`}
    viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
  >
    <path d="M6 9l6 6 6-6" />
  </svg>
);

// ── Film grain SVG data URI ───────────────────────────────────────────────────

const grainUrl = (size: number, freq: string) =>
  `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='${size}' height='${size}' viewBox='0 0 ${size} ${size}'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='${freq}' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.45'/%3E%3C/svg%3E")`;

// ── CountdownReel ─────────────────────────────────────────────────────────────
//
// Designed to occupy the exact same visual footprint as the menu panel.
// The parent passes className="relative w-full max-w-sm" — the reel's dark film
// panel extends with -inset-x-8 / -inset-y-12 (matching the menu panel insets).

const COUNTDOWN_START = 3;

const CountdownReel = ({ value, circleScale = 1 }: { value: number; circleScale?: number }) => {
  const displayValue = Math.max(0, value);
  const s = circleScale;

  const CONTENT_H = 300 * s;
  const INSET_X   = 32;        // NOT scaled — keeps panel width = menu panel width
  const INSET_Y   = 48 * s;
  const STRIP_W   = 42 * s;
  const CIRCLE_D  = 272 * s;
  const cx = CIRCLE_D / 2, cy = CIRCLE_D / 2;
  const outerR    = 126 * s;

  // 12 major + 24 minor tick marks
  const ticks = Array.from({ length: 12 }, (_, i) => {
    const rad = (i * 30 * Math.PI) / 180;
    const isMajor = i % 3 === 0;
    return {
      x1: cx + outerR * Math.sin(rad),
      y1: cy - outerR * Math.cos(rad),
      x2: cx + (outerR - (isMajor ? 18 : 10) * s) * Math.sin(rad),
      y2: cy - (outerR - (isMajor ? 18 : 10) * s) * Math.cos(rad),
      isMajor,
    };
  });
  const minorTicks = Array.from({ length: 24 }, (_, i) => {
    const rad = ((i * 15 + 7.5) * Math.PI) / 180;
    return {
      x1: cx + outerR * Math.sin(rad),
      y1: cy - outerR * Math.cos(rad),
      x2: cx + (outerR - 5 * s) * Math.sin(rad),
      y2: cy - (outerR - 5 * s) * Math.cos(rad),
    };
  });

  // Sprocket holes — 6 evenly spaced
  const holeOffsets = [-140, -84, -28, 28, 84, 140].map(o => o * s);

  const timecode = `00:00:0${displayValue}`;

  return (
    <div className="relative w-full" style={{ height: CONTENT_H }}>

      {/* Film panel */}
      <div
        className="absolute rounded-2xl overflow-hidden"
        style={{
          top: -INSET_Y, bottom: -INSET_Y,
          left: -INSET_X, right: -INSET_X,
          background: '#5c4c34',
          border: '1px solid rgba(255,240,195,0.12)',
          boxShadow: '0 6px 50px rgba(0,0,0,0.45)',
        }}
      >
        {/* Film grain */}
        <motion.div
          animate={{ opacity: [0.32, 0.52, 0.2, 0.4] }}
          transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: grainUrl(120, '0.85'),
            backgroundSize: '160px',
            mixBlendMode: 'overlay',
          }}
        />

        {/* Left film strip */}
        <div className="absolute left-0 top-0 bottom-0" style={{ width: STRIP_W }}>
          <div className="absolute inset-0"
            style={{ background: '#2e2418', borderRight: '1px solid rgba(255,240,195,0.08)' }} />
          {holeOffsets.map((offset, i) => (
            <div key={i} className="absolute" style={{
              width: 11 * s, height: 19 * s,
              top: '50%', marginTop: offset - 9 * s,
              left: '50%', marginLeft: -5 * s,
              borderRadius: 2 * s,
              background: '#1a1208',
              border: '1px solid rgba(255,240,195,0.1)',
              boxShadow: 'inset 0 1px 4px rgba(0,0,0,0.85)',
            }} />
          ))}
        </div>

        {/* Right film strip */}
        <div className="absolute right-0 top-0 bottom-0" style={{ width: STRIP_W }}>
          <div className="absolute inset-0"
            style={{ background: '#2e2418', borderLeft: '1px solid rgba(255,240,195,0.08)' }} />
          {holeOffsets.map((offset, i) => (
            <div key={i} className="absolute" style={{
              width: 11 * s, height: 19 * s,
              top: '50%', marginTop: offset - 9 * s,
              left: '50%', marginLeft: -5 * s,
              borderRadius: 2 * s,
              background: '#1a1208',
              border: '1px solid rgba(255,240,195,0.1)',
              boxShadow: 'inset 0 1px 4px rgba(0,0,0,0.85)',
            }} />
          ))}
        </div>

        {/* Center frame */}
        <div className="absolute" style={{ left: STRIP_W, right: STRIP_W, top: 0, bottom: 0 }}>

          {/* Corner registration marks */}
          {([
            { top: 10, left: 10 },
            { top: 10, right: 10 },
            { bottom: 10, left: 10 },
            { bottom: 10, right: 10 },
          ] as const).map((pos, i) => (
            <div key={i} className="absolute pointer-events-none" style={{
              top:    'top'    in pos ? pos.top    * s : undefined,
              bottom: 'bottom' in pos ? pos.bottom * s : undefined,
              left:   'left'   in pos ? pos.left   * s : undefined,
              right:  'right'  in pos ? pos.right  * s : undefined,
              width: 14 * s, height: 14 * s,
              borderTop:    'top'    in pos ? '1.5px solid rgba(255,240,195,0.3)' : undefined,
              borderBottom: 'bottom' in pos ? '1.5px solid rgba(255,240,195,0.3)' : undefined,
              borderLeft:   'left'   in pos ? '1.5px solid rgba(255,240,195,0.3)' : undefined,
              borderRight:  'right'  in pos ? '1.5px solid rgba(255,240,195,0.3)' : undefined,
            }} />
          ))}

          {/* Countdown circle */}
          <div className="absolute" style={{
            top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)',
            width: CIRCLE_D, height: CIRCLE_D,
          }}>
            {/* Circle background — flat aged sepia */}
            <div style={{
              position: 'absolute', inset: 0, borderRadius: '50%',
              background: 'radial-gradient(circle at 42% 38%, #cec4a0, #b8ae8c 55%, #a09880)',
              boxShadow: 'inset 0 3px 12px rgba(0,0,0,0.28), 0 0 0 2px rgba(10,7,2,0.5)',
            }} />

            {/* SVG: 3 rings, tick marks, rotating hand (below number) */}
            <svg style={{ position: 'absolute', inset: 0, overflow: 'visible', zIndex: 0 }}
              width={CIRCLE_D} height={CIRCLE_D} viewBox={`0 0 ${CIRCLE_D} ${CIRCLE_D}`}>

              {/* 3 concentric rings */}
              {[outerR, 88, 52].map((r, i) => (
                <circle key={i} cx={cx} cy={cy} r={r}
                  stroke={`rgba(10,6,2,${0.65 - i * 0.15})`}
                  strokeWidth={i === 0 ? 2.5 : 1.5}
                  fill="none"
                />
              ))}

              {/* Minor ticks */}
              {minorTicks.map((tick, i) => (
                <line key={i}
                  x1={tick.x1} y1={tick.y1} x2={tick.x2} y2={tick.y2}
                  stroke="rgba(10,6,2,0.22)" strokeWidth="0.7" />
              ))}

              {/* Major tick marks */}
              {ticks.map((tick, i) => (
                <line key={i}
                  x1={tick.x1} y1={tick.y1} x2={tick.x2} y2={tick.y2}
                  stroke={tick.isMajor ? 'rgba(8,4,1,0.75)' : 'rgba(10,6,2,0.4)'}
                  strokeWidth={tick.isMajor ? 2 : 1.1}
                />
              ))}

              {/* Center ring */}
              <circle cx={cx} cy={cy} r={10}
                stroke="rgba(8,4,1,0.55)" strokeWidth="1.5" fill="none" />

              {/* Trail arc — fills behind the hand as it sweeps */}
              <motion.circle
                key={`trail-${value}`}
                cx={cx} cy={cy} r={outerR - 5}
                stroke="rgba(4, 2, 0, 0.83)"
                strokeWidth="3" fill="none"
                transform={`rotate(-90 ${cx} ${cy})`}
                strokeDasharray={2 * Math.PI * (outerR - 5)}
                initial={{ strokeDashoffset: 2 * Math.PI * (outerR - 5) }}
                animate={{ strokeDashoffset: 0 }}
                transition={{ duration: 0.95, ease: 'linear' }}
              />

              {/* Clock hand — from center to outer ring */}
              <motion.g
                key={`hand-${value}`}
                style={{
                  transformOrigin: `${cx}px ${cy}px`,
                  transformBox: 'view-box' as const,
                }}
                initial={{ rotate: 0 }}
                animate={{ rotate: 360 }}
                transition={{ duration: 0.95, ease: 'linear' }}
              >
                <line
                  x1={cx} y1={cy + 12}
                  x2={cx} y2={cy - (outerR - 5)}
                  stroke="rgba(4,2,0,0.97)"
                  strokeWidth="4"
                  strokeLinecap="round"
                />
              </motion.g>

              {/* Center pip */}
              <circle cx={cx} cy={cy} r={4} fill="rgba(8,4,1,0.75)" />
            </svg>

            {/* Celluloid light sheen */}
            <div style={{
              position: 'absolute', inset: 0, borderRadius: '50%', pointerEvents: 'none',
              background: 'radial-gradient(circle at 36% 30%, rgba(255,248,225,0.25), transparent 52%)',
            }} />

            {/* Film grain on circle */}
            <motion.div
              animate={{ opacity: [0.35, 0.55, 0.2, 0.4] }}
              transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
              style={{
                position: 'absolute', inset: 0, borderRadius: '50%', pointerEvents: 'none',
                backgroundImage: grainUrl(80, '0.88'),
                backgroundSize: '100px',
                mixBlendMode: 'multiply',
              }}
            />

            {/* Number — above line and SVG */}
            <div style={{
              position: 'absolute', inset: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              zIndex: 10,
            }}>
              <motion.span
                key={`num-${value}`}
                initial={{ opacity: 0, scale: 1.18 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.16, ease: 'easeOut' }}
                style={{
                  fontSize: `${9 * s}rem`,
                  fontWeight: 800,
                  color: 'rgba(18,10,2,0.82)',
                  lineHeight: 1,
                  letterSpacing: '0.01em',
                  marginTop: `${8 * s}px`,
                  textShadow: '1px 2px 4px rgba(255,242,205,0.5), -1px -1px 0 rgba(0,0,0,0.18)',
                }}
              >
                {displayValue}
              </motion.span>
            </div>
          </div>

          {/* Timecode */}
          <div style={{
            position: 'absolute', bottom: 10 * s,
            left: 0, right: 0, textAlign: 'center',
          }}>
            <span style={{
              fontSize: `${0.5 * s}rem`, fontFamily: 'monospace',
              letterSpacing: '0.4em', textTransform: 'uppercase',
              color: 'rgba(255,240,195,0.4)',
            }}>
              {timecode}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Navbar ────────────────────────────────────────────────────────────────────

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [projectorOn, setProjectorOn] = useState(false);
  const [menuStable, setMenuStable] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [flashing, setFlashing] = useState(false);
  const [warmingUp, setWarmingUp] = useState(false);
  const [reelScale, setReelScale] = useState(1);
  const isClient = typeof window !== 'undefined';
  const t1 = useRef<ReturnType<typeof setTimeout> | null>(null);
  const t2 = useRef<ReturnType<typeof setTimeout> | null>(null);
  const t3 = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (t1.current) clearTimeout(t1.current);
    if (t2.current) clearTimeout(t2.current);
    if (t3.current) clearTimeout(t3.current);
  }, []);

  useEffect(() => {
    if (!isClient) return;
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open, isClient]);

  useEffect(() => {
    if (!isClient) return;
    const update = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const isLandscape = w > h && h <= 500; // mobile landscape only

      // Height-based scale only — width is handled by keeping INSET_X fixed in CountdownReel
      const vertPad = isLandscape ? 48 : 104; // landscape pt-6+pb-6 | portrait pt-10+pb-16
      const footerH = isLandscape ? 120 : 80;  // stacked buttons need more vertical room
      setReelScale(Math.min(1, (h - vertPad - footerH) / (300 + 96)));
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, [isClient]);

  const resetAll = () => {
    if (t1.current) clearTimeout(t1.current);
    if (t2.current) clearTimeout(t2.current);
    if (t3.current) clearTimeout(t3.current);
    setProjectorOn(false);
    setMenuStable(false);
    setCountdown(null);
    setFlashing(false);
    setWarmingUp(false);
  };

  const handleOpen  = () => { resetAll(); setOpen(true); };
  const handleClose = () => { resetAll(); setOpen(false); };
  const handleSkip  = () => {
    if (t1.current) clearTimeout(t1.current);
    if (t2.current) clearTimeout(t2.current);
    if (t3.current) clearTimeout(t3.current);
    setFlashing(false);
    setWarmingUp(false);
    setCountdown(null);
    setProjectorOn(true);
  };

  useEffect(() => {
    if (countdown === null) return;
    const timer = window.setTimeout(() => {
      if (countdown <= 0) {
        // 1. Warm flash — end of leader tape
        setFlashing(true);
        t1.current = setTimeout(() => {
          setFlashing(false);
          // 2. Projector lamp flicker — blank film frames
          setWarmingUp(true);
          t2.current = setTimeout(() => {
            // 3. Menu locks in while warmup fades
            setProjectorOn(true);
            setCountdown(null);
            t3.current = setTimeout(() => setWarmingUp(false), 500);
          }, 740);
        }, 380);
      } else {
        setCountdown(countdown - 1);
      }
    }, 950);
    return () => window.clearTimeout(timer);
  }, [countdown]);

  return (
    <>
      <motion.nav
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="fixed top-0 left-0 w-full backdrop-blur-md bg-slate-900/40 border-b border-slate-800 z-50"
      >
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-10 py-4 flex justify-end">
          {!open && (
            <button
              type="button"
              onClick={handleOpen}
              className="flex items-center gap-2 rounded-full border border-slate-700 bg-slate-900/70 px-4 py-2 text-sm font-medium text-slate-200 shadow-lg shadow-slate-900/50 transition hover:border-indigo-400 hover:text-indigo-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-400"
            >
              Menu
              <ArrowIcon direction="down" />
            </button>
          )}
        </div>
      </motion.nav>

      {isClient && createPortal(
        <AnimatePresence>
          {open && (
            <motion.div
              key="projector"
              className="fixed inset-0 z-[999] bg-black"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {/* Projected screen — warm paper/cream */}
              <motion.div
                variants={screenVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                style={{ originY: 0 }}
                className="relative h-full w-full overflow-hidden bg-[#ede3c6] border-[18px] border-black/90 shadow-[0_50px_140px_rgba(0,0,0,0.9)]"
                onAnimationComplete={(definition) => {
                  if (definition === 'visible' && countdown === null && !projectorOn) {
                    setCountdown(COUNTDOWN_START);
                  }
                }}
              >
                {/* Film gate edge — top strip */}
                <div className="absolute inset-x-0 top-0 h-4 z-[2]"
                  style={{ background: '#e0d5b2', boxShadow: 'inset 0 -2px 4px rgba(0,0,0,0.15)' }} />
                <div className="absolute inset-x-0 top-4 z-[2]"
                  style={{ height: 5, background: 'rgba(0,0,0,0.75)' }} />

                {/* Vignette — projector beam falloff */}
                <div className="pointer-events-none absolute inset-0 z-[3]" style={{
                  background: 'radial-gradient(ellipse at center, transparent 32%, rgba(58,36,8,0.17) 66%, rgba(18,10,2,0.52) 100%)',
                }} />

                {/* Film grain — multiply on warm background */}
                <motion.div
                  variants={grainVariants}
                  animate="animate"
                  className="pointer-events-none absolute inset-0 z-[4]"
                  style={{
                    backgroundImage: grainUrl(180, '0.75'),
                    backgroundSize: '220px',
                    mixBlendMode: 'multiply',
                  }}
                />

                {/* Subtle screen flicker — projector lamp */}
                <motion.div
                  variants={flickerVariants}
                  animate="animate"
                  className="pointer-events-none absolute inset-0 z-[5]"
                  style={{ background: 'rgba(255,248,220,0.025)' }}
                />

                {/* Projector warmup — warm lamp flicker (blank film frames) */}
                <AnimatePresence>
                  {warmingUp && (
                    <motion.div
                      key="warmup"
                      initial={{ opacity: 0 }}
                      animate={warmupKeyframes}
                      exit={{ opacity: 0, transition: { duration: 0.45, ease: 'easeOut' } }}
                      className="pointer-events-none absolute inset-0"
                      style={{
                        zIndex: 20,
                        background: 'radial-gradient(ellipse at 50% 45%, #fff6e0 0%, #f5e8c0 55%, #e8d8a0 100%)',
                      }}
                    />
                  )}
                </AnimatePresence>

                {/* End-of-leader flash */}
                <AnimatePresence>
                  {flashing && (
                    <motion.div
                      key="flash"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: [0, 1, 0.9, 1, 0] }}
                      transition={{ duration: 0.38, times: [0, 0.1, 0.4, 0.6, 1] }}
                      className="pointer-events-none absolute inset-0"
                      style={{ zIndex: 21, background: '#fff8e8' }}
                    />
                  )}
                </AnimatePresence>

                {/* ── Main content area ── */}
                <div className="relative z-10 min-h-full flex flex-col items-center justify-center px-6 sm:px-10 pt-10 sm:pt-20 mobile-landscape:pt-6 pb-16 sm:pb-24 mobile-landscape:pb-6">

                  {/* Countdown reel — scaled down on narrow screens */}
                  {!projectorOn && !flashing && !warmingUp && countdown !== null && (
                    <motion.div
                      key={countdown}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.18 }}
                      className="relative w-full max-w-sm mobile-landscape:max-w-md"
                    >
                      <CountdownReel value={countdown} circleScale={reelScale} />
                    </motion.div>
                  )}

                  {/* Navigation menu */}
                  {projectorOn && (
                    <motion.div
                      variants={menuBlinkVariants}
                      initial="hidden"
                      animate={menuStable ? 'stable' : 'visible'}
                      onAnimationComplete={(definition) => {
                        if (definition === 'visible' && !menuStable) {
                          t1.current = setTimeout(() => setMenuStable(true), 100);
                        }
                      }}
                      className="relative w-full max-w-sm mobile-landscape:max-w-md"
                    >
                      <motion.div
                        animate={menuStable ? { opacity: [1, 0.98, 1, 0.99, 1] } : { opacity: 1 }}
                        transition={menuStable
                          ? { duration: 3, repeat: Infinity, ease: 'easeInOut' as const }
                          : undefined}
                        className="absolute -inset-x-8 -inset-y-8 sm:-inset-y-12 mobile-landscape:-inset-y-5 rounded-3xl border border-white/10"
                        style={{
                          background: 'linear-gradient(160deg, rgba(99,55,180,0.88) 0%, rgba(68,35,130,0.92) 50%, rgba(45,20,90,0.96) 100%)',
                          boxShadow: '0 0 70px rgba(100,50,200,0.4), inset 0 0 60px rgba(80,40,160,0.25)',
                        }}
                      />

                      <motion.ul
                        variants={listVariants}
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                        className="relative z-10"
                      >
                        {links.map((link) => (
                          <motion.li
                            key={link.name}
                            variants={itemVariants}
                            whileHover="hover"
                            initial="rest"
                          >
                            <Link
                              href={link.href}
                              onClick={handleClose}
                              className="relative block px-6 py-3 sm:py-4 mobile-landscape:py-2 overflow-hidden"
                              style={{
                                fontSize: 'clamp(1.2rem, 5vw, 1.75rem)',
                                fontWeight: 700,
                                letterSpacing: '0.12em',
                                textTransform: 'uppercase',
                                borderBottom: '1px solid rgba(255,255,255,0.1)',
                              }}
                            >
                              <motion.span
                                variants={{ rest: { width: 0 }, hover: { width: 'calc(100% - 3rem)' } }}
                                transition={{ duration: 0.25, ease: 'easeOut' }}
                                className="absolute bottom-0 left-6 h-[1px] bg-white"
                              />
                              <motion.span
                                variants={{
                                  rest: { color: 'rgba(255,255,255,0.88)' },
                                  hover: { color: 'rgb(165,180,252)' },
                                }}
                                transition={{ duration: 0.2 }}
                                className="relative block"
                              >
                                {link.name}
                              </motion.span>
                            </Link>
                          </motion.li>
                        ))}
                      </motion.ul>
                    </motion.div>
                  )}
                </div>

                {/* Line separator above buttons */}
                <div
                  className="absolute left-8 right-8 z-20 bottom-[4.5rem] mobile-landscape:bottom-[7rem]"
                  style={{ height: 1, background: 'linear-gradient(90deg, transparent, rgba(184,168,130,0.5) 15%, rgba(184,168,130,0.5) 85%, transparent)' }}
                />
                {/* Skip button — portrait: left of Close / mobile-landscape: above Close */}
                <AnimatePresence>
                  {countdown !== null && !projectorOn && (
                    <motion.div
                      key="skip"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute top-7 right-36 z-30"
                    >
                      <button
                        type="button"
                        onClick={handleSkip}
                        className="flex items-center gap-1 rounded-full border border-[#b8a882]/60 bg-[#2e2416]/60 px-4 py-2 text-sm font-semibold text-[#f5e8c8]/70 shadow-md shadow-black/30 transition hover:border-[#e8d090] hover:text-[#f5e090]"
                      >
                        Skip
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Close button — warm palette to match screen */}
                <div className="absolute bottom-7 right-8 z-30">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="flex items-center gap-1 rounded-full border border-[#b8a882] bg-[#2e2416]/85 px-5 py-2 text-sm font-semibold text-[#f5e8c8] shadow-md shadow-black/50 transition hover:border-[#e8d090] hover:text-[#f5e090] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#e8d090]"
                  >
                    Close
                    <ArrowIcon direction="up" />
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
}
