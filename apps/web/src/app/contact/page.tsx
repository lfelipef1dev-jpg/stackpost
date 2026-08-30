import type { Metadata } from 'next';
import { Mail, MessageCircle, Send, Clock, Shield } from 'lucide-react';
import { FadeIn, ScrollReveal } from '@/components/animations';
import { TiltCard } from '@/components/TiltCard';
import { SpotlightCard } from '@/components/SpotlightCard';
import Footer from '@/components/Footer';
import { Breadcrumb } from '@/components/Breadcrumb';
import { ContactForm } from './ContactForm';

export const metadata: Metadata = {
  title: 'Contato — Fale com o time do StackPost',
  description:
    'Entre em contato com o time do StackPost para suporte, vendas, parcerias ou dúvidas sobre a API de redes sociais. Respondemos em até 1 dia útil.',
  alternates: { canonical: '/contact' },
};

const channels = [
  {
    icon: Mail,
    title: 'E-mail',
    value: 'suporte@stackpost.com.br',
    desc: 'Resposta em até 1 dia útil',
  },
  {
    icon: MessageCircle,
    title: 'Discord',
    value: 'Comunidade StackPost',
    desc: 'Suporte da comunidade e devs',
  },
  {
    icon: Send,
    title: 'Vendas',
    value: 'Enterprise e custom',
    desc: 'Planos sob medida para sua empresa',
  },
];

const guarantees = [
  { icon: Clock, title: 'Resposta rápida', desc: 'Retorno em até 1 dia útil, de segunda a sexta.' },
  { icon: Shield, title: 'Dados seguros', desc: 'Sua mensagem é tratada com confidencialidade total.' },
];

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-brand-bg text-brand-text">
      <Breadcrumb items={[{ name: 'Home', path: '/' }, { name: 'Contato', path: '/contact' }]} />

      <section className="relative pt-20 pb-16 px-4 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-brand-accent/10 rounded-full blur-[120px]" />
        </div>
        <div className="max-w-3xl mx-auto relative">
          <FadeIn>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-brand-accent/30 bg-brand-accent/10 mb-6">
              <Mail className="w-3.5 h-3.5 text-brand-accent" />
              <span className="text-xs font-mono text-brand-accent">Contato</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold font-display mb-6">
              Fale com o time do StackPost
            </h1>
            <p className="text-lg text-brand-text-secondary mb-8">
              Suporte técnico, vendas, parcerias ou dúvidas sobre a API. Estamos aqui para ajudar
              sua operação de redes sociais a crescer.
            </p>
          </FadeIn>
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-4 pb-20">
        <div className="grid sm:grid-cols-3 gap-4 mb-12">
          {channels.map((c, i) => (
            <ScrollReveal key={c.title} delay={i * 0.08}>
              <TiltCard>
                <SpotlightCard
                  className="p-6 text-center h-full"
                  spotlightColor="rgba(138, 180, 248, 0.15)"
                >
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-brand-accent/10 text-brand-accent mb-3">
                    <c.icon className="w-6 h-6" />
                  </div>
                  <h2 className="font-semibold mb-1">{c.title}</h2>
                  <p className="text-sm text-brand-text mb-1">{c.value}</p>
                  <p className="text-xs text-brand-text-secondary">{c.desc}</p>
                </SpotlightCard>
              </TiltCard>
            </ScrollReveal>
          ))}
        </div>

        <ScrollReveal>
          <div className="mb-6 grid sm:grid-cols-2 gap-4">
            {guarantees.map((g) => (
              <div
                key={g.title}
                className="flex items-start gap-3 p-4 rounded-xl bg-brand-surface/50 backdrop-blur border border-brand-border"
              >
                <g.icon className="w-5 h-5 text-brand-accent mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-brand-text">{g.title}</p>
                  <p className="text-xs text-brand-text-secondary">{g.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </ScrollReveal>

        <ScrollReveal>
          <ContactForm />
        </ScrollReveal>
      </section>

      <Footer />
    </main>
  );
}
