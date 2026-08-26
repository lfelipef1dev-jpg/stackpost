import { SEOPage } from '@/components/SEOPage';
import { auxPages } from '@/lib/seo-pages-data';

const data = auxPages['platforms'];

export const metadata = {
  title: data.title,
  description: data.description,
  alternates: { canonical: '/platforms' },
};

export default function Page() {
  return <SEOPage data={data} />;
}
