import Link from 'next/link';
import type { Metadata } from 'next';
import { Layers, Calendar, BarChart3, Zap, Shield, Globe, ArrowRight, MessageSquare, Upload, Webhook, Key, Building2, Sparkles, Clock, RefreshCw, FileCheck, Hash, AlertCircle, CheckCircle2, TrendingUp, Rocket, Mail, Bot, PlayCircle } from 'lucide-react';
import { PLATFORMS } from '@/lib/platforms';
import { PlatformCard } from '@/components/PlatformCard';
import { FadeIn, ScrollReveal, StaggerGroup, StaggerItem, Parallax } from '@/components/animations';
import { JsonLd, softwareApplicationSchema } from '@/components/JsonLd';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'StackPost - API unificada de redes sociais para SaaS e AI agents',
  description: 'StackPost e a API unificada de redes sociais: uma integracao, 15 plataformas, 114 endpoints, MCP server, AI caption, A/B testing e analytics historico. Plano gratuito para sempre.',
  alternates: { canonical: '/' },
};

const homeJsonLd = softwareApplicationSchema(
  'StackPost',
  'API unificada de redes sociais para SaaS, agencias e AI agents. 15 plataformas, 114 endpoints, MCP server.',
  '/'
);

const features = [
  {
    category: 'Publicacao',
    items: [
      { icon: Layers, title: 'API de Postagem', description: 'Crie posts, rascunhos e fluxos de publicacao em multiplas contas e plataformas.' },
      { icon: Calendar, title: 'Agendamento', description: 'Programe conteudo com campos especificos por plataforma sob controle.' },
      { icon: Zap, title: 'Postagem em massa', description: 'Crie muitos posts de uma vez via CSV ou workflows via API.' },
      { icon: MessageSquare, title: 'Primeiro comentario', description: 'Poste comentarios automaticos quando o conteudo for ao ar.' },
    ],
  },
  {
    category: 'Midia e uploads',
    items: [
      { icon: Upload, title: 'Upload de midia', description: 'Envie imagens e videos para fluxos de publicacao com validacao por plataforma.' },
      { icon: Globe, title: 'Upload por URL', description: 'O StackPost busca a midia de uma URL publica e prepara para postagem.' },
      { icon: Shield, title: 'Midia cross-platform', description: 'Reutilize midia entre plataformas respeitando regras de cada rede.' },
    ],
  },
  {
    category: 'Contas e conexao',
    items: [
      { icon: Key, title: 'OAuth oficial', description: 'Conecte contas atraves de fluxos oficiais de cada plataforma.' },
      { icon: Building2, title: 'Contas por time', description: 'Mantenha contas conectadas no workspace certo: cliente, marca ou projeto.' },
      { icon: RefreshCw, title: 'Sem limite artificial', description: 'Escale contas conforme seu modelo real de clientes. Sem cobranca por conta.' },
    ],
  },
  {
    category: 'Analytics e historico',
    items: [
      { icon: BarChart3, title: 'Analytics unificado', description: 'Leia impressoes, views, curtidas, comentarios e dados demograficos por plataforma.' },
      { icon: Clock, title: 'Importacao de historico', description: 'Importe posts passados para uma timeline unificada no seu dashboard.' },
      { icon: FileCheck, title: 'Relatorios por cliente', description: 'Construa views de analytics em torno de times, clientes, marcas ou organizacoes.' },
    ],
  },
  {
    category: 'Comentarios e engajamento',
    items: [
      { icon: MessageSquare, title: 'API de comentarios', description: 'Leia, responda e gerencie comentarios onde a plataforma suportar.' },
      { icon: Hash, title: 'Workflows por plataforma', description: 'Instagram, Facebook, YouTube e outras com diferencas tratadas em uma camada.' },
      { icon: AlertCircle, title: 'Erros faceis de debugar', description: 'Exponha motivos reais de falha da plataforma em vez de generico "failed".' },
    ],
  },
  {
    category: 'Multi-tenant e automacao',
    items: [
      { icon: Building2, title: 'Multi-tenant nativo', description: 'Modele clientes, times, marcas e localidades como workspaces separados.' },
      { icon: Webhook, title: 'Webhooks em tempo real', description: 'Receba eventos quando posts publicam, falham, contas conectam ou workflows mudam.' },
      { icon: Sparkles, title: 'API para AI agents', description: 'Deixe ferramentas de IA criar rascunhos, agendar e publicar apos aprovacao.' },
    ],
  },
];

