'use client';
import { useRef } from 'react';
import { motion, useAnimationFrame, useMotionValue, useTransform } from 'framer-motion';

interface GradientTextProps {
  children: React.ReactNode;
  className?: string;
  colors?: string[];
  animationSpeed?: number;
}

export default function GradientText({
  children,
  className = '',
  colors = ['#818cf8', '#c084fc', '#38bdf8', '#818cf8'],
  animationSpeed = 6,
}: GradientTextProps) {
  const progress = useMotionValue(0);
  const elapsed = useRef(0);
  const lastTime = useRef<number | null>(null);
  const duration = animationSpeed * 1000;

  useAnimationFrame((time) => {
    if (lastTime.current === null) { lastTime.current = time; return; }
    elapsed.current += time - lastTime.current;
    lastTime.current = time;
    const cycleTime = elapsed.current % (duration * 2);
    progress.set(cycleTime < duration ? cycleTime / duration : 1 - (cycleTime - duration) / duration);
  });

  const backgroundPosition = useTransform(progress, (p) => `${p * 100}% 50%`);

  return (
    <motion.span
      className={className}
      style={{
        backgroundImage: `linear-gradient(to right, ${colors.join(', ')})`,
        backgroundSize: '300% 100%',
        backgroundPosition,
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
        display: 'inline-block',
      }}
    >
      {children}
    </motion.span>
  );
}
