'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import { BarChart3, Zap, Shield, Globe, MessageSquare, Upload, Code, Bot, Building2, Sparkles } from 'lucide-react';
import { FadeIn, ScrollReveal, StaggerGroup, StaggerItem } from '@/components/animations';
import { JsonLd, softwareApplicationSchema } from '@/components/JsonLd';
import { Breadcrumb } from '@/components/Breadcrumb';
import Footer from '@/components/Footer';
import LandingHeader from '@/components/LandingHeader';

const featuresJsonLd = softwareApplicationSchema(
  'StackPost — Recursos',
  'API unificada de redes sociais com 15 plataformas, legendas com IA, MCP server, analytics histórico, A/B testing e multi-usuário com RBAC.',
  '/features'
);

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

const featureCategories = [
  {
    title: 'Publicação',
    icon: Zap,
    items: [
      { name: 'Post unificado', desc: 'Uma requisição, 15 plataformas. Publicação paralela com Promise.allSettled e relatório individual de status.' },
      { name: 'Agendamento', desc: 'Agende publicações para qualquer horário. Cron jobs processam a fila no momento exato com fuso horário por conta.' },
      { name: 'Primeiro comentário', desc: 'Comente automaticamente após publicar. Suporte por plataforma com configuração independente.' },
      { name: 'Publicação em lote', desc: 'Publique em massa via CSV ou API. Centenas de posts por requisição com validação completa.' },
      { name: 'Cross-post adaptativo', desc: 'Escreva uma vez. O sistema adapta formato, limite de caracteres e mídia para cada plataforma.' },
      { name: 'A/B testing', desc: 'Crie variações de legenda e hashtags. Compare performance e identifique a versão com melhor engajamento.' },
    ],
  },
  {
    title: 'Mídia',
    icon: Upload,
    items: [
      { name: 'Upload simples', desc: 'Multipart/form-data, 90 MB. Armazenamento no Cloudflare R2 com CDN global.' },
      { name: 'Upload direto', desc: 'Presigned URL do R2, validade de 30 minutos. Upload direto do cliente sem passar pelo servidor.' },
      { name: 'Multipart resumível', desc: 'Chunks de 64 MiB, validade de 6 horas. Retoma automaticamente após interrupções de rede.' },
      { name: 'Importação por URL', desc: 'Importe mídia de qualquer URL pública. Limite de 1 GB, timeout de 60 segundos.' },
      { name: 'Protocolo tus', desc: 'Padrão da indústria para upload resumível. Bibliotecas disponíveis em todas as linguagens principais.' },
      { name: 'Biblioteca de mídia', desc: 'Armazenamento centralizado. Reutilize mídia entre publicações e mantenha tudo organizado.' },
    ],
  },
  {
    title: 'Plataformas',
    icon: Globe,
    items: [
      { name: 'Instagram', desc: 'Post, Reel e Story. Carrossel até 10 itens. Meta Graph API oficial.' },
      { name: 'TikTok', desc: 'Video e Photo Mode. Content API oficial com status REVIEW em tempo real.' },
      { name: 'YouTube', desc: 'Vídeo e Shorts. Campo madeForKids obrigatório. Data API v3.' },
      { name: 'Facebook', desc: 'Post em Page, Reel e Story. Meta Graph API com suporte completo.' },
      { name: 'LinkedIn', desc: 'Perfil e Company Page. Texto, mídia, link e documento com API oficial.' },
      { name: 'X / Twitter', desc: 'Tweet com mídia. API v2. Até 4 imagens ou 1 vídeo por publicação.' },
      { name: 'Threads', desc: 'Texto, mídia, enquete, GIF e link. Até 10 imagens ou 1 vídeo.' },
      { name: 'Pinterest', desc: 'Pin com board obrigatório. API v5. 1 imagem ou vídeo por pin.' },
      { name: 'Reddit', desc: 'Text, link, mídia e gallery. Subreddit obrigatório com validação de regras.' },
      { name: 'Bluesky', desc: 'AT Protocol nativo. Texto, mídia, link card e quote post.' },
      { name: 'Mastodon', desc: 'Instância customizável. Status com mídia, privacidade e spoiler text.' },
      { name: 'Discord', desc: 'Webhook URL. Mensagem com até 10 attachments e embeds rich.' },
      { name: 'Slack', desc: 'Webhook URL. Mensagem com até 4 attachments e formatação markdown.' },
      { name: 'Google Business', desc: 'STANDARD, EVENT, OFFER e ALERT. My Business API com métricas integradas.' },
      { name: 'Snapchat', desc: 'Story e Spotlight. Marketing API com Public Profile oficial.' },
    ],
  },
  {
    title: 'Analytics',
    icon: BarChart3,
    items: [
      { name: 'Métricas normalizadas', desc: 'Impressions, views, likes, comments, shares e saves em formato unificado entre plataformas.' },
      { name: 'Analytics bruto', desc: 'Dados crus por plataforma. YouTube monetização via withBusinessScope para receita detalhada.' },
      { name: 'Histórico ilimitado', desc: 'Cron job diário salva snapshot de métricas. Gráficos de evolução temporal sem limite de retenção.' },
      { name: 'Comparação entre períodos', desc: 'Compare performance semana a semana, mês a mês. Identifique tendências e sazonalidade.' },
      { name: 'Atualização sob demanda', desc: 'Force a atualização de analytics quando precisar. Rate limit configurado por time.' },
      { name: 'Top publicações', desc: 'Ranking das melhores publicações por métrica. Descubra o que performa melhor em cada canal.' },
    ],
  },
  {
    title: 'Comentários',
    icon: MessageSquare,
    items: [
      { name: 'API de comentários', desc: 'Publique comentários em 11 plataformas via API unificada com resposta padronizada.' },
      { name: 'Importação de comentários', desc: 'Importe comentários existentes de 9 plataformas. Sincronize o histórico completo.' },
      { name: 'Resposta automática', desc: 'Responda comentários automaticamente com regras e gatilhos personalizáveis.' },
      { name: 'Comentário para DM', desc: 'Converta comentários em DM no Instagram e Facebook. Automatize o funil de atendimento.' },
      { name: 'Limites por plano', desc: 'FREE 25 / PRO 200 / BUSINESS 1.000 comentários por publicação. Escalável sob demanda.' },
    ],
  },
  {
    title: 'Desenvolvedores',
    icon: Code,
    items: [
      { name: 'API REST', desc: '114 endpoints documentados. OpenAPI 3.1 com Scalar docs interativas.' },
      { name: 'Autenticação por API Key', desc: 'Header x-api-key. Padrão Stripe-like com prefixo sk_live_ para segurança.' },
      { name: 'Rate limit em 3 camadas', desc: '100/1s, 500/10s, 2000/60s. Headers X-RateLimit-* para integração transparente.' },
      { name: 'Webhooks', desc: '9 eventos. HMAC-SHA256. 3 retries com backoff de 30s. 50 entregas concorrentes.' },
      { name: 'Replay de webhooks', desc: 'Reenvie eventos perdidos após reativar o endpoint. Auto-replay opcional configurável.' },
      { name: 'Idempotência', desc: 'Header Idempotency-Key. Deduplicação em 24 horas. Previne publicações duplicadas.' },
      { name: 'Paginação por cursor', desc: 'Todos os endpoints de listagem. ?cursor=abc&limit=50. Mais eficiente que offset tradicional.' },
      { name: 'SDKs oficiais', desc: 'TypeScript, Python e Go. Gerados automaticamente a partir do OpenAPI spec.' },
      { name: 'CLI', desc: 'Linha de comando completa. Publique direto do terminal sem escrever código.' },
      { name: 'MCP server', desc: 'Model Context Protocol. Claude, Cursor e AI agents publicam posts via ferramenta nativa.' },
    ],
  },
  {
    title: 'IA & Automação',
    icon: Bot,
    items: [
      { name: 'Legendas com IA', desc: 'Integração com Nexus IA. Gera 3 a 5 variações de legenda por plataforma com tom personalizável.' },
      { name: 'Melhor horário para postar', desc: 'Machine learning calcula engajamento por hora e dia. Sugere os 3 melhores horários automaticamente.' },
      { name: 'Sugestão de hashtags', desc: 'Trending APIs combinadas com análise de nicho. Volume de busca e nível de competitividade.' },
      { name: 'Reconexão automática', desc: 'Detecta desconexão de OAuth e tenta refresh automático. Minimiza interrupções de serviço.' },
      { name: 'Fluxo de aprovação', desc: 'DRAFT → REVIEW → APPROVED → SCHEDULED. Roles: creator, reviewer e approver com auditoria completa.' },
      { name: 'SSE em tempo real', desc: 'Server-Sent Events para status de publicações. Atualizações instantâneas sem polling.' },
    ],
  },
  {
    title: 'Multi-usuário & RBAC',
    icon: Building2,
    items: [
      { name: 'Organizações', desc: 'Multi-tenancy nativo. Cada organização tem sua cota, billing e isolamento de dados.' },
      { name: 'Times', desc: 'Times dentro de organizações. Permissões granulares por time com herança configurável.' },
      { name: 'Roles', desc: 'Owner, admin, editor e viewer. RBAC completo com validação em todos os endpoints.' },
      { name: 'Log de auditoria', desc: 'Todas as ações registradas. Quem fez o quê e quando, com exportação para compliance.' },
      { name: 'JWT + API Key', desc: 'JWT para dashboard com refresh seguro. API key para integrações server-to-server.' },
    ],
  },
];