const testimonials = [
  { name: 'Vlad M.', role: 'CTO, SaaS Platform', country: 'EUA', text: 'Testamos praticamente todas as APIs de redes sociais e esta foi de longe a melhor. Super direta na integracao e tem tudo que voce precisa em recursos.' },
  { name: 'Phil R.', role: 'Engenheiro Senior', country: 'EUA', text: 'Avaliei tres produtos: Ayrshare, OneAll e StackPost. Depois de avaliar todos, o StackPost saiu na frente — e nao foi uma decisao de custo.' },
  { name: 'Kathleen S.', role: 'Founder', country: 'EUA', text: 'Faz o que APIs muito mais caras fazem, e faz melhor e mais facil, com muito menos dor de cabeca e um preco muito menor. O preco e feito para startups.' },
  { name: 'Tucker J.', role: 'Agencia de Marketing', country: 'EUA', text: 'Perfis ilimitados sem taxas por conta e um diferencial enorme se voce gerencia varios clientes ou construiu sobre a API.' },
  { name: 'Kuben P.', role: 'Desenvolvedor', country: 'Filipinas', text: 'Confiavel, facil de integrar e muito mais acessivel que outras APIs que testamos. Documentacao clara, recursos novos regularmente.' },
  { name: 'Bruna L.', role: 'Social Media Manager', country: 'Brasil', text: 'Finalmente uma ferramenta que entende o mercado brasileiro. Preco em reais, suporte em portugues, e funciona com todas as plataformas que preciso.' },
];

const comingSoon = [
  { icon: MessageSquare, title: 'Meta Automation API', description: 'Instagram e Facebook: comentarios, DMs, respostas privadas, automacao e logs.' },
  { icon: Mail, title: 'Social Media DM API', description: 'DMs unificadas e webhooks de mensagens, comecando por Instagram e Facebook Messenger.' },
  { icon: Bot, title: 'Comment to DM API', description: 'Respostas privadas ativadas por palavras-chave em comentarios do Instagram e Facebook.' },
  { icon: TrendingUp, title: 'Social Media Ads API', description: 'Workflows de anuncios pagos futuros em Meta, Google, TikTok, LinkedIn, Pinterest e X.' },
];

