import { SEOPage } from '@/components/SEOPage';
import { generateSeoMetadata } from '@/components/generateSeoPage';
import { platformPages, apiPages, comparisonPages, specializedPages, auxPages } from '@/lib/seo-pages-data';

const all = { ...platformPages, ...apiPages, ...comparisonPages, ...specializedPages, ...auxPages };
const data = all['tiktok-content-posting-api'];

export const metadata = generateSeoMetadata('tiktok-content-posting-api');

export default function Page() {
  return <SEOPage data={data} />;
}