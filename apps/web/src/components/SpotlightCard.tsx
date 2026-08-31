'use client';

import { useRef, type ReactNode } from 'react';

interface SpotlightCardProps {
  children: ReactNode;
  className?: string;
  spotlightColor?: string;
}

/**
 * Card com efeito spotlight que segue o cursor.
 * Usa CSS vars para o gradiente radial, sem libs externas.
 */
export function SpotlightCard({
  children,
  className = '',
  spotlightColor = 'rgba(99, 102, 241, 0.15)',
}: SpotlightCardProps) {
  const ref = useRef<HTMLDivElement>(null);

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    el.style.setProperty('--spot-x', `${e.clientX - rect.left}px`);
    el.style.setProperty('--spot-y', `${e.clientY - rect.top}px`);
  }

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      className={`group relative overflow-hidden rounded-2xl bg-brand-surface border border-brand-border transition-colors duration-200 ${className}`}
      style={{
        backgroundImage:
          'radial-gradient(600px circle at var(--spot-x, -100px) var(--spot-y, -100px), var(--spotlight, transparent), transparent 40%)',
        ['--spotlight' as string]: spotlightColor,
      }}
    >
      {children}
    </div>
  );
}
