import type { Metadata } from 'next';
import { BookOpen } from 'lucide-react';
import { FadeIn, ScrollReveal } from '@/components/animations';
import Footer from '@/components/Footer';
import { Breadcrumb } from '@/components/Breadcrumb';

export const metadata: Metadata = {
  title: 'Glossário — Termos de API de redes sociais',
  description:
    'Glossário de termos técnicos de API de redes sociais: OAuth, webhook, cursor pagination, idempotency, MCP, SSE e mais.',
  alternates: { canonical: '/glossary' },
};

const terms = [
  { term: 'API Key', def: 'Chave de autenticação única enviada via header x-api-key. Padrão Stripe-like com prefixo sk_live_.' },
  { term: 'Adapter', def: 'Interface padronizada para cada plataforma. Implementa getAuthUrl, handleCallback, refreshToken, getChannels, publish e getAnalytics.' },
  { term: 'Analytics histórico', def: 'Cron job diário salva snapshot de métricas, permitindo gráficos de evolução temporal. O StackPost armazena o histórico indefinidamente.' },
  { term: 'Approval workflow', def: 'Fluxo de aprovação DRAFT → REVIEW → APPROVED → SCHEDULED. Papéis: creator, reviewer e approver.' },
  { term: 'A/B testing', def: 'Criação de variações de caption e hashtag para comparar performance entre versões.' },
  { term: 'Best-time-to-post', def: 'Modelo de ML calcula engagement por hora e dia da semana, sugerindo os três melhores horários.' },
  { term: 'Bulk posting', def: 'Publicação em lote via CSV ou API, suportando centenas de posts por requisição.' },
  { term: 'Cross-post adaptativo', def: 'Escreva uma vez e o sistema adapta o conteúdo para cada plataforma (hashtags no Instagram, sem hashtags no LinkedIn etc.).' },
  { term: 'Cursor pagination', def: 'Paginação via cursor em vez de offset, mais eficiente para grandes conjuntos de dados.' },
  { term: 'errorsVerbose', def: 'Erros padronizados com code, userFacingMessage e isTransient para tratamento consistente.' },
  { term: 'First comment', def: 'Comentário automático publicado logo após o post. Suporte por plataforma com limites específicos.' },
  { term: 'Idempotency-Key', def: 'Header opcional que previne duplicação em retries de rede. Janela de deduplicação de 24 horas.' },
  { term: 'MCP server', def: 'Model Context Protocol. Permite que AI agents (Claude, Cursor) publiquem posts via tools.' },
  { term: 'Multi-tenancy', def: 'Hierarquia Organizations → Teams → Users. Cada organização possui cota e billing próprios.' },
  { term: 'OAuth', def: 'Fluxo de autorização para conectar contas sociais. Set-channel para Meta (Instagram e Facebook).' },
  { term: 'Promise.allSettled', def: 'Publicação paralela por plataforma. A falha em uma não afeta as demais.' },
  { term: 'Rate limit', def: 'Três camadas: 100/1s, 500/10s e 2000/60s. Headers X-RateLimit-* expostos nas respostas.' },
  { term: 'RBAC', def: 'Role-Based Access Control. Papéis: owner, admin, editor e viewer.' },
  { term: 'SSE', def: 'Server-Sent Events. Status de posts em tempo real, sem necessidade de polling.' },
  { term: 'tus protocol', def: 'Padrão aberto para upload resumable, com bibliotecas disponíveis em todas as linguagens.' },
  { term: 'Webhook', def: 'Notificação HTTP para eventos. 9 eventos, assinatura HMAC-SHA256, 3 retries e 50 concorrentes.' },
  { term: 'Webhook replay', def: 'Reenvio de eventos perdidos após re-enable. Auto-replay opcional disponível.' },
];

export default function GlossaryPage() {
  return (
    <main className="min-h-screen bg-brand-bg text-brand-text">
      <Breadcrumb items={[{ name: 'Home', path: '/' }, { name: 'Glossário', path: '/glossary' }]} />
      <section className="relative pt-32 pb-16 px-4 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-brand-accent/10 rounded-full blur-[120px]" />
        </div>
        <div className="max-w-3xl mx-auto relative">
          <FadeIn>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-brand-accent/30 bg-brand-accent/8 mb-6">
              <BookOpen className="w-3.5 h-3.5 text-brand-accent" />
              <span className="text-xs font-mono text-brand-accent">Glossário</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Glossário</h1>
            <p className="text-lg text-brand-text-secondary">Termos de redes sociais e API explicados de forma clara e objetiva.</p>
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
