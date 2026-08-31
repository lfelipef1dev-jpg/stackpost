import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Users, Zap, Eye, Globe } from 'lucide-react';
import { ScrollReveal, FadeIn } from '@/components/animations';
import { JsonLd, serviceSchema } from '@/components/JsonLd';
import LandingHeader from '@/components/LandingHeader';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'StackPost for Agencies - Contas ilimitadas sem custo por perfil',
  description: '50 clientes, 500 contas, sem pagar por perfil. Cobranca por post, RBAC por cliente, analytics unificado e preco em reais com PIX.',
  alternates: { canonical: '/for-agencies' },
};

const jsonLd = serviceSchema('StackPost for Agencies', 'Contas ilimitadas para agencias.', '/for-agencies');

const features = [
  {
    icon: Users,
    title: 'Contas ilimitadas',
    desc: '50 clientes, 500 contas, sem pagar por perfil. Conecte quantas redes sociais precisar.',
  },
  {
    icon: Zap,
    title: 'Pague pelo uso',
    desc: 'Cobranca por post, nao por conta. Voce so paga quando realmente publica.',
  },
  {
    icon: Eye,
    title: 'RBAC',
    desc: 'Owner, Admin, Editor e Viewer por cliente. Cada membro da agencia com o nivel certo de acesso.',
  },
  {
    icon: Globe,
    title: 'Analytics unificado',
    desc: 'Metricas de todas as plataformas em um lugar. Compare performance entre clientes e redes.',
  },
];

export default function ForAgenciesPage() {
  return (
    <main className="min-h-screen bg-brand-bg text-brand-text">
      <JsonLd data={jsonLd} />
      <LandingHeader />

      {/* Hero com glow laranja */}
      <section className="relative pt-24 pb-20 px-4 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] rounded-full blur-[140px]" style={{ background: '#F59E0B15' }} />
          <div className="absolute bottom-0 left-1/3 w-[400px] h-[400px] rounded-full blur-[120px]" style={{ background: '#F59E0B10' }} />
          <div className="absolute top-0 left-0 w-[300px] h-[300px] rounded-full blur-[100px]" style={{ background: '#F59E0B08' }} />
        </div>
        <div className="max-w-5xl mx-auto relative text-center">
          <FadeIn>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border mb-6" style={{ borderColor: '#F59E0B40', backgroundColor: '#F59E0B10' }}>
              <Users className="w-3.5 h-3.5" style={{ color: '#F59E0B' }} />
              <span className="text-xs font-mono" style={{ color: '#F59E0B' }}>For Agencies</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight" style={{ color: 'color-mix(in srgb, #F59E0B 25%, white)' }}>
              StackPost for Agencies
            </h1>
            <p className="text-lg text-brand-text-secondary max-w-2xl mx-auto">
              Contas ilimitadas sem custo por perfil. Gerencie todos os seus clientes em uma plataforma, pague por post e receba em reais via PIX.
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
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{ backgroundColor: '#F59E0B15' }}>
                  <item.icon className="w-5 h-5" style={{ color: '#F59E0B' }} />
                </div>
                <h3 className="text-xl font-bold text-brand-text mb-2">{item.title}</h3>
                <p className="text-sm text-brand-text-secondary">{item.desc}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* Preco em reais + PIX */}
      <section className="max-w-5xl mx-auto px-4 md:px-6 pb-20">
        <ScrollReveal>
          <div className="p-8 rounded-2xl border text-center" style={{ borderColor: '#F59E0B40', backgroundColor: '#F59E0B08' }}>
            <h2 className="text-2xl md:text-3xl font-bold mb-4 text-brand-text">Preco em reais + PIX</h2>
            <p className="text-brand-text-secondary max-w-xl mx-auto">
              Sem dolar, sem IOF, sem surpresa no fim do mes. Cobranca em reais com pagamento via PIX. Previsibilidade total para a sua agencia.
            </p>
          </div>
        </ScrollReveal>
      </section>

      {/* CTA */}
      <section className="max-w-5xl mx-auto px-4 md:px-6 pb-20 text-center">
        <ScrollReveal>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 px-6 py-3 font-bold rounded-lg hover:scale-105 transition-transform"
            style={{ backgroundColor: '#F59E0B', color: '#0A0A0A' }}
          >
            Comecar gratis <ArrowRight className="w-4 h-4" />
          </Link>
        </ScrollReveal>
      </section>

      <Footer />
    </main>
  );
}