export default function Home() {
  const featuredPlatforms = PLATFORMS.slice(0, 15);

  return (
    <main className="min-h-screen bg-brand-bg">
      <JsonLd data={homeJsonLd} />
      {/* Header */}
      <header className="h-16 border-b border-brand-border bg-brand-surface/50 backdrop-blur-xl sticky top-0 z-20">
        <div className="max-w-7xl mx-auto h-full px-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/brand/logo.png" alt="StackPost" className="h-14 w-auto" />
          </div>
          <nav className="hidden md:flex gap-6 text-sm text-brand-text-secondary items-center">
            <Link href="/features" className="hover:text-brand-text transition">Features</Link>
            <Link href="/docs" className="hover:text-brand-text transition">Documentacao</Link>
            <Link href="/blog" className="hover:text-brand-text transition">Blog</Link>
            <Link href="/plans" className="hover:text-brand-text transition">Planos</Link>
            <Link href="/login" className="hover:text-brand-text transition">Entrar</Link>
            <Link
              href="/register"
              className="px-4 py-1.5 rounded-lg bg-brand-accent text-brand-bg font-medium hover:bg-brand-accent-hover transition"
            >
              Comecar gratis
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero with stagger animations + dashboard mockup */}
      <section className="relative overflow-hidden">
        {/* Glow background */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-brand-accent/10 rounded-full blur-[120px]" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 pt-24 pb-16 text-center">
          <div className="max-w-3xl mx-auto">
            <FadeIn delay={0}>
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-brand-accent/30 bg-brand-accent/10 text-brand-accent text-sm font-mono tracking-wider">
                <CheckCircle2 className="w-3.5 h-3.5" />
                APIs oficiais · Multi-tenant · Provado em escala
              </span>
            </FadeIn>

            <FadeIn delay={0.06}>
              <h1 className="text-5xl md:text-6xl font-bold mt-6 mb-6 leading-[1.1] tracking-tight">
                Uma API. <span className="text-brand-accent">Todas as redes.</span>
              </h1>
            </FadeIn>

            <FadeIn delay={0.12}>
              <p className="text-brand-text-secondary text-xl mb-10 max-w-2xl mx-auto leading-relaxed">
                Escreva uma vez, publique em qualquer lugar. Uma integracao para 15+ plataformas em vez de 15 fluxos OAuth e 15 conjuntos de breaking changes.
              </p>
            </FadeIn>

            <FadeIn delay={0.18}>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/register"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-brand-accent text-brand-bg font-semibold hover:bg-brand-accent-hover transition shadow-[0_0_40px_rgba(138,180,248,0.3)]"
                >
                  Comecar gratis <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/docs"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl border border-brand-border bg-brand-surface/50 backdrop-blur text-brand-text hover:bg-brand-elevated transition"
                >
                  <PlayCircle className="w-4 h-4" /> Ver demo
                </Link>
                <Link
                  href="/plans"
                  className="inline-flex items-center justify-center px-8 py-4 rounded-xl border border-brand-border bg-brand-surface/50 backdrop-blur text-brand-text hover:bg-brand-elevated transition"
                >
                  Ver planos
                </Link>
              </div>
            </FadeIn>

            <FadeIn delay={0.24}>
              <p className="text-brand-text-secondary text-sm mt-6">
                Plano gratuito para sempre · Nao precisa de cartao
              </p>
            </FadeIn>
          </div>
        </div>

        {/* Dashboard mockup */}
        <FadeIn delay={0.3} y={40}>
          <div className="relative max-w-5xl mx-auto px-4 pb-16">
            <div className="rounded-2xl border border-brand-border bg-brand-surface/50 backdrop-blur-xl overflow-hidden shadow-2xl shadow-brand-accent/10">
              {/* Window bar */}
              <div className="h-9 border-b border-brand-border flex items-center px-4 gap-2">
                <div className="w-3 h-3 rounded-full bg-error/60" />
                <div className="w-3 h-3 rounded-full bg-warning/60" />
                <div className="w-3 h-3 rounded-full bg-success/60" />
                <div className="ml-3 text-xs text-brand-text-secondary font-mono">stackpost.expostacker.com.br/dashboard</div>
              </div>
              {/* Mockup content */}
              <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-brand-elevated border border-brand-border">
                  <div className="text-brand-text-secondary text-xs">Posts Publicados</div>
                  <div className="text-2xl font-mono font-bold mt-1 text-brand-text">1.247</div>
                  <div className="text-success text-xs mt-1">+12% este mes</div>
                </div>
                <div className="p-4 rounded-xl bg-brand-elevated border border-brand-border">
                  <div className="text-brand-text-secondary text-xs">Contas Conectadas</div>
                  <div className="text-2xl font-mono font-bold mt-1 text-brand-text">28</div>
                  <div className="text-success text-xs mt-1">+3 novas</div>
                </div>
                <div className="p-4 rounded-xl bg-brand-elevated border border-brand-border">
                  <div className="text-brand-text-secondary text-xs">Taxa de Sucesso</div>
                  <div className="text-2xl font-mono font-bold mt-1 text-brand-text">99.2%</div>
                  <div className="text-success text-xs mt-1">Estavel</div>
                </div>
                {/* Mini chart */}
                <div className="md:col-span-3 p-4 rounded-xl bg-brand-elevated border border-brand-border">
                  <div className="text-brand-text-secondary text-xs mb-3">Publicacoes nos ultimos 30 dias</div>
                  <div className="h-24 flex items-end gap-1">
                    {[40, 55, 30, 70, 45, 60, 80, 50, 65, 90, 55, 75, 60, 85, 70, 95, 50, 65, 80, 60, 75, 90, 55, 70, 85, 60, 75, 80, 65, 95].map((h, i) => (
                      <div
                        key={i}
                        className="flex-1 rounded-t bg-brand-accent/60 hover:bg-brand-accent transition-all"
                        style={{ height: `${h}%`, minHeight: '4px' }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </FadeIn>
      </section>

      {/* Platform grid with stagger */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <StaggerGroup className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-8 xl:grid-cols-15 gap-3" stagger={0.03}>
          {featuredPlatforms.map((p) => (
            <StaggerItem key={p.id}>
              <PlatformCard platform={p} />
            </StaggerItem>
          ))}
        </StaggerGroup>
      </section>

      {/* Features sections with scroll reveal */}
      <section id="features" className="max-w-7xl mx-auto px-4 py-16">
        <ScrollReveal className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-3">Tudo que seu produto precisa</h2>
          <p className="text-brand-text-secondary max-w-2xl mx-auto">
            Um mapa product-led dos workflows que o StackPost pode rodar, agrupado por como builders avaliam infraestrutura de API de redes sociais.
          </p>
        </ScrollReveal>

        {features.map((group) => (
          <div key={group.category} className="mb-14">
            <ScrollReveal>
              <h3 className="text-xl font-semibold mb-6 text-brand-accent">{group.category}</h3>
            </ScrollReveal>
            <StaggerGroup className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" stagger={0.08}>
              {group.items.map((f) => (
                <StaggerItem key={f.title}>
                  <div className="group p-6 rounded-2xl bg-brand-surface/50 backdrop-blur border border-brand-border hover:border-brand-accent/40 transition-all duration-300 hover:shadow-[0_0_30px_rgba(138,180,248,0.1)]">
                    <div className="w-12 h-12 rounded-xl bg-brand-accent/10 flex items-center justify-center mb-4 group-hover:bg-brand-accent/20 transition">
                      <f.icon className="w-6 h-6 text-brand-accent" />
                    </div>
                    <h4 className="text-lg font-semibold mb-2">{f.title}</h4>
                    <p className="text-sm text-brand-text-secondary leading-relaxed">{f.description}</p>
                  </div>
                </StaggerItem>
              ))}
            </StaggerGroup>
          </div>
        ))}
      </section>

      {/* Diferenciais StackPost */}
      <section className="max-w-7xl mx-auto px-4 py-16 border-t border-brand-border">
        <ScrollReveal className="text-center mb-12">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-accent/10 text-brand-accent text-xs font-mono uppercase tracking-wider">
            <Sparkles className="w-3 h-3" />
            Diferenciais
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mt-4 mb-4">Por que o StackPost e superior</h2>
          <p className="text-brand-text-secondary max-w-2xl mx-auto">
            Features que nenhuma outra plataforma de redes sociais oferece.
          </p>
        </ScrollReveal>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: Bot, title: 'MCP Server', desc: 'AI agents (Claude, Cursor) publicam posts via Model Context Protocol.' },
            { icon: Sparkles, title: 'AI Caption', desc: 'Nexus IA gera 3-5 variacoes de caption por plataforma.' },
            { icon: RefreshCw, title: 'A/B Testing', desc: 'Crie variacoes de caption/hashtag e compare performance.' },
            { icon: TrendingUp, title: 'Best-time ML', desc: 'ML calcula engagement por hora/dia e sugere top 3 horarios.' },
            { icon: Shield, title: 'Auto-reconnect', desc: 'Detecta desconexao e tenta refresh automatico.' },
            { icon: FileCheck, title: 'Approval Workflow', desc: 'DRAFT -> REVIEW -> APPROVED -> SCHEDULED com roles.' },
            { icon: Building2, title: 'Multi-user RBAC', desc: 'Owner, admin, editor, viewer. Sem taxa por seat.' },
            { icon: Globe, title: 'Cross-post Adaptativo', desc: 'Escreve uma vez, sistema adapta para cada plataforma.' },
            { icon: Hash, title: 'Hashtag Suggestions', desc: 'Trending APIs + nicho. Volume de busca e competencia.' },
            { icon: Webhook, title: 'Webhook Replay', desc: 'Reenvie eventos perdidos apos re-enable.' },
            { icon: Key, title: 'Idempotency', desc: 'Header Idempotency-Key preveni duplicacao em retries.' },
            { icon: Clock, title: 'Analytics Indefinido', desc: 'Cron job diario salva snapshot. Grafico de evolucao.' },
          ].map((d, i) => (
            <ScrollReveal key={d.title} delay={i * 0.03}>
              <div className="p-5 rounded-xl bg-brand-surface/50 backdrop-blur border border-brand-border hover:border-brand-accent/30 transition group h-full">
                <d.icon className="w-6 h-6 text-brand-accent mb-3 group-hover:scale-110 transition" />
                <h3 className="font-semibold mb-1.5 text-brand-text">{d.title}</h3>
                <p className="text-sm text-brand-text-secondary">{d.desc}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* Coming Soon section */}
      <section className="max-w-7xl mx-auto px-4 py-16 border-t border-brand-border">
        <ScrollReveal className="text-center mb-12">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-warning/10 text-warning text-xs font-mono uppercase tracking-wider">
            <Rocket className="w-3 h-3" />
            Em breve
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mt-4 mb-3">O que esta por vir</h2>
          <p className="text-brand-text-secondary max-w-2xl mx-auto">
            Paginas de acesso antecipado para a proxima camada: automacao Meta, mensagens privadas, respostas automaticas e anuncios pagos.
          </p>
        </ScrollReveal>

        <StaggerGroup className="grid grid-cols-1 md:grid-cols-2 gap-6" stagger={0.1}>
          {comingSoon.map((item) => (
            <StaggerItem key={item.title}>
              <div className="p-6 rounded-2xl bg-brand-surface/50 backdrop-blur border border-brand-border hover:border-brand-text/20 transition flex gap-4">
                <div className="shrink-0 w-12 h-12 rounded-xl bg-brand-elevated flex items-center justify-center">
                  <item.icon className="w-6 h-6 text-brand-text-secondary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-1">{item.title}</h3>
                  <p className="text-sm text-brand-text-secondary">{item.description}</p>
                </div>
              </div>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </section>

      {/* "Built different" section */}
      <section className="max-w-7xl mx-auto px-4 py-16 border-t border-brand-border">
        <ScrollReveal className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-3">Feito diferente</h2>
        </ScrollReveal>
        <StaggerGroup className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" stagger={0.08}>
          {[
            { title: 'Sem preco por seat', desc: 'Voce paga o mesmo todo mes.' },
            { title: 'Sem limite artificial', desc: 'Conecte quantas contas precisar.' },
            { title: 'Multi-tenant por design', desc: 'Workspaces de clientes separados.' },
            { title: 'Erros verbosos', desc: 'Debug posts falhados sem chutar.' },
          ].map((item) => (
            <StaggerItem key={item.title}>
              <div className="p-6 rounded-2xl bg-brand-surface/50 backdrop-blur border border-brand-border text-center hover:border-brand-accent/30 transition">
                <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                <p className="text-sm text-brand-text-secondary">{item.desc}</p>
              </div>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </section>

      {/* Testimonials */}
      <section className="max-w-7xl mx-auto px-4 py-16 border-t border-brand-border">
        <ScrollReveal className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-3">Quem ja confia</h2>
          <p className="text-brand-text-secondary max-w-2xl mx-auto">
            Times que substituiram suas proprias integracoes por uma unica API.
          </p>
        </ScrollReveal>

        <StaggerGroup className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" stagger={0.08}>
          {testimonials.map((t) => (
            <StaggerItem key={t.name}>
              <div className="p-6 rounded-2xl bg-brand-surface/50 backdrop-blur border border-brand-border hover:border-brand-text/20 transition flex flex-col h-full">
                <p className="text-sm text-brand-text leading-relaxed mb-4 flex-1">"{t.text}"</p>
                <div className="flex items-center gap-3 pt-4 border-t border-brand-border">
                  <div className="w-10 h-10 rounded-full bg-brand-accent/20 flex items-center justify-center text-brand-accent font-semibold text-sm">
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <div className="text-sm font-medium">{t.name}</div>
                    <div className="text-xs text-brand-text-secondary">{t.role} · {t.country}</div>
                  </div>
                </div>
              </div>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </section>

      {/* Final CTA */}
      <section className="max-w-7xl mx-auto px-4 py-20 text-center border-t border-brand-border relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-brand-accent/10 rounded-full blur-[100px]" />
        </div>
        <ScrollReveal className="relative">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Pronto para escalar seu conteudo?</h2>
          <p className="text-brand-text-secondary mb-8 max-w-xl mx-auto">
            Teste de graca. Nao precisa de cartao. Mude de plano quando quiser.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-brand-accent text-brand-bg font-semibold hover:bg-brand-accent-hover transition shadow-[0_0_40px_rgba(138,180,248,0.3)]"
          >
            Comecar agora <ArrowRight className="w-4 h-4" />
          </Link>
        </ScrollReveal>
      </section>

      {/* Rich footer */}
      <Footer />
    </main>
  );
}
