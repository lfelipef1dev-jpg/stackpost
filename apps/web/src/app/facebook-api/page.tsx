import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { ScrollReveal } from '@/components/animations';
import { Breadcrumb } from '@/components/Breadcrumb';
import { JsonLd, serviceSchema } from '@/components/JsonLd';
import Footer from '@/components/Footer';
import LandingHeader from '@/components/LandingHeader';

export const metadata: Metadata = {
  title: 'Facebook API - Publique posts, Reels, Stories e Pages via StackPost',
  description: 'API de Facebook do StackPost: posts, Reels, Stories e Pages. OAuth via Facebook, analytics de reach, engagement e video views.',
  alternates: { canonical: '/facebook-api' },
};

const jsonLd = serviceSchema(
  'Facebook API',
  'API de Facebook para publicar posts, Reels, Stories e gerenciar Pages. OAuth via Facebook com analytics de reach, engagement e video views.',
  '/facebook-api',
);

const features = [
  {
    title: 'Posts',
    desc: 'Publique texto, foto e video no feed de Pages com legenda e link preview.',
  },
  {
    title: 'Reels',
    desc: 'Reels no Facebook com audio, mix de midia e capa personalizada.',
  },
  {
    title: 'Stories',
    desc: 'Stories em Pages com stickers e links. Expiracao automatica em 24 horas.',
  },
  {
    title: 'Pages',
    desc: 'Gerencie multiplas Pages por workspace com tokens renovados automaticamente.',
  },
  {
    title: 'OAuth via Facebook',
    desc: 'Login com Facebook com escopo de pages_read_engagement e pages_manage_posts.',
  },
  {
    title: 'Analytics',
    desc: 'Reach, engagement e video views sincronizados em snapshots diarios.',
  },
];

export default function FacebookApiPage() {
  return (
    <main className="min-h-screen bg-brand-bg text-brand-text">
      <JsonLd data={jsonLd} />
      <LandingHeader />
      <div className="pt-16">
        <Breadcrumb
          items={[
            { name: 'Home', path: '/' },
            { name: 'Plataformas', path: '/platforms' },
            { name: 'Facebook API', path: '/facebook-api' },
          ]}
        />

        {/* Hero */}
        <section className="max-w-4xl mx-auto px-4 pt-10 pb-16 text-center">
          <ScrollReveal>
            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 mb-6 text-xs font-bold uppercase tracking-widest text-brand-accent border border-brand-accent/25 rounded-full bg-brand-accent/10">
              API de Facebook
            </span>
            <h1 className="font-display text-4xl md:text-6xl font-black leading-[1.05] tracking-[-0.04em] text-brand-text mb-6">
              API de <span className="text-brand-accent">Facebook</span>
            </h1>
            <p className="text-lg md:text-xl text-brand-text-secondary max-w-2xl mx-auto">
              Publique posts, Reels e Stories em Pages via uma unica API. OAuth via Facebook, gerenciamento de multiplas Pages e analytics de reach, engagement e video views.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/register"
                className="inline-flex items-center gap-2 px-6 py-3 bg-brand-accent text-brand-bg text-sm font-bold rounded-lg hover:scale-105 transition-transform"
              >
                Comecar agora <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/docs"
                className="inline-flex items-center gap-2 px-6 py-3 border border-brand-border text-brand-text text-sm font-bold rounded-lg hover:bg-brand-surface transition-colors"
              >
                Ver documentacao
              </Link>
            </div>
          </ScrollReveal>
        </section>

        {/* Recursos */}
        <section className="max-w-6xl mx-auto px-4 py-16">
          <ScrollReveal>
            <h2 className="text-3xl md:text-4xl font-black text-center text-brand-text mb-12">
              Recursos da API de Facebook
            </h2>
          </ScrollReveal>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <ScrollReveal key={feature.title}>
                <div className="p-6 rounded-xl bg-brand-surface border border-brand-border h-full">
                  <h3 className="text-lg font-bold text-brand-text mb-2">{feature.title}</h3>
                  <p className="text-sm text-brand-text-secondary">{feature.desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </section>

        {/* Quick start */}
        <section className="max-w-3xl mx-auto px-4 py-16">
          <ScrollReveal>
            <h2 className="text-3xl font-black text-brand-text mb-4">Quick start</h2>
            <p className="text-brand-text-secondary mb-6">
              Instale o SDK e publique em Pages do Facebook em poucas linhas. OAuth via Facebook ja incluido.
            </p>
            <pre className="p-6 rounded-xl bg-brand-surface border border-brand-border overflow-x-auto text-sm font-mono text-brand-text-secondary">
              <code>{`npm install @stackpost/sdk

import { StackPost } from '@stackpost/sdk';

const client = new StackPost('sk_live_...');

const post = await client.posts.create({
  platforms: ['facebook'],
  text: 'Postando no Facebook via StackPost',
  media: [{ type: 'image', url: 'https://example.com/foto.jpg' }],
});`}</code>
            </pre>
          </ScrollReveal>
        </section>

        {/* CTA */}
        <section className="max-w-4xl mx-auto px-4 py-20 text-center">
          <ScrollReveal>
            <h2 className="text-3xl md:text-4xl font-black text-brand-text mb-4">
              Comece a publicar no Facebook agora
            </h2>
            <p className="text-brand-text-secondary mb-8 max-w-xl mx-auto">
              Crie sua conta gratuita e conecte suas Pages em minutos. Sem custo por conta.
            </p>
            <Link
              href="/register"
              className="inline-flex items-center gap-2 px-8 py-4 bg-brand-accent text-brand-bg text-base font-bold rounded-lg hover:scale-105 transition-transform"
            >
              Comecar agora <ArrowRight className="w-5 h-5" />
            </Link>
          </ScrollReveal>
        </section>
      </div>

      <Footer />
    </main>
  );
}
