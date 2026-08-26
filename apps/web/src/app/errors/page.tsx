import { SEOPage } from '@/components/SEOPage';
import { auxPages } from '@/lib/seo-pages-data';

const data = auxPages['errors'];

export const metadata = {
  title: data.title,
  description: data.description,
  alternates: { canonical: '/errors' },
};

export default function Page() {
  return <SEOPage data={data} />;
}
