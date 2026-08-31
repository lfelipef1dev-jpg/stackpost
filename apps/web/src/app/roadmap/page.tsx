import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Check, Circle, Map } from 'lucide-react';
import { ScrollReveal, FadeIn } from '@/components/animations';
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

      {/* Hero com glow */}
      <section className="relative pt-24 pb-12 px-4 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] rounded-full blur-[140px]" style={{ background: '#22C55E15' }} />
          <div className="absolute bottom-0 left-1/3 w-[400px] h-[400px] rounded-full blur-[120px]" style={{ background: '#22C55E10' }} />
        </div>
        <div className="max-w-4xl mx-auto relative text-center">
          <FadeIn>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border mb-6" style={{ borderColor: '#22C55E40', backgroundColor: '#22C55E10' }}>
              <Map className="w-3.5 h-3.5" style={{ color: '#22C55E' }} />
              <span className="text-xs font-mono" style={{ color: '#22C55E' }}>Roadmap</span>
            </div>
            <h1 className="font-display text-4xl md:text-5xl font-black tracking-tight mb-4" style={{ color: 'color-mix(in srgb, #22C55E 25%, white)' }}>
              Roadmap
            </h1>
            <p className="text-lg text-brand-text-secondary max-w-2xl mx-auto">
              Transparencia total. Veja o que ja esta pronto e o que vem por ai.
            </p>
          </FadeIn>
        </div>
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
