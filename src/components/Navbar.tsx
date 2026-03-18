'use client';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';

const links = [
  { name: 'Home',        href: '/'            },
  { name: 'My Projects', href: '/my-projects' },
  { name: 'Services',    href: '/#services'   },
  { name: 'Contact',     href: '/#contact'    },
];

const MENU_W = 240;
const MENU_H = 260;
const RAIN_MS = 1000;
const FONT_SIZE = 14;
const CHARS = '01';

function MenuPortal({ onClose }: { onClose: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [done, setDone] = useState(false);
  const progress = useMotionValue(0);
  const clipBottom = useTransform(progress, [0, 1], ['100%', '0%']);
  const clipPath = useTransform(clipBottom, v => `inset(0 0 ${v} 0 round 12px)`);
  const canvasOpacity = useTransform(progress, [0.7, 1], [1, 0]);

  // Matrix rain — drives progress in real time
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    const cols = Math.floor(MENU_W / FONT_SIZE);
    const rows = Math.floor(MENU_H / FONT_SIZE);
    const drops = Array.from({ length: cols }, () => Math.floor(Math.random() * -rows * 0.4));
    let start: number | null = null;
    let raf = 0;
    let lastFrame = 0;

    const tick = (ts: number) => {
      if (!start) start = ts;
      const elapsed = ts - start;
      const t = Math.min(elapsed / RAIN_MS, 1);

      progress.set(t);

      if (t >= 1) {
        setDone(true);
        return;
      }

      if (ts - lastFrame < 50) {
        raf = requestAnimationFrame(tick);
        return;
      }
      lastFrame = ts;

      ctx.fillStyle = 'rgba(0,0,0,0.18)';
      ctx.fillRect(0, 0, MENU_W, MENU_H);
      ctx.font = `bold ${FONT_SIZE}px monospace`;

      for (let i = 0; i < cols; i++) {
        const char = CHARS[Math.floor(Math.random() * CHARS.length)];
        const x = i * FONT_SIZE;
        const y = drops[i] * FONT_SIZE;

        ctx.globalAlpha = 1;
        ctx.fillStyle = '#ccffcc';
        ctx.fillText(char, x, y);

        ctx.fillStyle = '#00ff41';
        for (let tr = 1; tr < 6; tr++) {
          ctx.globalAlpha = 1 - tr / 6;
          ctx.fillText(CHARS[Math.floor(Math.random() * CHARS.length)], x, y - tr * FONT_SIZE);
        }
        ctx.globalAlpha = 1;

        drops[i]++;
        if (drops[i] * FONT_SIZE > MENU_H && Math.random() > 0.7) {
          drops[i] = Math.floor(Math.random() * -rows * 0.3);
        }
      }

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [progress]);

  return createPortal(
    <div
      id="matrix-menu"
      style={{ position: 'absolute', top: 58, right: 16, width: MENU_W, zIndex: 9999 }}
    >
      {/* Menu — revealed in sync with rain via clipPath */}
      <motion.div
        style={{
          clipPath,
          background: 'rgba(0, 10, 2, 0.96)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          border: '1px solid rgba(0, 255, 65, 0.3)',
          borderRadius: 8,
          padding: '8px 0 10px',
          boxShadow: '0 0 18px rgba(0,255,65,0.08), inset 0 0 30px rgba(0,255,65,0.03)',
          position: 'relative',
          fontFamily: 'monospace',
        }}
      >
        {/* Header bar */}
        <div style={{
          padding: '4px 14px 8px',
          borderBottom: '1px solid rgba(0,255,65,0.15)',
          marginBottom: 4,
          display: 'flex',
          alignItems: 'center',
          gap: 6,
        }}>
          <span style={{ color: '#00ff41', fontSize: 10, opacity: 0.6 }}>◉</span>
          <span style={{ color: '#00ff41', fontSize: 10, opacity: 0.5, letterSpacing: '0.1em' }}>NAV_SYSTEM</span>
        </div>

        {links.map((link, i) => (
          <motion.div
            key={link.href}
            initial={{ opacity: 0, x: -6 }}
            animate={done ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: i * 0.08, duration: 0.18 }}
          >
            <Link
              href={link.href}
              onClick={onClose}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '8px 14px',
                color: '#00cc33',
                fontSize: 13,
                fontWeight: 400,
                letterSpacing: '0.05em',
                textDecoration: 'none',
                transition: 'color 0.1s, background 0.1s',
                fontFamily: 'monospace',
              }}
              onMouseEnter={e => {
                const el = e.currentTarget as HTMLElement;
                el.style.color = '#00ff41';
                el.style.background = 'rgba(0,255,65,0.07)';
                const prefix = el.querySelector('.prefix') as HTMLElement;
                if (prefix) prefix.style.opacity = '1';
              }}
              onMouseLeave={e => {
                const el = e.currentTarget as HTMLElement;
                el.style.color = '#00cc33';
                el.style.background = 'transparent';
                const prefix = el.querySelector('.prefix') as HTMLElement;
                if (prefix) prefix.style.opacity = '0.3';
              }}
            >
              <span className="prefix" style={{ opacity: 0.3, transition: 'opacity 0.1s', minWidth: 12 }}>{'>'}</span>
              {link.name}
            </Link>
          </motion.div>
        ))}

        {/* Blinking cursor at bottom */}
        {done && (
          <motion.div
            style={{ padding: '4px 14px 0', display: 'flex', alignItems: 'center', gap: 4 }}
          >
            <span style={{ color: '#00ff41', fontSize: 10, opacity: 0.4, fontFamily: 'monospace' }}>_</span>
            <motion.span
              animate={{ opacity: [1, 0, 1] }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              style={{ display: 'inline-block', width: 7, height: 13, background: '#00ff41', opacity: 0.5 }}
            />
          </motion.div>
        )}
      </motion.div>

      {/* Canvas on top, fades out as rain completes */}
      {!done && (
        <motion.canvas
          ref={canvasRef}
          width={MENU_W}
          height={MENU_H}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            borderRadius: 12,
            opacity: canvasOpacity,
            pointerEvents: 'none',
          }}
        />
      )}
    </div>,
    document.body,
  );
}

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const openRef = useRef(false);

  // Keep ref in sync with state
  useEffect(() => {
    openRef.current = open;
  }, [open]);

  // Outside-click handler lives here — stable, never re-created
  useEffect(() => {
    const handler = (e: MouseEvent | TouchEvent) => {
      if (!openRef.current) return;
      const target = 'touches' in e ? e.touches[0]?.target : (e as MouseEvent).target;
      const menu = document.getElementById('matrix-menu');
      const btn = document.getElementById('nav-menu-btn');
      // Ignore clicks on the button itself — the button's onClick handles that
      if (btn && btn.contains(target as Node)) return;
      // Close if click was outside the menu
      if (menu && !menu.contains(target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler as EventListener);
    document.addEventListener('touchstart', handler as EventListener);
    return () => {
      document.removeEventListener('mousedown', handler as EventListener);
      document.removeEventListener('touchstart', handler as EventListener);
    };
  }, []); // empty deps — registers once, reads openRef via ref

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-end px-8 py-3 md:px-24 bg-slate-950/60 backdrop-blur-md border-b border-slate-800/50">
        <button
          id="nav-menu-btn"
          onClick={() => setOpen(o => !o)}
          className="flex items-center gap-2 rounded-full border border-slate-700 bg-slate-900/40 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-slate-500 hover:bg-slate-800/60"
        >
          Menu
          <motion.svg
            animate={{ rotate: open ? 180 : 0 }}
            transition={{ duration: 0.25 }}
            width="12" height="12" viewBox="0 0 12 12" fill="none"
          >
            <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </motion.svg>
        </button>
      </nav>

      <AnimatePresence>
        {open && <MenuPortal onClose={() => setOpen(false)} />}
      </AnimatePresence>
    </>
  );
}
