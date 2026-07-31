export type AuditEntry = {
  type: 'audit';
  platform: 'code4rena' | 'sherlock' | 'cantina' | 'immunefi' | 'private';
  protocol: string;
  date: string; // e.g. "2024-03"
  tags: string[]; // e.g. ["DeFi", "Solidity"]
  findings: { high: number; medium: number; low: number };
  /** Confirmed findings whose severity/details can't be published yet (live code,
   *  disclosure embargo). Counts toward ordering; renders without a severity. */
  embargoedFindings?: number;
  reportUrl?: string;
  rank?: string; // e.g. "#3 of 120 auditors"
  description?: string;
  logoUrl?: string; // path in /public/logos/, e.g. "/logos/thorwallet.png"
  logoBg?: string; // backdrop for logos drawn for dark UIs, e.g. "#000"
};

export type SoftwareProject = {
  type: 'software';
  name: string;
  description: string;
  tech: string[];
  githubUrl?: string;
  demoUrl?: string;
  gitpodUrl?: string; // fallback: opens project in Gitpod externally
  terminalUrl?: string; // HTTPS URL to ttyd instance, embedded in the detail page
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
    logoUrl: '/logos/thorwallet.png',
    date: '2025-02',
    tags: ['EVM', 'Solidity', 'DeFi', 'Cross-chain', 'Multisig'],
    findings: { high: 1, medium: 0, low: 0 },
    rank: '🥉',
    description:
      'Found 1 High severity bug in a cross-chain TITN token contract. A `to != lzEndpoint` exemption in the transfer-lock check created an escape hatch. Restricted holders could route tokens through the LayerZero endpoint and bypass the lock entirely. First contest, first finding.',
    reportUrl: 'https://code4rena.com/reports/2025-02-thorwallet',
  },
  {
    type: 'audit',
    platform: 'code4rena',
    protocol: 'Forte: Float128 Solidity Library',
    logoUrl: '/logos/forte.png',
    date: '2025-04',
    tags: ['EVM', 'Solidity', 'Library', 'Math'],
    findings: { high: 2, medium: 0, low: 0 },
    rank: '#18',
    description:
      'Found 2 High severity bugs in a 128-bit floating-point Solidity library. Key finding: ln(0) did not revert, silently returning an invalid result, violating mathematical invariants and exposing dependent protocols (AMMs, lending rates) to silent precision errors.',
    reportUrl: 'https://code4rena.com/reports/2025-04-forte-float128-solidity-library',
  },
  {
    type: 'audit',
    platform: 'code4rena',
    protocol: 'Virtuals Protocol',
    logoUrl: '/logos/virtuals.png',
    date: '2025-05',
    tags: ['EVM', 'Solidity', 'DeFi', 'AI Agents'],
    findings: { high: 0, medium: 1, low: 0 },
    rank: '#64',
    description:
      'Found 1 Medium severity bug in the FERC20 token contract. `burnFrom()` reduced user balances without decrementing `_totalSupply`, permanently inflating the reported circulating supply and breaking the core ERC20 accounting invariant.',
    reportUrl: 'https://code4rena.com/reports/2025-04-virtuals-protocol',
  },
  {
    type: 'audit',
    platform: 'code4rena',
    protocol: 'Chainlink Rewards',
    logoUrl: '/logos/chainlink.png',
    date: '2025-06',
    tags: ['EVM', 'Solidity', 'Token Distribution', 'Vesting'],
    findings: { high: 0, medium: 0, low: 0 },
    description:
      'On-chain claim mechanism for the Chainlink BUILD program, a two-file scope against a $200k prize pool. Reviewed double-claim paths, the early-claim discount curve, and factory-to-claim solvency accounting.',
  },
  {
    type: 'audit',
    platform: 'code4rena',
    protocol: 'Lido Community Staking Module',
    logoUrl: '/logos/lido.png',
    date: '2025-07',
    tags: ['EVM', 'Solidity', 'Staking', 'Merkle Proofs', 'Oracles'],
    findings: { high: 0, medium: 0, low: 0 },
    reportUrl: 'https://code4rena.com/reports/2025-07-lido-finance',
    description:
      "Lido's permissionless staking module. 34 files covering bond accounting, exit penalties and beacon-chain Merkle verification. Scope was CSM (~8.5% of Lido TVL), not the core stETH pool.",
  },
  {
    type: 'audit',
    platform: 'code4rena',
    protocol: 'Flare FAssets',
    logoUrl: '/logos/flare.png',
    date: '2025-08',
    tags: ['EVM', 'Solidity', 'Cross-chain', 'Bridge', 'Collateral'],
    findings: { high: 0, medium: 0, low: 0 },
    reportUrl: 'https://code4rena.com/reports/2025-08-flare-fasset',
    description:
      'Brings XRP and other non-smart-contract assets into DeFi via attestation-backed minting. 120 files, the largest scope I have reviewed. Focused on attestation replay and the redemption default path.',
  },
  {
    type: 'audit',
    platform: 'code4rena',
    protocol: 'Sequence Ecosystem Wallet',
    logoUrl: '/logos/sequence.png',
    date: '2025-10',
    tags: ['EVM', 'Solidity', 'Account Abstraction', 'Smart Wallet', 'Merkle Proofs'],
    findings: { high: 0, medium: 0, low: 0 },
    reportUrl: 'https://code4rena.com/reports/2025-10-sequence',
    description:
      'V3 non-custodial smart wallet using passkeys, timed recovery and Merkle-proof configuration. Reviewed configuration integrity, session permission escape and cross-chain signature replay.',
  },
  {
    type: 'audit',
    platform: 'code4rena',
    protocol: 'Ekubo Protocol',
    logoUrl: '/logos/ekubo.png',
    date: '2025-11',
    tags: ['EVM', 'Solidity', 'AMM', 'Concentrated Liquidity', 'DeFi'],
    findings: { high: 0, medium: 0, low: 0 },
    reportUrl: 'https://code4rena.com/reports/2025-11-ekubo',
    description:
      'Concentrated-liquidity AMM built on a singleton architecture with pluggable extensions. 92 files. Focused on cross-pool accounting isolation and what an extension can reach from its hook points.',
  },
  {
    type: 'audit',
    platform: 'code4rena',
    protocol: 'Chainlink Payment Abstraction V2',
    logoUrl: '/logos/chainlink.png',
    date: '2026-03',
    tags: ['EVM', 'Solidity', 'Dutch Auction', 'CCIP', 'DeFi'],
    findings: { high: 0, medium: 0, low: 0 },
    description:
      'Replaces V1 Uniswap routing with a permissionless Dutch auction settling through CowSwap. Reviewed price-descent timing, the auction callback boundary and PriceManager staleness handling.',
  },
  {
    type: 'audit',
    platform: 'code4rena',
    protocol: 'Nudge.xyz',
    logoUrl: '/logos/nudge.png',
    logoBg: '#000',
    date: '2025-03',
    tags: ['EVM', 'Solidity', 'Incentives', 'Campaigns'],
    findings: { high: 0, medium: 0, low: 0 },
    reportUrl: 'https://code4rena.com/reports/2025-03-nudgexyz',
    description:
      'Campaign platform paying rewards for token holding. Reviewed the reallocation accounting every reward rests on, flash-loan-shaped holding around sampling boundaries, and griefing of the payout path.',
  },
  {
    type: 'audit',
    platform: 'code4rena',
    protocol: 'Silo Finance',
    logoUrl: '/logos/silo.png',
    date: '2025-03',
    tags: ['EVM', 'Solidity', 'ERC-4626', 'Lending', 'DeFi'],
    findings: { high: 0, medium: 0, low: 0 },
    reportUrl: 'https://code4rena.com/reports/2025-03-silo-finance',
    description:
      'ERC-4626 meta-vault distributing deposits across multiple lending markets. Reviewed allocation invariants, reward accrual across share movements, rounding direction and the forced market-removal path.',
  },
  {
    type: 'audit',
    platform: 'code4rena',
    protocol: 'Kinetiq',
    logoUrl: '/logos/kinetiq.png',
    date: '2025-04',
    tags: ['EVM', 'Solidity', 'Liquid Staking', 'Hyperliquid'],
    findings: { high: 0, medium: 0, low: 0 },
    reportUrl: 'https://code4rena.com/reports/2025-04-kinetiq',
    description:
      'HYPE liquid staking split across HyperEVM and HyperCore. Reviewed buffer coherence between the two layers, withdrawal-queue ordering under slashing, and oracle-driven validator rotation.',
  },
  {
    type: 'audit',
    platform: 'code4rena',
    protocol: 'Upside',
    logoUrl: '/logos/upside.png',
    logoBg: '#000',
    date: '2025-05',
    tags: ['EVM', 'Solidity', 'Tokenisation'],
    findings: { high: 0, medium: 0, low: 0 },
    reportUrl: 'https://code4rena.com/reports/2025-05-upside',
    description:
      'URL tokenisation and swaps in 379 lines, the smallest scope I have reviewed. The contest closed with zero Highs and zero Mediums found by anyone who entered.',
  },
  {
    type: 'audit',
    platform: 'code4rena',
    protocol: 'Covenant',
    logoUrl: '/logos/covenant.png',
    date: '2025-10',
    tags: ['EVM', 'Solidity', 'Leverage', 'Oracles', 'DeFi'],
    findings: { high: 0, medium: 0, low: 0 },
    reportUrl: 'https://code4rena.com/reports/2025-10-covenant',
    description:
      'Leverage markets using the collateral itself as liquidity. Concentrated on the oracle adapter layer: cross-adapter staleness composition and the mismatch between Chainlink push and Pyth pull semantics.',
  },
  {
    type: 'audit',
    platform: 'code4rena',
    protocol: 'Megapot',
    logoUrl: '/logos/megapot.png',
    date: '2025-11',
    tags: ['EVM', 'Solidity', 'Randomness', 'Cross-chain'],
    findings: { high: 0, medium: 0, low: 0 },
    reportUrl: 'https://code4rena.com/reports/2025-11-megapot',
    description:
      'Jackpot protocol with NFT tickets, LP-funded prize pools and Pyth entropy. Reviewed entropy timing, modulo bias in Fisher-Yates rejection sampling, and the combinatorial payout accounting LPs underwrite.',
  },
  {
    type: 'audit',
    platform: 'code4rena',
    protocol: 'Sequence: Transaction Rails',
    logoUrl: '/logos/sequence.png',
    date: '2025-11',
    tags: ['EVM', 'Solidity', 'Intents', 'Cross-chain', 'Delegatecall'],
    findings: { high: 0, medium: 0, low: 0 },
    description:
      'Multichain intent rails, a separate contest from the Ecosystem Wallet. Nine files including a dedicated DelegatecallGuard. Reviewed delegatecall containment, intent binding and replay across chains.',
  },
  {
    type: 'audit',
    platform: 'code4rena',
    protocol: 'K2',
    logoUrl: '/logos/k2.png',
    date: '2026-04',
    tags: ['Rust', 'Soroban', 'Stellar', 'Lending'],
    findings: { high: 0, medium: 0, low: 0 },
    embargoedFindings: 1,
    description:
      'Aave V3 adapted to Stellar Soroban. 81 files of Rust, the only non-Solidity review here. Worked it as a differential audit: which EVM assumptions did the port carry across that Soroban does not provide. One finding confirmed; details withheld while the code is live.',
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

  // Private audits, add when you can disclose them:
  // {
  //   type: 'audit',
  //   platform: 'private',
  //   protocol: 'Confidential',
  //   date: '2025-XX',
  //   tags: ['...'],
  //   findings: { high: 0, medium: 0, low: 0 },
  //   description: 'Private engagement, details under NDA.',
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
