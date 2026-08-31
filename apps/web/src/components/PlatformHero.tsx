import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';
import { FadeIn } from '@/components/animations';
import { IconType } from 'react-icons/lib';

interface PlatformHeroProps {
  icon: IconType;
  label: string;
  title: string;
  description: string;
  color?: string;
  docsHref?: string;
}

export function PlatformHero({
  icon: Icon,
  label,
  title,
  description,
  color = '#8AB4F8',
  docsHref = '/docs',
}: PlatformHeroProps) {
  return (
    <section className="relative pt-24 pb-20 px-4 overflow-hidden">
      {/* Glow effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute top-1/4 right-1/4 w-[500px] h-[500px] rounded-full blur-[140px] transition-colors duration-700"
          style={{ background: `${color}15` }}
        />
        <div
          className="absolute bottom-0 left-1/3 w-[400px] h-[400px] rounded-full blur-[120px] transition-colors duration-700"
          style={{ background: `${color}10` }}
        />
        <div
          className="absolute top-0 left-0 w-[300px] h-[300px] rounded-full blur-[100px] transition-colors duration-700"
          style={{ background: `${color}08` }}
        />
      </div>

      <div className="max-w-5xl mx-auto relative">
        <FadeIn>
          <div className="grid md:grid-cols-[1fr_0.5fr] gap-10 items-center">
            {/* Left: text */}
            <div>
              {/* Badge */}
              <div
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border mb-6"
                style={{
                  borderColor: `${color}40`,
                  backgroundColor: `${color}10`,
                }}
              >
                <Icon size={14} color={color} />
                <span className="text-xs font-mono" style={{ color }}>
                  {label}
                </span>
              </div>

              {/* Title */}
              <h1
                className="text-4xl md:text-6xl font-bold mb-6 leading-tight"
                style={{ color: `color-mix(in srgb, ${color} 25%, white)` }}
              >
                {title}
              </h1>

              {/* Description */}
              <p className="text-lg text-brand-text-secondary mb-8 max-w-2xl">
                {description}
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap gap-4">
                <Link
                  href="/register"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-colors hover:opacity-90"
                  style={{ backgroundColor: color, color: '#0A0A0A' }}
                >
                  <Sparkles className="w-4 h-4" />
                  Comecar gratis <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href={docsHref}
                  className="px-6 py-3 rounded-xl border border-brand-border text-brand-text hover:bg-brand-elevated transition"
                >
                  Ver documentacao
                </Link>
              </div>
            </div>

            {/* Right: visual card */}
            <div className="hidden md:flex items-center justify-center">
              <div
                className="relative w-48 h-48 lg:w-64 lg:h-64 rounded-3xl flex items-center justify-center border"
                style={{
                  borderColor: `${color}30`,
                  background: `radial-gradient(circle at 50% 50%, ${color}20, transparent 70%)`,
                  boxShadow: `0 0 80px -20px ${color}40`,
                }}
              >
                {/* Inner glow ring */}
                <div
                  className="absolute inset-4 rounded-2xl border"
                  style={{ borderColor: `${color}20` }}
                />
                <Icon
                  size={112}
                  color={color}
                  style={{ filter: `drop-shadow(0 0 50px ${color})` }}
                />
              </div>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
