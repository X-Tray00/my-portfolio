'use client';
import { useMemo } from 'react';
import styles from '../interactive-coin.module.css';

interface ProtocolCoinProps {
  src?: string;
  name: string;
  size?: number;
  duration?: number;
}

export default function ProtocolCoin({
  src,
  name,
  size     = 52,
  duration = 14,
}: ProtocolCoinProps) {
  const slices    = 48;
  const thickness = Math.max(5, Math.round(size * 0.13));
  const facetLen  = size * Math.sin(Math.PI / slices);

  const initials = name
    .replace(/[^a-zA-Z0-9]/g, ' ')
    .trim()
    .split(/\s+/)
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const sliceElems = useMemo(
    () =>
      Array.from({ length: slices }, (_, i) => (
        <div
          key={i}
          className={styles.slice}
          style={{ transform: `rotateY(90deg) rotateX(${(360 / slices) * i}deg)` }}
        />
      )),
    [],
  );

  function FaceContent({ flip = false }: { flip?: boolean }) {
    return (
      <div
        style={{
          width:          '100%',
          height:         '100%',
          borderRadius:   '50%',
          background:     'radial-gradient(circle at 38% 32%, #fff0a0 0%, #ffd700 22%, #c8a000 52%, #7a5200 100%)',
          boxShadow:      'inset 0 3px 6px rgba(255,255,180,0.45), inset 0 -3px 6px rgba(0,0,0,0.45)',
          display:        'flex',
          alignItems:     'center',
          justifyContent: 'center',
          transform:      flip ? 'scaleX(-1)' : undefined,
        }}
      >
        {src ? (
          <div
            style={{
              width:               '88%',
              height:              '88%',
              borderRadius:        '50%',
              backgroundImage:     `url(${src})`,
              backgroundSize:      'cover',
              backgroundPosition:  'center',
              boxShadow:           'inset 0 1px 3px rgba(0,0,0,0.3)',
            }}
          />
        ) : (
          <span
            style={{
              fontWeight:    700,
              fontSize:      size * 0.28,
              fontFamily:    'Inter, sans-serif',
              letterSpacing: '0.04em',
              color:         'rgba(60, 35, 0, 0.9)',
              textShadow:    '0 1px 2px rgba(255,240,120,0.6)',
            }}
          >
            {initials}
          </span>
        )}
      </div>
    );
  }

  return (
    <div
      className={styles.purse}
      style={
        {
          '--diam':         `${size}px`,
          '--thickness':    `${thickness}px`,
          '--slices':       `${slices}`,
          '--facetLen':     `${facetLen}px`,
          '--facetOverlap': '0.5px',
          '--edge-color-1': 'rgba(255, 225, 70, 0.98)',
          '--edge-color-2': 'rgba(110, 72, 4, 0.95)',
          // Proportional perspective: small coins need smaller value for visible 3D
          perspective:      `${size * 5}px`,
          margin:           0,
          flexShrink:       0,
        } as React.CSSProperties
      }
    >
      <div
        className={styles.glow}
        style={{
          background: 'radial-gradient(closest-side, rgba(255,190,20,0.28), transparent 70%)',
        }}
      />

      <div
        className={styles.coin}
        style={{
          animation: `protocol-coin-spin ${duration}s linear infinite`,
          cursor:    'default',
        }}
      >
        <div className={`${styles.face} ${styles.front}`}>
          <FaceContent />
        </div>
        <div className={`${styles.face} ${styles.back}`}>
          <FaceContent flip />
        </div>
        <div className={styles.edge}>{sliceElems}</div>
      </div>
    </div>
  );
}
