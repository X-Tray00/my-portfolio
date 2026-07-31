'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type Tab = 'docs' | 'findings';

interface AuditTabsProps {
  documentation: React.ReactNode;
  findings: React.ReactNode;
  findingCount: number;
}

/** Switches between the protocol write-up and the findings. Server-rendered MDX
 *  arrives as ReactNodes, so this component only owns the toggle. */
export default function AuditTabs({ documentation, findings, findingCount }: AuditTabsProps) {
  const hasFindings = findingCount > 0;
  // Findings are the payoff, lead with them when they exist
  const [tab, setTab] = useState<Tab>(hasFindings ? 'findings' : 'docs');

  const tabs: { id: Tab; label: string; count?: number }[] = [
    { id: 'docs', label: 'Documentation' },
    ...(hasFindings ? [{ id: 'findings' as Tab, label: 'Findings', count: findingCount }] : []),
  ];

  return (
    <div>
      {/* Only worth a switcher when there is something to switch to */}
      {hasFindings && (
        <div className="mb-10 flex flex-wrap gap-2">
          {tabs.map(({ id, label, count }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={[
                'rounded-full border px-4 py-2 text-sm font-medium transition',
                tab === id
                  ? 'border-indigo-500 bg-indigo-600 text-white shadow-lg shadow-indigo-900/40'
                  : 'border-slate-700 bg-slate-900/40 text-slate-400 hover:border-slate-500 hover:text-slate-200',
              ].join(' ')}
            >
              {label}
              {count !== undefined && <span className="ml-1.5 text-xs opacity-60">({count})</span>}
            </button>
          ))}
        </div>
      )}

      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {tab === 'docs' ? documentation : findings}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
