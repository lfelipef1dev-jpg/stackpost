import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Check, Circle } from 'lucide-react';
import { ScrollReveal } from '@/components/animations';
import { JsonLd, serviceSchema } from '@/components/JsonLd';
import LandingHeader from '@/components/LandingHeader';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Roadmap - StackPost',
  description: 'Roadmap público do StackPost: o que já está pronto, o que vem em 2026 e 2027. Infraestrutura social para SaaS e AI agents.',
  alternates: { canonical: '/roadmap' },
};

const jsonLd = serviceSchema('StackPost Roadmap', 'Roadmap público de infraestrutura social.', '/roadmap');

const shipped = [
  'API unificada de publicação (15 plataformas)',
  'Multi-tenant com RBAC',
  'OAuth por plataforma (Meta, LinkedIn, Discord, Google)',
  'Webhooks com replay e HMAC',
  'MCP server para AI agents',
  'Analytics histórico com cron diário',
  'Agendamento com best-time ML',
  'Primeiro comentário automático',
  'A/B testing de postagens',
  'Upload de mídia (presigned, multipart, URL import)',
  'SDK TypeScript, Python e Go',
  'OpenAPI 3.1',
];

const q4_2026 = [
  'Social DMs API',
  'Comment to DM automation',
  'Meta Automation API',
  'Bulk posting v2',
];

const y2027 = [
  'Ads API (Meta, LinkedIn)',
  'Advanced agent automation',
  'Real-time analytics streaming',
  'Custom platform adapters (SDK público)',
];

export default function RoadmapPage() {
  return (
    <main className="min-h-screen bg-brand-bg text-brand-text">
      <JsonLd data={jsonLd} />
      <LandingHeader />

      <section className="pt-24 pb-12 max-w-4xl mx-auto px-4 md:px-6 text-center">
        <ScrollReveal>
          <h1 className="font-display text-4xl md:text-5xl font-black tracking-tight mb-4">
            Roadmap
          </h1>
          <p className="text-lg text-brand-text-secondary max-w-2xl mx-auto">
            Transparência total. Veja o que já está pronto e o que vem por aí.
          </p>
        </ScrollReveal>
      </section>

      <section className="max-w-4xl mx-auto px-4 md:px-6 pb-12">
        <ScrollReveal>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-full bg-success/20 flex items-center justify-center">
              <Check className="w-5 h-5 text-success" />
            </div>
            <h2 className="text-2xl font-bold">Disponível agora</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {shipped.map((item) => (
              <div key={item} className="flex items-center gap-3 p-4 rounded-xl bg-brand-surface/50 border border-brand-border">
                <Check className="w-4 h-4 text-success flex-shrink-0" />
                <span className="text-sm text-brand-text">{item}</span>
              </div>
            ))}
          </div>
        </ScrollReveal>
      </section>

      <section className="max-w-4xl mx-auto px-4 md:px-6 pb-12">
        <ScrollReveal>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-full bg-brand-accent/20 flex items-center justify-center">
              <Circle className="w-5 h-5 text-brand-accent" />
            </div>
            <h2 className="text-2xl font-bold">Q4 2026</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {q4_2026.map((item) => (
              <div key={item} className="flex items-center gap-3 p-4 rounded-xl bg-brand-surface/30 border border-brand-border/50">
                <Circle className="w-4 h-4 text-brand-accent flex-shrink-0" />
                <span className="text-sm text-brand-text-secondary">{item}</span>
              </div>
            ))}
          </div>
        </ScrollReveal>
      </section>

      <section className="max-w-4xl mx-auto px-4 md:px-6 pb-20">
        <ScrollReveal>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-full bg-brand-text-secondary/20 flex items-center justify-center">
              <Circle className="w-5 h-5 text-brand-text-secondary" />
            </div>
            <h2 className="text-2xl font-bold">2027</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {y2027.map((item) => (
              <div key={item} className="flex items-center gap-3 p-4 rounded-xl bg-brand-surface/20 border border-brand-border/30">
                <Circle className="w-4 h-4 text-brand-text-secondary flex-shrink-0" />
                <span className="text-sm text-brand-text-secondary">{item}</span>
              </div>
            ))}
          </div>
        </ScrollReveal>

        <ScrollReveal className="mt-12 text-center">
          <Link
            href="/register"
            className="inline-flex items-center gap-2 px-6 py-3 bg-brand-accent text-brand-bg font-bold rounded-lg hover:scale-105 transition-transform"
          >
            Comecar agora <ArrowRight className="w-4 h-4" />
          </Link>
        </ScrollReveal>
      </section>

      <Footer />
    </main>
  );
}
