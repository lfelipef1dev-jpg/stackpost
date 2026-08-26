import Link from 'next/link';
import type { Metadata } from 'next';
import { BookOpen, Code, Terminal, Bot, Webhook, Key, ArrowRight } from 'lucide-react';
import { FadeIn, ScrollReveal, StaggerGroup, StaggerItem } from '@/components/animations';
import { Breadcrumb } from '@/components/Breadcrumb';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Documentacao - API, SDK, CLI, MCP server e Webhooks',
  description: 'Documentacao completa do StackPost: API Reference com 114 endpoints (OpenAPI 3.1), SDK em TypeScript/Python/Go, CLI, MCP server para AI agents, Webhooks com HMAC-SHA256 e OAuth.',
  alternates: { canonical: '/docs' },
};

const sections = [
  { title: 'API Reference', desc: '114 endpoints. OpenAPI 3.1. Scalar docs.', icon: Code, href: '/docs/api' },
  { title: 'SDK', desc: 'TypeScript, Python, Go. Gerado de OpenAPI.', icon: BookOpen, href: '/docs/sdk' },
  { title: 'CLI', desc: 'Linha de comando. Publique do terminal.', icon: Terminal, href: '/docs/cli' },
  { title: 'MCP Server', desc: 'Model Context Protocol para AI agents.', icon: Bot, href: '/docs/mcp' },
  { title: 'Webhooks', desc: '9 eventos. HMAC-SHA256. Replay.', icon: Webhook, href: '/docs/webhooks' },
  { title: 'OAuth', desc: 'Conecte contas sociais via OAuth.', icon: Key, href: '/docs/oauth' },
];

const quickstart = [
  { step: 1, title: 'Crie sua conta', desc: 'Registre-se gratis. Sem cartao.' },
  { step: 2, title: 'Gere sua API key', desc: 'Header x-api-key com prefixo sk_live_.' },
  { step: 3, title: 'Conecte uma conta', desc: 'OAuth para Instagram, Facebook, etc.' },
  { step: 4, title: 'Faca seu primeiro post', desc: 'POST /post com text e uploadIds.' },
];

export default function DocsPage() {
  return (
    <main className="min-h-screen bg-brand-bg text-brand-text">
      <Breadcrumb items={[{ name: 'Home', path: '/' }, { name: 'Documentacao', path: '/docs' }]} />
      <section className="relative pt-32 pb-16 px-4 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-brand-accent/10 rounded-full blur-[120px]" />
        </div>
        <div className="max-w-4xl mx-auto relative">
          <FadeIn>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-brand-accent/30 bg-brand-accent/8 mb-6">
              <BookOpen className="w-3.5 h-3.5 text-brand-accent" />
              <span className="text-xs font-mono text-brand-accent">Documentacao</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Documentacao</h1>
            <p className="text-lg text-brand-text-secondary mb-8">Tudo que voce precisa para integrar o StackPost.</p>
          </FadeIn>
        </div>
      </section>

      {/* Quickstart */}
      <section className="max-w-4xl mx-auto px-4 pb-16">
        <ScrollReveal className="mb-6">
          <h2 className="text-2xl font-bold">Quickstart</h2>
        </ScrollReveal>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickstart.map((q, i) => (
            <ScrollReveal key={q.step} delay={i * 0.05}>
              <div className="p-5 rounded-xl bg-brand-surface/50 backdrop-blur border border-brand-border hover:border-brand-accent/30 transition h-full">
                <div className="w-8 h-8 rounded-lg bg-brand-accent/10 flex items-center justify-center mb-3">
                  <span className="text-sm font-bold text-brand-accent">{q.step}</span>
                </div>
                <h3 className="font-semibold mb-1">{q.title}</h3>
                <p className="text-sm text-brand-text-secondary">{q.desc}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* Sections */}
      <section className="max-w-4xl mx-auto px-4 pb-20">
        <ScrollReveal className="mb-6">
          <h2 className="text-2xl font-bold">Secoes</h2>
        </ScrollReveal>
        <StaggerGroup className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {sections.map((s) => (
            <StaggerItem key={s.title}>
              <Link href={s.href} className="block p-5 rounded-xl bg-brand-surface/50 backdrop-blur border border-brand-border hover:border-brand-accent/30 transition group h-full">
                <s.icon className="w-6 h-6 text-brand-accent mb-3" />
                <h3 className="font-semibold mb-1 group-hover:text-brand-accent transition">{s.title}</h3>
                <p className="text-sm text-brand-text-secondary">{s.desc}</p>
              </Link>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </section>

      {/* Code example */}
      <section className="max-w-3xl mx-auto px-4 pb-20">
        <ScrollReveal>
          <h2 className="text-2xl font-bold mb-4">Exemplo</h2>
          <div className="p-6 rounded-xl bg-brand-surface border border-brand-border overflow-x-auto">
            <pre className="text-sm font-mono text-brand-text-secondary"><code>{`# Publicar em 3 plataformas com uma request
curl -X POST https://api.stackpost.expostacker.com.br/post \\
  -H "x-api-key: sk_live_..." \\
  -H "Content-Type: application/json" \\
  -d '{
    "platforms": ["instagram", "tiktok", "linkedin"],
    "text": "Lancamento do produto X!",
    "uploadIds": ["upl_abc123"],
    "postDate": "2026-08-27T10:00:00Z",
    "firstComment": "Link na bio!"
  }'`}</code></pre>
          </div>
        </ScrollReveal>
      </section>

      <Footer />
    </main>
  );
}
