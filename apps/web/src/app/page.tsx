import Link from 'next/link';
import type { Metadata } from 'next';
import { ArrowRight, Zap, Calendar, BarChart3, Upload, Webhook, Bot, Shield, Globe, Sparkles, Clock, MessageSquare, Layers, CheckCircle2, Building2, TrendingUp, Rocket } from 'lucide-react';
import { PLATFORMS } from '@/lib/platforms';
import { PlatformIcon } from '@/components/PlatformIcon';
import { FadeIn, ScrollReveal, StaggerGroup, StaggerItem } from '@/components/animations';
import { JsonLd, softwareApplicationSchema } from '@/components/JsonLd';
import Footer from '@/components/Footer';
import HeroBanner from '@/components/HeroBanner';
import PlatformCards from '@/components/PlatformCards';
import LandingHeader from '@/components/LandingHeader';

export const metadata: Metadata = {
  title: 'StackPost - API unificada de redes sociais para SaaS, agências e AI agents',
  description: 'StackPost é a API unificada de redes sociais: poste, agende, analise e modere em 15 plataformas por uma única integração. 114 endpoints, MCP server, AI caption, A/B testing, analytics histórico e contas ilimitadas. Plano gratuito para sempre.',
  alternates: { canonical: '/' },
};

const homeJsonLd = softwareApplicationSchema(
  'StackPost',
  'API unificada de redes sociais para SaaS, agências e AI agents. 15 plataformas, 114 endpoints, MCP server, publishing, scheduling, analytics, comments, webhooks e contas ilimitadas.',
  '/'
);

const stats = [
  { value: '15', label: 'plataformas conectadas' },
  { value: '114', label: 'endpoints prontos' },
  { value: '0', label: 'custo por conta' },
  { value: '99.9%', label: 'uptime' },
];

const bentoFeatures = [
  { icon: Zap, title: 'Publicação unificada', desc: 'Um payload. 15 redes. Agendamento, retry e status tracking.', href: '/features' },
  { icon: Upload, title: 'Upload de mídia escalável', desc: 'Multipart, presigned, TUS e URL import. Suporta até 1 GB.', href: '/features' },
  { icon: Calendar, title: 'Agendamento inteligente', desc: 'Best-time ML, primeiro comentário e A/B testing.', href: '/features' },
  { icon: BarChart3, title: 'Analytics histórico', desc: 'Cron diário de snapshots. Gráficos de evolução sem limite.', href: '/features' },
  { icon: Bot, title: 'AI caption & hashtags', desc: 'Nexus IA gera variações de caption e hashtags por nicho.', href: '/features' },
  { icon: Webhook, title: 'Webhooks com replay', desc: 'HMAC, retry, replay e eventos em tempo real.', href: '/features' },
  { icon: Shield, title: 'Multi-user RBAC', desc: 'Owner, admin, editor, viewer. Workspaces separados.', href: '/features' },
  { icon: MessageSquare, title: 'Comment → DM', desc: 'Converta comentários em DM no Instagram e Facebook automaticamente.', href: '/features' },
];

