export const services = [
  {
    id: 'audit',
    icon: '🔍',
    title: 'Smart Contract Audits',
    description:
      'Thorough security review of Solidity and Rust smart contracts. I identify vulnerabilities, from reentrancy and logic errors to access control flaws, before they reach mainnet.',
    includes: [
      'Manual line-by-line code review',
      'Automated tooling (Slither, Foundry fuzzing)',
      'Detailed written report with severity ratings',
      'Remediation support & re-check',
    ],
    cta: 'Request an Audit',
  },
  {
    id: 'security-consulting',
    icon: '🛡️',
    title: 'Security Consulting',
    description:
      'Advisory services for any team building software, from Web3 protocols to traditional web and mobile applications. I help identify risks early and design secure systems.',
    includes: [
      'Architecture & threat modelling',
      'Web application security review (OWASP Top 10)',
      'API & authentication security',
      'Ongoing retainer available',
    ],
    cta: 'Get in Touch',
  },
  {
    id: 'it-consulting',
    icon: '💡',
    title: 'IT & Software Consulting',
    description:
      'Strategic consulting for businesses looking to build or improve their digital infrastructure, covering everything from tech stack selection to planning scalable and maintainable systems.',
    includes: [
      'Tech stack selection & architecture planning',
      'Code review & refactoring',
      'Database design & optimisation',
      'Team process & tooling improvement',
    ],
    cta: "Let's Talk",
  },
  {
    id: 'software',
    icon: '⚙️',
    title: 'Software Development',
    description:
      'Custom software built with security and quality in mind, covering web and mobile apps, blockchain integrations, and automation tools.',
    includes: [
      'Web applications (Next.js, React, TypeScript)',
      'Mobile apps (React Native)',
      'Smart contract development (Solidity)',
      'APIs, automation & custom tooling',
    ],
    cta: 'Discuss a Project',
  },
] as const;

export type Service = (typeof services)[number];
