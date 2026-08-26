import type { Metadata } from 'next';
import Link from 'next/link';
import { Terminal, ArrowRight } from 'lucide-react';
import { FadeIn, ScrollReveal } from '@/components/animations';
import { Breadcrumb } from '@/components/Breadcrumb';
import { JsonLd, serviceSchema } from '@/components/JsonLd';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'CLI - Linha de comando do StackPost',
  description: 'CLI do StackPost: publique posts, gerencie contas, veja analytics e importe historico direto do terminal. Instalacao via npm ou pip.',
  alternates: { canonical: '/docs/cli' },
};

const jsonLd = serviceSchema('StackPost CLI', 'Linha de comando para publicar e gerenciar posts do terminal.', '/docs/cli');

export default function DocsCliPage() {
  return (
    <main className="min-h-screen bg-brand-bg text-brand-text">
      <JsonLd data={jsonLd} />
      <Breadcrumb items={[{ name: 'Home', path: '/' }, { name: 'Documentacao', path: '/docs' }, { name: 'CLI', path: '/docs/cli' }]} />
      <section className="relative pt-20 pb-12 px-4">
        <div className="max-w-4xl mx-auto">
          <FadeIn>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-brand-accent/30 bg-brand-accent/8 mb-6">
              <Terminal className="w-3.5 h-3.5 text-brand-accent" />
              <span className="text-xs font-mono text-brand-accent">CLI</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">CLI</h1>
            <p className="text-lg text-brand-text-secondary mb-8 max-w-2xl">
              Linha de comando do StackPost. Publique posts, gerencie contas, veja analytics e importe historico direto do terminal.
            </p>
          </FadeIn>
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-4 pb-12 space-y-8">
        <ScrollReveal>
          <h2 className="text-2xl font-bold mb-4">Instalacao</h2>
          <pre className="p-6 rounded-xl bg-brand-surface border border-brand-border overflow-x-auto text-sm font-mono text-brand-text-secondary"><code>{`npm install -g @stackpost/cli
# ou
pip install stackpost-cli`}</code></pre>
        </ScrollReveal>

        <ScrollReveal>
          <h2 className="text-2xl font-bold mb-4">Comandos</h2>
          <pre className="p-6 rounded-xl bg-brand-surface border border-brand-border overflow-x-auto text-sm font-mono text-brand-text-secondary"><code>{`# Publicar post
stackpost post --text "Hello" --platforms instagram,facebook

# Agendar post
stackpost post --text "Lancamento!" --platforms instagram \\
  --schedule "2026-09-01T10:00:00Z"

# Listar contas
stackpost accounts list

# Ver analytics
stackpost analytics --period 30d

# Importar historico
stackpost import history --account acc_123 --format csv`}</code></pre>
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
