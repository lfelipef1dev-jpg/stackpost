import Link from 'next/link';
import type { Metadata } from 'next';
import { Layers, Calendar, BarChart3, Zap, Shield, Globe, MessageSquare, Upload, Webhook, Key, Building2, Sparkles, Clock, RefreshCw, FileCheck, Hash, Bot, GitBranch, Cpu, Database, Code, Terminal, Mail } from 'lucide-react';
import { FadeIn, ScrollReveal, StaggerGroup, StaggerItem } from '@/components/animations';
import { JsonLd, softwareApplicationSchema } from '@/components/JsonLd';
import { Breadcrumb } from '@/components/Breadcrumb';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Features - 15 plataformas, AI caption, MCP server e mais',
  description: 'Recursos completos do StackPost: publicacao paralela em 15 redes sociais, upload resumable (tus), analytics historico, AI caption, A/B testing, MCP server, webhooks com replay, multi-user RBAC.',
  alternates: { canonical: '/features' },
};

const featuresJsonLd = softwareApplicationSchema(
  'StackPost Features',
  'API unificada de redes sociais com 15 plataformas, AI caption, MCP server, analytics historico, A/B testing e multi-user RBAC.',
  '/features'
);

const featureCategories = [
  {
    title: 'Publicacao',
    icon: Zap,
    color: 'text-brand-accent',
    items: [
      { name: 'Post unificado', desc: 'Uma request, 15 plataformas. Publicacao paralela com Promise.allSettled.' },
      { name: 'Agendamento', desc: 'Agende posts para qualquer horario. Cron job processa no momento certo.' },
      { name: 'First comment', desc: 'Comente automaticamente apos publicar. Suporte por plataforma.' },
      { name: 'Bulk posting', desc: 'Publique em lote via CSV ou API. Centenas de posts por request.' },
      { name: 'Cross-post adaptativo', desc: 'Escreva uma vez. O sistema adapta para cada plataforma.' },
      { name: 'A/B testing', desc: 'Crie variacoes de caption/hashtag. Compare performance.' },
    ],
  },
  {
    title: 'Midia',
    icon: Upload,
    color: 'text-brand-accent',
    items: [
      { name: 'Upload simples', desc: 'Multipart/form-data, 90 MB. Salvo no Cloudflare R2.' },
      { name: 'Direct upload', desc: 'Presigned URL R2, 30 min expiry. Upload direto do cliente.' },
      { name: 'Multipart resumable', desc: 'Chunks de 64 MiB, 6h expiry. Resume automatico.' },
      { name: 'Upload from URL', desc: 'Importe midia de qualquer URL. 1 GB max, 60s timeout.' },
      { name: 'tus protocol', desc: 'Padrao da industria para upload resumable. Bibliotecas em todas linguagens.' },
      { name: 'Media library', desc: 'Biblioteca centralizada. Reuse midia entre posts.' },
    ],
  },
  {
    title: 'Plataformas',
    icon: Globe,
    color: 'text-brand-accent',
    items: [
      { name: 'Instagram', desc: 'Post, Reel, Story. Carousel ate 10 items. Meta Graph API.' },
      { name: 'TikTok', desc: 'Video e Photo Mode. Content API oficial. Status REVIEW.' },
      { name: 'YouTube', desc: 'Video e Shorts. madeForKids required. Data API v3.' },
      { name: 'Facebook', desc: 'Page post, Reel, Story. Meta Graph API.' },
      { name: 'LinkedIn', desc: 'Perfil e Company Page. Texto, midia, link, documento.' },
      { name: 'X / Twitter', desc: 'Tweet com midia. API v2. 4 imagens ou 1 video.' },
      { name: 'Threads', desc: 'Texto, midia, poll, gif, link. 10 imagens ou 1 video.' },
      { name: 'Pinterest', desc: 'Pin com board. API v5. 1 imagem ou video.' },
      { name: 'Reddit', desc: 'Text, link, midia, gallery. Subreddit required.' },
      { name: 'Bluesky', desc: 'AT Protocol. Text, midia, link card, quote.' },
      { name: 'Mastodon', desc: 'Instancia custom. Status com midia, privacy, spoiler.' },
      { name: 'Discord', desc: 'Webhook URL. Mensagem com ate 10 attachments.' },
      { name: 'Slack', desc: 'Webhook URL. Mensagem com ate 4 attachments.' },
      { name: 'Google Business', desc: 'STANDARD, EVENT, OFFER, ALERT. My Business API.' },
      { name: 'Snapchat', desc: 'Story e Spotlight. Marketing API. Public Profile.' },
    ],
  },
  {
    title: 'Analytics',
    icon: BarChart3,
    color: 'text-brand-accent',
    items: [
      { name: 'Metricas normalizadas', desc: 'Impressions, views, likes, comments, shares, saves.' },
      { name: 'Raw analytics', desc: 'Dados crus por plataforma. YouTube monetizacao com withBusinessScope.' },
      { name: 'Historico indefinido', desc: 'Cron job diario salva snapshot. Grafico de evolucao temporal.' },
      { name: 'Comparacao entre periodos', desc: 'Compare performance semana a semana, mes a mes.' },
      { name: 'Force refresh', desc: 'Force atualizacao de analytics sob demanda. Rate limit por team.' },
      { name: 'Top posts', desc: 'Ranking dos melhores posts por metrica.' },
    ],
  },
  {
    title: 'Comentarios',
    icon: MessageSquare,
    color: 'text-brand-accent',
    items: [
      { name: 'Comments API', desc: 'Poste comentarios em 11 plataformas via API unificada.' },
      { name: 'Import comentarios', desc: 'Importe comentarios existentes de 9 plataformas.' },
      { name: 'Reply automation', desc: 'Responda comentarios automaticamente.' },
      { name: 'Comment to DM', desc: 'Converta comentarios em DM no Instagram e Facebook.' },
      { name: 'Limites por plano', desc: 'FREE 25 / PRO 200 / BUSINESS 1.000 comentarios por post.' },
    ],
  },
  {
    title: 'Desenvolvedores',
    icon: Code,
    color: 'text-brand-accent',
    items: [
      { name: 'API REST', desc: '114 endpoints. OpenAPI 3.1. Scalar docs.' },
      { name: 'API Key auth', desc: 'Header x-api-key. Padrao Stripe-like com prefixo sk_live_.' },
      { name: 'Rate limit 3 camadas', desc: '100/1s, 500/10s, 2000/60s. Headers X-RateLimit-*.' },
      { name: 'Webhooks', desc: '9 eventos. HMAC-SHA256. 3 retries, backoff 30s. 50 concorrentes.' },
      { name: 'Webhook replay', desc: 'Reenvie eventos perdidos apos re-enable. Auto-replay opcional.' },
      { name: 'Idempotency', desc: 'Header Idempotency-Key. Dedup em 24h. Preveni duplicacao.' },
      { name: 'Cursor pagination', desc: 'Todos list endpoints. ?cursor=abc&limit=50. Mais eficiente que offset.' },
      { name: 'SDK', desc: 'TypeScript, Python, Go. Gerado de OpenAPI.' },
      { name: 'CLI', desc: 'Linha de comando. Publique direto do terminal.' },
      { name: 'MCP server', desc: 'Model Context Protocol. Claude, Cursor, AI agents publicam posts.' },
    ],
  },
  {
    title: 'AI & Automacao',
    icon: Bot,
    color: 'text-brand-accent',
    items: [
      { name: 'AI caption', desc: 'Integracao com Nexus IA. 3-5 variacoes por plataforma.' },
      { name: 'Best-time-to-post', desc: 'ML calcula engagement por hora/dia. Sugere top 3 horarios.' },
      { name: 'Hashtag suggestions', desc: 'Trending APIs + nicho. Volume de busca e competencia.' },
      { name: 'Auto-reconnect', desc: 'Detecta desconexao e tenta refresh automatico.' },
      { name: 'Approval workflow', desc: 'DRAFT -> REVIEW -> APPROVED -> SCHEDULED. Roles: creator, reviewer, approver.' },
      { name: 'SSE real-time', desc: 'Server-Sent Events para status de posts. Sem polling.' },
    ],
  },
  {
    title: 'Multi-user & RBAC',
    icon: Building2,
    color: 'text-brand-accent',
    items: [
      { name: 'Organizations', desc: 'Multi-tenancy. Cada org tem sua cota e billing.' },
      { name: 'Teams', desc: 'Times dentro de orgs. Permissoes por team.' },
      { name: 'Roles', desc: 'Owner, admin, editor, viewer. RBAC completo.' },
      { name: 'Audit log', desc: 'Todas as acoes registradas. Quem fez o que e quando.' },
      { name: 'JWT + API Key', desc: 'JWT para dashboard, API key para integracoes.' },
    ],
  },
];

