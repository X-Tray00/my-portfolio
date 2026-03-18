export type AuditEntry = {
  type: 'audit';
  platform: 'code4rena' | 'sherlock' | 'cantina' | 'private';
  protocol: string;
  date: string; // e.g. "2024-03"
  tags: string[]; // e.g. ["DeFi", "Solidity"]
  findings: { high: number; medium: number; low: number };
  reportUrl?: string;
  rank?: string; // e.g. "#3 of 120 auditors"
  description?: string;
  logoUrl?: string; // path in /public/logos/, e.g. "/logos/thorwallet.png"
};

export type SoftwareProject = {
  type: 'software';
  name: string;
  description: string;
  tech: string[];
  githubUrl?: string;
  demoUrl?: string;
  gitpodUrl?: string; // fallback: opens project in Gitpod externally
  terminalUrl?: string; // HTTPS URL to ttyd instance — embedded in the detail page
};

export type BugBountyEntry = {
  type: 'bugbounty';
  platform: string; // e.g. "Immunefi", "HackerOne"
  protocol: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  date: string;
  description?: string;
  reportUrl?: string;
};

export type ProjectEntry = AuditEntry | SoftwareProject | BugBountyEntry;

export const projects: ProjectEntry[] = [
  {
    type: 'audit',
    platform: 'code4rena',
    protocol: 'THORWallet',
    logoUrl: 'https://avatars.githubusercontent.com/u/85075725?s=400&v=4',
    date: '2025-02',
    tags: ['EVM', 'Solidity', 'DeFi', 'Cross-chain', 'Multisig'],
    findings: { high: 1, medium: 0, low: 0 },
    rank: '#6',
    description:
      'Found 1 High severity bug in a cross-chain TITN token contract. A `to != lzEndpoint` exemption in the transfer-lock check created an escape hatch — restricted holders could route tokens through the LayerZero endpoint and bypass the lock entirely. First contest, first finding.',
    // reportUrl: 'https://code4rena.com/reports/...', // TODO: add when published
  },
  {
    type: 'audit',
    platform: 'code4rena',
    protocol: 'Forte: Float128 Solidity Library',
    logoUrl: 'https://pbs.twimg.com/profile_images/1844150391723757569/kr1nvMyy_400x400.jpg',
    date: '2025-04',
    tags: ['EVM', 'Solidity', 'Library', 'Math'],
    findings: { high: 2, medium: 0, low: 0 },
    rank: '#21',
    description:
      'Found 2 High severity bugs in a 128-bit floating-point Solidity library. Key finding: ln(0) did not revert, silently returning an invalid result, violating mathematical invariants and exposing dependent protocols (AMMs, lending rates) to silent precision errors.',
    // reportUrl: 'https://code4rena.com/reports/...', // TODO: add when published
  },
  {
    type: 'audit',
    platform: 'code4rena',
    protocol: 'Virtuals Protocol',
    logoUrl: 'https://coin-images.coingecko.com/coins/images/34057/large/LOGOMARK.png?1708356054',
    date: '2025-05',
    tags: ['EVM', 'Solidity', 'DeFi', 'AI Agents'],
    findings: { high: 0, medium: 1, low: 0 },
    rank: '#83',
    description:
      'Found 1 Medium severity bug in the FERC20 token contract. `burnFrom()` reduced user balances without decrementing `_totalSupply`, permanently inflating the reported circulating supply and breaking the core ERC20 accounting invariant.',
    // reportUrl: 'https://code4rena.com/reports/...', // TODO: add when published
  },
  {
    type: 'software',
    name: 'HallReserve',
    description:
      'Web application for reserving halls. Go REST backend, React/Vite frontend served via Nginx, PostgreSQL database. Fully containerised with Docker Compose.',
    tech: ['Go', 'React', 'Vite', 'PostgreSQL', 'Docker', 'Nginx'],
    githubUrl: 'https://github.com/X-Tray00/software-for-reserving-halls',
    gitpodUrl:
      'https://gitpod.io/#https://github.com/X-Tray00/software-for-reserving-halls',
  },

  // Private audits — add when you can disclose them:
  // {
  //   type: 'audit',
  //   platform: 'private',
  //   protocol: 'Confidential',
  //   date: '2025-XX',
  //   tags: ['...'],
  //   findings: { high: 0, medium: 0, low: 0 },
  //   description: 'Private engagement — details under NDA.',
  // },
];

// ── Utilities ─────────────────────────────────────────────────────────────────

/** Converts a project name to a URL slug, e.g. "HallReserve" → "hallreserve" */
export function toSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}
