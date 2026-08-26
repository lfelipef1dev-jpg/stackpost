import Link from 'next/link';
import type { Metadata } from 'next';
import { BookOpen } from 'lucide-react';
import { FadeIn, ScrollReveal } from '@/components/animations';
import Footer from '@/components/Footer';
import { Breadcrumb } from '@/components/Breadcrumb';

export const metadata: Metadata = { title: 'Glossario - Termos de API de redes sociais', description: 'Glossario de termos tecnicos de API de redes sociais: OAuth, webhook, cursor pagination, idempotency, MCP, SSE e mais.', alternates: { canonical: '/glossary' } };

const terms = [
  { term: 'API Key', def: 'Chave de autenticacao unica passada via header x-api-key. Padrao Stripe-like com prefixo sk_live_.' },
  { term: 'Adapter', desc: 'Interface padrao para cada plataforma. Implementa getAuthUrl, handleCallback, refreshToken, getChannels, publish, getAnalytics.' },
  { term: 'Analytics historico', def: 'Cron job diario salva snapshot de metricas. Permite grafico de evolucao temporal. StackPost guarda indefinidamente.' },
  { term: 'Approval workflow', def: 'Fluxo DRAFT -> REVIEW -> APPROVED -> SCHEDULED. Roles: creator, reviewer, approver.' },
  { term: 'A/B testing', def: 'Criacao de variacoes de caption/hashtag para comparar performance.' },
  { term: 'Best-time-to-post', def: 'ML calcula engagement por hora/dia e sugere top 3 horarios.' },
  { term: 'Bulk posting', def: 'Publicacao em lote via CSV ou API. Centenas de posts por request.' },
  { term: 'Cross-post adaptativo', def: 'Escreve uma vez, sistema adapta para cada plataforma (hashtags no IG, sem hashtags no LinkedIn, etc).' },
  { term: 'Cursor pagination', def: 'Paginacao via cursor em vez de offset. Mais eficiente para grandes datasets.' },
  { term: 'errorsVerbose', def: 'Erros padronizados com code, userFacingMessage, isTransient.' },
  { term: 'First comment', def: 'Comentario automatico apos publicar. Suporte por plataforma com limites especificos.' },
  { term: 'Idempotency-Key', def: 'Header opcional que preveni duplicacao em retries de rede. Dedup em 24h.' },
  { term: 'MCP server', def: 'Model Context Protocol. Permite AI agents (Claude, Cursor) publicarem posts via tools.' },
  { term: 'Multi-tenancy', def: 'Organizations > Teams > Users. Cada org tem sua cota e billing.' },
  { term: 'OAuth', def: 'Fluxo de autorizacao para conectar contas sociais. Set-channel para Meta (Instagram, Facebook).' },
  { term: 'Promise.allSettled', def: 'Publicacao paralela por plataforma. Falha em uma nao afeta outras.' },
  { term: 'Rate limit', def: '3 camadas: 100/1s, 500/10s, 2000/60s. Headers X-RateLimit-*.' },
  { term: 'RBAC', def: 'Role-Based Access Control. Roles: owner, admin, editor, viewer.' },
  { term: 'SSE', def: 'Server-Sent Events. Status de posts em real-time sem polling.' },
  { term: 'tus protocol', def: 'Padrao aberto para upload resumable. Bibliotecas em todas linguagens.' },
  { term: 'Webhook', def: 'Notificacao HTTP para eventos. 9 eventos, HMAC-SHA256, 3 retries, 50 concorrentes.' },
  { term: 'Webhook replay', def: 'Reenvio de eventos perdidos apos re-enable. Auto-replay opcional.' },
];

export default function GlossaryPage() {
  return (
    <main className="min-h-screen bg-brand-bg text-brand-text">
      <Breadcrumb items={[{ name: 'Home', path: '/' }, { name: 'Glossario', path: '/glossary' }]} />
      <section className="relative pt-32 pb-16 px-4 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-brand-accent/10 rounded-full blur-[120px]" />
        </div>
        <div className="max-w-3xl mx-auto relative">
          <FadeIn>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-brand-accent/30 bg-brand-accent/8 mb-6">
              <BookOpen className="w-3.5 h-3.5 text-brand-accent" />
              <span className="text-xs font-mono text-brand-accent">Glossario</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Glossario</h1>
            <p className="text-lg text-brand-text-secondary">Termos de redes sociais e API.</p>
          </FadeIn>
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-4 pb-20">
        <div className="space-y-3">
          {terms.map((t, i) => (
            <ScrollReveal key={t.term} delay={i * 0.02}>
              <div className="p-4 rounded-xl bg-brand-surface/50 backdrop-blur border border-brand-border hover:border-brand-accent/30 transition">
                <h2 className="font-semibold text-brand-accent mb-1">{t.term}</h2>
                <p className="text-sm text-brand-text-secondary">{t.def}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      <Footer />
    </main>
  );
}
