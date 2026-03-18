'use client';
import { useEffect, useState } from 'react';

type Props = {
  text: string;
  speed?: number;        // ms per char
  start?: boolean;       // when true, start typing
  className?: string;
  onDone?: () => void;   // called once when typing completes
};

export default function Typewriter({
  text,
  speed = 80,
  start = true,
  className = '',
  onDone,
}: Props) {
  const [i, setI] = useState(0);
  const [cursorVisible, setCursorVisible] = useState(true);
  const typing = start && i < text.length;

  useEffect(() => {
    if (!start) return;

    const t1 = window.setInterval(() => {
      setI((v) => {
        if (v < text.length) return v + 1;
        if (t1) window.clearInterval(t1);
        if (onDone) queueMicrotask(onDone);
        return v;
      });
    }, speed);

    return () => {
      window.clearInterval(t1);
    };
  }, [start, speed, text.length, onDone]);

  useEffect(() => {
    if (!start) return;
    const blink = window.setInterval(() => {
      setCursorVisible((v) => !v);
    }, 450);
    return () => window.clearInterval(blink);
  }, [start]);

  const showCursor = typing;

  return (
    <span className={className}>
      {text.slice(0, i)}
      {showCursor && (
        <span aria-hidden className="inline-block align-[-2px]">
          {cursorVisible ? '|' : '\u00A0'}
        </span>
      )}
    </span>
  );
}
