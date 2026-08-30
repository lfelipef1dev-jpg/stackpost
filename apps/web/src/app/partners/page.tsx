import Link from 'next/link';
import type { Metadata } from 'next';
import { Handshake, ArrowRight } from 'lucide-react';
import { FadeIn, ScrollReveal } from '@/components/animations';
import Footer from '@/components/Footer';
import { Breadcrumb } from '@/components/Breadcrumb';

export const metadata: Metadata = {
  title: 'Parceiros StackPost — Ecossistema de API de redes sociais',
  description: 'Conheça os parceiros oficiais StackPost. Soluções integradas de API de redes sociais para agências, SaaS e AI agents.',
  alternates: { canonical: '/partners' },
};

const partners = [
  {
    slug: 'savedtime',
    name: 'SavedTime',
    description: 'Automação de redes sociais e gestão de tempo para agências e criadores de conteúdo.',
    features: ['Agendamento em 15 plataformas', 'Automação de comentários e DMs', 'Analytics consolidado', 'White-label para agências'],
  },
  {
    slug: 'that-marketing-buddy',
    name: 'That Marketing Buddy',
    description: 'Assistente de marketing com IA para pequenos negócios.',
    features: ['Geração de conteúdo com IA', 'Publicação automática em 15 plataformas', 'Best-time-to-post com ML', 'Sugestões de hashtags automáticas'],
  },
];

export default function PartnersPage() {
  return (
    <main className="min-h-screen bg-brand-bg text-brand-text">
      <Breadcrumb items={[{ name: 'Home', path: '/' }, { name: 'Parceiros', path: '/partners' }]} />
      <section className="relative pt-32 pb-16 px-4 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-brand-accent/10 rounded-full blur-[120px]" />
        </div>
        <div className="max-w-4xl mx-auto relative">
          <FadeIn>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-brand-accent/30 bg-brand-accent/8 mb-6">
              <Handshake className="w-3.5 h-3.5 text-brand-accent" />
              <span className="text-xs font-mono text-brand-accent">Parceiros</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Parceiros StackPost</h1>
            <p className="text-lg text-brand-text-secondary mb-8">
              Soluções integradas de API de redes sociais para agências, SaaS e AI agents. Ferramentas certificadas que ampliam o ecossistema StackPost.
            </p>
          </FadeIn>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-4 pb-20">
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {partners.map((partner) => (
            <ScrollReveal key={partner.slug}>
              <Link href={`/partners/${partner.slug}`} className="block p-6 rounded-xl bg-brand-surface/50 backdrop-blur border border-brand-border hover:border-brand-accent/40 transition group">
                <h2 className="text-xl font-bold mb-2 group-hover:text-brand-accent transition-colors">{partner.name}</h2>
                <p className="text-sm text-brand-text-secondary mb-4">{partner.description}</p>
                <ul className="space-y-1.5 text-sm text-brand-text-secondary">
                  {partner.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2">
                      <span className="text-brand-accent mt-0.5" aria-hidden="true">•</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-4 inline-flex items-center gap-2 text-sm text-brand-accent font-medium">
                  Conhecer a parceria <ArrowRight className="w-4 h-4" />
                </div>
              </Link>
            </ScrollReveal>
          ))}
        </div>

        <ScrollReveal>
          <Link href="/contact" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-accent text-brand-bg font-semibold hover:bg-brand-accent-hover transition">
            Seja parceiro também <ArrowRight className="w-4 h-4" />
          </Link>
        </ScrollReveal>
      </section>

      <Footer />
    </main>
  );
}
