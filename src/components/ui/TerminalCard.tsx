'use client';
import { useEffect, useState, useRef } from 'react';
import { useInView } from 'framer-motion';
import Link from 'next/link';
import { toSlug, type SoftwareProject } from '@/data/projects';

// ── Typing hook ───────────────────────────────────────────────────────────────

function useTyping(text: string, speed = 28, active = true) {
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!active) return;
    setDisplayed('');
    setDone(false);
    let i = 0;
    const id = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) { clearInterval(id); setDone(true); }
    }, speed);
    return () => clearInterval(id);
  }, [text, speed, active]);

  return { displayed, done };
}

// ── Cursor ────────────────────────────────────────────────────────────────────

function Cursor({ visible }: { visible: boolean }) {
  const [on, setOn] = useState(true);
  useEffect(() => {
    const id = setInterval(() => setOn((v) => !v), 530);
    return () => clearInterval(id);
  }, []);
  if (!visible) return null;
  return <span className={on ? 'opacity-100' : 'opacity-0'}>▌</span>;
}

// ── Line component ────────────────────────────────────────────────────────────

function TermLine({
  prompt,
  text,
  speed = 28,
  active,
  onDone,
  color = 'text-green-400',
  prefix = '',
}: {
  prompt?: string;
  text: string;
  speed?: number;
  active: boolean;
  onDone?: () => void;
  color?: string;
  prefix?: string;
}) {
  const { displayed, done } = useTyping(text, speed, active);

  useEffect(() => {
    if (done && onDone) onDone();
  }, [done, onDone]);

  return (
    <div className="flex items-start gap-1 leading-relaxed min-h-[1.4rem]">
      {prompt && <span className="text-indigo-400 shrink-0 select-none">{prompt}</span>}
      {prefix  && <span className="text-slate-500 shrink-0 select-none">{prefix}</span>}
      <span className={color}>
        {active ? displayed : ''}
        <Cursor visible={active && !done} />
      </span>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

interface TerminalCardProps {
  project: SoftwareProject;
}

export default function TerminalCard({ project }: TerminalCardProps) {
  const ref  = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '0px 0px -60px 0px' });

  // Each "step" = one line finishing before the next starts
  const [step, setStep] = useState(0);
  const next = () => setStep((s) => s + 1);

  useEffect(() => {
    if (inView) setStep(1);
  }, [inView]);

  const slug       = toSlug(project.name);
  const techString = project.tech.join('  ');
  const hostname   = 'x-tray@vm';
  const dir        = `~/projects/${slug}`;

  return (
    <div
      ref={ref}
      className="h-full rounded-2xl overflow-hidden border border-slate-700/60 font-mono text-xs"
      style={{ background: '#0d1117' }}
    >
      {/* Title bar */}
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-slate-700/60"
        style={{ background: '#161b22' }}>
        <span className="w-3 h-3 rounded-full bg-red-500/80" />
        <span className="w-3 h-3 rounded-full bg-yellow-400/80" />
        <span className="w-3 h-3 rounded-full bg-green-500/80" />
        <span className="ml-3 text-slate-500 text-[11px]">{hostname}:{dir}</span>
      </div>

      {/* Terminal body */}
      <div className="p-4 space-y-1 min-h-[220px]">

        {/* Step 1: cat README */}
        {step >= 1 && (
          <TermLine prompt={`${hostname}:${dir}$`} text=" cat README.md"
            active={step === 1} onDone={next} />
        )}

        {/* Step 2: project name */}
        {step >= 2 && (
          <TermLine prefix="# " text={project.name}
            active={step === 2} onDone={next} color="text-slate-100" speed={22} />
        )}

        {/* Step 3: description */}
        {step >= 3 && (
          <TermLine text={project.description}
            active={step === 3} onDone={next} color="text-slate-400" speed={12} />
        )}

        {/* Step 4: ls tech */}
        {step >= 4 && (
          <>
            <div className="mt-2" />
            <TermLine prompt={`${hostname}:${dir}$`} text=" ls tech/"
              active={step === 4} onDone={next} />
          </>
        )}

        {/* Step 5: tech list */}
        {step >= 5 && (
          <TermLine text={techString}
            active={step === 5} onDone={next} color="text-cyan-400" speed={18} />
        )}

        {/* Step 6: git remote */}
        {step >= 6 && project.githubUrl && (
          <>
            <div className="mt-2" />
            <TermLine prompt={`${hostname}:${dir}$`} text=" git remote get-url origin"
              active={step === 6} onDone={next} />
          </>
        )}

        {/* Step 7: repo URL + links */}
        {step >= 7 && project.githubUrl && (
          <div className="flex items-center gap-1">
            <span className="text-green-400">{project.githubUrl}</span>
            <Cursor visible={false} />
          </div>
        )}

        {/* Links */}
        {step >= 7 && (
          <div className="flex flex-wrap items-center gap-3 pt-3 mt-1 border-t border-slate-700/40">
            {project.githubUrl && (
              <Link href={project.githubUrl} target="_blank" rel="noopener noreferrer"
                className="text-indigo-400 hover:text-indigo-300 transition">
                → GitHub
              </Link>
            )}
            {project.demoUrl && (
              <Link href={project.demoUrl} target="_blank" rel="noopener noreferrer"
                className="text-green-400 hover:text-green-300 transition">
                → Live Demo
              </Link>
            )}
            {project.gitpodUrl && (
              <Link
                href={project.gitpodUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold
                           bg-green-500/15 border border-green-500/40 text-green-400
                           hover:bg-green-500/25 hover:border-green-400/60 transition-all"
              >
                <span className="inline-block w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                Boot Project
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
