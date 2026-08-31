'use client';

import { useState } from 'react';
import { Check, X } from 'lucide-react';
import Link from 'next/link';

const plans = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    features: ['3 contas sociais', '50 posts/mes', 'API e SDK'],
  },
  {
    id: 'starter',
    name: 'Inicial',
    price: 39,
    features: ['5 contas sociais', '2.000 posts/mes', '2 usuarios'],
    popular: true,
  },
  {
    id: 'growth',
    name: 'Crescimento',
    price: 89,
    features: ['20 contas sociais', '8.000 posts/mes', 'AI caption + webhooks'],
  },
  {
    id: 'scale',
    name: 'Escala',
    price: 197,
    features: ['Contas ilimitadas', '40.000 posts/mes', 'MCP server + CLI'],
  },
  {
    id: 'business',
    name: 'Empresarial',
    price: 497,
    features: ['Contas ilimitadas', '150.000 posts/mes', 'White label + SLA'],
  },
];

export default function PlanModal({ currentPlan, onClose }: { currentPlan: string; onClose: () => void }) {
  const [selected, setSelected] = useState(currentPlan);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="relative w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-2xl bg-brand-surface border border-brand-border p-6 md:p-8">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-brand-elevated text-brand-text-secondary"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-2xl font-bold mb-2">Mudar de plano</h2>
        <p className="text-brand-text-secondary mb-8">Escolha o plano que faz sentido para voce.</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          {plans.map((plan) => (
            <div
              key={plan.id}
              onClick={() => setSelected(plan.id)}
              className={`cursor-pointer p-5 rounded-2xl border transition ${
                selected === plan.id
                  ? 'border-brand-accent bg-brand-elevated'
                  : 'border-brand-border bg-brand-bg hover:border-brand-text/20'
              }`}
            >
              {plan.popular && (
                <div className="mb-2 inline-block px-2 py-0.5 rounded-full bg-brand-accent text-brand-bg text-[10px] font-semibold">
                  Popular
                </div>
              )}
              <h3 className="text-lg font-bold">{plan.name}</h3>
              <div className="mt-2 mb-4">
                <span className="text-2xl font-bold">R$ {plan.price}</span>
                <span className="text-brand-text-secondary text-sm">/mes</span>
              </div>
              <ul className="space-y-2">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-xs text-brand-text-secondary">
                    <Check className="w-3 h-3 text-success shrink-0 mt-0.5" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-3 rounded-xl border border-brand-border text-brand-text hover:bg-brand-elevated transition"
          >
            Cancelar
          </button>
          <Link
            href="/plans"
            className="px-6 py-3 rounded-xl bg-brand-accent text-brand-bg font-semibold hover:bg-brand-accent-hover transition"
          >
            Continuar com {plans.find((p) => p.id === selected)?.name}
          </Link>
        </div>
      </div>
    </div>
  );
}
