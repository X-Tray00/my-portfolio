'use client';

import { useEffect, useState } from 'react';

type Props = {
  phrases: string[];
  typingSpeed?: number;
  deletingSpeed?: number;
  pauseBetween?: number;
  className?: string;
};

export default function CyclingTypewriter({
  phrases,
  typingSpeed = 90,
  deletingSpeed = 55,
  pauseBetween = 1200,
  className = '',
}: Props) {
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [display, setDisplay] = useState('');
  const [cursorVisible, setCursorVisible] = useState(true);
  const [mode, setMode] = useState<'typing' | 'deleting'>('typing');
  const [isPausing, setIsPausing] = useState(false);
  const [nextMode, setNextMode] = useState<'typing' | 'deleting'>('deleting');

  const currentPhrase = phrases[phraseIndex] ?? '';

  useEffect(() => {
    const blink = window.setInterval(() => setCursorVisible((v) => !v), 420);
    return () => window.clearInterval(blink);
  }, []);

  useEffect(() => {
    if (isPausing) return;
    const targetText =
      mode === 'typing'
        ? currentPhrase.slice(0, display.length + 1)
        : currentPhrase.slice(0, Math.max(display.length - 1, 0));
    const delay = mode === 'typing' ? typingSpeed : deletingSpeed;

    const timer = window.setTimeout(() => {
      setDisplay(targetText);

      if (mode === 'typing' && targetText === currentPhrase) {
        setNextMode('deleting');
        setIsPausing(true);
      } else if (mode === 'deleting' && targetText === '') {
        setNextMode('typing');
        setPhraseIndex((prev) => (prev + 1) % phrases.length);
        setIsPausing(true);
      }
    }, delay);

    return () => window.clearTimeout(timer);
  }, [currentPhrase, deletingSpeed, display, isPausing, mode, phrases.length, typingSpeed]);

  useEffect(() => {
    if (!isPausing) return;
    const pauseTimer = window.setTimeout(() => {
      setMode(nextMode);
      setIsPausing(false);
    }, pauseBetween);
    return () => window.clearTimeout(pauseTimer);
  }, [isPausing, nextMode, pauseBetween]);

  const showCursor = !isPausing || mode === 'typing' || mode === 'deleting';

  return (
    <span className={className}>
      {display}
      {showCursor && (
        <span aria-hidden className="inline-block align-[-2px]">
          {cursorVisible ? '|' : '\u00A0'}
        </span>
      )}
    </span>
  );
}

