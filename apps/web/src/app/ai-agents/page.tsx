import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Bot, KeyRound, Eye } from 'lucide-react';
import { ScrollReveal, FadeIn } from '@/components/animations';
import { JsonLd, serviceSchema } from '@/components/JsonLd';
import LandingHeader from '@/components/LandingHeader';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'StackPost for AI Agents - MCP server para Claude, Cursor e AI agents',
  description: 'Model Context Protocol nativo para Claude, Cursor, ChatGPT e Gemini. Agent Permission Layer com scopes, tokens, expiration e human-in-the-loop.',
  alternates: { canonical: '/ai-agents' },
};

const jsonLd = serviceSchema('StackPost for AI Agents', 'MCP server para AI agents.', '/ai-agents');

const mcpClients = ['Claude', 'Cursor', 'ChatGPT', 'Gemini'];

const permissionFeatures = [
  { title: 'Scopes granulares', desc: 'Defina exatamente quais plataformas e acoes cada agent pode acessar.' },
  { title: 'Tokens com expiration', desc: 'Tokens expiram automaticamente. Renovacao sob demanda.' },
  { title: 'Approval workflow', desc: 'Acoes sensiveis exigem aprovacao humana antes de executar.' },
  { title: 'Audit completo', desc: 'Cada acao do agent registrada com token, scope e timestamp.' },
];

const hitlSteps = ['Draft', 'Review', 'Approved', 'Scheduled'];

