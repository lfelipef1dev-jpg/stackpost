import type { Metadata } from 'next';
import { SEOPage } from '@/components/SEOPage';
import { platformPages, apiPages, comparisonPages, specializedPages } from '@/lib/seo-pages-data';

const all = { ...platformPages, ...apiPages, ...comparisonPages, ...specializedPages };

/**
 * Gera uma pagina SEO com metadata + canonical automaticos.
 * Uso em app/<slug>/page.tsx:
 *
 *   import { generateSeoPage } from '@/components/generateSeoPage';
 *   export default generateSeoPage('instagram-api');
 *
 * Para exportar metadata:
 *   import { generateSeoMetadata } from '@/components/generateSeoPage';
 *   export const metadata = generateSeoMetadata('instagram-api');
 */
export function generateSeoMetadata(slug: string): Metadata {
  const data = all[slug];
  if (!data) {
    return { title: 'StackPost' };
  }
  return {
    title: data.title,
    description: data.description,
    alternates: { canonical: `/${slug}` },
  };
}

export function generateSeoPage(slug: string) {
  const data = all[slug];
  if (!data) {
    return function NotFound() {
      return <div>Pagina nao encontrada</div>;
    };
  }
  return function Page() {
    return <SEOPage data={data} />;
  };
}
