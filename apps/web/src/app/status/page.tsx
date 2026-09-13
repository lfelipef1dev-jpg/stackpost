import type { Metadata } from 'next';
import { Activity } from 'lucide-react';
import { ScrollReveal } from '@/components/animations';
import { JsonLd, serviceSchema } from '@/components/JsonLd';
import LandingHeader from '@/components/LandingHeader';
import Footer from '@/components/Footer';
import StatusLive from './StatusLive';

export const metadata: Metadata = {
  title: 'Status - StackPost',
  description: 'Status ao vivo dos serviços do StackPost: API, banco de dados, provedores sociais e pagamentos verificados em tempo real.',
  alternates: { canonical: '/status' },
};

const jsonLd = serviceSchema('StackPost Status', 'Status da infraestrutura social.', '/status');

export default function StatusPage() {
  return (
    <main className="min-h-screen bg-brand-bg text-brand-text">
      <JsonLd data={jsonLd} />
      <LandingHeader />

      <section className="pt-24 pb-12 max-w-4xl mx-auto px-4 md:px-6">
        <ScrollReveal>
          <div className="flex items-center gap-3 mb-2">
            <Activity className="w-6 h-6 text-brand-accent" />
            <h1 className="font-display text-3xl md:text-4xl font-black tracking-tight">Status</h1>
          </div>
          <p className="text-brand-text-secondary">Verificação ao vivo dos serviços do StackPost, com latência real de cada dependência.</p>
        </ScrollReveal>
      </section>

      <section className="max-w-4xl mx-auto px-4 md:px-6 pb-20">
        <ScrollReveal>
          <StatusLive />
        </ScrollReveal>
      </section>

      <Footer />
    </main>
  );
}
