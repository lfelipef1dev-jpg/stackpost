'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { Info, Globe, Github, Linkedin, Twitter, Target, Layers, ShieldCheck, Building2 } from 'lucide-react';
import { FadeIn, ScrollReveal, StaggerGroup, StaggerItem } from '@/components/animations';
import { Breadcrumb } from '@/components/Breadcrumb';
import { JsonLd } from '@/components/JsonLd';
import Footer from '@/components/Footer';
import LandingHeader from '@/components/LandingHeader';

export const metadata: Metadata = {
  title: 'Sobre o StackPost — API unificada de redes sociais',
  description:
    'StackPost é uma API unificada de redes sociais para SaaS, agências e AI agents. Uma integração, 15 plataformas, 114 endpoints. Feito no Brasil, para o mundo.',
  alternates: { canonical: '/about' },
};

const organizationDetailsJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  '@id': 'https://stackpost.com.br/#organization',
  name: 'StackPost',
  url: 'https://stackpost.com.br',
  founder: {
    '@type': 'Organization',
    name: 'StackPost',
    url: 'https://stackpost.com.br',
    description:
      'Plataforma de publicação multi-rede com API unificada para SaaS, agências e AI agents.',
  },
  foundingDate: '2026',
  knowsAbout: ['Social Media API', 'Multi-tenant SaaS', 'MCP server', 'AI agents', 'Cross-posting', 'Analytics'],
  sameAs: [
    'https://github.com/stackpost',
    'https://instagram.com/stackpost',
    'https://linkedin.com/company/stackpost',
    'https://x.com/stackpost',
    'https://stackpost.com.br',
  ],
};

