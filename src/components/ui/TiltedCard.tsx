'use client';
import { useRef } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

const spring = { damping: 30, stiffness: 120, mass: 1.5 };

interface TiltedCardProps {
  children: React.ReactNode;
  className?: string;
  rotateAmplitude?: number;
  scaleOnHover?: number;
}

export default function TiltedCard({
  children,
  className = '',
  rotateAmplitude = 10,
  scaleOnHover = 1.03,
}: TiltedCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const rotateX = useSpring(useMotionValue(0), spring);
  const rotateY = useSpring(useMotionValue(0), spring);
  const scale   = useSpring(1, spring);

  function onMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const ox = e.clientX - rect.left - rect.width / 2;
    const oy = e.clientY - rect.top - rect.height / 2;
    rotateX.set((oy / (rect.height / 2)) * -rotateAmplitude);
    rotateY.set((ox / (rect.width  / 2)) *  rotateAmplitude);
  }

  function onMouseEnter() { scale.set(scaleOnHover); }
  function onMouseLeave() { scale.set(1); rotateX.set(0); rotateY.set(0); }

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMouseMove}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      style={{ rotateX, rotateY, scale, transformStyle: 'preserve-3d', perspective: 800 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