export default function FeaturesPage() {
  return (
    <main className="min-h-screen bg-brand-bg text-brand-text">
      <JsonLd data={featuresJsonLd} />
      <Breadcrumb items={[{ name: 'Home', path: '/' }, { name: 'Features', path: '/features' }]} />
      {/* Hero */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-brand-accent/10 rounded-full blur-[120px]" />
        </div>
        <div className="max-w-4xl mx-auto text-center relative">
          <FadeIn>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-brand-accent/30 bg-brand-accent/8 mb-6">
              <Sparkles className="w-3.5 h-3.5 text-brand-accent" />
              <span className="text-xs font-mono text-brand-accent">Features</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Tudo que voce precisa para{' '}
              <span className="text-brand-accent">escalar redes sociais</span>
            </h1>
            <p className="text-lg text-brand-text-secondary mb-8 max-w-2xl mx-auto">
              API unificada para 15 plataformas. Publicacao paralela, analytics historico, AI caption,
              MCP server, multi-user com RBAC e muito mais.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link href="/register" className="px-6 py-3 rounded-xl bg-brand-accent text-brand-bg font-semibold hover:bg-brand-accent-hover transition">
                Comecar gratis
              </Link>
              <Link href="/docs" className="px-6 py-3 rounded-xl border border-brand-border text-brand-text hover:bg-brand-elevated transition">
                Ver documentacao
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Feature categories */}
      <section className="max-w-7xl mx-auto px-4 pb-20">
        <StaggerGroup className="space-y-16">
          {featureCategories.map((cat) => (
            <StaggerItem key={cat.title}>
              <div className="mb-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-brand-accent/10 flex items-center justify-center">
                    <cat.icon className="w-5 h-5 text-brand-accent" />
                  </div>
                  <h2 className="text-2xl font-bold">{cat.title}</h2>
                </div>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {cat.items.map((item) => (
                  <div key={item.name} className="p-5 rounded-xl bg-brand-surface/50 backdrop-blur border border-brand-border hover:border-brand-accent/30 transition group">
                    <h3 className="font-semibold mb-1.5 text-brand-text group-hover:text-brand-accent transition">{item.name}</h3>
                    <p className="text-sm text-brand-text-secondary">{item.desc}</p>
                  </div>
                ))}
              </div>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </section>

      {/* CTA */}
      <section className="max-w-4xl mx-auto px-4 pb-20 text-center">
        <ScrollReveal>
          <h2 className="text-3xl font-bold mb-4">Pronto para comecar?</h2>
          <p className="text-brand-text-secondary mb-8">Plano free. Sem cartao. 15 plataformas.</p>
          <Link href="/register" className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-brand-accent text-brand-bg font-semibold hover:bg-brand-accent-hover transition">
            Criar conta <Zap className="w-4 h-4" />
          </Link>
        </ScrollReveal>
      </section>

      <Footer />
    </main>
  );
}
