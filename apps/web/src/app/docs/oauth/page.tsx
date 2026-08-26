import type { Metadata } from 'next';
import Link from 'next/link';
import { Key, ArrowRight } from 'lucide-react';
import { FadeIn, ScrollReveal } from '@/components/animations';
import { Breadcrumb } from '@/components/Breadcrumb';
import { JsonLd, serviceSchema } from '@/components/JsonLd';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'OAuth - Conecte contas sociais',
  description: 'OAuth do StackPost: conecte Instagram, Facebook, TikTok, YouTube, LinkedIn, X, Pinterest, Reddit, Snapchat e Bluesky via OAuth 2.0. Fluxo authorization code com callback.',
  alternates: { canonical: '/docs/oauth' },
};

const jsonLd = serviceSchema('StackPost OAuth', 'OAuth 2.0 para conectar contas sociais.', '/docs/oauth');

const platforms = [
  { name: 'Instagram', via: 'Meta Graph API (Facebook Login)' },
  { name: 'Facebook', via: 'Meta Graph API' },
  { name: 'TikTok', via: 'TikTok Content API' },
  { name: 'YouTube', via: 'Google OAuth 2.0' },
  { name: 'LinkedIn', via: 'LinkedIn OAuth 2.0' },
  { name: 'X / Twitter', via: 'Twitter API v2 OAuth 2.0' },
  { name: 'Pinterest', via: 'Pinterest API v5' },
  { name: 'Reddit', via: 'Reddit OAuth 2.0' },
  { name: 'Snapchat', via: 'Snapchat Marketing API' },
  { name: 'Bluesky', via: 'AT Protocol (PDS)' },
];

export default function DocsOauthPage() {
  return (
    <main className="min-h-screen bg-brand-bg text-brand-text">
      <JsonLd data={jsonLd} />
      <Breadcrumb items={[{ name: 'Home', path: '/' }, { name: 'Documentacao', path: '/docs' }, { name: 'OAuth', path: '/docs/oauth' }]} />
      <section className="relative pt-20 pb-12 px-4">
        <div className="max-w-4xl mx-auto">
          <FadeIn>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-brand-accent/30 bg-brand-accent/8 mb-6">
              <Key className="w-3.5 h-3.5 text-brand-accent" />
              <span className="text-xs font-mono text-brand-accent">OAuth</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">OAuth</h1>
            <p className="text-lg text-brand-text-secondary mb-8 max-w-2xl">
              Conecte contas sociais via OAuth 2.0. Fluxo authorization code com callback.
              O StackPost armazena access_token e refresh_token com seguranca.
            </p>
          </FadeIn>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-4 pb-12">
        <ScrollReveal className="mb-6">
          <h2 className="text-2xl font-bold">Plataformas suportadas</h2>
        </ScrollReveal>
        <div className="grid sm:grid-cols-2 gap-4">
          {platforms.map((p) => (
            <div key={p.name} className="p-4 rounded-xl bg-brand-surface/50 backdrop-blur border border-brand-border">
              <h3 className="font-semibold text-brand-text">{p.name}</h3>
              <p className="text-sm text-brand-text-secondary mt-1">{p.via}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-4 pb-12">
        <ScrollReveal>
          <h2 className="text-2xl font-bold mb-4">Fluxo</h2>
          <pre className="p-6 rounded-xl bg-brand-surface border border-brand-border overflow-x-auto text-sm font-mono text-brand-text-secondary"><code>{`# 1. Redirecionar usuario
GET /api/oauth/meta?team_id=team_123
-> 302 https://www.facebook.com/v19.0/dialog/oauth?...

# 2. Callback apos consentimento
GET /api/oauth/meta/callback?code=...&state=...
-> 200 { account_id, platform, username }

# 3. Usar conta para publicar
POST /api/posts
{ platforms: ["instagram"], uploadIds: [...], text: "..." }`}</code></pre>
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
