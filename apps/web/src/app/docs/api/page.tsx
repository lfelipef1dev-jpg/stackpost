import type { Metadata } from 'next';
import Link from 'next/link';
import { Code, ArrowRight } from 'lucide-react';
import { ScrollReveal } from '@/components/animations';
import { Breadcrumb } from '@/components/Breadcrumb';
import { DocsHero } from '@/components/DocsHero';
import { DocsSidebar } from '@/components/DocsSidebar';
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
  PATCH: 'bg-yellow-500/20 text-yellow-400',
  DELETE: 'bg-error/20 text-error',
};

const endpoints = [
  // Posts
  { method: 'POST', path: '/post', desc: 'Criar post (rascunho ou agendado)' },
  { method: 'GET', path: '/post', desc: 'Listar posts (cursor pagination)' },
  { method: 'GET', path: '/post/{id}', desc: 'Detalhes de um post' },
  { method: 'PATCH', path: '/post/{id}', desc: 'Editar post' },
  { method: 'DELETE', path: '/post/{id}', desc: 'Deletar post' },
  { method: 'POST', path: '/post/publish', desc: 'Publicar post agendado' },
  { method: 'POST', path: '/post/bulk', desc: 'Postagem em massa (CSV)' },
  { method: 'POST', path: '/post/variants', desc: 'Criar variantes A/B' },
  { method: 'POST', path: '/post/approve', desc: 'Aprovar post (workflow)' },
  { method: 'GET', path: '/post/{id}/events', desc: 'SSE - status em tempo real' },
  // Social Accounts
  { method: 'POST', path: '/social-account/connect', desc: 'Conectar conta social (OAuth)' },
  { method: 'POST', path: '/social-account/set-channel', desc: 'Definir canal (Meta)' },
  { method: 'POST', path: '/social-account/refresh-channels', desc: 'Atualizar canais' },
  { method: 'GET', path: '/social-accounts', desc: 'Listar contas conectadas' },
  { method: 'DELETE', path: '/social-account/{id}', desc: 'Desconectar conta' },
  // Upload
  { method: 'POST', path: '/upload', desc: 'Upload simples (multipart, 90 MB)' },
  { method: 'POST', path: '/upload/init', desc: 'Direct upload (presigned URL, 30 min)' },
  { method: 'POST', path: '/upload/finalize', desc: 'Confirmar direct upload' },
  { method: 'POST', path: '/upload/multipart/init', desc: 'Multipart init (64 MiB chunks, 6h)' },
  { method: 'POST', path: '/upload/multipart/sign', desc: 'Re-sign part expirada' },
  { method: 'POST', path: '/upload/multipart/complete', desc: 'Completar multipart (ETags)' },
  { method: 'POST', path: '/upload/multipart/abort', desc: 'Abortar multipart' },
  { method: 'POST', path: '/upload/from-url', desc: 'Upload from URL (1 GB, 60s)' },
  { method: 'POST', path: '/upload/tus', desc: 'tus protocol (resumable)' },
  // Analytics
  { method: 'GET', path: '/analytics/post/{id}', desc: 'Analytics de um post' },
  { method: 'POST', path: '/analytics/post/force', desc: 'Forçar refresh analytics do post' },
  { method: 'GET', path: '/analytics/social-account/{id}', desc: 'Analytics de conta' },
  { method: 'POST', path: '/analytics/social-account/force', desc: 'Forçar refresh analytics da conta' },
  { method: 'GET', path: '/analytics/post/raw', desc: 'Analytics raw do post' },
  { method: 'GET', path: '/analytics/social-account/raw', desc: 'Analytics raw da conta' },
  // Comments
  { method: 'GET', path: '/comments', desc: 'Listar comentários' },
  { method: 'POST', path: '/comment', desc: 'Postar comentário (11 plataformas)' },
  { method: 'DELETE', path: '/comment/{id}', desc: 'Deletar comentário' },
  { method: 'POST', path: '/comment/import', desc: 'Importar comentários (async, 9 plataformas)' },
  // Imports
  { method: 'POST', path: '/post-history-import', desc: 'Importar histórico (15 plataformas)' },
  { method: 'POST', path: '/post-csv-import', desc: 'Importar CSV em massa' },
  // Webhooks
  { method: 'GET', path: '/webhooks', desc: 'Listar webhooks' },
  { method: 'POST', path: '/webhooks', desc: 'Criar webhook' },
  { method: 'PATCH', path: '/webhooks/{id}', desc: 'Editar webhook' },
  { method: 'DELETE', path: '/webhooks/{id}', desc: 'Deletar webhook' },
  { method: 'POST', path: '/webhooks/replay', desc: 'Reenviar eventos (replay)' },
  { method: 'GET', path: '/webhook-events', desc: 'Listar eventos entregues' },
  // Usage
  { method: 'GET', path: '/usage/daily-limits', desc: 'Limites diários por conta' },
  { method: 'GET', path: '/usage/monthly', desc: 'Uso mensal da organização' },
  // Organization
  { method: 'GET', path: '/organization', desc: 'Dados da organização' },
  { method: 'PATCH', path: '/organization', desc: 'Editar organização' },
  { method: 'GET', path: '/organization/teams', desc: 'Listar times' },
  { method: 'POST', path: '/organization/teams', desc: 'Criar time' },
  { method: 'GET', path: '/organization/api-keys', desc: 'Listar API keys' },
  { method: 'POST', path: '/organization/api-keys', desc: 'Criar API key' },
  { method: 'DELETE', path: '/organization/api-keys/{id}', desc: 'Revogar API key' },
  // Misc - Instagram
  { method: 'GET', path: '/misc/instagram/audio', desc: 'Reels Music API' },
  { method: 'GET', path: '/misc/instagram/locations', desc: 'Localizações' },
  { method: 'GET', path: '/misc/instagram/tags', desc: 'Business discovery (tags)' },
  // Misc - LinkedIn
  { method: 'GET', path: '/misc/linkedin/mentions/builder', desc: 'Menções' },
  // Misc - YouTube
  { method: 'GET', path: '/misc/youtube/playlists', desc: 'Listar playlists' },
  { method: 'POST', path: '/misc/youtube/playlists', desc: 'Criar playlist' },
  { method: 'POST', path: '/misc/youtube/playlists/items', desc: 'Adicionar item à playlist' },
  // Misc - TikTok
  { method: 'GET', path: '/misc/tiktok/cml/trending-list', desc: 'CML trending list' },
  // Misc - Reddit
  { method: 'GET', path: '/misc/reddit/subreddit-flairs', desc: 'Flairs do subreddit' },
  { method: 'GET', path: '/misc/reddit/post-requirements', desc: 'Regras de postagem' },
  // Misc - Google Business
  { method: 'GET', path: '/misc/google-business/locations', desc: 'Listar locations' },
  { method: 'POST', path: '/misc/google-business/locations', desc: 'Criar location' },
  { method: 'PATCH', path: '/misc/google-business/locations/{id}', desc: 'Editar location' },
  { method: 'GET', path: '/misc/google-business/reviews', desc: 'Listar reviews' },
  { method: 'POST', path: '/misc/google-business/reviews/reply', desc: 'Responder review' },
  // AI
  { method: 'POST', path: '/post/ai-caption', desc: 'Gerar legendas com IA (Nexus)' },
  { method: 'POST', path: '/post/ai-hashtags', desc: 'Sugerir hashtags com IA' },
  // Link in bio
  { method: 'GET', path: '/link-in-bio', desc: 'Listar páginas link in bio' },
  { method: 'POST', path: '/link-in-bio', desc: 'Criar página link in bio' },
  { method: 'PATCH', path: '/link-in-bio/{id}', desc: 'Editar página' },
  { method: 'DELETE', path: '/link-in-bio/{id}', desc: 'Deletar página' },
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

      <div className="max-w-6xl mx-auto px-4 pb-12">
        <div className="grid lg:grid-cols-[240px_1fr] gap-10">
          <aside className="hidden lg:block border-r border-brand-border/40 pr-6">
            <DocsSidebar />
          </aside>
          <div className="min-w-0">
            <ScrollReveal className="mb-6">
              <h2 className="text-2xl font-bold">Endpoints principais</h2>
              <p className="text-sm text-brand-text-secondary mt-1">{endpoints.length} endpoints documentados de 114 totais.</p>
            </ScrollReveal>
            <div className="space-y-2">
              {endpoints.map((ep) => (
                <div key={`${ep.method}-${ep.path}`} className="flex items-center gap-4 p-3 rounded-xl bg-brand-surface/50 border border-brand-border hover:border-brand-accent/30 transition">
                  <span className={`px-2.5 py-1 rounded text-xs font-mono font-bold w-16 text-center ${methodStyles[ep.method]}`}>
                    {ep.method}
                  </span>
                  <code className="text-sm font-mono text-brand-text flex-shrink-0">{ep.path}</code>
                  <span className="text-sm text-brand-text-secondary ml-auto text-right">{ep.desc}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

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