export default function FeaturesClient() {
  return (
    <main className="min-h-screen bg-brand-bg text-brand-text pt-16">
      <JsonLd data={featuresJsonLd} />
      <LandingHeader />
      <Breadcrumb items={[{ name: 'Home', path: '/' }, { name: 'Recursos', path: '/features' }]} />

      {/* Hero */}
      <section className="relative pt-20 pb-20 px-4 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-brand-accent/10 rounded-full blur-[120px]" />
        </div>
        <div className="max-w-4xl mx-auto text-center relative">
          <FadeIn>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-brand-accent/30 bg-brand-accent/10 mb-6">
              <Sparkles className="w-3.5 h-3.5 text-brand-accent" />
              <span className="text-xs font-mono text-brand-accent">Recursos</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Tudo que você precisa para{' '}
              <span className="text-brand-accent">escalar redes sociais</span>
            </h1>
            <p className="text-lg text-brand-text-secondary mb-8 max-w-2xl mx-auto">
              API unificada para 15 plataformas. Publicação paralela, analytics histórico, legendas com IA,
              MCP server, multi-usuário com RBAC e muito mais — em uma única integração.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link
                href="/register"
                className="px-6 py-3 rounded-xl bg-brand-accent text-brand-bg font-semibold hover:bg-brand-accent-hover transition-colors"
              >
                Começar gratuitamente
              </Link>
              <Link
                href="/docs"
                className="px-6 py-3 rounded-xl border border-brand-border text-brand-text hover:bg-brand-elevated transition-colors"
              >
                Ver documentação
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Categorias de recursos */}
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
                  <TiltCard key={item.name}>
                    <SpotlightCard className="h-full p-5">
                      <h3 className="font-semibold mb-1.5 text-brand-text">{item.name}</h3>
                      <p className="text-sm text-brand-text-secondary leading-relaxed">{item.desc}</p>
                    </SpotlightCard>
                  </TiltCard>
                ))}
              </div>
            </StaggerItem>
          ))}
        </StaggerGroup>
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
            Criar conta <Zap className="w-4 h-4" />
          </Link>
        </ScrollReveal>
      </section>

      <Footer />
    </main>
  );
}
