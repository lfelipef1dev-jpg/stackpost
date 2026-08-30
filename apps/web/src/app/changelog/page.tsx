import Link from 'next/link';
import type { Metadata } from 'next';
import { Sparkles, ArrowRight, Rocket } from 'lucide-react';
import { FadeIn, ScrollReveal } from '@/components/animations';
import Footer from '@/components/Footer';
import { Breadcrumb } from '@/components/Breadcrumb';

export const metadata: Metadata = {
  title: 'Changelog — Atualizações do StackPost',
  description:
    'Histórico de atualizações do StackPost: novas plataformas, endpoints, recursos e correções.',
  alternates: { canonical: '/changelog' },
};

const releases = [
  {
    version: 'v1.0.0',
    date: '2026-08-26',
    changes: [
      'Lançamento inicial',
      '15 plataformas suportadas',
      'API REST com 114 endpoints',
      'MCP server para agentes de IA',
      'Multi-usuário com RBAC',
      'Analytics com histórico ilimitado',
    ],
  },
  {
    version: 'v0.9.0',
    date: '2026-08-20',
    changes: [
      'Adição de Bluesky e Mastodon',
      'Protocolo de upload tus',
      'Cursor pagination em todos os endpoints',
      'Replay de webhooks',
    ],
  },
  {
    version: 'v0.8.0',
    date: '2026-08-15',
    changes: [
      'A/B testing de publicações',
      'Melhor horário para postar com ML',
      'Reconexão automática de contas',
      'Fluxo de aprovação',
    ],
  },
  {
    version: 'v0.7.0',
    date: '2026-08-10',
    changes: [
      'Legendas com IA via Nexus IA',
      'Sugestões de hashtags',
      'Cross-post adaptativo',
      'SSE em tempo real',
    ],
  },
  {
    version: 'v0.6.0',
    date: '2026-08-05',
    changes: [
      'API de comentários em 11 plataformas',
      'Importação de histórico de publicações',
      'Importação em massa via CSV',
      'Importação de avaliações',
    ],
  },
  {
    version: 'v0.5.0',
    date: '2026-07-28',
    changes: [
      '9 plataformas em funcionamento',
      'Analytics com métricas normalizadas',
      'Analytics bruto por plataforma',
    ],
  },
];

export default function ChangelogPage() {
  return (
    <main className="min-h-screen bg-brand-bg text-brand-text">
      <Breadcrumb items={[{ name: 'Home', path: '/' }, { name: 'Changelog', path: '/changelog' }]} />
      <section className="relative pt-32 pb-16 px-4 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-brand-accent/10 rounded-full blur-[120px]" />
        </div>
        <div className="max-w-3xl mx-auto relative">
          <FadeIn>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-brand-accent/30 bg-brand-accent/8 mb-6">
              <Rocket className="w-3.5 h-3.5 text-brand-accent" />
              <span className="text-xs font-mono text-brand-accent">Changelog</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Changelog</h1>
            <p className="text-lg text-brand-text-secondary">
              Histórico de atualizações do StackPost.
            </p>
          </FadeIn>
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-4 pb-20">
        <div className="space-y-8">
          {releases.map((rel, i) => (
            <ScrollReveal key={rel.version} delay={i * 0.05}>
              <div className="relative pl-8 border-l-2 border-brand-border">
                <div className="absolute -left-[7px] top-1 w-3 h-3 rounded-full bg-brand-accent" />
                <div className="flex items-center gap-3 mb-3">
                  <h2 className="text-xl font-bold">{rel.version}</h2>
                  <span className="text-xs text-brand-text-secondary font-mono">{rel.date}</span>
                </div>
                <ul className="space-y-1.5">
                  {rel.changes.map((c, idx) => (
                    <li key={`${rel.version}-${idx}`} className="text-sm text-brand-text-secondary flex items-start gap-2">
                      <span className="text-brand-accent mt-0.5">-</span>
                      {c}
                    </li>
                  ))}
                </ul>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      <Footer />
    </main>
  );
}
