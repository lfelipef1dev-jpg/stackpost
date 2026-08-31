import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { FaInstagram } from 'react-icons/fa6';
import { ScrollReveal } from '@/components/animations';
import { Breadcrumb } from '@/components/Breadcrumb';
import { JsonLd, serviceSchema } from '@/components/JsonLd';
import { PlatformHero } from '@/components/PlatformHero';
import Footer from '@/components/Footer';
import LandingHeader from '@/components/LandingHeader';

export const metadata: Metadata = {
  title: 'Instagram API - Publique feed, Reels, Stories e Carrossel via StackPost',
  description: 'API de Instagram do StackPost: feed posts, Reels, Stories, Carrossel e primeiro comentario. OAuth via Meta Business, analytics de likes, comments, reach e impressions.',
  alternates: { canonical: '/instagram-api' },
};

const jsonLd = serviceSchema(
  'Instagram API',
  'API de Instagram para publicar feed posts, Reels, Stories, Carrossel e primeiro comentario. OAuth via Meta Business com analytics de likes, comments, reach e impressions.',
  '/instagram-api',
);

const features = [
  {
    title: 'Feed posts',
    desc: 'Publique fotos e videos no feed do Instagram com legenda, localizacao e alt text.',
  },
  {
    title: 'Reels',
    desc: 'Publique Reels com audio original, mix de midia e capa personalizada.',
  },
  {
    title: 'Stories',
    desc: 'Stories com stickers, links e musica. Expiracao automatica em 24 horas.',
  },
  {
    title: 'Carrossel',
    desc: 'Carrossel multi-midia com ate 10 itens misturando imagem e video.',
  },
  {
    title: 'Primeiro comentario',
    desc: 'Agende o primeiro comentario junto com a publicacao para hashtags e CTAs.',
  },
  {
    title: 'Analytics',
    desc: 'Likes, comments, reach e impressions sincronizados em snapshots diarios.',
  },
];

export default function InstagramApiPage() {
  return (
    <main className="min-h-screen bg-brand-bg text-brand-text">
      <JsonLd data={jsonLd} />
      <LandingHeader />
      <div className="pt-16">
        <Breadcrumb
          items={[
            { name: 'Home', path: '/' },
            { name: 'Plataformas', path: '/platforms' },
            { name: 'Instagram API', path: '/instagram-api' },
          ]}
        />

        {/* Hero com cor e icone oficial */}
        <PlatformHero
          icon={FaInstagram}
          label="API de Instagram"
          title="API de Instagram"
          description="Publique feed posts, Reels, Stories e Carrossel via uma unica API. OAuth via Meta Business, primeiro comentario automatico e analytics completo de likes, comments, reach e impressions."
          color="#E4405F"
          docsHref="/docs"
        />

        {/* Recursos */}
        <section className="max-w-6xl mx-auto px-4 py-16">
          <ScrollReveal>
            <h2 className="text-3xl md:text-4xl font-black text-center text-brand-text mb-12">
              Recursos da API de Instagram
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
              Instale o SDK e publique no Instagram em poucas linhas. OAuth via Meta Business ja incluido.
            </p>
            <pre className="p-6 rounded-xl bg-brand-surface border border-brand-border overflow-x-auto text-sm font-mono text-brand-text-secondary">
              <code>{`npm install @stackpost/sdk

import { StackPost } from '@stackpost/sdk';

const client = new StackPost('sk_live_...');

const post = await client.posts.create({
  platforms: ['instagram'],
  text: 'Postando no Instagram via StackPost',
  media: [{ type: 'image', url: 'https://example.com/foto.jpg' }],
  firstComment: '#marketing #stackpost',
});`}</code>
            </pre>
          </ScrollReveal>
        </section>

        {/* CTA */}
        <section className="max-w-4xl mx-auto px-4 py-20 text-center">
          <ScrollReveal>
            <h2 className="text-3xl md:text-4xl font-black text-brand-text mb-4">
              Comece a publicar no Instagram agora
            </h2>
            <p className="text-brand-text-secondary mb-8 max-w-xl mx-auto">
              Crie sua conta gratuita e conecte o Instagram em minutos. Sem custo por conta.
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
