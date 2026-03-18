'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import BlurText from '@/components/ui/BlurText';
import ScrollReveal from '@/components/ui/ScrollReveal';
import TiltedCard from '@/components/ui/TiltedCard';
import ProtocolCoin from '@/components/ui/ProtocolCoin';
import { projects, toSlug, type ProjectEntry, type AuditEntry, type BugBountyEntry, type SoftwareProject } from '@/data/projects';

// ── Platform config ───────────────────────────────────────────────────────────

const platformConfig = {
  code4rena: { label: 'Code4rena', color: '#7c3aed', bg: 'rgba(124,58,237,0.15)', border: 'rgba(124,58,237,0.4)' },
  sherlock:  { label: 'Sherlock',  color: '#2563eb', bg: 'rgba(37,99,235,0.15)',   border: 'rgba(37,99,235,0.4)'  },
  cantina:   { label: 'Cantina',   color: '#0d9488', bg: 'rgba(13,148,136,0.15)',  border: 'rgba(13,148,136,0.4)' },
  private:   { label: 'Private',   color: '#6b7280', bg: 'rgba(107,114,128,0.15)', border: 'rgba(107,114,128,0.4)' },
};

const severityConfig = {
  critical: { label: 'Critical', color: '#ef4444', dot: '🔴' },
  high:     { label: 'High',     color: '#f97316', dot: '🟠' },
  medium:   { label: 'Medium',   color: '#eab308', dot: '🟡' },
  low:      { label: 'Low',      color: '#22c55e', dot: '🟢' },
};

// ── Sub-cards ────────────────────────────────────────────────────────────────