export default function AiAgentsPage() {
  return (
    <main className="min-h-screen bg-brand-bg text-brand-text">
      <JsonLd data={jsonLd} />
      <LandingHeader />

      {/* Hero com glow roxo */}
      <section className="relative pt-24 pb-20 px-4 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] rounded-full blur-[140px]" style={{ background: '#A855F715' }} />
          <div className="absolute bottom-0 left-1/3 w-[400px] h-[400px] rounded-full blur-[120px]" style={{ background: '#A855F710' }} />
          <div className="absolute top-0 left-0 w-[300px] h-[300px] rounded-full blur-[100px]" style={{ background: '#A855F708' }} />
        </div>
        <div className="max-w-5xl mx-auto relative text-center">
          <FadeIn>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border mb-6" style={{ borderColor: '#A855F740', backgroundColor: '#A855F710' }}>
              <Bot className="w-3.5 h-3.5" style={{ color: '#A855F7' }} />
              <span className="text-xs font-mono" style={{ color: '#A855F7' }}>AI Agents</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight" style={{ color: 'color-mix(in srgb, #A855F7 25%, white)' }}>
              StackPost for AI Agents
            </h1>
            <p className="text-lg text-brand-text-secondary max-w-2xl mx-auto">
              MCP server nativo para Claude, Cursor, ChatGPT e Gemini. Seu AI agent publica em 15 plataformas com uma integracao.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* MCP Server */}
      <section className="max-w-5xl mx-auto px-4 md:px-6 pb-20">
        <ScrollReveal>
          <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center">MCP Server</h2>
          <p className="text-brand-text-secondary text-center max-w-2xl mx-auto mb-8">
            Model Context Protocol nativo. Conecte seu AI agent ao StackPost e publique em 15 plataformas sem escrever uma linha de integracao.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {mcpClients.map((client) => (
              <span key={client} className="px-4 py-2 rounded-lg bg-brand-surface/60 border border-brand-border/50 text-sm font-mono" style={{ color: '#A855F7' }}>
                {client}
              </span>
            ))}
          </div>
        </ScrollReveal>
      </section>

      {/* Como funciona - diagrama */}
      <section className="max-w-5xl mx-auto px-4 md:px-6 pb-20">
        <ScrollReveal>
          <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center">Como funciona</h2>
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8">
            <div className="px-6 py-4 rounded-xl bg-brand-surface/60 border border-brand-border/50 text-center">
              <p className="text-sm font-mono text-brand-text-secondary mb-1">Step 1</p>
              <p className="font-bold text-brand-text">AI Agent</p>
              <p className="text-xs text-brand-text-secondary mt-1">Claude, Cursor, ChatGPT</p>
            </div>
            <ArrowRight className="w-6 h-6 text-brand-text-secondary rotate-90 md:rotate-0" />
            <div className="px-6 py-4 rounded-xl border text-center" style={{ borderColor: '#A855F740', backgroundColor: '#A855F710' }}>
              <p className="text-sm font-mono mb-1" style={{ color: '#A855F7' }}>Step 2</p>
              <p className="font-bold text-brand-text">StackPost MCP</p>
              <p className="text-xs text-brand-text-secondary mt-1">Model Context Protocol</p>
            </div>
            <ArrowRight className="w-6 h-6 text-brand-text-secondary rotate-90 md:rotate-0" />
            <div className="px-6 py-4 rounded-xl bg-brand-surface/60 border border-brand-border/50 text-center">
              <p className="text-sm font-mono text-brand-text-secondary mb-1">Step 3</p>
              <p className="font-bold text-brand-text">15 plataformas</p>
              <p className="text-xs text-brand-text-secondary mt-1">Instagram, LinkedIn, X...</p>
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* Agent Permission Layer */}
      <section className="max-w-5xl mx-auto px-4 md:px-6 pb-20">
        <ScrollReveal>
          <div className="flex items-center gap-3 mb-8 justify-center">
            <KeyRound className="w-6 h-6" style={{ color: '#A855F7' }} />
            <h2 className="text-2xl md:text-3xl font-bold text-brand-text">Agent Permission Layer</h2>
          </div>
        </ScrollReveal>
        <div className="grid sm:grid-cols-2 gap-4">
          {permissionFeatures.map((item) => (
            <ScrollReveal key={item.title}>
              <div className="h-full p-6 rounded-2xl bg-brand-surface/60 backdrop-blur-xl border border-brand-border/50">
                <h3 className="text-lg font-bold text-brand-text mb-2">{item.title}</h3>
                <p className="text-sm text-brand-text-secondary">{item.desc}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* Human-in-the-loop */}
      <section className="max-w-5xl mx-auto px-4 md:px-6 pb-20">
        <ScrollReveal>
          <div className="flex items-center gap-3 mb-8 justify-center">
            <Eye className="w-6 h-6" style={{ color: '#A855F7' }} />
            <h2 className="text-2xl md:text-3xl font-bold text-brand-text">Human-in-the-loop</h2>
          </div>
          <div className="flex flex-col md:flex-row items-center justify-center gap-3 md:gap-2">
            {hitlSteps.map((step, i) => (
              <div key={step} className="flex items-center gap-3 md:gap-2">
                <div className="px-5 py-3 rounded-xl border" style={{ borderColor: '#A855F740', backgroundColor: '#A855F710' }}>
                  <span className="font-mono text-sm" style={{ color: '#A855F7' }}>{step}</span>
                </div>
                {i < hitlSteps.length - 1 && <ArrowRight className="w-5 h-5 text-brand-text-secondary rotate-90 md:rotate-0" />}
              </div>
            ))}
          </div>
          <p className="text-center text-sm text-brand-text-secondary mt-6 max-w-xl mx-auto">
            O agent cria o draft, um humano revisa, aprova e o post e agendado. Controle total sobre o que publica.
          </p>
        </ScrollReveal>
      </section>

      {/* Quick start MCP */}
      <section className="max-w-3xl mx-auto px-4 md:px-6 pb-20">
        <ScrollReveal>
          <h2 className="text-2xl md:text-3xl font-bold mb-6 text-center">Quick start MCP</h2>
          <div className="rounded-2xl bg-brand-surface/60 backdrop-blur-xl border border-brand-border/50 overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-brand-border/50">
              <div className="w-3 h-3 rounded-full bg-brand-text-secondary/30" />
              <div className="w-3 h-3 rounded-full bg-brand-text-secondary/30" />
              <div className="w-3 h-3 rounded-full bg-brand-text-secondary/30" />
              <span className="ml-2 text-xs font-mono text-brand-text-secondary">claude_desktop_config.json</span>
            </div>
            <pre className="p-4 overflow-x-auto text-sm font-mono text-brand-text-secondary"><code>{`{
  "mcpServers": {
    "stackpost": {
      "command": "npx",
      "args": ["@stackpost/mcp"],
      "env": { "STACKPOST_API_KEY": "sk_live_..." }
    }
  }
}`}</code></pre>
          </div>
        </ScrollReveal>
      </section>

      {/* CTA */}
      <section className="max-w-5xl mx-auto px-4 md:px-6 pb-20 text-center">
        <ScrollReveal>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 px-6 py-3 font-bold rounded-lg hover:scale-105 transition-transform"
              style={{ backgroundColor: '#A855F7', color: '#0A0A0A' }}
            >
              Comecar gratis <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/docs/mcp"
              className="px-6 py-3 rounded-xl border border-brand-border text-brand-text hover:bg-brand-elevated transition"
            >
              Documentacao MCP
            </Link>
          </div>
        </ScrollReveal>
      </section>

      <Footer />
    </main>
  );
}
