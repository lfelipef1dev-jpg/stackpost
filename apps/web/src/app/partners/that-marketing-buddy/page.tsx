import Link from 'next/link';
import type { Metadata } from 'next';
import { Handshake, ArrowRight } from 'lucide-react';
import { FadeIn, ScrollReveal } from '@/components/animations';
import Footer from '@/components/Footer';
import { Breadcrumb } from '@/components/Breadcrumb';

export const metadata: Metadata = { title: 'StackPost x That Marketing Buddy - Parceria', description: 'Parceria StackPost x That Marketing Buddy: API de redes sociais para agencias de marketing.', alternates: { canonical: '/partners/that-marketing-buddy' } };

export default function ThatMarketingBuddyPartnerPage() {
  return (
    <main className="min-h-screen bg-brand-bg text-brand-text">
      <Breadcrumb items={[{ name: 'Home', path: '/' }, { name: 'Parceiros', path: '/partners' }, { name: 'That Marketing Buddy', path: '/partners/that-marketing-buddy' }]} />
      <section className="relative pt-32 pb-16 px-4 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-brand-accent/10 rounded-full blur-[120px]" />
        </div>
        <div className="max-w-3xl mx-auto relative">
          <FadeIn>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-brand-accent/30 bg-brand-accent/8 mb-6">
              <Handshake className="w-3.5 h-3.5 text-brand-accent" />
              <span className="text-xs font-mono text-brand-accent">Parceiro</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">That Marketing Buddy</h1>
            <p className="text-lg text-brand-text-secondary mb-8">
              Parceiro oficial StackPost. Assistente de marketing com AI para pequenos negocios.
            </p>
          </FadeIn>
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-4 pb-20 space-y-6">
        <ScrollReveal>
          <div className="p-6 rounded-xl bg-brand-surface/50 backdrop-blur border border-brand-border">
            <h2 className="text-xl font-bold mb-3">Sobre o That Marketing Buddy</h2>
            <p className="text-sm text-brand-text-secondary">
              That Marketing Buddy e um assistente de marketing com AI que usa o StackPost para
              publicar conteudo gerado automaticamente em multiplas redes sociais. A integracao
              permite que pequenos negocios tenham presenca digital sem precisar de um time de marketing.
            </p>
          </div>
        </ScrollReveal>
        <ScrollReveal>
          <div className="p-6 rounded-xl bg-brand-surface/50 backdrop-blur border border-brand-border">
            <h2 className="text-xl font-bold mb-3">O que o That Marketing Buddy faz com o StackPost</h2>
            <ul className="space-y-1.5 text-sm text-brand-text-secondary">
              <li>- Geracao de conteudo com AI</li>
              <li>- Publicacao automatica em 15 plataformas</li>
              <li>- Best-time-to-post com ML</li>
              <li>- Hashtag suggestions automaticas</li>
            </ul>
          </div>
        </ScrollReveal>
        <ScrollReveal>
          <Link href="/contact" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-accent text-brand-bg font-semibold hover:bg-brand-accent-hover transition">
            Seja parceiro tambem <ArrowRight className="w-4 h-4" />
          </Link>
        </ScrollReveal>
      </section>

      <Footer />
    </main>
  );
}
