import Link from 'next/link';
import type { Metadata } from 'next';
import { BookOpen, Code, Terminal, Bot, Webhook, Key, ArrowRight, User, Globe, Layers, Zap, Check } from 'lucide-react';
import { ScrollReveal, StaggerGroup, StaggerItem, FadeIn } from '@/components/animations';
import { Breadcrumb } from '@/components/Breadcrumb';
import { DocsSidebar } from '@/components/DocsSidebar';
import { PlatformIcon } from '@/components/PlatformIcon';
import { PLATFORMS } from '@/lib/platforms';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Documentação — Como usar e integrar o StackPost',
  description: 'Guia do usuário e documentação técnica do StackPost. Aprenda a conectar redes sociais, publicar e agendar pelo dashboard, ou integre via API, SDK, CLI, MCP Server e Webhooks.',
  alternates: { canonical: '/docs' },
};

const devSections = [
  { title: 'API Reference', desc: '114 endpoints. OpenAPI 3.1. Scalar docs.', icon: Code, href: '/docs/api' },
  { title: 'SDK', desc: 'TypeScript, Python, Go. Gerado de OpenAPI.', icon: BookOpen, href: '/docs/sdk' },
  { title: 'CLI', desc: 'Linha de comando. Publique do terminal.', icon: Terminal, href: '/docs/cli' },
  { title: 'MCP Server', desc: 'Model Context Protocol para AI agents.', icon: Bot, href: '/docs/mcp' },
  { title: 'Webhooks', desc: '9 eventos. HMAC-SHA256. Replay.', icon: Webhook, href: '/docs/webhooks' },
  { title: 'OAuth Técnico', desc: 'Fluxo authorization code e callbacks.', icon: Key, href: '/docs/oauth' },
];

const userSteps = [
  {
    step: 1,
    title: 'Crie sua conta',
    desc: 'Registre-se grátis em /register. Sem cartão. Você é o administrador do workspace.',
    icon: User,
  },
  {
    step: 2,
    title: 'Conecte suas redes',
    desc: 'No dashboard, clique em "Contas", escolha a rede e autorize. Você faz login na própria rede e aprova o acesso. O StackPost nunca pede sua senha.',
    icon: Globe,
  },
  {
    step: 3,
    title: 'Crie e programe posts',
    desc: 'Use "Criar post" para texto, imagem, vídeo ou carrossel. Escolha as redes, defina data e hora e publique ou agende.',
    icon: Layers,
  },
  {
    step: 4,
    title: 'Acompanhe resultados',
    desc: 'Veja status de publicação, comentários, analytics e histórico em um só lugar.',
    icon: Zap,
  },
];

