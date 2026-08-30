import type { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { BillingTabs } from '@/components/BillingTabs';

export const metadata: Metadata = {
  title: 'Cobrança | StackPost',
  description: 'Gerencie sua assinatura, uso, faturas e planos do StackPost.',
  robots: { index: false, follow: false },
};

export default function BillingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-brand-bg text-brand-text flex flex-col">
      <Header activeHref="/billing" />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Cobrança</h1>
          <p className="text-brand-text-secondary mb-6">
            Gerencie sua assinatura, acompanhe o uso e visualize suas faturas.
          </p>
          <BillingTabs />
        </div>
        {children}
      </main>
      <Footer />
    </div>
  );
}
