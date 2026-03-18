'use client';
import { Highlight, themes } from 'prism-react-renderer';
import type { ReactElement, ReactNode } from 'react';

// Map languages not bundled in prism-react-renderer to close equivalents
const LANG_MAP: Record<string, string> = {
  solidity: 'javascript',
  sol:      'javascript',
  sh:       'bash',
  zsh:      'bash',
};

function extractCodeProps(children: ReactNode): { code: string; language: string } {
  const el = children as ReactElement<{ className?: string; children?: string }>;
  if (!el || typeof el !== 'object' || !('props' in el)) {
    return { code: String(children ?? ''), language: 'text' };
  }
  const raw      = el.props.className ?? '';
  const match    = raw.match(/language-(\w+)/);
  const lang     = match?.[1] ?? 'text';
  const code     = (el.props.children ?? '').toString().trimEnd();
  return { code, language: LANG_MAP[lang] ?? lang };
}

interface CodeBlockProps {
  children?: ReactNode;
}

export default function CodeBlock({ children }: CodeBlockProps) {
  const { code, language } = extractCodeProps(children);

  return (
    <Highlight theme={themes.oneDark} code={code} language={language as never}>
      {({ style, tokens, getLineProps, getTokenProps }) => (
        <pre
          style={{
            ...style,
            background:   '#0d1117',
            border:       '1px solid rgba(148,163,184,0.12)',
            borderRadius: '10px',
            padding:      'clamp(0.6rem, 3vw, 1rem) clamp(0.75rem, 4vw, 1.25rem)',
            overflowX:    'auto',
            margin:       '1rem 0',
            fontSize:     'clamp(0.72rem, 2vw, 0.82rem)',
            lineHeight:   '1.6',
            fontFamily:   "'JetBrains Mono','Fira Code',monospace",
          }}
        >
          {tokens.map((line, i) => (
            <div key={i} {...getLineProps({ line })}>
              {line.map((token, key) => (
                <span key={key} {...getTokenProps({ token })} />
              ))}
            </div>
          ))}
        </pre>
      )}
    </Highlight>
  );
}