function AuditCard({ entry }: { entry: AuditEntry }) {
  const platform = platformConfig[entry.platform];
  const date = new Date(entry.date + '-01').toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

  return (
    <Link href={`/audits/${toSlug(entry.protocol)}`} className="flex flex-col h-full p-5 rounded-2xl border border-slate-700/60 bg-slate-900/70 backdrop-blur-sm hover:border-slate-600 transition-colors cursor-pointer">
      {/* Header */}
      <div className="flex items-center gap-3 mb-3">
        <ProtocolCoin src={entry.logoUrl} name={entry.protocol} size={44} />
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-semibold text-slate-100 leading-snug mb-1 truncate">{entry.protocol}</h3>
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className="text-xs font-semibold px-2 py-0.5 rounded-full"
              style={{ color: platform.color, background: platform.bg, border: `1px solid ${platform.border}` }}
            >
              {platform.label}
            </span>
            <span className="text-xs text-slate-500">{date}</span>
          </div>
        </div>
      </div>

      {/* Description */}
      {entry.description && <p className="text-sm text-slate-400 mb-3 flex-1">{entry.description}</p>}

      {/* Tags */}
      {entry.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {entry.tags.map((tag) => (
            <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Findings */}
      <div className="flex items-center gap-3 text-sm mb-3">
        {entry.findings.high   > 0 && <span>🟠 <span className="text-slate-300">{entry.findings.high}H</span></span>}
        {entry.findings.medium > 0 && <span>🟡 <span className="text-slate-300">{entry.findings.medium}M</span></span>}
        {entry.findings.low    > 0 && <span>🟢 <span className="text-slate-300">{entry.findings.low}L</span></span>}
        {entry.findings.high === 0 && entry.findings.medium === 0 && entry.findings.low === 0 && (
          <span className="text-slate-500 text-xs">No public findings</span>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between mt-auto pt-3 border-t border-slate-700/50">
        {entry.rank && <span className="text-xs text-slate-500">{entry.rank}</span>}
        {entry.reportUrl ? (
          <Link
            href={entry.reportUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-medium text-indigo-400 hover:text-indigo-300 transition ml-auto"
          >
            View Report →
          </Link>
        ) : (
          <span className="text-xs text-slate-600 ml-auto">Report pending</span>
        )}
      </div>
    </Link>
  );
}


function BugBountyCard({ entry }: { entry: BugBountyEntry }) {
  const sev = severityConfig[entry.severity];
  const date = new Date(entry.date + '-01').toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

  return (
    <div className="flex flex-col h-full p-5 rounded-2xl border border-slate-700/60 bg-slate-900/70 backdrop-blur-sm">
      <div className="flex items-start justify-between gap-3 mb-3">
        <span
          className="text-xs font-semibold px-2.5 py-1 rounded-full border"
          style={{ color: sev.color, background: `${sev.color}18`, borderColor: `${sev.color}55` }}
        >
          {sev.dot} {sev.label}
        </span>
        <span className="text-xs text-slate-500 shrink-0">{date}</span>
      </div>

      <h3 className="text-lg font-semibold text-slate-100 mb-1">{entry.protocol}</h3>
      <p className="text-xs text-slate-500 mb-3">{entry.platform}</p>
      {entry.description && <p className="text-sm text-slate-400 flex-1 mb-3">{entry.description}</p>}

      {entry.reportUrl && (
        <div className="mt-auto pt-3 border-t border-slate-700/50">
          <Link href={entry.reportUrl} target="_blank" rel="noopener noreferrer"
            className="text-xs font-medium text-indigo-400 hover:text-indigo-300 transition">
            View Report →
          </Link>
        </div>
      )}
    </div>
  );
}

function SoftwareCard({ entry }: { entry: SoftwareProject }) {
  return (
    <div className="flex flex-col h-full p-5 rounded-2xl border border-slate-700/60 bg-slate-900/70 backdrop-blur-sm">
      <div className="mb-3">
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full"
          style={{ color: '#6366f1', background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.4)' }}>
          Software
        </span>
      </div>

      <h3 className="text-lg font-semibold text-slate-100 mb-2 leading-snug">{entry.name}</h3>
      <p className="text-sm text-slate-400 mb-3 flex-1">{entry.description}</p>

      {entry.tech.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {entry.tech.map((t) => (
            <span key={t} className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
              {t}
            </span>
          ))}
        </div>
      )}

      {entry.githubUrl && (
        <div className="mt-auto pt-3 border-t border-slate-700/50">
          <Link href={entry.githubUrl} target="_blank" rel="noopener noreferrer"
            className="text-xs font-medium text-indigo-400 hover:text-indigo-300 transition">
            View on GitHub →
          </Link>
        </div>
      )}
    </div>
  );
}

// ── Filter config ────────────────────────────────────────────────────────────

type Filter = 'all' | 'audit' | 'software' | 'bugbounty';

const filters: { id: Filter; label: string }[] = [
  { id: 'all',       label: 'All'         },
  { id: 'audit',     label: 'Web3 Audits' },
  { id: 'software',  label: 'Software'    },
  { id: 'bugbounty', label: 'Bug Bounty'  },
];

// ── Page ─────────────────────────────────────────────────────────────────────

export default function MyProjectsPage() {
  const [activeFilter, setActiveFilter] = useState<Filter>('all');

  const filtered: ProjectEntry[] = activeFilter === 'all'
    ? projects
    : projects.filter((p) => p.type === activeFilter);

  const isEmpty = filtered.length === 0;

  return (
    <main className="min-h-screen pt-28 pb-24 px-4 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-6xl">

        {/* Heading */}
        <BlurText
          text="My Work"
          className="text-5xl sm:text-6xl font-bold text-slate-100 mb-3"
          delay={60}
        />
        <ScrollReveal delay={0.15}>
          <p className="text-slate-400 text-lg max-w-xl mb-10">
            Smart contract audits, software projects, and bug bounty findings.
          </p>
        </ScrollReveal>

        {/* Filter bar */}
        <ScrollReveal delay={0.25}>
          <div className="flex flex-wrap gap-2 mb-10">
            {filters.map(({ id, label }) => (
              <button
                key={id}
                onClick={() => setActiveFilter(id)}
                className={[
                  'px-4 py-2 rounded-full text-sm font-medium transition border',
                  activeFilter === id
                    ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-900/40'
                    : 'border-slate-700 text-slate-400 hover:border-slate-500 hover:text-slate-200 bg-slate-900/40',
                ].join(' ')}
              >
                {label}
                <span className="ml-1.5 text-xs opacity-60">
                  ({id === 'all' ? projects.length : projects.filter((p) => p.type === id).length})
                </span>
              </button>
            ))}
          </div>
        </ScrollReveal>

        {/* Grid */}
        <AnimatePresence mode="wait">
          {isEmpty ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-24 text-slate-500"
            >
              <p className="text-4xl mb-3">🔒</p>
              <p className="text-lg font-medium text-slate-400">No entries yet</p>
              <p className="text-sm mt-1">Add your work to <code className="text-indigo-400">src/data/projects.ts</code></p>
            </motion.div>
          ) : (
            <motion.div
              key={activeFilter}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
            >
              {filtered.map((entry, i) => (
                <ScrollReveal key={i} delay={i * 0.05} direction="up">
                  <TiltedCard className="h-full" rotateAmplitude={6}>
                    {entry.type === 'audit'     && <AuditCard     entry={entry} />}
                    {entry.type === 'software'  && <SoftwareCard  entry={entry} />}
                    {entry.type === 'bugbounty' && <BugBountyCard entry={entry} />}
                  </TiltedCard>
                </ScrollReveal>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
