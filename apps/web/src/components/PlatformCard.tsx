'use client';

import { useState } from 'react';
import { PlatformIcon } from './PlatformIcon';
import type { Platform } from '@/lib/platforms';

interface PlatformCardProps {
  platform: Platform;
}

export function PlatformCard({ platform }: PlatformCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="p-3 rounded-xl bg-brand-surface/50 backdrop-blur border text-center transition-all duration-200 hover:scale-105 cursor-default h-full flex flex-col items-center justify-between"
      style={{
        borderColor: isHovered ? `${platform.brandColor}99` : 'var(--brand-border, rgba(255,255,255,0.1))',
        boxShadow: isHovered ? `0 0 20px ${platform.brandColor}40` : 'none',
        background: isHovered ? `${platform.brandColor}15` : undefined,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="mx-auto mb-1.5 flex justify-center">
        <PlatformIcon
          id={platform.id}
          size={22}
          color={isHovered ? platform.brandColor : platform.color}
        />
      </div>
      <div className="text-brand-text text-[11px] font-medium leading-tight min-h-[1.75rem] flex items-center justify-center text-center w-full">
        {platform.name}
      </div>
    </div>
  );
}
