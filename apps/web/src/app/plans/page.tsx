import type { Metadata } from 'next';
import { JsonLd, productSchema } from '@/components/JsonLd';
import { Breadcrumb } from '@/components/Breadcrumb';
import PlansClient from './PlansClient';

export const metadata: Metadata = {
  title: 'Planos e precos - Free, Pro, Business e Enterprise',
  description: 'Planos do StackPost: Free gratis para sempre (20 posts/mes), Pro R$515/mes (10.000 posts), Business R$2.060/mes (100.000 posts), Enterprise custom. Sem taxa por conta social.',
  alternates: { canonical: '/plans' },
};

const freeJsonLd = productSchema('StackPost Free', 'Plano gratuito: 20 posts/mes, 3 contas sociais, API access.', 0, '/plans');
const proJsonLd = productSchema('StackPost Pro', 'Plano Pro: 10.000 posts/mes, contas ilimitadas, AI caption, A/B testing.', 515, '/plans');
const businessJsonLd = productSchema('StackPost Business', 'Plano Business: 100.000 posts/mes, contas ilimitadas, tudo do Pro.', 2060, '/plans');

export default function PlansPage() {
  return (
    <>
      <JsonLd data={[freeJsonLd, proJsonLd, businessJsonLd]} />
      <Breadcrumb items={[{ name: 'Home', path: '/' }, { name: 'Planos', path: '/plans' }]} />
      <PlansClient />
    </>
  );
}
