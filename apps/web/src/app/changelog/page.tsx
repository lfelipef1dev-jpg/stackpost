import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Plus, Wrench, Zap } from 'lucide-react';
import { ScrollReveal } from '@/components/animations';
import { JsonLd, serviceSchema } from '@/components/JsonLd';
import LandingHeader from '@/components/LandingHeader';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Changelog - StackPost',
  description: 'Historico de atualizacoes do StackPost. Novas funcionalidades, correcoes e melhorias.',
  alternates: { canonical: '/changelog' },
};

const jsonLd = serviceSchema('StackPost Changelog', 'Historico de atualizacoes.', '/changelog');

type Entry = {
  type: 'feature' | 'fix' | 'improvement';
  text: string;
};

type Release = {
  version: string;
  date: string;
  entries: Entry[];
};

const releases: Release[] = [
  {
    version: 'Agosto 2026',
    date: '2026-08-31',
    entries: [
      { type: 'feature', text: 'Login OAuth com Google e Discord direto pelo StackPost' },
      { type: 'feature', text: 'Landing pages SEO por plataforma (Instagram, Facebook, LinkedIn, Discord)' },
      { type: 'feature', text: 'Pagina de comparacao com concorrentes' },
      { type: 'feature', text: 'Roadmap publico' },
      { type: 'feature', text: 'Status page e Changelog' },
      { type: 'fix', text: 'postType (POST/REEL/STORY) agora persistido no banco' },
      { type: 'fix', text: 'Discord webhook adapter corrigido (le platform_metadata)' },
      { type: 'fix', text: 'NEXT_PUBLIC_API_URL adicionado ao Cloudflare Worker' },
      { type: 'fix', text: 'Cookie SameSite=Lax para OAuth redirect funcionar' },
      { type: 'improvement', text: 'Header com Docs, Quick Start, API Reference, Comparar e Roadmap' },
      { type: 'improvement', text: 'Depoimentos marcados como beta testers' },
      { type: 'improvement', text: 'Hero reescrito: infraestrutura social > features' },
    ],
  },
  {
    version: 'Julho 2026',
    date: '2026-07-15',
    entries: [
      { type: 'feature', text: 'MCP server para Claude, Cursor e AI agents' },
      { type: 'feature', text: 'CLI @stackpost/cli' },
      { type: 'feature', text: 'SDK TypeScript, Python e Go gerados de OpenAPI 3.1' },
      { type: 'feature', text: 'Comment to DM no Instagram e Facebook' },
      { type: 'feature', text: 'A/B testing de postagens' },
      { type: 'improvement', text: 'Analytics com comparacao de periodos' },
      { type: 'improvement', text: 'Upload TUS e URL import' },
    ],
  },
  {
    version: 'Junho 2026',
    date: '2026-06-01',
    entries: [
      { type: 'feature', text: 'Multi-tenant com RBAC (Owner, Admin, Editor, Viewer)' },
      { type: 'feature', text: 'Webhooks com HMAC, retry e replay' },
      { type: 'feature', text: 'Approval workflow (Draft -> Review -> Approved -> Scheduled)' },
      { type: 'feature', text: 'Best-time ML para agendamento' },
      { type: 'feature', text: 'Primeiro comentario automatico' },
      { type: 'improvement', text: '15 plataformas suportadas' },
      { type: 'improvement', text: '114 endpoints REST' },
    ],
  },
];

function EntryIcon({ type }: { type: Entry['type'] }) {
  if (type === 'feature') return <Plus className="w-4 h-4 text-success flex-shrink-0" />;
  if (type === 'fix') return <Wrench className="w-4 h-4 text-brand-accent flex-shrink-0" />;
  return <Zap className="w-4 h-4 text-warning flex-shrink-0" />;
}

function EntryLabel({ type }: { type: Entry['type'] }) {
  const labels: Record<string, string> = {
    feature: 'Novo',
    fix: 'Correcao',
    improvement: 'Melhoria',
  };
  const colors: Record<string, string> = {
    feature: 'text-success',
    fix: 'text-brand-accent',
    improvement: 'text-warning',
  };
  return <span className={`text-xs font-bold uppercase ${colors[type]}`}>{labels[type]}</span>;
}

export default function ChangelogPage() {
  return (
    <main className="min-h-screen bg-brand-bg text-brand-text">
      <JsonLd data={jsonLd} />
      <LandingHeader />

      <section className="pt-24 pb-12 max-w-3xl mx-auto px-4 md:px-6">
        <ScrollReveal>
          <h1 className="font-display text-3xl md:text-4xl font-black tracking-tight mb-2">Changelog</h1>
          <p className="text-brand-text-secondary mb-8">O que mudou no StackPost. Atualizado a cada release.</p>
        </ScrollReveal>
      </section>

      <section className="max-w-3xl mx-auto px-4 md:px-6 pb-20">
        <div className="space-y-12">
          {releases.map((release) => (
            <ScrollReveal key={release.version}>
              <div className="border-l-2 border-brand-border pl-6">
                <div className="flex items-baseline gap-3 mb-4">
                  <h2 className="text-xl font-bold">{release.version}</h2>
                  <span className="text-sm text-brand-text-secondary">{release.date}</span>
                </div>
                <div className="space-y-3">
                  {release.entries.map((entry, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <EntryIcon type={entry.type} />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-0.5">
                          <EntryLabel type={entry.type} />
                        </div>
                        <p className="text-sm text-brand-text">{entry.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>

        <ScrollReveal className="mt-12">
          <Link
            href="/roadmap"
            className="inline-flex items-center gap-2 text-brand-accent hover:underline"
          >
            Ver roadmap <ArrowRight className="w-4 h-4" />
          </Link>
        </ScrollReveal>
      </section>

      <Footer />
    </main>
  );
}
