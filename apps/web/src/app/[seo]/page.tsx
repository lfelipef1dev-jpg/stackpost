import { notFound } from 'next/navigation';
import { SEOPage } from '@/components/SEOPage';
import { generateSeoMetadata } from '@/components/generateSeoPage';
import { platformPages, apiPages, comparisonPages, specializedPages, auxPages } from '@/lib/seo-pages-data';
import { SEO_SLUGS } from '@/lib/seo-slugs';

const all = { ...platformPages, ...apiPages, ...comparisonPages, ...specializedPages, ...auxPages };

export function generateStaticParams() {
  return SEO_SLUGS.map((seo) => ({ seo }));
}

export async function generateMetadata({ params }: { params: Promise<{ seo: string }> }) {
  const { seo } = await params;
  return generateSeoMetadata(seo);
}

export default async function SeoDynamicPage({ params }: { params: Promise<{ seo: string }> }) {
  const { seo } = await params;
  const data = all[seo];
  if (!data) return notFound();
  return <SEOPage data={data} />;
}
