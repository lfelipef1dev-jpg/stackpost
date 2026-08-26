import type { Metadata } from 'next';
import { Breadcrumb } from '@/components/Breadcrumb';
import Footer from '@/components/Footer';
import { JsonLd, serviceSchema } from '@/components/JsonLd';

export const metadata: Metadata = {
  title: 'API Reference - Scalar Docs - StackPost',
  description: 'Documentacao interativa da API do StackPost com Scalar. 114 endpoints, OpenAPI 3.1, exemplos em curl, TypeScript, Python e Go.',
  alternates: { canonical: '/docs/api-reference' },
};

const jsonLd = serviceSchema('StackPost API Reference (Scalar)', 'Documentacao interativa da API com 114 endpoints.', '/docs/api-reference');

export default function ApiReferencePage() {
  return (
    <main className="min-h-screen bg-brand-bg text-brand-text">
      <JsonLd data={jsonLd} />
      <Breadcrumb items={[
        { name: 'Home', path: '/' },
        { name: 'Documentacao', path: '/docs' },
        { name: 'API Reference', path: '/docs/api' },
        { name: 'Scalar Docs', path: '/docs/api-reference' },
      ]} />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-4">API Reference - Scalar Docs</h1>
        <p className="text-brand-text-secondary mb-6">
          Documentacao interativa completa da API do StackPost. 114 endpoints, OpenAPI 3.1.
        </p>
        <div style={{ width: '100%', height: '80vh' }}>
          <iframe
            src="https://api.scalar.com/embed?spec=https://stackpost.expostacker.com.br/openapi.json"
            style={{ width: '100%', height: '100%', border: 'none' }}
            title="StackPost API Reference"
          />
        </div>
      </div>
      <Footer />
    </main>
  );
}
