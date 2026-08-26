import { SEOPage } from '@/components/SEOPage';
import { generateSeoMetadata } from '@/components/generateSeoPage';
import { platformPages, apiPages, comparisonPages, specializedPages, auxPages } from '@/lib/seo-pages-data';

const all = { ...platformPages, ...apiPages, ...comparisonPages, ...specializedPages, ...auxPages };
const data = all['social-media-mcp-server'];

export const metadata = generateSeoMetadata('social-media-mcp-server');

export default function Page() {
  return <SEOPage data={data} />;
}