import Link from 'next/link';
import type { Metadata } from 'next';
import { Sparkles, ArrowRight, Rocket } from 'lucide-react';
import { FadeIn, ScrollReveal } from '@/components/animations';
import Footer from '@/components/Footer';
import { Breadcrumb } from '@/components/Breadcrumb';

export const metadata: Metadata = { title: 'Changelog - Atualizacoes do StackPost', description: 'Historico de atualizacoes do StackPost: novas plataformas, endpoints, features e correcoes.', alternates: { canonical: '/changelog' } };

const releases = [
  { version: 'v1.0.0', date: '2026-08-26', changes: ['Lancamento inicial', '15 plataformas suportadas', 'API REST com 114 endpoints', 'MCP server para AI agents', 'Multi-user com RBAC', 'Analytics historico indefinido'] },
  { version: 'v0.9.0', date: '2026-08-20', changes: ['Adicionado Bluesky e Mastodon', 'tus upload protocol', 'Cursor pagination em todos endpoints', 'Webhook replay'] },
  { version: 'v0.8.0', date: '2026-08-15', changes: ['A/B testing de posts', 'Best-time-to-post com ML', 'Auto-reconnect de contas', 'Approval workflow'] },
  { version: 'v0.7.0', date: '2026-08-10', changes: ['AI caption com Nexus IA', 'Hashtag suggestions', 'Cross-post adaptativo', 'SSE real-time'] },
  { version: 'v0.6.0', date: '2026-08-05', changes: ['Comments API em 11 plataformas', 'Post history import', 'CSV bulk import', 'Reviews import'] },
  { version: 'v0.5.0', date: '2026-07-28', changes: ['9 plataformas funcionando', 'Analytics com metricas normalizadas', 'Raw analytics por plataforma'] },
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
            <p className="text-lg text-brand-text-secondary">Historico de atualizacoes do StackPost.</p>
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
                  {rel.changes.map((c) => (
                    <li key={c} className="text-sm text-brand-text-secondary flex items-start gap-2">
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