const testimonials = [
  { name: 'Vlad M.', role: 'CTO · Beta tester', country: 'EUA', text: 'Testamos praticamente todas as APIs de redes sociais e esta foi de longe a melhor. Super direta na integração e tem tudo que você precisa em recursos.' },
  { name: 'Tucker J.', role: 'Agência · Beta tester', country: 'EUA', text: 'Perfis ilimitados sem taxas por conta é um diferencial enorme se você gerencia vários clientes ou construiu sobre a API.' },
  { name: 'Bruna L.', role: 'Social Media · Beta tester', country: 'Brasil', text: 'Finalmente uma ferramenta que entende o mercado brasileiro. Preço em reais, suporte em português, e funciona com todas as plataformas que preciso.' },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-brand-bg pt-16">
      <JsonLd data={homeJsonLd} />
      <LandingHeader />

      {/* Hero */}
      <section className="relative flex flex-col items-center justify-center pt-4 pb-4 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none hidden md:block" aria-hidden="true">
          <div className="absolute top-[-10%] right-[-10%] w-[40rem] h-[40rem] rounded-full bg-gradient-to-br from-brand-accent/10 to-brand-accent-hover/5 blur-[100px]"></div>
          <div className="absolute bottom-[-10%] left-[-5%] w-[32rem] h-[32rem] rounded-full bg-gradient-to-tr from-brand-accent/8 to-transparent blur-[90px]"></div>
        </div>

        <div className="relative w-full max-w-6xl mx-auto px-4 md:px-6 text-center">
          <div className="max-w-3xl mx-auto">
            <FadeIn>
              <span className="inline-flex items-center gap-2 px-3.5 py-1.5 mb-0 text-[10px] md:text-xs font-bold uppercase tracking-widest text-brand-accent border border-brand-accent/25 rounded-full bg-brand-accent/10 backdrop-blur-sm">
                <span className="relative flex w-2 h-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-accent opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-accent"></span>
                </span>
                114 endpoints · 15 plataformas · API ao vivo
              </span>
            </FadeIn>

            <FadeIn delay={0.06}>
              <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-black leading-[1.05] tracking-[-0.04em] text-brand-text mt-8 mb-8 text-center md:whitespace-nowrap -translate-x-[2.5cm]">
                A infraestrutura social <span className="text-brand-accent">do seu produto.</span>
              </h1>
            </FadeIn>
          </div>

          <HeroBanner />

          <div className="max-w-3xl mx-auto">
            <FadeIn delay={0.12}>
              <p className="text-base md:text-lg text-brand-text-secondary max-w-2xl mx-auto mb-6 leading-relaxed mt-6">
                Publique, agende, analise e automatize em 15 plataformas com uma única API. Sem implementar 15 fluxos OAuth, sem manter integrações, sem pagar por conta.
              </p>
            </FadeIn>

            <FadeIn delay={0.18}>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="/register"
                  className="inline-flex items-center justify-center px-8 py-4 bg-brand-accent text-brand-bg font-bold rounded-xl hover:opacity-90 transition-opacity duration-200 shadow-[0_0_32px_rgba(138,180,248,0.35)] min-w-[220px]"
                  >
                    Começar grátis <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                  <Link
                    href="/docs"
                    className="inline-flex items-center justify-center px-5 py-4 text-brand-text-secondary hover:text-brand-accent transition-colors duration-200 min-h-[48px] font-medium"
                  >
                    Ver documentação &rarr;
                  </Link>
                </div>
                <p className="text-brand-text-secondary/60 text-sm mt-4">Plano gratuito para sempre. Não precisa de cartão.</p>
              </FadeIn>
            </div>
          </div>

        </section>


        {/* TrustBar */}
        <section className="py-6 md:py-8 border-y border-brand-border">
          <div className="max-w-6xl mx-auto px-4 md:px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((s) => (
                <div key={s.label} className="text-center md:text-left border-l border-brand-border first:border-0 pl-4 first:pl-0">
                  <div className="text-3xl md:text-4xl font-black text-brand-accent font-mono leading-none">{s.value}</div>
                  <div className="text-sm text-brand-text-secondary mt-1">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Bento Features */}
      <section className="py-20 md:py-28 border-y border-brand-border">
        <div className="max-w-6xl mx-auto px-4 md:px-6">
          <ScrollReveal className="mb-12">
            <span className="inline-block text-xs font-mono font-bold text-brand-accent uppercase tracking-[0.2em] mb-3">Recursos</span>
            <h2 className="font-display text-3xl md:text-5xl font-black leading-[1.05] tracking-[-0.03em] text-brand-text mb-4">
              Tudo que seu produto precisa
            </h2>
          </ScrollReveal>

          <StaggerGroup className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5" stagger={0.04}>
            {bentoFeatures.map((f) => (
              <StaggerItem key={f.title}>
                <Link href={f.href} className="group block p-6 rounded-2xl border border-brand-border bg-gradient-to-br from-brand-surface/80 to-brand-bg/60 hover:border-brand-accent/60 transition-all duration-200 h-full">
                  <div className="w-10 h-10 rounded-xl bg-brand-accent/10 flex items-center justify-center mb-4 group-hover:bg-brand-accent/20 transition">
                    <f.icon className="w-5 h-5 text-brand-accent" />
                  </div>
                  <h3 className="font-semibold text-brand-text mb-2 group-hover:text-brand-accent transition-colors">{f.title}</h3>
                  <p className="text-sm text-brand-text-secondary leading-relaxed">{f.desc}</p>
                </Link>
              </StaggerItem>
            ))}
          </StaggerGroup>
        </div>
      </section>

      {/* 15 plataformas com cards + modal */}
      <PlatformCards />

      {/* Diferenciais */}
      <section className="py-20 md:py-28 border-y border-brand-border">
        <div className="max-w-6xl mx-auto px-4 md:px-6">
          <ScrollReveal className="text-center mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-black tracking-tight text-brand-text mb-4">
              O que torna o StackPost diferente
            </h2>
            <p className="text-brand-text-secondary max-w-2xl mx-auto">
              Infraestrutura social completa com custo por uso, sem taxas por conta.
            </p>
            <h2 className="font-display text-3xl md:text-4xl font-black tracking-tight text-brand-text mb-4">
              Por que escolher o StackPost
            </h2>
            <p className="text-brand-text-secondary max-w-2xl mx-auto">
              Diferenciais que nenhuma outra API de redes sociais oferece no mesmo preço.
            </p>
          </ScrollReveal>

          <StaggerGroup className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4" stagger={0.03}>
            {[
              { icon: Layers, title: 'API unificada', desc: 'Um endpoint para 15 plataformas. Sem implementar 15 fluxos OAuth, retry e status individuais.' },
              { icon: Globe, title: 'Contas ilimitadas', desc: 'Conecte todos os perfis que quiser. Pague pelo uso, não por conta.' },
              { icon: TrendingUp, title: 'Analytics real', desc: 'Post e account analytics com refresh sob demanda e histórico infinito.' },
              { icon: Bot, title: 'Pronto para IA', desc: 'MCP server, AI caption e A/B testing para agentes e produtos de conteúdo.' },
              { icon: Shield, title: 'Produção', desc: 'Idempotency, webhooks com replay e RBAC nativo para multi-tenant.' },
              { icon: Clock, title: 'Sem filas quebradas', desc: 'Scheduling, retry, best-time e aprovação em um só fluxo.' },
              { icon: Sparkles, title: 'PIX em reais', desc: 'Checkout com Mercado Pago. Sem taxa internacional escondida.' },
              { icon: CheckCircle2, title: 'Sem vendor lock-in', desc: 'Pegue seus dados a qualquer momento. API-first e transparente.' },
            ].map((d) => (
              <StaggerItem key={d.title}>
                <div className="p-5 rounded-xl bg-brand-surface/50 border border-brand-border hover:border-brand-accent/40 transition h-full">
                  <d.icon className="w-6 h-6 text-brand-accent mb-3" />
                  <h3 className="font-semibold text-brand-text mb-1.5">{d.title}</h3>
                  <p className="text-sm text-brand-text-secondary">{d.desc}</p>
                </div>
              </StaggerItem>
            ))}
          </StaggerGroup>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 md:py-28 max-w-6xl mx-auto px-4 md:px-6">
        <ScrollReveal className="text-center mb-12">
          <h2 className="font-display text-3xl md:text-4xl font-black tracking-tight text-brand-text mb-4">
            Feedback de beta testers
          </h2>
        </ScrollReveal>

        <StaggerGroup className="grid grid-cols-1 md:grid-cols-3 gap-6" stagger={0.08}>
          {testimonials.map((t) => (
            <StaggerItem key={t.name}>
              <div className="p-6 rounded-2xl bg-brand-surface/50 border border-brand-border h-full flex flex-col">
                <p className="text-sm text-brand-text leading-relaxed mb-6 flex-1">"{t.text}"</p>
                <div className="flex items-center gap-3 pt-4 border-t border-brand-border">
                  <div className="w-10 h-10 rounded-full bg-brand-accent/20 flex items-center justify-center text-brand-accent font-semibold text-sm">
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <div className="text-sm font-medium">{t.name}</div>
                    <div className="text-xs text-brand-text-secondary">{t.role} · {t.country}</div>
                  </div>
                </div>
              </div>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </section>

      {/* CTA Final */}
      <section className="py-24 md:py-32 border-t border-brand-border relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-brand-accent/10 rounded-full blur-[100px]" />
        </div>
        <ScrollReveal className="relative max-w-4xl mx-auto px-4 text-center">
          <h2 className="font-display text-4xl md:text-6xl font-black tracking-tight text-brand-text mb-6">
            Pronto para escalar seu conteúdo?
          </h2>
          <p className="text-brand-text-secondary text-lg md:text-xl mb-8 max-w-xl mx-auto">
            Teste de graça. Não precisa de cartão. Mude de plano quando quiser.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-brand-accent text-brand-bg font-bold hover:opacity-90 transition-opacity duration-200 shadow-[0_0_40px_rgba(138,180,248,0.35)]"
          >
            Começar agora <ArrowRight className="w-4 h-4" />
          </Link>
          <p className="text-brand-text-secondary/60 text-sm mt-4">Plano Free para sempre. Pro com 14 dias de teste.</p>
        </ScrollReveal>
      </section>

      <Footer />
    </main>
  );
}
