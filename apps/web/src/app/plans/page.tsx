import type { Metadata } from 'next';
import { Suspense } from 'react';
import { JsonLd, productSchema, faqSchema } from '@/components/JsonLd';
import { Breadcrumb } from '@/components/Breadcrumb';
import PlansClient from './PlansClient';

export const metadata: Metadata = {
  title: 'Planos e preços - Free, Starter, Growth, Scale e Business',
  description: 'Planos do StackPost: Free grátis (50 posts/mês), Starter R$39/mês (2.000 posts), Growth R$89/mês (8.000 posts), Scale R$197/mês (40.000 posts), Business R$497/mês (150.000 posts). Sem taxa por conta social.',
  alternates: { canonical: '/plans' },
};

const freeJsonLd = productSchema('StackPost Free', 'Plano gratuito: 50 posts/mês, 100 comentários, 3 contas sociais, API access.', 0, '/plans');
const starterJsonLd = productSchema('StackPost Starter', 'Plano Starter: 2.000 posts/mês, 5 contas sociais, API e SDK.', 39, '/plans');
const growthJsonLd = productSchema('StackPost Growth', 'Plano Growth: 8.000 posts/mês, 20 contas sociais, AI caption, webhooks.', 89, '/plans');
const scaleJsonLd = productSchema('StackPost Scale', 'Plano Scale: 40.000 posts/mês, contas ilimitadas, MCP server, A/B testing.', 197, '/plans');
const businessJsonLd = productSchema('StackPost Business', 'Plano Business: 150.000 posts/mês, white label, custom domain, suporte dedicado.', 497, '/plans');

const faqsJsonLd = faqSchema([
  { q: 'O StackPost cobra por conta social conectada?', a: 'Não. Você escala por volume de posts, não por número de perfis.' },
  { q: 'Posso testar antes de pagar?', a: 'Sim. O plano Free inclui 50 posts/mês. Planos pagos oferecem 14 dias de teste grátis.' },
  { q: 'Como funciona a cobrança do X?', a: 'O X cobra por post da API oficial. Esse custo é pago com créditos X pré-pagos no painel.' },
  { q: 'Os preços são em reais?', a: 'Sim. Cobrança via Mercado Pago com PIX e cartão.' },
  { q: 'Preciso contrato ou posso cancelar?', a: 'Cancele quando quiser. Sem contrato, sem multa.' },
  { q: 'Tem garantia?', a: 'Sim. 7 dias de garantia em todos os planos pagos.' },
]);

export default function PlansPage() {
  return (
    <>
      <JsonLd data={[freeJsonLd, starterJsonLd, growthJsonLd, scaleJsonLd, businessJsonLd, faqsJsonLd]} />
      <Breadcrumb items={[{ name: 'Home', path: '/' }, { name: 'Planos', path: '/plans' }]} />
      <Suspense fallback={<div className="min-h-screen bg-brand-bg" />}>
        <PlansClient />
      </Suspense>
    </>
  );
}
