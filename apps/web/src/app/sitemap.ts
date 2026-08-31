import type { MetadataRoute } from 'next';
import { platformPages, apiPages, comparisonPages, specializedPages, auxPages } from '@/lib/seo-pages-data';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://stackpost.com.br';

const staticPages = [
  '',
  '/features',
  '/plans',
  '/blog',
  '/changelog',
  '/glossary',
  '/brand-kit',
  '/status',
  '/docs',
  '/docs/api',
  '/docs/sdk',
  '/docs/cli',
  '/docs/mcp',
  '/docs/webhooks',
  '/docs/oauth',
  '/about',
  '/contact',
  '/platforms',
  '/errors',
  '/comparisons',
  '/terms',
  '/privacy',
];

const partnerPages = ['/partners/savedtime', '/partners/that-marketing-buddy'];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date().toISOString();

  const allSeoSlugs = [
    ...Object.keys(platformPages),
    ...Object.keys(apiPages),
    ...Object.keys(comparisonPages),
    ...Object.keys(specializedPages),
    ...Object.keys(auxPages),
  ];

  const routes = [
    ...staticPages,
    ...partnerPages,
    ...allSeoSlugs.map((s) => `/${s}`),
  ];

  return routes.map((path) => ({
    url: `${SITE_URL}${path === '' ? '' : path}`,
    lastModified: now,
    changeFrequency: path === '' ? 'daily' : 'weekly',
    priority: path === '' ? 1.0 : path === '/features' || path === '/plans' ? 0.9 : 0.7,
  }));
}
