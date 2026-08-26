'use client';

import { useEffect, useState } from 'react';
import { CreditCard, Loader2, Check, Zap, Sparkles, Building2, Crown } from 'lucide-react';

export default function BillingPage() {
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

  const plans = [
    { id: 'free', name: 'Free', price: 0, icon: Zap, features: ['20 posts/mes', '50 comentarios/mes', '3 contas'] },
    { id: 'pro', name: 'Pro', price: 100, icon: Sparkles, features: ['10k posts/mes', '5k comentarios/mes', 'Contas ilimitadas'] },
    { id: 'business', name: 'Business', price: 400, icon: Building2, features: ['100k posts/mes', '50k comentarios/mes', 'Contas ilimitadas'] },
    { id: 'enterprise', name: 'Enterprise', price: null, icon: Crown, features: ['Custom', 'SLA dedicado', 'White-label'] },
  ];

  async function handleUpgrade(plan: string) {
    setLoading(true);
    // In production, this would redirect to Stripe Checkout
    alert(`Redirecionando para Stripe Checkout - Plano ${plan}...\n\nEm producao, isso abre uma sessao Stripe real.`);
    setLoading(false);
  }

  async function handleAddCredits() {
    setLoading(true);
    alert('Redirecionando para Stripe para adicionar creditos X...');
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-brand-bg">
      <header className="h-16 border-b border-brand-border bg-brand-surface/50 backdrop-blur sticky top-0 z-20">
        <div className="max-w-7xl mx-auto h-full px-4 flex items-center justify-between">
          <div className="font-display font-bold text-xl text-brand-accent">StackPost</div>
          <nav className="hidden md:flex gap-6 text-sm text-brand-text-secondary">
            <a href="/dashboard" className="hover:text-brand-text">Dashboard</a>
            <a href="/analytics" className="hover:text-brand-text">Analytics</a>
            <a href="/billing" className="text-brand-text">Billing</a>
            <a href="/settings" className="hover:text-brand-text">Config</a>
          </nav>
        </div>
      </header>

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
            <div className="text-3xl font-bold font-mono">${credits.toFixed(2)}</div>
            <p className="text-sm text-brand-text-secondary mt-2">Cobranca por uso: $0.015/post, $0.20/post com link</p>
            <button onClick={handleAddCredits} disabled={loading} className="mt-3 w-full px-4 py-2 rounded-xl bg-brand-elevated border border-brand-border text-sm hover:bg-brand-border transition">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Adicionar creditos'}
            </button>
          </div>

          <div className="p-6 rounded-2xl bg-brand-surface border border-brand-border">
            <h2 className="text-lg font-semibold mb-2">Proximo pagamento</h2>
            <div className="text-3xl font-bold">{currentPlan === 'free' ? 'R$ 0' : currentPlan === 'pro' ? 'R$ 100' : currentPlan === 'business' ? 'R$ 400' : 'Custom'}</div>
            <p className="text-sm text-brand-text-secondary mt-2">Cobrado mensalmente</p>
          </div>
        </div>

        <h2 className="text-2xl font-bold mb-6">Mudar de plano</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((p) => (
            <div key={p.id} className={`p-6 rounded-2xl border ${currentPlan === p.id ? 'bg-brand-surface border-brand-accent' : 'bg-brand-surface border-brand-border'}`}>
              <p.icon className="w-8 h-8 text-brand-accent mb-3" />
              <h3 className="text-lg font-bold">{p.name}</h3>
              <div className="text-2xl font-bold mb-4">{p.price === null ? 'Custom' : `R$ ${p.price}`}</div>
              <ul className="space-y-2 mb-6">
                {p.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-brand-text-secondary">
                    <Check className="w-4 h-4 text-success" /> {f}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => handleUpgrade(p.id)}
                disabled={loading || currentPlan === p.id}
                className={`w-full px-4 py-3 rounded-xl font-semibold text-sm transition disabled:opacity-50 ${
                  currentPlan === p.id
                    ? 'bg-brand-elevated border border-brand-border text-brand-text-secondary'
                    : 'bg-brand-accent text-brand-bg hover:bg-brand-accent-hover'
                }`}
              >
                {currentPlan === p.id ? 'Plano atual' : 'Fazer upgrade'}
              </button>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
