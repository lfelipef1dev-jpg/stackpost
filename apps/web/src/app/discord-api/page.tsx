import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { FaDiscord } from 'react-icons/fa6';
import { ScrollReveal } from '@/components/animations';
import { Breadcrumb } from '@/components/Breadcrumb';
import { JsonLd, serviceSchema } from '@/components/JsonLd';
import { PlatformHero } from '@/components/PlatformHero';
import Footer from '@/components/Footer';
import LandingHeader from '@/components/LandingHeader';

export const metadata: Metadata = {
  title: 'Discord API - Envie mensagens via webhook e embeds via StackPost',
  description: 'API de Discord do StackPost: mensagens via webhook, OAuth2 com webhook.incoming scope e embeds com imagem. Automacao de canais sem bot.',
  alternates: { canonical: '/discord-api' },
};

const jsonLd = serviceSchema(
  'Discord API',
  'API de Discord para enviar mensagens via webhook, OAuth2 com webhook.incoming scope e embeds com imagem. Automacao de canais sem necessidade de bot.',
  '/discord-api',
);

const features = [
  {
    title: 'Mensagens via webhook',
    desc: 'Envie mensagens para canais do Discord via webhook URL sem criar um bot.',
  },
  {
    title: 'OAuth2 com webhook.incoming',
    desc: 'Autenticacao OAuth2 com escopo webhook.incoming para criar webhooks dinamicamente.',
  },
  {
    title: 'Embeds com imagem',
    desc: 'Embeds ricos com titulo, descricao, cor, thumbnail e imagem de capa.',
  },
  {
    title: 'Multi-canal',
    desc: 'Gerencie webhooks de multiplas guildas e canais por workspace.',
  },
  {
    title: 'Agendamento',
    desc: 'Agende mensagens e embeds com timezone e best-time ML.',
  },
  {
    title: 'Webhooks com replay',
    desc: 'Eventos de entrega com HMAC, retry e replay para mensagens falhas.',
  },
];

export default function DiscordApiPage() {
  return (
    <main className="min-h-screen bg-brand-bg text-brand-text">
      <JsonLd data={jsonLd} />
      <LandingHeader />
      <div className="pt-16">
        <Breadcrumb
          items={[
            { name: 'Home', path: '/' },
            { name: 'Plataformas', path: '/platforms' },
            { name: 'Discord API', path: '/discord-api' },
          ]}
        />

        {/* Hero com cor e icone oficial */}
        <PlatformHero
          icon={FaDiscord}
          label="API de Discord"
          title="API de Discord"
          description="Envie mensagens via webhook e embeds com imagem via uma unica API. OAuth2 com webhook.incoming scope, multi-canal e agendamento sem necessidade de bot."
          color="#5865F2"
          docsHref="/docs"
        />

        {/* Recursos */}
        <section className="max-w-6xl mx-auto px-4 py-16">
          <ScrollReveal>
            <h2 className="text-3xl md:text-4xl font-black text-center text-brand-text mb-12">
              Recursos da API de Discord
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
              Instale o SDK e envie mensagens via webhook no Discord em poucas linhas. OAuth2 com webhook.incoming ja incluido.
            </p>
            <pre className="p-6 rounded-xl bg-brand-surface border border-brand-border overflow-x-auto text-sm font-mono text-brand-text-secondary">
              <code>{`npm install @stackpost/sdk

import { StackPost } from '@stackpost/sdk';

const client = new StackPost('sk_live_...');

const post = await client.posts.create({
  platforms: ['discord'],
  text: 'Enviando mensagem no Discord via StackPost',
  embeds: [{
    title: 'Novo update',
    description: 'Confira as novidades',
    image: { url: 'https://example.com/capa.png' },
  }],
});`}</code>
            </pre>
          </ScrollReveal>
        </section>

        {/* CTA */}
        <section className="max-w-4xl mx-auto px-4 py-20 text-center">
          <ScrollReveal>
            <h2 className="text-3xl md:text-4xl font-black text-brand-text mb-4">
              Comece a enviar no Discord agora
            </h2>
            <p className="text-brand-text-secondary mb-8 max-w-xl mx-auto">
              Crie sua conta gratuita e conecte seus webhooks em minutos. Sem custo por conta.
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
