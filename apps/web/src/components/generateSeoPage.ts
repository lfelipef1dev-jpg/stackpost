import type { Metadata } from 'next';
import { platformPages, apiPages, comparisonPages, specializedPages, auxPages } from '@/lib/seo-pages-data';

const all = { ...platformPages, ...apiPages, ...comparisonPages, ...specializedPages, ...auxPages };

export function generateSeoMetadata(slug: string): Metadata {
  const data = all[slug];
  if (!data) return { title: 'StackPost' };
  return {
    title: data.title,
    description: data.description,
    alternates: { canonical: `/${slug}` },
  };
}
