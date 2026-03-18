'use client';
import { useState } from 'react';
import BlurText from '@/components/ui/BlurText';
import ScrollReveal from '@/components/ui/ScrollReveal';

// ── Replace with your actual details ─────────────────────────────────────────
const EMAIL   = 'your@email.com';        // TODO: replace
const TWITTER = 'https://x.com/X_Tray0'; // TODO: replace with your X URL
// Sign up at https://formspree.io and replace the form ID below
const FORMSPREE_URL = 'https://formspree.io/f/REPLACE_ME';
// ─────────────────────────────────────────────────────────────────────────────

export default function ContactPage() {
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [copied, setCopied] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus('sending');
    const form = e.currentTarget;
    const data = new FormData(form);

    try {
      const res = await fetch(FORMSPREE_URL, {
        method: 'POST',
        body: data,
        headers: { Accept: 'application/json' },
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
    <main className="min-h-screen pt-28 pb-24 px-4 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-5xl">

        {/* Heading */}
        <BlurText
          text="Let's Talk"
          className="text-5xl sm:text-6xl font-bold text-slate-100 mb-3"
          delay={60}
        />
        <ScrollReveal delay={0.15}>
          <p className="text-slate-400 text-lg max-w-xl mb-12">
            Available for audits, consulting, and collaborations. Reach out and
            I&apos;ll get back to you within 24 hours.
          </p>
        </ScrollReveal>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-10">

          {/* ── Contact form ── */}
          <ScrollReveal direction="left">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1.5">Name</label>
                  <input
                    name="name"
                    type="text"
                    required
                    placeholder="Satoshi Nakamoto"
                    className="w-full rounded-xl border border-slate-700 bg-slate-900/60 px-4 py-3 text-slate-100 placeholder-slate-600 text-sm focus:outline-none focus:border-indigo-500 transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1.5">Email</label>
                  <input
                    name="email"
                    type="email"
                    required
                    placeholder="satoshi@bitcoin.org"
                    className="w-full rounded-xl border border-slate-700 bg-slate-900/60 px-4 py-3 text-slate-100 placeholder-slate-600 text-sm focus:outline-none focus:border-indigo-500 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1.5">Subject</label>
                <input
                  name="subject"
                  type="text"
                  placeholder="Smart contract audit request"
                  className="w-full rounded-xl border border-slate-700 bg-slate-900/60 px-4 py-3 text-slate-100 placeholder-slate-600 text-sm focus:outline-none focus:border-indigo-500 transition"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1.5">Message</label>
                <textarea
                  name="message"
                  required
                  rows={6}
                  placeholder="Tell me about your project, timeline, and what kind of help you need..."
                  className="w-full rounded-xl border border-slate-700 bg-slate-900/60 px-4 py-3 text-slate-100 placeholder-slate-600 text-sm focus:outline-none focus:border-indigo-500 transition resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={status === 'sending' || status === 'sent'}
                className="w-full sm:w-auto rounded-xl px-8 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed transition text-sm font-semibold text-white shadow-lg shadow-indigo-900/40"
              >
                {status === 'sending' ? 'Sending…' : status === 'sent' ? '✓ Message sent!' : 'Send Message'}
              </button>

              {status === 'error' && (
                <p className="text-red-400 text-sm">
                  Something went wrong. Please email me directly instead.
                </p>
              )}

              {FORMSPREE_URL.includes('REPLACE_ME') && (
                <p className="text-amber-400/70 text-xs">
                  ⚠ Contact form not yet configured. Set up Formspree at{' '}
                  <a href="https://formspree.io" target="_blank" rel="noopener noreferrer" className="underline">
                    formspree.io
                  </a>{' '}
                  and replace the URL in <code>src/app/contact/page.tsx</code>.
                </p>
              )}
            </form>
          </ScrollReveal>

          {/* ── Contact info sidebar ── */}
          <ScrollReveal direction="right" delay={0.1}>
            <div className="space-y-4">

              {/* Email card */}
              <div className="rounded-2xl border border-slate-700/60 bg-slate-900/60 p-5">
                <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-2">Email</p>
                <button
                  onClick={copyEmail}
                  className="flex items-center gap-2 text-slate-200 hover:text-indigo-300 transition group"
                >
                  <span className="text-sm font-medium">{EMAIL}</span>
                  <span className="text-xs text-slate-500 group-hover:text-indigo-400 transition">
                    {copied ? '✓ Copied' : 'Copy'}
                  </span>
                </button>
              </div>

              {/* Twitter card */}
              <a
                href={TWITTER}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 rounded-2xl border border-slate-700/60 bg-slate-900/60 p-5 hover:border-slate-500 hover:bg-slate-800/60 transition group"
              >
                <svg className="w-5 h-5 text-slate-400 group-hover:text-slate-200 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.26 5.632 5.905-5.632zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-0.5">Twitter / X</p>
                  <p className="text-sm text-slate-300 group-hover:text-slate-100 transition">@X_Tray0</p>
                </div>
              </a>

              {/* Availability note */}
              <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5">
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <p className="text-xs font-semibold text-emerald-400">Available for work</p>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Currently taking on new audit and consulting engagements.
                  Response time: &lt; 24 hours.
                </p>
              </div>

            </div>
          </ScrollReveal>
        </div>
      </div>
    </main>
  );
}
