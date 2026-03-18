'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import confetti from 'canvas-confetti';
import Typewriter from '@/components/Typewriter';
import CyclingTypewriter from '@/components/CyclingTypewriter';
import ProfileCoin from '@/components/ProfileCoin';
import ScrollReveal from '@/components/ui/ScrollReveal';
import GradientText from '@/components/ui/GradientText';
import TiltedCard from '@/components/ui/TiltedCard';
import { services } from '@/data/services';

// ── Config — update with your real info ───────────────────────────────────────

const EMAIL   = 'adv.t.marinov@gmail.com';
const TWITTER = 'https://x.com/XTray00';

const skills = [
  // Languages & runtimes
  'TypeScript', 'JavaScript', 'Python', 'Solidity', 'Rust', 'Go', 'C++', 'Java',
  // Frontend & mobile
  'React', 'Next.js', 'React Native', 'Tailwind CSS',
  // Backend & databases
  'Node.js', 'PostgreSQL', 'Docker',
  // Blockchain
  'EVM', 'Foundry', 'Hardhat', 'ethers.js', 'Web3.js',
  // Security
  'Penetration Testing', 'OWASP', 'Slither', 'Linux', 'macOS', 'Active Directory',
];

const stats = [
  { label: 'C4 Leaderboard',        value: '#261' },
  { label: 'Vulnerabilities Found', value: '4'    },
  { label: 'Best Contest Rank',     value: '#6'   },
];

// ── Divider ───────────────────────────────────────────────────────────────────

function SectionDivider() {
  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-10">
      <div className="h-px bg-gradient-to-r from-transparent via-slate-700/60 to-transparent" />
    </div>
  );
}

// ── Contact form (self-contained) ─────────────────────────────────────────────

