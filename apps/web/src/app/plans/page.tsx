'use client';

import { useState } from 'react';
import { Check, X, Zap, Crown, Building2, Star, ChevronRight, Sparkles } from 'lucide-react';
import Link from 'next/link';

interface PlanFeature {
  label: string;
  value: string | number | boolean;
  highlight?: boolean;
}

interface Plan {
  id: string;
  name: string;
  tagline: string;
  monthlyPrice: number | null;
  yearlyPrice: number | null;
  icon: typeof Zap;
  popular?: boolean;
  cta: string;
  ctaHref: string;
  features: PlanFeature[];
  included: string[];
}

const plans: Plan[] = [
  {
    id: 'free',
    name: 'Free',
    tagline: 'Para experimentar',
    monthlyPrice: 0,
    yearlyPrice: 0,
    icon: Zap,
    cta: 'Comecar gratis',
    ctaHref: '/register',
    features: [
      { label: 'Posts', value: '20 / mes' },
      { label: 'Comentarios', value: '50 / mes' },
      { label: 'Importacao de posts', value: '5 / conta / mes' },
      { label: 'Importacao de comentarios', value: '25 / post' },
      { label: 'Contas sociais', value: '3' },
      { label: 'Acesso a API', value: true },
      { label: 'Biblioteca de midia', value: true },
      { label: 'Analytics', value: true },
      { label: 'Calendario', value: true },
      { label: 'Postagem em massa', value: true },
      { label: 'Link na bio', value: true },
    ],
    included: [
      'Acesso a API',
      'Biblioteca de midia',
      'Analytics',
      'Calendario',
      'Postagem em massa',
      'Link na bio',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    tagline: 'Para usuarios avancados',
    monthlyPrice: 100,
    yearlyPrice: 1000,
    icon: Sparkles,
    cta: 'Iniciar teste de 14 dias',
    ctaHref: '/register?plan=pro',
    features: [
      { label: 'Posts', value: '10.000 / mes' },
      { label: 'Comentarios', value: '5.000 / mes' },
      { label: 'Importacao de posts', value: '100 / conta / mes' },
      { label: 'Importacao de comentarios', value: '200 / post' },
      { label: 'Contas sociais', value: 'Ilimitadas' },
      { label: 'Acesso a API', value: true },
      { label: 'Biblioteca de midia', value: true },
      { label: 'Analytics', value: true },
      { label: 'Calendario', value: true },
      { label: 'Postagem em massa', value: true },
      { label: 'Link na bio', value: true },
    ],
    included: [
      'Acesso a API',
      'Biblioteca de midia',
      'Analytics',
      'Calendario',
      'Postagem em massa',
      'Link na bio',
    ],
  },
  {
    id: 'business',
    name: 'Business',
    tagline: 'Para empresas em crescimento',
    monthlyPrice: 400,
    yearlyPrice: 4000,
    icon: Building2,
    popular: true,
    cta: 'Iniciar teste de 14 dias',
    ctaHref: '/register?plan=business',
    features: [
      { label: 'Posts', value: '100.000 / mes' },
      { label: 'Comentarios', value: '50.000 / mes' },
      { label: 'Importacao de posts', value: '500 / conta / mes' },
      { label: 'Importacao de comentarios', value: '1.000 / post' },
      { label: 'Contas sociais', value: 'Ilimitadas' },
      { label: 'Acesso a API', value: true },
      { label: 'Biblioteca de midia', value: true },
      { label: 'Analytics', value: true },
      { label: 'Calendario', value: true },
      { label: 'Postagem em massa', value: true },
      { label: 'Link na bio', value: true },
    ],
    included: [
      'Acesso a API',
      'Biblioteca de midia',
      'Analytics',
      'Calendario',
      'Postagem em massa',
      'Link na bio',
    ],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    tagline: 'Para grandes organizacoes',
    monthlyPrice: null,
    yearlyPrice: null,
    icon: Crown,
    cta: 'Falar com vendas',
    ctaHref: '/contact',
    features: [
      { label: 'Posts', value: 'Custom' },
      { label: 'Comentarios', value: 'Custom' },
      { label: 'Importacao de posts', value: 'Custom' },
      { label: 'Importacao de comentarios', value: 'Custom' },
      { label: 'Contas sociais', value: 'Ilimitadas' },
      { label: 'Acesso a API', value: true },
      { label: 'Biblioteca de midia', value: true },
      { label: 'Analytics', value: true },
      { label: 'Calendario', value: true },
      { label: 'Postagem em massa', value: true },
      { label: 'Link na bio', value: true },
    ],
    included: [
      'Acesso a API',
      'Biblioteca de midia',
      'Analytics',
      'Calendario',
      'Postagem em massa',
      'Link na bio',
    ],
  },
];

const faqs = [
  {
    q: 'O StackPost cobra por conta social conectada?',
    a: 'Nao. Todos os planos pagos incluem contas sociais ilimitadas. Voce escala por uso de API, posts e armazenamento, nao por numero de contas.',
  },
  {
    q: 'Posso testar antes de pagar?',
    a: 'Sim. O plano free permite conectar contas, publicar e testar a API sem detalhes de pagamento. Voce faz upgrade quando seu uso crescer.',
  },
  {
    q: 'Como funciona a cobranca por uso?',
    a: 'Os planos incluem cotas mensais de posts e armazenamento. Se exceder, voce pode fazer upgrade ou falar com nosso time sobre um plano Enterprise.',
  },
  {
    q: 'Planos Enterprise customizados estao disponiveis?',
    a: 'Sim. Contate nosso time se precisar de limites maiores, SLAs customizados, suporte dedicado, white-label ou termos de cobranca especificos.',
  },
  {
    q: 'Postar no X custa extra?',
    a: 'O X mudou sua API para cobranca por chamada em 2025. Cada post no X custa $0.015, e posts com link custam $0.20. Esses custos sao do X, nao nossos. O saldo pre-pago e visivel no painel de billing.',
  },
];

export default function PlansPage() {
  const [yearly, setYearly] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);

  function formatPrice(plan: Plan) {
    if (plan.monthlyPrice === null) return 'Custom';
    if (plan.monthlyPrice === 0) return 'R$ 0';
    const price = yearly ? plan.yearlyPrice : plan.monthlyPrice;
    return `R$ ${price}`;
  }

  function formatPeriod(plan: Plan) {
    if (plan.monthlyPrice === null) return '';
    if (plan.monthlyPrice === 0) return '/mes';
    return yearly ? '/ano' : '/mes';
  }

  return (
    <main className="min-h-screen bg-brand-bg">
      <header className="h-16 border-b border-brand-border bg-brand-surface/50 backdrop-blur sticky top-0 z-20">
        <div className="max-w-7xl mx-auto h-full px-4 flex items-center justify-between">
          <Link href="/" className="font-display font-bold text-xl text-brand-accent">StackPost</Link>
          <nav className="hidden md:flex gap-6 text-sm text-brand-text-secondary">
            <Link href="/" className="hover:text-brand-text">Inicio</Link>
            <Link href="/plans" className="text-brand-text">Planos</Link>
            <Link href="/login" className="hover:text-brand-text">Entrar</Link>
          </nav>
        </div>
      </header>

      <section className="max-w-7xl mx-auto px-4 pt-16 pb-8 text-center">
        <span className="text-brand-accent text-sm font-mono tracking-wider uppercase">Planos</span>
        <h1 className="text-4xl md:text-5xl font-bold mt-4 mb-4">
          Precos transparentes para <span className="text-brand-accent">cada fase</span>
        </h1>
        <p className="text-brand-text-secondary text-lg max-w-2xl mx-auto mb-8">
          Comece gratis, depois escale conforme o uso. Todos os planos pagos incluem contas sociais ilimitadas em uma unica API.
        </p>

        <div className="inline-flex items-center gap-3 p-1 rounded-xl bg-brand-surface border border-brand-border">
          <button
            onClick={() => setYearly(false)}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition ${!yearly ? 'bg-brand-accent text-brand-bg' : 'text-brand-text-secondary hover:text-brand-text'}`}
          >
            Mensal
          </button>
          <button
            onClick={() => setYearly(true)}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition ${yearly ? 'bg-brand-accent text-brand-bg' : 'text-brand-text-secondary hover:text-brand-text'}`}
          >
            Anual
            <span className="ml-2 text-xs text-success">-17%</span>
          </button>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`relative p-6 rounded-2xl border transition flex flex-col ${
                plan.popular
                  ? 'bg-brand-surface border-brand-accent shadow-[0_0_40px_rgba(138,180,248,0.25)]'
                  : 'bg-brand-surface border-brand-border hover:border-brand-text/30'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-brand-accent text-brand-bg text-xs font-semibold whitespace-nowrap">
                  Mais popular
                </div>
              )}

              <div className="flex items-center gap-3 mb-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${plan.popular ? 'bg-brand-accent/20' : 'bg-brand-elevated'}`}>
                  <plan.icon className={`w-5 h-5 ${plan.popular ? 'text-brand-accent' : 'text-brand-text-secondary'}`} />
                </div>
                <div>
                  <h3 className="text-lg font-bold">{plan.name}</h3>
                  <p className="text-xs text-brand-text-secondary">{plan.tagline}</p>
                </div>
              </div>

              <div className="mb-6">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold">{formatPrice(plan)}</span>
                  <span className="text-brand-text-secondary text-sm">{formatPeriod(plan)}</span>
                </div>
                <p className="text-xs text-brand-text-secondary mt-1">por organizacao</p>
              </div>

              <button
                onClick={() => setSelectedPlan(plan)}
                className={`w-full mb-6 px-4 py-3 rounded-xl font-semibold text-sm transition flex items-center justify-center gap-2 ${
                  plan.popular
                    ? 'bg-brand-accent text-brand-bg hover:bg-brand-accent-hover'
                    : 'bg-brand-elevated border border-brand-border text-brand-text hover:bg-brand-border'
                }`}
              >
                {plan.cta}
                <ChevronRight className="w-4 h-4" />
              </button>

              <div className="space-y-3 flex-1">
                {plan.features.map((f) => (
                  <div key={f.label} className="flex items-center justify-between text-sm">
                    <span className="text-brand-text-secondary">{f.label}</span>
                    {typeof f.value === 'boolean' ? (
                      f.value ? <Check className="w-4 h-4 text-success" /> : <X className="w-4 h-4 text-error" />
                    ) : (
                      <span className={`font-medium ${f.highlight ? 'text-brand-accent' : 'text-brand-text'}`}>{f.value}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-4 pb-20">
        <div className="p-6 rounded-2xl bg-brand-surface border border-brand-border">
          <h2 className="text-2xl font-bold mb-6">Comparacao detalhada</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-brand-border">
                  <th className="text-left py-3 px-2 text-brand-text-secondary font-medium">Recurso</th>
                  {plans.map((p) => (
                    <th key={p.id} className="text-center py-3 px-2 font-semibold">{p.name}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-brand-border/50">
                  <td className="py-3 px-2 text-brand-text-secondary">Preco mensal</td>
                  <td className="text-center py-3 px-2 font-mono">R$ 0</td>
                  <td className="text-center py-3 px-2 font-mono">R$ 100</td>
                  <td className="text-center py-3 px-2 font-mono">R$ 400</td>
                  <td className="text-center py-3 px-2 font-mono">Custom</td>
                </tr>
                {plans[0].features.map((_, idx) => (
                  <tr key={idx} className="border-b border-brand-border/50">
                    <td className="py-3 px-2 text-brand-text-secondary">{plans[0].features[idx].label}</td>
                    {plans.map((p) => {
                      const v = p.features[idx].value;
                      return (
                        <td key={p.id} className="text-center py-3 px-2">
                          {typeof v === 'boolean' ? (
                            v ? <Check className="w-4 h-4 text-success mx-auto" /> : <X className="w-4 h-4 text-error mx-auto" />
                          ) : (
                            <span className="font-medium">{v}</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-4 pb-20">
        <h2 className="text-2xl font-bold mb-8 text-center">Perguntas frequentes</h2>
        <div className="space-y-3">
          {faqs.map((faq) => (
            <details key={faq.q} className="group p-5 rounded-xl bg-brand-surface border border-brand-border">
              <summary className="cursor-pointer font-medium flex items-center justify-between list-none">
                {faq.q}
                <ChevronRight className="w-4 h-4 text-brand-text-secondary group-open:rotate-90 transition" />
              </summary>
              <p className="mt-3 text-sm text-brand-text-secondary">{faq.a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 py-12 text-center border-t border-brand-border">
        <h2 className="text-3xl font-bold mb-6">Pronto para escalar seu conteudo?</h2>
        <p className="text-brand-text-secondary mb-8 max-w-xl mx-auto">
          Teste de graca. Nao precisa de cartao. Mude de plano quando quiser.
        </p>
        <Link
          href="/register"
          className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-brand-accent text-brand-bg font-semibold hover:bg-brand-accent-hover transition"
        >
          Comecar agora <ChevronRight className="w-4 h-4" />
        </Link>
      </section>

      <footer className="border-t border-brand-border bg-brand-surface/30">
        <div className="max-w-7xl mx-auto px-4 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-brand-text-secondary text-sm">© 2026 StackPost. Feito por ExpoStacker.</div>
          <div className="flex gap-4 text-sm text-brand-text-secondary">
            <Link href="/plans" className="hover:text-brand-text">Planos</Link>
            <Link href="/login" className="hover:text-brand-text">Entrar</Link>
          </div>
        </div>
      </footer>

      {selectedPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={() => setSelectedPlan(null)}>
          <div className="w-full max-w-md p-8 rounded-2xl bg-brand-surface border border-brand-border" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-6">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${selectedPlan.popular ? 'bg-brand-accent/20' : 'bg-brand-elevated'}`}>
                <selectedPlan.icon className={`w-6 h-6 ${selectedPlan.popular ? 'text-brand-accent' : 'text-brand-text-secondary'}`} />
              </div>
              <div>
                <h3 className="text-xl font-bold">{selectedPlan.name}</h3>
                <p className="text-sm text-brand-text-secondary">{selectedPlan.tagline}</p>
              </div>
            </div>

            <div className="mb-6">
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-bold">{formatPrice(selectedPlan)}</span>
                <span className="text-brand-text-secondary text-sm">{formatPeriod(selectedPlan)}</span>
              </div>
              <p className="text-xs text-brand-text-secondary mt-1">por organizacao</p>
            </div>

            <div className="space-y-2 mb-6 max-h-60 overflow-y-auto">
              {selectedPlan.features.map((f) => (
                <div key={f.label} className="flex items-center justify-between text-sm">
                  <span className="text-brand-text-secondary">{f.label}</span>
                  {typeof f.value === 'boolean' ? (
                    f.value ? <Check className="w-4 h-4 text-success" /> : <X className="w-4 h-4 text-error" />
                  ) : (
                    <span className="font-medium text-brand-text">{f.value}</span>
                  )}
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setSelectedPlan(null)}
                className="flex-1 px-4 py-3 rounded-xl border border-brand-border text-brand-text hover:bg-brand-elevated transition"
              >
                Fechar
              </button>
              <Link
                href={selectedPlan.ctaHref}
                className={`flex-1 text-center px-4 py-3 rounded-xl font-semibold transition ${
                  selectedPlan.popular
                    ? 'bg-brand-accent text-brand-bg hover:bg-brand-accent-hover'
                    : 'bg-brand-elevated border border-brand-border text-brand-text hover:bg-brand-border'
                }`}
              >
                {selectedPlan.cta}
              </Link>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
