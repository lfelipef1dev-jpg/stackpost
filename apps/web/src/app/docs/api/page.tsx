import type { Metadata } from 'next';
import Link from 'next/link';
import { Code, ArrowRight } from 'lucide-react';
import { ScrollReveal } from '@/components/animations';
import { Breadcrumb } from '@/components/Breadcrumb';
import { DocsHero } from '@/components/DocsHero';
import { JsonLd, serviceSchema } from '@/components/JsonLd';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'API Reference - 114 endpoints (OpenAPI 3.1)',
  description: 'Referência completa da API do StackPost: 114 endpoints, OpenAPI 3.1, autenticação via x-api-key, rate limit em 3 camadas, cursor pagination, idempotency keys e SSE.',
  alternates: { canonical: '/docs/api' },
};

const jsonLd = serviceSchema('StackPost API Reference', '114 endpoints REST com OpenAPI 3.1.', '/docs/api');

const methodStyles: Record<string, string> = {
  GET: 'bg-info/20 text-info',
  POST: 'bg-success/20 text-success',
};

const endpoints = [
  { method: 'POST', path: '/post', desc: 'Criar post' },
  { method: 'GET', path: '/post', desc: 'Listar posts (cursor pagination)' },
  { method: 'POST', path: '/post/publish', desc: 'Publicar post' },
  { method: 'POST', path: '/post/bulk', desc: 'Postagem em massa (CSV)' },
  { method: 'POST', path: '/post/variants', desc: 'Criar variantes A/B' },
  { method: 'POST', path: '/post/approve', desc: 'Aprovar post (workflow)' },
  { method: 'GET', path: '/social-accounts', desc: 'Listar contas conectadas' },
  { method: 'POST', path: '/upload', desc: 'Upload simples (multipart)' },
  { method: 'POST', path: '/upload/init', desc: 'Iniciar direct upload (presigned)' },
  { method: 'POST', path: '/upload/multipart', desc: 'Multipart resumable (64 MiB chunks)' },
  { method: 'POST', path: '/upload/from-url', desc: 'Upload from URL (1 GB max)' },
  { method: 'POST', path: '/upload/tus', desc: 'tus protocol (resumable)' },
  { method: 'GET', path: '/analytics', desc: 'Analytics normalizado' },
  { method: 'GET', path: '/analytics/raw', desc: 'Analytics raw por plataforma' },
  { method: 'GET', path: '/comments', desc: 'Listar comentários' },
  { method: 'POST', path: '/comments', desc: 'Postar comentário' },
  { method: 'GET', path: '/webhooks', desc: 'Listar webhooks' },
  { method: 'POST', path: '/webhooks', desc: 'Criar webhook' },
  { method: 'POST', path: '/webhooks/replay', desc: 'Reenviar eventos (replay)' },
  { method: 'GET', path: '/usage/daily-limits', desc: 'Limites diários por conta' },
  { method: 'GET', path: '/usage/monthly', desc: 'Uso mensal da organização' },
];

export default function DocsApiPage() {
  return (
    <main className="min-h-screen bg-brand-bg text-brand-text">
      <JsonLd data={jsonLd} />
      <Breadcrumb items={[{ name: 'Home', path: '/' }, { name: 'Documentação', path: '/docs' }, { name: 'API Reference', path: '/docs/api' }]} />
      <DocsHero
        icon={Code}
        label="API Reference"
        title="API Reference"
        description="114 endpoints REST. OpenAPI 3.1. Autenticação via header x-api-key. Rate limit em 3 camadas (100/1s, 500/10s, 2000/60s). Cursor pagination. Idempotency keys. SSE para status em tempo real."
        color="#25F4EE"
      />

      <section className="max-w-4xl mx-auto px-4 pb-12">
        <ScrollReveal className="mb-6">
          <h2 className="text-2xl font-bold">Endpoints principais</h2>
        </ScrollReveal>
        <div className="space-y-2">
          {endpoints.map((ep) => (
            <div key={`${ep.method}-${ep.path}`} className="flex items-center gap-4 p-4 rounded-xl bg-brand-surface/50 backdrop-blur border border-brand-border">
              <span className={`px-2.5 py-1 rounded text-xs font-mono font-bold ${methodStyles[ep.method]}`}>
                {ep.method}
              </span>
              <code className="text-sm font-mono text-brand-text">{ep.path}</code>
              <span className="text-sm text-brand-text-secondary ml-auto">{ep.desc}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-4 pb-20">
        <ScrollReveal>
          <h2 className="text-2xl font-bold mb-4">Exemplo de requisição</h2>
          <div className="p-6 rounded-xl bg-brand-surface border border-brand-border overflow-x-auto">
            <pre className="text-sm font-mono text-brand-text-secondary"><code>{`curl -X POST https://api.stackpost.com.br/post \\
  -H "x-api-key: sk_live_..." \\
  -H "Content-Type: application/json" \\
  -H "Idempotency-Key: uuid-1234" \\
  -d '{
    "platforms": ["instagram", "tiktok", "linkedin"],
    "text": "Lançamento!",
    "uploadIds": ["upl_abc123"]
  }'`}</code></pre>
          </div>
        </ScrollReveal>
        <div className="mt-8">
          <Link href="/docs" className="inline-flex items-center gap-2 text-brand-accent hover:text-brand-accent-hover hover:underline">
            Voltar para documentação <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  );
}
