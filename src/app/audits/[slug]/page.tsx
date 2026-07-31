import { redirect } from 'next/navigation';
import Link from 'next/link';
import path from 'path';
import fs from 'fs';
import { compileMDX } from 'next-mdx-remote/rsc';
import BlurText from '@/components/ui/BlurText';
import ScrollReveal from '@/components/ui/ScrollReveal';
import { projects, toSlug, type AuditEntry } from '@/data/projects';
import CodeBlock from '@/components/ui/CodeBlock';
import ProtocolCoin from '@/components/ui/ProtocolCoin';
import AuditTabs from '@/components/ui/AuditTabs';

// ── Types ─────────────────────────────────────────────────────────────────────

type Frontmatter = {
  title: string;
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  submission?: string;
  status?: string;
};

// ── Config ────────────────────────────────────────────────────────────────────

const platformConfig = {
  code4rena: { label: 'Code4rena', color: '#7c3aed', bg: 'rgba(124,58,237,0.15)', border: 'rgba(124,58,237,0.4)' },
  sherlock:  { label: 'Sherlock',  color: '#2563eb', bg: 'rgba(37,99,235,0.15)',   border: 'rgba(37,99,235,0.4)'  },
  cantina:   { label: 'Cantina',   color: '#0d9488', bg: 'rgba(13,148,136,0.15)',  border: 'rgba(13,148,136,0.4)' },
  immunefi:  { label: 'Immunefi',  color: '#ea580c', bg: 'rgba(234,88,12,0.15)',   border: 'rgba(234,88,12,0.4)'  },
  private:   { label: 'Private',   color: '#6b7280', bg: 'rgba(107,114,128,0.15)', border: 'rgba(107,114,128,0.4)' },
};

const severityConfig = {
  critical: { label: 'Critical', color: '#ef4444', bg: 'rgba(239,68,68,0.12)',   border: 'rgba(239,68,68,0.4)'   },
  high:     { label: 'High',     color: '#f97316', bg: 'rgba(249,115,22,0.12)',  border: 'rgba(249,115,22,0.4)'  },
  medium:   { label: 'Medium',   color: '#eab308', bg: 'rgba(234,179,8,0.12)',   border: 'rgba(234,179,8,0.4)'   },
  low:      { label: 'Low',      color: '#22c55e', bg: 'rgba(34,197,94,0.12)',   border: 'rgba(34,197,94,0.4)'   },
  info:     { label: 'Info',     color: '#6b7280', bg: 'rgba(107,114,128,0.12)', border: 'rgba(107,114,128,0.4)' },
};

// ── Static params ─────────────────────────────────────────────────────────────

export function generateStaticParams() {
  return projects
    .filter((p): p is AuditEntry => p.type === 'audit')
    .map((p) => ({ slug: toSlug(p.protocol) }));
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const DOC_FILE = 'documentation.md';

function readFindingFiles(slug: string): string[] {
  const dir = path.join(process.cwd(), 'content', 'audits', slug);
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.md') && !f.startsWith('placeholder') && f !== DOC_FILE)
    .sort()
    .map((f) => fs.readFileSync(path.join(dir, f), 'utf8'));
}

function readDocumentation(slug: string): string | null {
  const file = path.join(process.cwd(), 'content', 'audits', slug, DOC_FILE);
  return fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : null;
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function AuditDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const entry = projects
    .filter((p): p is AuditEntry => p.type === 'audit')
    .find((p) => toSlug(p.protocol) === slug);

  if (!entry) redirect('/my-projects');

  const platform = platformConfig[entry.platform];
  const date = new Date(entry.date + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const sources = readFindingFiles(slug);

  const findings = await Promise.all(
    sources.map(async (src) => {
      const { content, frontmatter } = await compileMDX<Frontmatter>({
        source: src,
        components: { pre: CodeBlock },
        options: { parseFrontmatter: true },
      });
      return { content, frontmatter };
    })
  );

  const docSource = readDocumentation(slug);
  const documentation = docSource
    ? (
        await compileMDX({
          source: docSource,
          components: { pre: CodeBlock },
          options: { parseFrontmatter: true },
        })
      ).content
    : null;

  return (
    <main className="min-h-screen pt-28 pb-24 px-4 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-4xl">

        {/* Back */}
        <Link
          href="/my-projects"
          className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-300 transition mb-8 group"
        >
          <span className="group-hover:-translate-x-0.5 transition-transform inline-block">←</span>
          My Projects
        </Link>

        {/* Header */}
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <span
            className="text-xs font-semibold px-2.5 py-1 rounded-full"
            style={{ color: platform.color, background: platform.bg, border: `1px solid ${platform.border}` }}
          >
            {platform.label}
          </span>
          <span className="text-xs text-slate-500">{date}</span>
          {entry.rank &&
            (entry.rank.startsWith('#') ? (
              <span className="text-xs text-slate-500">· Rank {entry.rank}</span>
            ) : (
              // "Rank 🥉" reads oddly, the medal speaks for itself
              <span className="text-xl leading-none" title="Podium finish, 3rd place">
                {entry.rank}
              </span>
            ))}
        </div>

        <div className="flex items-center gap-5 mb-4">
          <ProtocolCoin src={entry.logoUrl} name={entry.protocol} size={72} duration={12} logoBg={entry.logoBg} />
          <BlurText
            text={entry.protocol}
            className="text-4xl sm:text-5xl font-bold text-slate-100"
            delay={50}
          />
        </div>

        {entry.tags.length > 0 && (
          <ScrollReveal delay={0.1}>
            <div className="flex flex-wrap gap-1.5 mb-12">
              {entry.tags.map((tag) => (
                <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                  {tag}
                </span>
              ))}
            </div>
          </ScrollReveal>
        )}

        <AuditTabs
          findingCount={findings.length}
          documentation={
            documentation ? (
              <div className="rounded-2xl border border-slate-700/60 bg-slate-900/40 px-3 py-4 sm:px-6 sm:py-6 prose-audit">
                {documentation}
              </div>
            ) : (
              <div className="rounded-2xl border border-slate-700/60 bg-slate-900/70 p-10 text-center">
                <p className="text-2xl mb-3">📄</p>
                <p className="text-slate-300 font-medium mb-1">No write-up published</p>
                <p className="text-slate-500 text-sm">Notes for this review aren&apos;t public yet.</p>
              </div>
            )
          }
          findings={
            <div className="space-y-10">
              {findings.map(({ content, frontmatter }, i) => {
                const sev = severityConfig[frontmatter.severity] ?? severityConfig.info;
                return (
                  <div key={i} className="rounded-2xl border border-slate-700/60 bg-slate-900/40 overflow-hidden">
                    {/* Finding header */}
                    <div className="flex flex-wrap items-center gap-2 px-3 py-3 sm:px-6 sm:py-4 border-b border-slate-700/50">
                      <span
                        className="text-xs font-semibold px-2.5 py-1 rounded-full"
                        style={{ color: sev.color, background: sev.bg, border: `1px solid ${sev.border}` }}
                      >
                        {sev.label}
                      </span>
                      {frontmatter.submission && (
                        <span className="text-xs text-slate-500 font-mono">{frontmatter.submission}</span>
                      )}
                      <h2 className="text-slate-100 font-semibold text-base leading-snug flex-1">
                        {frontmatter.title}
                      </h2>
                    </div>

                    {/* Markdown body */}
                    <div className="px-3 py-4 sm:px-6 sm:py-6 prose-audit">
                      {content}
                    </div>
                  </div>
                );
              })}
            </div>
          }
        />
      </div>
    </main>
  );
}