function ContactForm() {
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (status !== 'sent') return;
    const end = Date.now() + 1500;
    const frame = () => {
      confetti({ particleCount: 4, angle: 60,  spread: 65, origin: { x: 0, y: 1 }, colors: ['#6366f1', '#818cf8', '#a5b4fc', '#f59e0b', '#34d399'] });
      confetti({ particleCount: 4, angle: 120, spread: 65, origin: { x: 1, y: 1 }, colors: ['#6366f1', '#818cf8', '#a5b4fc', '#f59e0b', '#34d399'] });
      if (Date.now() < end) requestAnimationFrame(frame);
    };
    frame();
  }, [status]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus('sending');
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form));
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) { setStatus('sent'); form.reset(); }
      else        { setStatus('error'); }
    } catch {
      setStatus('error');
    }
  }

  function copyEmail() {
    navigator.clipboard.writeText(EMAIL);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-10">
      {/* Form */}
      <ScrollReveal direction="left">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1.5">Name</label>
              <input name="name" type="text" required placeholder="Satoshi Nakamoto"
                className="w-full rounded-xl border border-slate-700 bg-slate-900/60 px-4 py-3 text-slate-100 placeholder-slate-600 text-sm focus:outline-none focus:border-indigo-500 transition" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1.5">Email</label>
              <input name="email" type="email" required placeholder="satoshi@bitcoin.org"
                className="w-full rounded-xl border border-slate-700 bg-slate-900/60 px-4 py-3 text-slate-100 placeholder-slate-600 text-sm focus:outline-none focus:border-indigo-500 transition" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1.5">Subject</label>
            <input name="subject" type="text" placeholder="Smart contract audit request"
              className="w-full rounded-xl border border-slate-700 bg-slate-900/60 px-4 py-3 text-slate-100 placeholder-slate-600 text-sm focus:outline-none focus:border-indigo-500 transition" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1.5">Message</label>
            <textarea name="message" required rows={5}
              placeholder="Tell me about your project, timeline, and what kind of help you need..."
              className="w-full rounded-xl border border-slate-700 bg-slate-900/60 px-4 py-3 text-slate-100 placeholder-slate-600 text-sm focus:outline-none focus:border-indigo-500 transition resize-none" />
          </div>
          <button type="submit"
            disabled={status === 'sending' || status === 'sent'}
            className="rounded-xl px-8 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed transition text-sm font-semibold text-white shadow-lg shadow-indigo-900/40">
            {status === 'sending' ? 'Sending…' : status === 'sent' ? '✓ Sent!' : 'Send Message'}
          </button>
          {status === 'error' && (
            <p className="text-red-400 text-sm">Something went wrong — email me directly instead.</p>
          )}
        </form>
      </ScrollReveal>

      {/* Sidebar */}
      <ScrollReveal direction="right" delay={0.1}>
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-700/60 bg-slate-900/60 p-5">
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-2">Email</p>
            <button onClick={copyEmail}
              className="flex items-center gap-2 text-slate-200 hover:text-indigo-300 transition group">
              <span className="text-sm font-medium">{EMAIL}</span>
              <span className="text-xs text-slate-500 group-hover:text-indigo-400 transition">
                {copied ? '✓ Copied' : 'Copy'}
              </span>
            </button>
          </div>

          <a href={TWITTER} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-3 rounded-2xl border border-slate-700/60 bg-slate-900/60 p-5 hover:border-slate-500 hover:bg-slate-800/60 transition group">
            <svg className="w-5 h-5 text-slate-400 group-hover:text-slate-200 shrink-0" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.26 5.632 5.905-5.632zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-0.5">Twitter / X</p>
              <p className="text-sm text-slate-300 group-hover:text-slate-100 transition">@XTray00</p>
            </div>
          </a>

          <a href="https://github.com/X-Tray00" target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-3 rounded-2xl border border-slate-700/60 bg-slate-900/60 p-5 hover:border-slate-500 hover:bg-slate-800/60 transition group">
            <svg className="w-5 h-5 text-slate-400 group-hover:text-slate-200 shrink-0" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
            </svg>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-0.5">GitHub</p>
              <p className="text-sm text-slate-300 group-hover:text-slate-100 transition">X-Tray00</p>
            </div>
          </a>


          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5">
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <p className="text-xs font-semibold text-emerald-400">Available for work</p>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Taking on new audits and consulting engagements. Response time: &lt;24h.
            </p>
          </div>
        </div>
      </ScrollReveal>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function Home() {
  const [firstDone,    setFirstDone]    = useState(false);
  const [subtitleDone, setSubtitleDone] = useState(false);
  const [coinSize, setCoinSize] = useState(280);

  const line1 = 'Hi, my name is Trayan Marinov';
  const line2 = '(also known as X-Tray)';
  const roles = [
    'a Web3 Security Researcher',
    'a Mathematics & Cognitive Psychology Enthusiast',
    'sometimes a Software Developer',
    'interested in Cybersecurity',
    'also rethinking my life choices at 3AM in the morning',
  ];

  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      setCoinSize(w < 480 ? 200 : w < 768 ? 230 : w < 1280 ? 270 : 320);
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  return (
    <main className="min-h-screen overflow-x-hidden">

      {/* ── Hero ───────────────────────────────────────────────────────────── */}
      <header className="mx-auto flex flex-col-reverse items-center gap-6 sm:gap-10 lg:gap-14 px-4 pt-24 sm:pt-32 text-center sm:px-6 md:pt-40 lg:max-w-6xl lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-center lg:text-left">
        <div className="w-full max-w-3xl">
          <Typewriter
            text={line1} speed={100} start={!firstDone}
            onDone={() => setFirstDone(true)}
            className="block text-4xl sm:text-5xl md:text-6xl font-semibold tracking-tight leading-tight"
          />
          <div className="mt-3">
            <Typewriter
              text={line2} speed={90} start={firstDone}
              onDone={() => setSubtitleDone(true)}
              className="block text-lg sm:text-xl text-slate-400"
            />
          </div>

          {subtitleDone && (
            <motion.div
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mt-6 text-base sm:text-lg md:text-xl text-slate-300"
            >
              I&apos;m{' '}
              <CyclingTypewriter phrases={roles} className="font-medium"
                typingSpeed={110} deletingSpeed={60} pauseBetween={1000} />
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="mt-8 flex flex-wrap justify-center gap-4 sm:justify-start"
          >
            <Link href="/my-projects"
              className="rounded-xl px-6 py-3 bg-indigo-600 hover:bg-indigo-500 transition text-base font-semibold shadow-lg shadow-indigo-900/40">
              View My Work
            </Link>
            <button
              onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
              className="rounded-xl px-6 py-3 border border-slate-700 hover:border-slate-600 transition text-base font-semibold">
              Contact Me
            </button>
          </motion.div>
        </div>

        <div className="relative w-full" style={{ minHeight: coinSize }}>
          <div className="absolute inset-x-0 top-0 lg:-top-12 flex justify-center lg:justify-end lg:-right-12">
            <ProfileCoin
              size={coinSize}
              thickness={Math.round(coinSize / 11)}
              slices={64}
              src="/profile.jpg"
            />
          </div>
        </div>
      </header>

      {/* ── About ──────────────────────────────────────────────────────────── */}
      <section id="about" className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-10 pt-32 pb-24">
        <ScrollReveal>
          <p className="text-xs font-semibold uppercase tracking-widest text-indigo-400 mb-4">About Me</p>
        </ScrollReveal>
        <ScrollReveal delay={0.05}>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-100 mb-6 leading-snug max-w-2xl">
            Developer with a habit of{' '}
            <GradientText className="font-bold" colors={['#818cf8', '#c084fc', '#38bdf8', '#818cf8']}>
              taking things apart
            </GradientText>
          </h2>
        </ScrollReveal>
        <ScrollReveal delay={0.1}>
          <div className="text-slate-400 text-lg leading-relaxed max-w-2xl mb-12 space-y-4">
            <p>
              I&apos;m a developer who enjoys building software, analyzing systems, and occasionally
              discovering creative ways how things can break. Most of my interests revolve around
              cybersecurity, blockchain technology, and experimenting with unusual ideas in software.
            </p>
            <p>
              I&apos;m naturally curious about how systems work under the hood. If something looks
              complicated, my first instinct is usually to take it apart and see what happens.
              Sometimes that leads to useful projects. Sometimes it just confirms that computers
              are held together by duct tape and optimism.
            </p>
            <p>
              Personality-wise, I&apos;m an ENTP. In practical terms this means I
              like ideas, debates, experimentation, and occasionally questioning how things are
              supposed to work. Outside of coding I tend to wander into topics like psychology,
              philosophy, and the future of intelligent systems.
            </p>
            <p>
              At the end of the day, I just enjoy learning new things, building projects, and
              figuring out how complex systems behave when nobody is watching.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-3 gap-3 sm:gap-6 mb-14 max-w-lg">
          {stats.map((s, i) => (
            <ScrollReveal key={s.label} delay={i * 0.08}>
              <div>
                <p className="text-2xl sm:text-3xl font-bold text-slate-100">{s.value}</p>
                <p className="text-xs text-slate-500 mt-1">{s.label}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>

        <ScrollReveal delay={0.1}>
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-4">
            Technologies &amp; Tools
          </p>
        </ScrollReveal>
        <div className="flex flex-wrap gap-2">
          {skills.map((skill, i) => (
            <ScrollReveal key={skill} delay={i * 0.03} direction="none">
              <span className="px-3 py-1.5 rounded-full text-sm border border-slate-700 text-slate-300 bg-slate-900/40 hover:border-indigo-500/60 hover:text-indigo-300 transition cursor-default">
                {skill}
              </span>
            </ScrollReveal>
          ))}
        </div>
      </section>

      <SectionDivider />

      {/* ── Services ───────────────────────────────────────────────────────── */}
      <section id="services" className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-10 pt-24 pb-24">
        <ScrollReveal>
          <p className="text-xs font-semibold uppercase tracking-widest text-indigo-400 mb-4">Services</p>
        </ScrollReveal>
        <ScrollReveal delay={0.05}>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-100 mb-3 leading-snug">
            What I can do for you
          </h2>
        </ScrollReveal>
        <ScrollReveal delay={0.1}>
          <p className="text-slate-400 text-lg max-w-xl mb-12">
            Security-first work across the full Web3 stack.
          </p>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {services.map((service, i) => (
            <ScrollReveal key={service.id} delay={i * 0.08} direction="up">
              <TiltedCard className="h-full" rotateAmplitude={5}>
                <div className="flex flex-col h-full p-7 rounded-2xl border border-slate-700/60 bg-slate-900/70 backdrop-blur-sm">
                  <div className="text-4xl mb-4">{service.icon}</div>
                  <h3 className="text-xl font-bold text-slate-100 mb-3">{service.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed mb-5">{service.description}</p>
                  <ul className="space-y-2 mb-6 flex-1">
                    {service.includes.map((item) => (
                      <li key={item} className="flex items-start gap-2 text-sm text-slate-300">
                        <span className="mt-0.5 text-indigo-400 shrink-0">✓</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
                    className="mt-auto inline-flex items-center justify-center gap-2 rounded-xl border border-indigo-500/60 bg-indigo-600/20 px-5 py-2.5 text-sm font-semibold text-indigo-300 transition hover:bg-indigo-600/40 hover:border-indigo-400 hover:text-indigo-200">
                    {service.cta} →
                  </button>
                </div>
              </TiltedCard>
            </ScrollReveal>
          ))}
        </div>
      </section>

      <SectionDivider />

      {/* ── Contact ────────────────────────────────────────────────────────── */}
      <section id="contact" className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-10 pt-24 pb-32">
        <ScrollReveal>
          <p className="text-xs font-semibold uppercase tracking-widest text-indigo-400 mb-4">Contact</p>
        </ScrollReveal>
        <ScrollReveal delay={0.05}>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-100 mb-3 leading-snug">
            Let&apos;s Talk
          </h2>
        </ScrollReveal>
        <ScrollReveal delay={0.1}>
          <p className="text-slate-400 text-lg max-w-xl mb-12">
            Available for audits, consulting, and collaborations. I&apos;ll get back to
            you within 24 hours.
          </p>
        </ScrollReveal>

        <ContactForm />
      </section>

    </main>
  );
}
