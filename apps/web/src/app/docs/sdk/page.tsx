import type { Metadata } from 'next';
import Link from 'next/link';
import { BookOpen, ArrowRight } from 'lucide-react';
import { FadeIn, ScrollReveal } from '@/components/animations';
import { Breadcrumb } from '@/components/Breadcrumb';
import { JsonLd, serviceSchema } from '@/components/JsonLd';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'SDK - TypeScript, Python e Go',
  description: 'SDKs oficiais do StackPost gerados a partir do OpenAPI 3.1: TypeScript, Python e Go. Instalacao, autenticacao e exemplos de uso.',
  alternates: { canonical: '/docs/sdk' },
};

const jsonLd = serviceSchema('StackPost SDK', 'SDKs em TypeScript, Python e Go gerados de OpenAPI 3.1.', '/docs/sdk');

export default function DocsSdkPage() {
  return (
    <main className="min-h-screen bg-brand-bg text-brand-text">
      <JsonLd data={jsonLd} />
      <Breadcrumb items={[{ name: 'Home', path: '/' }, { name: 'Documentacao', path: '/docs' }, { name: 'SDK', path: '/docs/sdk' }]} />
      <section className="relative pt-20 pb-12 px-4">
        <div className="max-w-4xl mx-auto">
          <FadeIn>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-brand-accent/30 bg-brand-accent/8 mb-6">
              <BookOpen className="w-3.5 h-3.5 text-brand-accent" />
              <span className="text-xs font-mono text-brand-accent">SDK</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">SDK</h1>
            <p className="text-lg text-brand-text-secondary mb-8 max-w-2xl">
              SDKs oficiais gerados a partir do OpenAPI 3.1. Disponiveis em TypeScript, Python e Go.
            </p>
          </FadeIn>
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-4 pb-12 space-y-8">
        <ScrollReveal>
          <h2 className="text-2xl font-bold mb-4">TypeScript</h2>
          <pre className="p-6 rounded-xl bg-brand-surface border border-brand-border overflow-x-auto text-sm font-mono text-brand-text-secondary"><code>{`npm install @stackpost/sdk

import { StackPost } from '@stackpost/sdk';
const client = new StackPost('sk_live_...');

const post = await client.posts.create({
  platforms: ['instagram', 'tiktok'],
  text: 'Hello world!',
});`}</code></pre>
        </ScrollReveal>

        <ScrollReveal>
          <h2 className="text-2xl font-bold mb-4">Python</h2>
          <pre className="p-6 rounded-xl bg-brand-surface border border-brand-border overflow-x-auto text-sm font-mono text-brand-text-secondary"><code>{`pip install stackpost

from stackpost import StackPost
client = StackPost('sk_live_...')

post = client.posts.create(
  platforms=['instagram', 'tiktok'],
  text='Hello world!',
)`}</code></pre>
        </ScrollReveal>

        <ScrollReveal>
          <h2 className="text-2xl font-bold mb-4">Go</h2>
          <pre className="p-6 rounded-xl bg-brand-surface border border-brand-border overflow-x-auto text-sm font-mono text-brand-text-secondary"><code>{`go get github.com/stackpost/sdk-go

client := stackpost.New("sk_live_...")
post, err := client.Posts.Create(&stackpost.PostParams{
  Platforms: []string{"instagram", "tiktok"},
  Text:      "Hello world!",
})`}</code></pre>
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