export default function DocsPage() {
  return (
    <main className="min-h-screen bg-brand-bg text-brand-text">
      <Breadcrumb items={[{ name: 'Home', path: '/' }, { name: 'Documentação', path: '/docs' }]} />

      {/* Hero com identidade StackPost */}
      <section className="relative pt-24 pb-16 px-4 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] rounded-full blur-[140px] bg-brand-accent/10" />
          <div className="absolute bottom-0 left-1/3 w-[400px] h-[400px] rounded-full blur-[120px] bg-brand-accent/8" />
        </div>

        <div className="max-w-5xl mx-auto relative">
          <FadeIn>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-brand-accent/40 bg-brand-accent/10 mb-6">
              <BookOpen className="w-3.5 h-3.5 text-brand-accent" />
              <span className="text-xs font-mono text-brand-accent">Documentação</span>
            </div>

            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Como usar o <span className="text-brand-accent">StackPost</span>
            </h1>

            <p className="text-lg text-brand-text-secondary mb-8 max-w-2xl">
              Você não precisa saber programar. O StackPost funciona como qualquer plataforma: faça login, conecte suas redes e publique. Se for desenvolvedor, a API unificada está logo abaixo.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link
                href="/register"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-accent text-brand-bg font-semibold hover:opacity-90 transition"
              >
                Começar grátis <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/docs/api"
                className="px-6 py-3 rounded-xl border border-brand-border text-brand-text hover:bg-brand-elevated transition"
              >
                Ver API Reference
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Conteudo com sidebar */}
      <div className="max-w-6xl mx-auto px-4 pb-20">
        <div className="grid lg:grid-cols-[240px_1fr] gap-10">
          {/* Sidebar */}
          <aside className="hidden lg:block border-r border-brand-border/40 pr-6">
            <DocsSidebar />
          </aside>

          {/* Conteudo principal */}
          <div className="min-w-0">
            {/* Guia do usuario */}
            <section className="pb-16">
              <ScrollReveal className="mb-8">
                <h2 className="text-2xl font-bold mb-2">Guia do usuário</h2>
                <p className="text-brand-text-secondary">Fluxo completo em 4 passos. Nenhum código exigido.</p>
              </ScrollReveal>

              <div className="grid sm:grid-cols-2 gap-4">
                {userSteps.map((q, i) => (
                  <ScrollReveal key={q.step} delay={i * 0.05}>
                    <div className="p-5 rounded-xl bg-brand-surface/50 border border-brand-border hover:border-brand-accent/30 transition h-full">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-10 h-10 rounded-lg bg-brand-accent/10 flex items-center justify-center">
                          <q.icon className="w-5 h-5 text-brand-accent" />
                        </div>
                        <span className="text-2xl font-black text-brand-text-secondary/30 font-mono">0{q.step}</span>
                      </div>
                      <h3 className="font-semibold text-lg mb-1">{q.title}</h3>
                      <p className="text-sm text-brand-text-secondary leading-relaxed">{q.desc}</p>
                    </div>
                  </ScrollReveal>
                ))}
              </div>

              <ScrollReveal className="mt-8">
                <Link
                  href="/docs/oauth"
                  className="inline-flex items-center gap-2 text-brand-accent hover:underline font-medium"
                >
                  Entenda como funciona o OAuth <ArrowRight className="w-4 h-4" />
                </Link>
              </ScrollReveal>
            </section>

            {/* 15 Plataformas */}
            <section className="pb-16">
              <ScrollReveal className="mb-6">
                <h2 className="text-2xl font-bold mb-2">Plataformas suportadas</h2>
                <p className="text-brand-text-secondary">15 redes sociais em uma única API. Clique para ver a documentação específica de cada uma.</p>
              </ScrollReveal>
              <StaggerGroup className="grid grid-cols-2 sm:grid-cols-3 gap-3" stagger={0.03}>
                {PLATFORMS.map((p) => (
                  <StaggerItem key={p.id}>
                    <Link
                      href={`${p.id === 'google_business' ? 'google-business' : p.id}-api`}
                      className="flex items-center gap-3 p-3 rounded-xl bg-brand-surface/50 border border-brand-border hover:border-brand-accent/40 transition group"
                    >
                      <PlatformIcon
                        id={p.id}
                        size={24}
                        color={p.brandColor}
                        className="w-6 h-6 shrink-0"
                        style={{ filter: `drop-shadow(0 0 12px ${p.brandColor})` } as React.CSSProperties}
                      />
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-brand-text group-hover:text-brand-accent transition truncate">{p.name}</div>
                        <div className="text-[10px] text-brand-text-secondary truncate">{p.description}</div>
                      </div>
                    </Link>
                  </StaggerItem>
                ))}
              </StaggerGroup>
            </section>

            {/* Code example */}
            <section className="pb-16">
              <ScrollReveal>
                <h2 className="text-2xl font-bold mb-4">Exemplo para desenvolvedores</h2>
                <p className="text-brand-text-secondary mb-4">
                  Se você quer automatizar a publicação, gere uma API key no dashboard e use o mesmo payload para todas as redes.
                </p>
                <div className="p-6 rounded-xl bg-brand-surface border border-brand-border overflow-x-auto">
                  <pre className="text-sm font-mono text-brand-text-secondary"><code>{`# Publicar em 3 plataformas com uma request
curl -X POST https://api.stackpost.com.br/post \\
  -H "x-api-key: sk_live_..." \\
  -H "Content-Type: application/json" \\
  -d '{
    "platforms": ["instagram", "tiktok", "linkedin"],
    "text": "Lançamento do produto X!",
    "uploadIds": ["upl_abc123"],
    "postDate": "2026-08-27T10:00:00Z",
    "firstComment": "Link na bio!"
  }'`}</code></pre>
                </div>
              </ScrollReveal>
            </section>

            {/* Seções técnicas */}
            <section className="pb-20">
              <ScrollReveal className="mb-6">
                <h2 className="text-2xl font-bold">Para desenvolvedores</h2>
              </ScrollReveal>
              <StaggerGroup className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4" stagger={0.05}>
                {devSections.map((s) => (
                  <StaggerItem key={s.title}>
                    <Link href={s.href} className="block p-5 rounded-xl bg-brand-surface/50 border border-brand-border hover:border-brand-accent/30 transition group h-full">
                      <s.icon className="w-6 h-6 text-brand-accent mb-3" />
                      <h3 className="font-semibold mb-1 group-hover:text-brand-accent transition">{s.title}</h3>
                      <p className="text-sm text-brand-text-secondary">{s.desc}</p>
                    </Link>
                  </StaggerItem>
                ))}
              </StaggerGroup>
            </section>

            {/* CTA */}
            <section className="pb-12 text-center">
              <ScrollReveal>
                <div className="p-8 rounded-2xl bg-gradient-to-br from-brand-surface/80 to-brand-surface/40 border border-brand-border">
                  <h2 className="text-2xl font-bold mb-3">Pronto para começar?</h2>
                  <p className="text-brand-text-secondary mb-6">Crie sua conta grátis. Sem cartão. API key em segundos.</p>
                  <div className="flex flex-wrap items-center justify-center gap-4">
                    <Link href="/register" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-accent text-brand-bg font-semibold hover:opacity-90 transition">
                      Criar conta grátis <ArrowRight className="w-4 h-4" />
                    </Link>
                    <Link href="/plans" className="px-6 py-3 rounded-xl border border-brand-border text-brand-text hover:bg-brand-elevated transition">
                      Ver planos
                    </Link>
                  </div>
                </div>
              </ScrollReveal>
            </section>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
