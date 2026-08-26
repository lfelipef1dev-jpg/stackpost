import { SEOPage } from '@/components/SEOPage';
import { generateSeoMetadata } from '@/components/generateSeoPage';
import { platformPages, apiPages, comparisonPages, specializedPages, auxPages } from '@/lib/seo-pages-data';

const all = { ...platformPages, ...apiPages, ...comparisonPages, ...specializedPages, ...auxPages };
const data = all['zernio-alternative'];

export const metadata = generateSeoMetadata('zernio-alternative');

export default function Page() {
  return <SEOPage data={data} />;
}