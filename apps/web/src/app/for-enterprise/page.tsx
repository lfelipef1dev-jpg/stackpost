import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Building2, FileText, Shield, Zap, Users } from 'lucide-react';
import { ScrollReveal, FadeIn } from '@/components/animations';
import { JsonLd, serviceSchema } from '@/components/JsonLd';
import LandingHeader from '@/components/LandingHeader';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'StackPost for Enterprise - Infraestrutura social em escala',
  description: 'Multi-tenant com isolamento, audit logs, SLA de 99.9% uptime, compliance LGPD/GDPR, DPA e suporte dedicado para enterprise.',
  alternates: { canonical: '/for-enterprise' },
};

const jsonLd = serviceSchema('StackPost for Enterprise', 'Infraestrutura social em escala.', '/for-enterprise');

const features = [
  {
    icon: Building2,
    title: 'Multi-tenant com isolamento',
    desc: 'Workspaces separados com RBAC granular. Cada time ou cliente com dados isolados e permissoes proprias.',
  },
  {
    icon: FileText,
    title: 'Audit logs',
    desc: 'Todas as acoes rastreadas: quem fez, o que fez, quando e de onde. Exportavel para SIEM.',
  },
  {
    icon: Zap,
    title: 'SLA e uptime',
    desc: '99.9% de uptime garantido. Idempotencia e retry automatico em todas as publicacoes.',
  },
  {
    icon: Shield,
    title: 'Compliance',
    desc: 'LGPD, GDPR, DPA disponivel e data retention configuravel por workspace.',
  },
  {
    icon: Users,
    title: 'Suporte dedicado',
    desc: 'SLA de resposta, onboarding assistido e canal direto com o time de engenharia.',
  },
];

export default function ForEnterprisePage() {
  return (
    <main className="min-h-screen bg-brand-bg text-brand-text">
      <JsonLd data={jsonLd} />
      <LandingHeader />

      {/* Hero com glow verde */}
      <section className="relative pt-24 pb-20 px-4 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] rounded-full blur-[140px]" style={{ background: '#22C55E15' }} />
          <div className="absolute bottom-0 left-1/3 w-[400px] h-[400px] rounded-full blur-[120px]" style={{ background: '#22C55E10' }} />
          <div className="absolute top-0 left-0 w-[300px] h-[300px] rounded-full blur-[100px]" style={{ background: '#22C55E08' }} />
        </div>
        <div className="max-w-5xl mx-auto relative text-center">
          <FadeIn>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border mb-6" style={{ borderColor: '#22C55E40', backgroundColor: '#22C55E10' }}>
              <Building2 className="w-3.5 h-3.5" style={{ color: '#22C55E' }} />
              <span className="text-xs font-mono" style={{ color: '#22C55E' }}>Enterprise</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight" style={{ color: 'color-mix(in srgb, #22C55E 25%, white)' }}>
              StackPost for Enterprise
            </h1>
            <p className="text-lg text-brand-text-secondary max-w-2xl mx-auto">
              Infraestrutura social em escala. Multi-tenant com isolamento, audit logs, SLA de 99.9% e compliance completa.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* Features grid */}
      <section className="max-w-5xl mx-auto px-4 md:px-6 pb-20">
        <div className="grid sm:grid-cols-2 gap-4">
          {features.map((item) => (
            <ScrollReveal key={item.title}>
              <div className="h-full p-6 rounded-2xl bg-brand-surface/60 backdrop-blur-xl border border-brand-border/50">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{ backgroundColor: '#22C55E15' }}>
                  <item.icon className="w-5 h-5" style={{ color: '#22C55E' }} />
                </div>
                <h3 className="text-xl font-bold text-brand-text mb-2">{item.title}</h3>
                <p className="text-sm text-brand-text-secondary">{item.desc}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-5xl mx-auto px-4 md:px-6 pb-20 text-center">
        <ScrollReveal>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 px-6 py-3 font-bold rounded-lg hover:scale-105 transition-transform"
              style={{ backgroundColor: '#22C55E', color: '#0A0A0A' }}
            >
              Comecar gratis <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/contact"
              className="px-6 py-3 rounded-xl border border-brand-border text-brand-text hover:bg-brand-elevated transition"
            >
              Falar com vendas
            </Link>
          </div>
        </ScrollReveal>
      </section>

      <Footer />
    </main>
  );
}
