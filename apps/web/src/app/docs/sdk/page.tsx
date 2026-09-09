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
  description: 'SDKs do StackPost em TypeScript, Python e Go. Disponíveis no repositório. Incluem tipagem, métodos para posts, contas, analytics, webhooks e IA.',
  alternates: { canonical: '/docs/sdk' },
};

const jsonLd = serviceSchema('StackPost SDK', 'SDKs em TypeScript, Python e Go disponíveis no repositório.', '/docs/sdk');

export default function DocsSdkPage() {
  return (
    <main className="min-h-screen bg-brand-bg text-brand-text">
      <JsonLd data={jsonLd} />
      <Breadcrumb items={[{ name: 'Home', path: '/' }, { name: 'Documentação', path: '/docs' }, { name: 'SDK', path: '/docs/sdk' }]} />
      <DocsHero
        icon={BookOpen}
        label="SDK"
        title="SDK"
        description="SDKs em TypeScript, Python e Go com métodos para posts, contas, uploads, analytics, comentários, webhooks e IA. Disponíveis no repositório."
        color="#E4405F"
      />

      <section className="max-w-3xl mx-auto px-4 pb-12 space-y-8">
        <ScrollReveal>
          <h2 className="text-2xl font-bold mb-4 text-brand-text">TypeScript</h2>
          <p className="mb-4 text-brand-text-secondary">O SDK TypeScript está em <code className="text-brand-accent">packages/sdk-typescript</code>. Use via clone do repositório.</p>
          <pre className="p-6 rounded-xl bg-brand-surface border border-brand-border overflow-x-auto text-sm font-mono text-brand-text-secondary"><code>{`# Clone o repositório
git clone https://github.com/lfelipef1dev-jpg/stackpost.git
cd stackpost/packages/sdk-typescript

# Importe diretamente (Node 22+ suporta .ts)
import { StackPost } from './src/index.ts';

const client = new StackPost({ apiKey: 'sk_live_...' });

const post = await client.createPost({
  platforms: ['instagram', 'tiktok'],
  text: 'Hello world!',
});`}</code></pre>
        </ScrollReveal>

        <ScrollReveal>
          <h2 className="text-2xl font-bold mb-4 text-brand-text">Python</h2>
          <p className="mb-4 text-brand-text-secondary">O SDK Python está em <code className="text-brand-accent">packages/sdk-python</code>. Usa apenas urllib da biblioteca padrão.</p>
          <pre className="p-6 rounded-xl bg-brand-surface border border-brand-border overflow-x-auto text-sm font-mono text-brand-text-secondary"><code>{`# Clone o repositório
git clone https://github.com/lfelipef1dev-jpg/stackpost.git
cd stackpost/packages/sdk-python

# Instale localmente
pip install -e .

from stackpost import StackPost

client = StackPost(api_key='sk_live_...')

post = client.create_post(
    platforms=['instagram', 'tiktok'],
    text='Hello world!',
)`}</code></pre>
        </ScrollReveal>

        <ScrollReveal>
          <h2 className="text-2xl font-bold mb-4 text-brand-text">Go</h2>
          <p className="mb-4 text-brand-text-secondary">O SDK Go está em <code className="text-brand-accent">packages/sdk-go</code>. Use via clone do repositório.</p>
          <pre className="p-6 rounded-xl bg-brand-surface border border-brand-border overflow-x-auto text-sm font-mono text-brand-text-secondary"><code>{`# Clone o repositório
git clone https://github.com/lfelipef1dev-jpg/stackpost.git
cd stackpost/packages/sdk-go

client := stackpost.New("sk_live_...")

post, err := client.CreatePost(&stackpost.PostParams{
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
