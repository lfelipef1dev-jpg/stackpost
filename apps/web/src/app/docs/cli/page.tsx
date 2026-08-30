import type { Metadata } from 'next';
import Link from 'next/link';
import { Terminal, ArrowRight } from 'lucide-react';
import { ScrollReveal } from '@/components/animations';
import { Breadcrumb } from '@/components/Breadcrumb';
import { DocsHero } from '@/components/DocsHero';
import { JsonLd, serviceSchema } from '@/components/JsonLd';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'CLI — Linha de comando do StackPost',
  description: 'CLI do StackPost: publique posts, gerencie contas, visualize analytics e importe histórico direto do terminal. Instalação via npm ou pip.',
  alternates: { canonical: '/docs/cli' },
};

const jsonLd = serviceSchema(
  'StackPost CLI',
  'Linha de comando para publicar e gerenciar posts diretamente do terminal.',
  '/docs/cli',
);

export default function DocsCliPage() {
  return (
    <main className="min-h-screen bg-brand-bg text-brand-text">
      <JsonLd data={jsonLd} />
      <Breadcrumb items={[{ name: 'Home', path: '/' }, { name: 'Documentação', path: '/docs' }, { name: 'CLI', path: '/docs/cli' }]} />
      <DocsHero
        icon={Terminal}
        label="CLI"
        title="CLI"
        description="Linha de comando do StackPost. Publique posts, gerencie contas, visualize analytics e importe histórico diretamente do terminal."
        color="#FFFC00"
      />

      <section className="max-w-3xl mx-auto px-4 pb-12 space-y-8">
        <ScrollReveal>
          <h2 className="text-2xl font-bold mb-4">Instalação</h2>
          <pre className="p-6 rounded-xl bg-brand-surface border border-brand-border overflow-x-auto text-sm font-mono text-brand-text-secondary"><code>{`npm install -g @stackpost/cli
# ou
pip install stackpost-cli`}</code></pre>
        </ScrollReveal>

        <ScrollReveal>
          <h2 className="text-2xl font-bold mb-4">Comandos</h2>
          <pre className="p-6 rounded-xl bg-brand-surface border border-brand-border overflow-x-auto text-sm font-mono text-brand-text-secondary"><code>{`# Publicar post
stackpost post --text "Hello" --platforms instagram,facebook

# Agendar post
stackpost post --text "Lançamento!" --platforms instagram \\
  --schedule "2026-09-01T10:00:00Z"

# Listar contas
stackpost accounts list

# Visualizar analytics
stackpost analytics --period 30d

# Importar histórico
stackpost import history --account acc_123 --format csv`}</code></pre>
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
