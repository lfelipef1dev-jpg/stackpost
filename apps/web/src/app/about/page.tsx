import type { Metadata } from 'next';
import AboutClient from './AboutClient';

export const metadata: Metadata = {
  title: 'Sobre o StackPost — API unificada de redes sociais',
  description:
    'StackPost é uma API unificada de redes sociais para SaaS, agências e AI agents. Uma integração, 15 plataformas, 114 endpoints. Feito no Brasil, para o mundo.',
  alternates: { canonical: '/about' },
};

export default function Page() {
  return <AboutClient />;
}
