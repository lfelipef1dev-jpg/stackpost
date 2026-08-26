import type { Metadata } from 'next';
import Link from 'next/link';
import { Bot, ArrowRight } from 'lucide-react';
import { FadeIn, ScrollReveal } from '@/components/animations';
import { Breadcrumb } from '@/components/Breadcrumb';
import { JsonLd, serviceSchema } from '@/components/JsonLd';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'MCP Server - Model Context Protocol para AI agents',
  description: 'MCP server do StackPost: Claude, Cursor e outros AI agents podem criar posts, listar contas, ver analytics e fazer upload de midia via Model Context Protocol.',
  alternates: { canonical: '/docs/mcp' },
};

const jsonLd = serviceSchema('StackPost MCP Server', 'Model Context Protocol para AI agents publicarem posts.', '/docs/mcp');

const tools = [
  { name: 'create_post', desc: 'Criar e opcionalmente publicar post em multiplas plataformas' },
  { name: 'list_posts', desc: 'Listar posts com cursor pagination' },
  { name: 'list_accounts', desc: 'Listar contas sociais conectadas' },
  { name: 'get_analytics', desc: 'Obter analytics normalizado de um post ou conta' },
  { name: 'upload_from_url', desc: 'Fazer upload de midia a partir de uma URL' },
  { name: 'get_best_time', desc: 'Sugestao de melhor horario para postar (ML)' },
  { name: 'generate_caption', desc: 'Gerar caption com AI (Nexus IA) por plataforma' },
  { name: 'suggest_hashtags', desc: 'Sugerir hashtags baseadas em trending e nicho' },
];

export default function DocsMcpPage() {
  return (
    <main className="min-h-screen bg-brand-bg text-brand-text">
      <JsonLd data={jsonLd} />
      <Breadcrumb items={[{ name: 'Home', path: '/' }, { name: 'Documentacao', path: '/docs' }, { name: 'MCP Server', path: '/docs/mcp' }]} />
      <section className="relative pt-20 pb-12 px-4">
        <div className="max-w-4xl mx-auto">
          <FadeIn>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-brand-accent/30 bg-brand-accent/8 mb-6">
              <Bot className="w-3.5 h-3.5 text-brand-accent" />
              <span className="text-xs font-mono text-brand-accent">MCP Server</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">MCP Server</h1>
            <p className="text-lg text-brand-text-secondary mb-8 max-w-2xl">
              Model Context Protocol para AI agents. Claude, Cursor e outros LLMs podem criar posts, listar contas,
              ver analytics e fazer upload via ferramentas MCP padronizadas.
            </p>
          </FadeIn>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-4 pb-12">
        <ScrollReveal className="mb-6">
          <h2 className="text-2xl font-bold">Ferramentas disponiveis</h2>
        </ScrollReveal>
        <div className="grid sm:grid-cols-2 gap-4">
          {tools.map((t) => (
            <div key={t.name} className="p-5 rounded-xl bg-brand-surface/50 backdrop-blur border border-brand-border">
              <code className="text-sm font-mono text-brand-accent">{t.name}</code>
              <p className="text-sm text-brand-text-secondary mt-2">{t.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-4 pb-12">
        <ScrollReveal>
          <h2 className="text-2xl font-bold mb-4">Configuracao no Claude Desktop</h2>
          <pre className="p-6 rounded-xl bg-brand-surface border border-brand-border overflow-x-auto text-sm font-mono text-brand-text-secondary"><code>{`{
  "mcpServers": {
    "stackpost": {
      "command": "npx",
      "args": ["-y", "@stackpost/mcp-server"],
      "env": {
        "STACKPOST_API_KEY": "sk_live_..."
      }
    }
  }
}`}</code></pre>
        </ScrollReveal>
      </section>

      <section className="max-w-3xl mx-auto px-4 pb-20">
        <Link href="/docs" className="inline-flex items-center gap-2 text-brand-accent hover:underline">
          Voltar para documentacao <ArrowRight className="w-4 h-4" />
        </Link>
      </section>

      <Footer />
    </main>
  );
}
