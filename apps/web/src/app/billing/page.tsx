'use client';

import Header from '@/components/Header';
import Footer from '@/components/Footer';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CreditCard, Loader2, Check, X, Zap, Sparkles, Building2, Crown, ChevronRight } from 'lucide-react';

interface BillingFeature {
  label: string;
  value: string | number | boolean;
}

interface BillingPlan {
  id: string;
  name: string;
  tagline: string;
  monthlyPrice: number | null;
  icon: typeof Zap;
  popular?: boolean;
  features: BillingFeature[];
  included: string[];
}

const billingPlans: BillingPlan[] = [
  {
    id: 'free',
    name: 'Free',
    tagline: 'Para experimentar',
    monthlyPrice: 0,
    icon: Zap,
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
    included: ['Acesso a API', 'Biblioteca de midia', 'Analytics', 'Calendario', 'Postagem em massa', 'Link na bio'],
  },
  {
    id: 'pro',
    name: 'Pro',
    tagline: 'Para usuarios avancados',
    monthlyPrice: 100,
    icon: Sparkles,
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
    included: ['Acesso a API', 'Biblioteca de midia', 'Analytics', 'Calendario', 'Postagem em massa', 'Link na bio'],
  },
  {
    id: 'business',
    name: 'Business',
    tagline: 'Para empresas em crescimento',
    monthlyPrice: 400,
    icon: Building2,
    popular: true,
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
    included: ['Acesso a API', 'Biblioteca de midia', 'Analytics', 'Calendario', 'Postagem em massa', 'Link na bio'],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    tagline: 'Para grandes organizacoes',
    monthlyPrice: null,
    icon: Crown,
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
    included: ['Acesso a API', 'Biblioteca de midia', 'Analytics', 'Calendario', 'Postagem em massa', 'Link na bio'],
  },
];

function formatPlanPrice(price: number | null) {
  if (price === null) return 'Custom';
  if (price === 0) return 'R$ 0';
  return `R$ ${price}`;
}

function formatPlanPeriod(price: number | null) {
  if (price === null || price === 0) return '/mes';
  return '/mes';
}

export default function BillingPage() {
  const router = useRouter();
  const [credits, setCredits] = useState(0);
  const [loading, setLoading] = useState(false);
  const [currentPlan, setCurrentPlan] = useState('free');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    fetch('/api/usage/monthly', { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => res.json())
      .then((data) => {
        setCredits(data.credits || 0);
        setCurrentPlan(data.plan || 'free');
      });
  }, []);

  async function handleUpgrade(planId: string) {
    if (planId === 'free') {
      router.push('/dashboard');
      return;
    }
    if (planId === 'enterprise') {
      window.location.href = 'mailto:stackpost@expostacker.com.br?subject=Interesse%20no%20plano%20Enterprise';
      return;
    }
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login?redirect=billing');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/pagamentos/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ plano: planId }),
      });
      const data = await res.json();
      if (res.ok && data.init_point) {
        window.location.href = data.init_point;
      } else {
        alert(data.error || 'Erro ao iniciar pagamento. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  }

  const nextPayment = billingPlans.find((p) => p.id === currentPlan)?.monthlyPrice ?? null;

  return (
    <div className="min-h-screen bg-brand-bg">
      <Header activeHref="/billing" />

      <main className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Billing</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
          <div className="p-6 rounded-2xl bg-brand-surface border border-brand-border">
            <h2 className="text-lg font-semibold mb-2">Plano atual</h2>
            <div className="text-3xl font-bold capitalize">{currentPlan}</div>
            <p className="text-sm text-brand-text-secondary mt-2">Renova em 1 de {new Date(Date.now() + 30 * 86400000).toLocaleDateString('pt-BR', { month: 'long' })}</p>
          </div>

          <div className="p-6 rounded-2xl bg-brand-surface border border-brand-border">
            <h2 className="text-lg font-semibold mb-2 flex items-center gap-2"><CreditCard className="w-5 h-5 text-brand-accent" /> Creditos X</h2>
            <div className="text-3xl font-bold">R$ {credits.toFixed(2)}</div>
            <p className="text-sm text-brand-text-secondary mt-2">Cobranca por uso: R$ 0.015/post, R$ 0.20/post com link</p>
            <button onClick={() => alert('Adicionar creditos X ainda nao implementado.')} disabled={loading} className="mt-3 w-full px-4 py-2 rounded-xl bg-brand-elevated border border-brand-border text-sm hover:bg-brand-border transition">
              Adicionar creditos
            </button>
          </div>

          <div className="p-6 rounded-2xl bg-brand-surface border border-brand-border">
            <h2 className="text-lg font-semibold mb-2">Proximo pagamento</h2>
            <div className="text-3xl font-bold">{nextPayment === null ? 'Custom' : formatPlanPrice(nextPayment)}</div>
            <p className="text-sm text-brand-text-secondary mt-2">Cobrado mensalmente</p>
          </div>
        </div>

        <h2 className="text-2xl font-bold mb-6">Mudar de plano</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {billingPlans.map((plan) => (
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
                  <span className="text-3xl font-bold">{formatPlanPrice(plan.monthlyPrice)}</span>
                  <span className="text-brand-text-secondary text-sm">{formatPlanPeriod(plan.monthlyPrice)}</span>
                </div>
                <p className="text-xs text-brand-text-secondary mt-1">por organizacao</p>
              </div>

              <button
                onClick={() => handleUpgrade(plan.id)}
                disabled={loading || currentPlan === plan.id}
                className={`w-full mb-6 px-4 py-3 rounded-xl font-semibold text-sm transition flex items-center justify-center gap-2 ${
                  currentPlan === plan.id
                    ? 'bg-brand-elevated border border-brand-border text-brand-text-secondary cursor-not-allowed'
                    : plan.popular
                      ? 'bg-brand-accent text-brand-bg hover:bg-brand-accent-hover'
                      : 'bg-brand-elevated border border-brand-border text-brand-text hover:bg-brand-border'
                }`}
              >
                {currentPlan === plan.id ? 'Plano atual' : plan.id === 'enterprise' ? 'Falar com vendas' : 'Escolher plano'}
                {!['free', 'enterprise'].includes(plan.id) && currentPlan !== plan.id && <ChevronRight className="w-4 h-4" />}
              </button>

              <div className="space-y-3 flex-1">
                {plan.features.map((f) => (
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
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
