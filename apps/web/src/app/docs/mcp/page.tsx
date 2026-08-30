import type { Metadata } from 'next';
import Link from 'next/link';
import { Bot, ArrowRight } from 'lucide-react';
import { ScrollReveal } from '@/components/animations';
import { Breadcrumb } from '@/components/Breadcrumb';
import { DocsHero } from '@/components/DocsHero';
import { JsonLd, serviceSchema } from '@/components/JsonLd';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'MCP Server - Model Context Protocol para AI agents',
  description: 'MCP server do StackPost: Claude, Cursor e demais AI agents podem criar posts, listar contas, consultar analytics e fazer upload de mídia via Model Context Protocol.',
  alternates: { canonical: '/docs/mcp' },
};

const jsonLd = serviceSchema('StackPost MCP Server', 'Model Context Protocol para AI agents publicarem posts de forma padronizada.', '/docs/mcp');

const tools = [
  { name: 'create_post', desc: 'Cria e, opcionalmente, publica um post em múltiplas plataformas sociais.' },
  { name: 'list_posts', desc: 'Lista posts com paginação por cursor e filtros por plataforma.' },
  { name: 'list_accounts', desc: 'Lista as contas sociais conectadas e seus respectivos status.' },
  { name: 'get_analytics', desc: 'Obtém métricas normalizadas de um post ou de uma conta específica.' },
  { name: 'upload_from_url', desc: 'Realiza upload de mídia a partir de uma URL pública.' },
  { name: 'get_best_time', desc: 'Sugere o melhor horário para publicar com base em modelo de ML.' },
  { name: 'generate_caption', desc: 'Gera legendas com IA (Nexus IA) adaptadas a cada plataforma.' },
  { name: 'suggest_hashtags', desc: 'Sugere hashtags com base em trending topics e nicho do conteúdo.' },
];

export default function DocsMcpPage() {
  return (
    <main className="min-h-screen bg-brand-bg text-brand-text">
      <JsonLd data={jsonLd} />
      <Breadcrumb items={[{ name: 'Home', path: '/' }, { name: 'Documentação', path: '/docs' }, { name: 'MCP Server', path: '/docs/mcp' }]} />
      <DocsHero
        icon={Bot}
        label="MCP Server"
        title="MCP Server"
        description="Model Context Protocol para AI agents. Claude, Cursor e outros LLMs podem criar posts, listar contas, ver analytics e fazer upload via ferramentas MCP padronizadas."
        color="#6364FF"
      />

      <section className="max-w-4xl mx-auto px-4 pb-12">
        <ScrollReveal className="mb-6">
          <h2 className="text-2xl font-bold">Ferramentas disponíveis</h2>
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
          <h2 className="text-2xl font-bold mb-4">Configuração no Claude Desktop</h2>
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
          Voltar para documentação <ArrowRight className="w-4 h-4" />
        </Link>
      </section>

      <Footer />
    </main>
  );
}
