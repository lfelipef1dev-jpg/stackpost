import type { Metadata } from 'next';
import { Code } from 'lucide-react';
import { Breadcrumb } from '@/components/Breadcrumb';
import { DocsHero } from '@/components/DocsHero';
import { JsonLd, serviceSchema } from '@/components/JsonLd';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'API Reference — Scalar Docs — StackPost',
  description:
    'Documentação interativa da API do StackPost com Scalar. 114 endpoints, OpenAPI 3.1, exemplos em curl, TypeScript, Python e Go.',
  alternates: { canonical: '/docs/api-reference' },
};

const jsonLd = serviceSchema(
  'StackPost API Reference (Scalar)',
  'Documentação interativa da API com 114 endpoints.',
  '/docs/api-reference',
);

export default function ApiReferencePage() {
  return (
    <main className="min-h-screen bg-brand-bg text-brand-text">
      <JsonLd data={jsonLd} />
      <Breadcrumb
        items={[
          { name: 'Home', path: '/' },
          { name: 'Documentação', path: '/docs' },
          { name: 'API Reference', path: '/docs/api' },
          { name: 'Scalar Docs', path: '/docs/api-reference' },
        ]}
      />
      <DocsHero
        icon={Code}
        label="Scalar Docs"
        title="API Reference Interativa"
        description="Documentação interativa e completa da API do StackPost, renderizada via Scalar. 114 endpoints REST, especificação OpenAPI 3.1, com exemplos executáveis em curl, TypeScript, Python e Go."
        color="#25F4EE"
      />

      <section className="max-w-7xl mx-auto px-4 pb-20">
        <div className="relative rounded-2xl border border-brand-border bg-brand-surface overflow-hidden">
          <div
            className="w-full"
            style={{ height: '80vh' }}
          >
            <iframe
              src="https://api.scalar.com/embed?spec=https://stackpost.com.br/openapi.json"
              className="w-full h-full border-0"
              title="StackPost API Reference — Scalar"
              loading="lazy"
            />
          </div>
        </div>
        <p className="mt-4 text-sm text-brand-text-secondary">
          A documentação é gerada automaticamente a partir da especificação
          OpenAPI 3.1 publicada em{' '}
          <code className="font-mono text-brand-accent">
            /openapi.json
          </code>
          . Para detalhes de autenticação, rate limit e paginação, consulte a{' '}
          <a
            href="/docs/api"
            className="text-brand-accent hover:text-brand-accent-hover underline underline-offset-4"
          >
            referência resumida
          </a>
          .
        </p>
      </section>

      <Footer />
    </main>
  );
}
