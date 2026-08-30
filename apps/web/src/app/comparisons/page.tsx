import Link from 'next/link';
import type { Metadata } from 'next';
import { ArrowRight, GitCompare } from 'lucide-react';
import { FadeIn, ScrollReveal, StaggerGroup, StaggerItem } from '@/components/animations';
import Footer from '@/components/Footer';
import { Breadcrumb } from '@/components/Breadcrumb';

export const metadata: Metadata = { title: 'Comparações | StackPost vs Alternativas de Agendamento', description: 'Compare o StackPost com Ayrshare, Buffer, Publer, Metricool, Postiz, SocialPilot, Blotato e Zernio. Descubra por que o StackPost é a melhor alternativa para agendamento de redes sociais.', alternates: { canonical: '/comparisons' } };

const comparisons = [
  { name: 'Ayrshare', slug: 'ayrshare-alternative' },
  { name: 'Zernio', slug: 'zernio-alternative' },
  { name: 'Postiz', slug: 'postiz-alternative' },
  { name: 'Metricool', slug: 'metricool-alternative' },
  { name: 'Publer', slug: 'publer-alternative' },
  { name: 'Buffer', slug: 'buffer-alternative' },
  { name: 'SocialPilot', slug: 'socialpilot-alternative' },
  { name: 'Blotato', slug: 'blotato-alternative' },
];

export default function ComparisonsPage() {
  return (
    <main className="min-h-screen bg-brand-bg text-brand-text">
      <Breadcrumb items={[{ name: 'Home', path: '/' }, { name: 'Comparações', path: '/comparisons' }]} />
      <section className="relative pt-32 pb-16 px-4 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-brand-accent/10 rounded-full blur-[120px]" />
        </div>
        <div className="max-w-3xl mx-auto relative">
          <FadeIn>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-brand-accent/30 bg-brand-accent/8 mb-6">
              <GitCompare className="w-3.5 h-3.5 text-brand-accent" />
              <span className="text-xs font-mono text-brand-accent">Comparações</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">StackPost vs concorrentes</h1>
            <p className="text-lg text-brand-text-secondary">Análise honesta e direta entre o StackPost e as principais plataformas de agendamento do mercado.</p>
          </FadeIn>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-4 pb-20">
        <StaggerGroup className="grid sm:grid-cols-2 gap-4">
          {comparisons.map((c) => (
            <StaggerItem key={c.slug}>
              <Link href={'/' + c.slug} className="flex items-center justify-between p-5 rounded-xl bg-brand-surface/50 backdrop-blur border border-brand-border hover:border-brand-accent/30 transition group">
                <div>
                  <h2 className="font-semibold group-hover:text-brand-accent transition">StackPost vs {c.name}</h2>
                  <p className="text-sm text-brand-text-secondary">Veja por que o StackPost é a melhor alternativa ao {c.name}</p>
                </div>
                <ArrowRight className="w-5 h-5 text-brand-text-secondary group-hover:text-brand-accent transition" />
              </Link>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </section>

      <Footer />
    </main>
  );
}
