import type { Metadata } from 'next';
import Link from 'next/link';
import { BookOpen, ArrowRight } from 'lucide-react';
import { ScrollReveal } from '@/components/animations';
import { Breadcrumb } from '@/components/Breadcrumb';
import { DocsHero } from '@/components/DocsHero';
import { JsonLd, serviceSchema } from '@/components/JsonLd';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'SDK - TypeScript, Python e Go',
  description: 'SDKs oficiais do StackPost gerados a partir do OpenAPI 3.1: TypeScript, Python e Go. Instalação, autenticação e exemplos de uso práticos.',
  alternates: { canonical: '/docs/sdk' },
};

const jsonLd = serviceSchema('StackPost SDK', 'SDKs em TypeScript, Python e Go gerados de OpenAPI 3.1.', '/docs/sdk');

export default function DocsSdkPage() {
  return (
    <main className="min-h-screen bg-brand-bg text-brand-text">
      <JsonLd data={jsonLd} />
      <Breadcrumb items={[{ name: 'Home', path: '/' }, { name: 'Documentação', path: '/docs' }, { name: 'SDK', path: '/docs/sdk' }]} />
      <DocsHero
        icon={BookOpen}
        label="SDK"
        title="SDK"
        description="SDKs oficiais gerados a partir do OpenAPI 3.1. Disponíveis em TypeScript, Python e Go, com tipagem completa e suporte a todas as plataformas integradas."
        color="#E4405F"
      />

      <section className="max-w-3xl mx-auto px-4 pb-12 space-y-8">
        <ScrollReveal>
          <h2 className="text-2xl font-bold mb-4 text-brand-text">TypeScript</h2>
          <p className="mb-4 text-brand-text-secondary">Instalação via npm e exemplo de criação de postagem multiplataforma.</p>
          <pre className="p-6 rounded-xl bg-brand-surface border border-brand-border overflow-x-auto text-sm font-mono text-brand-text-secondary"><code>{`npm install @stackpost/sdk

import { StackPost } from '@stackpost/sdk';

const client = new StackPost('sk_live_...');

const post = await client.posts.create({
  platforms: ['instagram', 'tiktok'],
  text: 'Hello world!',
});`}</code></pre>
        </ScrollReveal>

        <ScrollReveal>
          <h2 className="text-2xl font-bold mb-4 text-brand-text">Python</h2>
          <p className="mb-4 text-brand-text-secondary">Instalação via pip e exemplo de criação de postagem multiplataforma.</p>
          <pre className="p-6 rounded-xl bg-brand-surface border border-brand-border overflow-x-auto text-sm font-mono text-brand-text-secondary"><code>{`pip install stackpost

from stackpost import StackPost

client = StackPost('sk_live_...')

post = client.posts.create(
  platforms=['instagram', 'tiktok'],
  text='Hello world!',
)`}</code></pre>
        </ScrollReveal>

        <ScrollReveal>
          <h2 className="text-2xl font-bold mb-4 text-brand-text">Go</h2>
          <p className="mb-4 text-brand-text-secondary">Instalação via go get e exemplo de criação de postagem multiplataforma.</p>
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
          Voltar para documentação <ArrowRight className="w-4 h-4" />
        </Link>
      </section>

      <Footer />
    </main>
  );
}
