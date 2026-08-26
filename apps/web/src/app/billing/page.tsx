'use client';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CreditCard, Loader2, Check, Zap, Sparkles, Building2, Crown } from 'lucide-react';

function brl(n: number) {
  return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
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

  const planPrices: Record<string, number | null> = {
    free: 0,
    pro: 100,
    business: 400,
    enterprise: null,
  };

  const plans = [
    { id: 'free', name: 'Free', price: 0, icon: Zap, features: ['20 posts/mes', '50 comentarios/mes', '3 contas'] },
    { id: 'pro', name: 'Pro', price: 100, icon: Sparkles, features: ['10k posts/mes', '5k comentarios/mes', 'Contas ilimitadas'] },
    { id: 'business', name: 'Business', price: 400, icon: Building2, features: ['100k posts/mes', '50k comentarios/mes', 'Contas ilimitadas'] },
    { id: 'enterprise', name: 'Enterprise', price: null, icon: Crown, features: ['Custom', 'SLA dedicado', 'White-label'] },
  ];

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

  async function handleAddCredits() {
    setLoading(true);
    alert('Adicionar creditos X ainda nao implementado.');
    setLoading(false);
  }

  const nextPayment = planPrices[currentPlan];

  return (
    <div className="min-h-screen bg-brand-bg">
      <Header activeHref="/billing" />

      <main className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Billing</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="p-6 rounded-2xl bg-brand-surface border border-brand-border">
            <h2 className="text-lg font-semibold mb-2">Plano atual</h2>
            <div className="text-3xl font-bold capitalize">{currentPlan}</div>
            <p className="text-sm text-brand-text-secondary mt-2">Renova em 1 de {new Date(Date.now() + 30 * 86400000).toLocaleDateString('pt-BR', { month: 'long' })}</p>
          </div>

          <div className="p-6 rounded-2xl bg-brand-surface border border-brand-border">
            <h2 className="text-lg font-semibold mb-2 flex items-center gap-2"><CreditCard className="w-5 h-5 text-brand-accent" /> Creditos X</h2>
            <div className="text-3xl font-bold">{brl(credits)}</div>
            <p className="text-sm text-brand-text-secondary mt-2">Cobranca por uso: R$ 0,015/post, R$ 0,20/post com link</p>
            <button onClick={handleAddCredits} disabled={loading} className="mt-3 w-full px-4 py-2 rounded-xl bg-brand-elevated border border-brand-border text-sm hover:bg-brand-border transition">
              {loading ? 'Carregando...' : 'Adicionar creditos'}
            </button>
          </div>

          <div className="p-6 rounded-2xl bg-brand-surface border border-brand-border">
            <h2 className="text-lg font-semibold mb-2">Proximo pagamento</h2>
            <div className="text-3xl font-bold">{nextPayment === null ? 'Custom' : brl(nextPayment)}</div>
            <p className="text-sm text-brand-text-secondary mt-2">Cobrado mensalmente</p>
          </div>
        </div>

        <h2 className="text-2xl font-bold mb-6">Mudar de plano</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((p) => (
            <div key={p.id} className={`p-6 rounded-2xl border ${currentPlan === p.id ? 'bg-brand-surface border-brand-accent' : 'bg-brand-surface border-brand-border'}`}>
              <p.icon className="w-8 h-8 text-brand-accent mb-3" />
              <h3 className="text-lg font-bold">{p.name}</h3>
              <div className="text-2xl font-bold mb-4">{p.price === null ? 'Custom' : brl(p.price)}</div>
              <ul className="space-y-2 mb-6">
                {p.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-brand-text-secondary">
                    <Check className="w-4 h-4 text-success" /> {f}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => handleUpgrade(p.id)}
                disabled={loading || (currentPlan === p.id && p.id !== 'enterprise')}
                className={`w-full px-4 py-3 rounded-xl font-semibold text-sm transition disabled:opacity-50 ${
                  currentPlan === p.id && p.id !== 'enterprise'
                    ? 'bg-brand-elevated border border-brand-border text-brand-text-secondary'
                    : 'bg-brand-accent text-brand-bg hover:bg-brand-accent-hover'
                }`}
              >
                {currentPlan === p.id && p.id !== 'enterprise' ? 'Plano atual' : p.id === 'enterprise' ? 'Falar com vendas' : 'Fazer upgrade'}
              </button>
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
