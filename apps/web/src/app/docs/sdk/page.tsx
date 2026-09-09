import type { Metadata } from 'next';
import Link from 'next/link';
import { BookOpen, ArrowRight } from 'lucide-react';
import { ScrollReveal } from '@/components/animations';
import { Breadcrumb } from '@/components/Breadcrumb';
import { DocsHero } from '@/components/DocsHero';
import { JsonLd, serviceSchema } from '@/components/JsonLd';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'SDK - TypeScript e Go',
  description: 'SDKs oficiais do StackPost: TypeScript e Go. Disponíveis no repositório (publicação no npm/Go modules em breve). Python em desenvolvimento.',
  alternates: { canonical: '/docs/sdk' },
};

const jsonLd = serviceSchema('StackPost SDK', 'SDKs em TypeScript e Go disponíveis no repositório.', '/docs/sdk');

export default function DocsSdkPage() {
  return (
    <main className="min-h-screen bg-brand-bg text-brand-text">
      <JsonLd data={jsonLd} />
      <Breadcrumb items={[{ name: 'Home', path: '/' }, { name: 'Documentação', path: '/docs' }, { name: 'SDK', path: '/docs/sdk' }]} />
      <DocsHero
        icon={BookOpen}
        label="SDK"
        title="SDK"
        description="SDKs oficiais disponíveis no repositório. TypeScript e Go com tipagem completa e suporte a todas as plataformas integradas. Python em desenvolvimento."
        color="#E4405F"
      />

      <section className="max-w-3xl mx-auto px-4 pb-12 space-y-8">
        <ScrollReveal>
          <h2 className="text-2xl font-bold mb-4 text-brand-text">TypeScript</h2>
          <p className="mb-4 text-brand-text-secondary">Disponível no repositório (publicação no npm em breve). Exemplo de criação de postagem multiplataforma.</p>
          <pre className="p-6 rounded-xl bg-brand-surface border border-brand-border overflow-x-auto text-sm font-mono text-brand-text-secondary"><code>{`# Instale via git
npm install github:lfelipef1dev-jpg/stackpost#main --workspace

import { StackPost } from '@stackpost/sdk';

const client = new StackPost('sk_live_...');

const post = await client.posts.create({
  platforms: ['instagram', 'tiktok'],
  text: 'Hello world!',
});`}</code></pre>
        </ScrollReveal>

        <ScrollReveal>
          <h2 className="text-2xl font-bold mb-4 text-brand-text">Go</h2>
          <p className="mb-4 text-brand-text-secondary">Disponível no repositório (publicação em Go modules em breve). Exemplo de criação de postagem multiplataforma.</p>
          <pre className="p-6 rounded-xl bg-brand-surface border border-brand-border overflow-x-auto text-sm font-mono text-brand-text-secondary"><code>{`# Clone o repo
git clone https://github.com/lfelipef1dev-jpg/stackpost
cd packages/sdk-go

client := stackpost.New("sk_live_...")

post, err := client.Posts.Create(&stackpost.PostParams{
  Platforms: []string{"instagram", "tiktok"},
  Text:      "Hello world!",
})`}</code></pre>
        </ScrollReveal>

        <ScrollReveal>
          <h2 className="text-2xl font-bold mb-4 text-brand-text">Python</h2>
          <p className="mb-4 text-brand-text-secondary">Em desenvolvimento. Acompanhe o roadmap para novidades.</p>
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