/* ------------------------------------------------------------------ */
/* SpotlightCard — glow radial seguindo o cursor (120px / 0a / 25)     */
/* ------------------------------------------------------------------ */
function SpotlightCard({
  children,
  className = '',
  glow = '#8AB4F8',
}: {
  children: React.ReactNode;
  className?: string;
  glow?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [spot, setSpot] = useState({ x: 0, y: 0, active: false });

  return (
    <div
      ref={ref}
      onMouseMove={(e) => {
        if (!ref.current) return;
        const r = ref.current.getBoundingClientRect();
        setSpot({ x: e.clientX - r.left, y: e.clientY - r.top, active: true });
      }}
      onMouseLeave={() => setSpot((s) => ({ ...s, active: false }))}
      className={`relative rounded-2xl bg-brand-surface/60 backdrop-blur-xl border border-brand-border/50 ${className}`}
      style={{
        backgroundImage: spot.active
          ? `radial-gradient(circle 120px at ${spot.x}px ${spot.y}px, ${glow}0a, transparent)`
          : undefined,
      }}
    >
      <div
        className="absolute inset-0 rounded-2xl pointer-events-none"
        style={{
          boxShadow: spot.active ? `inset 0 0 0 1px ${glow}25` : 'inset 0 0 0 1px transparent',
          transition: 'box-shadow 0.3s ease-out',
        }}
      />
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* TiltCard — inclinação 3D suave (1.5°, sem scale)                    */
/* ------------------------------------------------------------------ */
function TiltCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [style, setStyle] = useState({});

  return (
    <div
      ref={ref}
      onMouseMove={(e) => {
        if (!ref.current) return;
        const r = ref.current.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        setStyle({
          transform: `perspective(1200px) rotateX(${-y * 1.5}deg) rotateY(${x * 1.5}deg)`,
          transition: 'transform 0.15s ease-out',
        });
      }}
      onMouseLeave={() =>
        setStyle({
          transform: 'perspective(1200px) rotateX(0deg) rotateY(0deg)',
          transition: 'transform 0.4s ease-out',
        })
      }
      style={style}
      className={`will-change-transform ${className}`}
    >
      {children}
    </div>
  );
}

const pillars = [
  {
    icon: Target,
    title: 'Nossa missão',
    desc: 'Democratizar o acesso a redes sociais via API. Desenvolvedores e times não deveriam integrar 15 APIs diferentes — uma integração, uma chave, uma API.',
  },
  {
    icon: Layers,
    title: 'Stack técnica',
    desc: 'Next.js 15 com App Router, Supabase (PostgreSQL), Cloudflare Workers com @opennextjs/cloudflare, CDN global e pagamentos via Mercado Pago.',
  },
  {
    icon: ShieldCheck,
    title: 'Transparência (E-E-A-T)',
    desc: 'Produto StackPost, fundada em 2026, sede no Brasil. Código público no GitHub, deploy em Cloudflare Workers e banco em Supabase (PostgreSQL).',
  },
  {
    icon: Building2,
    title: 'Para quem',
    desc: 'SaaS que precisam de publicação multi-rede, agências que gerenciam múltiplos clientes e AI agents que publicam via MCP server nativo.',
  },
];

const stackItems = [
  { label: 'Frontend', value: 'Next.js 15 + App Router' },
  { label: 'Banco', value: 'Supabase (PostgreSQL)' },
  { label: 'Deploy', value: 'Cloudflare Workers + @opennextjs/cloudflare' },
  { label: 'CDN', value: 'Cloudflare' },
  { label: 'Pagamentos', value: 'Mercado Pago' },
  { label: 'Auth', value: 'JWT + bcrypt' },
];

const socials = [
  { href: 'https://github.com/stackpost', icon: Github, label: 'GitHub' },
  { href: 'https://linkedin.com/company/stackpost', icon: Linkedin, label: 'LinkedIn' },
  { href: 'https://x.com/stackpost', icon: Twitter, label: 'X' },
  { href: 'https://stackpost.com.br', icon: Globe, label: 'stackpost.com.br' },
];

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-brand-bg text-brand-text pt-16">
      <JsonLd data={organizationDetailsJsonLd} />
      <LandingHeader />
      <Breadcrumb items={[{ name: 'Home', path: '/' }, { name: 'Sobre', path: '/about' }]} />

      {/* Hero */}
      <section className="relative pt-20 pb-16 px-4 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-brand-accent/10 rounded-full blur-[120px]" />
        </div>
        <div className="max-w-3xl mx-auto relative">
          <FadeIn>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-brand-accent/30 bg-brand-accent/10 mb-6">
              <Info className="w-3.5 h-3.5 text-brand-accent" />
              <span className="text-xs font-mono text-brand-accent">Sobre</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Sobre o <span className="text-brand-accent">StackPost</span>
            </h1>
            <p className="text-lg text-brand-text-secondary mb-8">
              StackPost é uma API unificada de redes sociais para SaaS, agências e AI agents.
              Uma integração, 15 plataformas, 114 endpoints — feito no Brasil, para o mundo.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/register"
                className="px-6 py-3 rounded-xl bg-brand-accent text-brand-bg font-semibold hover:bg-brand-accent-hover transition-colors"
              >
                Começar gratuitamente
              </Link>
              <Link
                href="/features"
                className="px-6 py-3 rounded-xl border border-brand-border text-brand-text hover:bg-brand-elevated transition-colors"
              >
                Ver recursos
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Pilares */}
      <section className="max-w-5xl mx-auto px-4 pb-20">
        <StaggerGroup className="grid sm:grid-cols-2 gap-4">
          {pillars.map((p) => (
            <StaggerItem key={p.title}>
              <TiltCard>
                <SpotlightCard className="h-full p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-brand-accent/10 flex items-center justify-center">
                      <p.icon className="w-5 h-5 text-brand-accent" />
                    </div>
                    <h2 className="text-xl font-bold text-brand-text">{p.title}</h2>
                  </div>
                  <p className="text-sm text-brand-text-secondary leading-relaxed">{p.desc}</p>
                </SpotlightCard>
              </TiltCard>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </section>

      {/* Stack técnica detalhada */}
      <section className="max-w-3xl mx-auto px-4 pb-20">
        <ScrollReveal>
          <TiltCard>
            <SpotlightCard className="p-6">
              <h2 className="text-xl font-bold mb-4 text-brand-text">Stack técnica</h2>
              <ul className="space-y-2 text-sm text-brand-text-secondary">
                {stackItems.map((item) => (
                  <li key={item.label} className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                    <span className="font-mono text-xs text-brand-accent sm:w-32 flex-shrink-0">{item.label}</span>
                    <span className="text-brand-text">{item.value}</span>
                  </li>
                ))}
              </ul>
            </SpotlightCard>
          </TiltCard>
        </ScrollReveal>
      </section>

      {/* Identidade + redes */}
      <section className="max-w-3xl mx-auto px-4 pb-20">
        <ScrollReveal>
          <TiltCard>
            <SpotlightCard className="p-6">
              <h2 className="text-xl font-bold mb-3 text-brand-text">StackPost</h2>
              <p className="text-sm text-brand-text-secondary mb-4 leading-relaxed">
                Plataforma de publicação multi-rede com API unificada para SaaS, agências e AI agents.
                Feito no Brasil, para o mundo.
              </p>
              <div className="flex gap-3 flex-wrap">
                {socials.map((s) => (
                  <a
                    key={s.label}
                    href={s.href}
                    className="inline-flex items-center gap-2 text-sm text-brand-accent hover:text-brand-accent-hover transition-colors"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <s.icon className="w-4 h-4" /> {s.label}
                  </a>
                ))}
              </div>
            </SpotlightCard>
          </TiltCard>
        </ScrollReveal>
      </section>

      {/* CTA */}
      <section className="max-w-4xl mx-auto px-4 pb-20 text-center">
        <ScrollReveal>
          <h2 className="text-3xl font-bold mb-4">Pronto para começar?</h2>
          <p className="text-brand-text-secondary mb-8">
            Plano gratuito para sempre. Sem cartão de crédito. 15 plataformas conectadas.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-brand-accent text-brand-bg font-semibold hover:bg-brand-accent-hover transition-colors"
          >
            Criar conta <Globe className="w-4 h-4" />
          </Link>
        </ScrollReveal>
      </section>

      <Footer />
    </main>
  );
}
