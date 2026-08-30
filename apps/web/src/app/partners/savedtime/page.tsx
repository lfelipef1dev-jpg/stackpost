import Link from 'next/link';
import type { Metadata } from 'next';
import { Handshake, ArrowRight } from 'lucide-react';
import { FadeIn, ScrollReveal } from '@/components/animations';
import Footer from '@/components/Footer';
import { Breadcrumb } from '@/components/Breadcrumb';

export const metadata: Metadata = {
  title: 'StackPost x SavedTime — Parceria de API de redes sociais',
  description:
    'Parceria StackPost x SavedTime: integração de API de redes sociais para automação de marketing e gestão de tempo para agências e criadores.',
  alternates: { canonical: '/partners/savedtime' },
};

export default function SavedTimePartnerPage() {
  return (
    <main className="min-h-screen bg-brand-bg text-brand-text">
      <Breadcrumb
        items={[
          { name: 'Home', path: '/' },
          { name: 'Parceiros', path: '/partners' },
          { name: 'SavedTime', path: '/partners/savedtime' },
        ]}
      />

      <section className="relative pt-32 pb-16 px-4 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-brand-accent/10 rounded-full blur-[120px]" />
        </div>
        <div className="max-w-3xl mx-auto relative">
          <FadeIn>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-brand-accent/30 bg-brand-accent/10 mb-6">
              <Handshake className="w-3.5 h-3.5 text-brand-accent" />
              <span className="text-xs font-mono text-brand-accent">Parceiro oficial</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">SavedTime</h1>
            <p className="text-lg text-brand-text-secondary mb-8">
              Parceiro oficial StackPost. Automação de redes sociais e gestão de tempo para agências
              e criadores que precisam escalar sua presença digital sem perder produtividade.
            </p>
          </FadeIn>
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-4 pb-20 space-y-6">
        <ScrollReveal>
          <div className="p-6 rounded-xl bg-brand-surface/50 backdrop-blur border border-brand-border">
            <h2 className="text-xl font-bold mb-3">Sobre o SavedTime</h2>
            <p className="text-sm text-brand-text-secondary">
              SavedTime é uma plataforma de automação de redes sociais que usa o StackPost como
              backend para publicação em múltiplas plataformas. Juntos, oferecemos uma solução
              completa para agências e criadores que precisam agendar conteúdo, responder
              interações e acompanhar resultados em um único lugar.
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal>
          <div className="p-6 rounded-xl bg-brand-surface/50 backdrop-blur border border-brand-border">
            <h2 className="text-xl font-bold mb-3">O que o SavedTime faz com o StackPost</h2>
            <ul className="space-y-1.5 text-sm text-brand-text-secondary">
              <li>- Agendamento de posts em 15 plataformas</li>
              <li>- Automação de comentários e DMs</li>
              <li>- Analytics consolidado por cliente</li>
              <li>- White-label para agências</li>
            </ul>
          </div>
        </ScrollReveal>

        <ScrollReveal>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-accent text-brand-bg font-semibold transition hover:bg-brand-accent-hover"
          >
            Seja parceiro também <ArrowRight className="w-4 h-4" />
          </Link>
        </ScrollReveal>
      </section>

      <Footer />
    </main>
  );
}
