'use client';

import { useEffect, useState } from 'react';
import { Users, Building2, FileText, CreditCard, AlertCircle, Loader2, type LucideIcon } from 'lucide-react';

interface Stats {
  users: number;
  organizations: number;
  posts: number;
  payments: number;
  scheduled: number;
  errors: number;
}

type StatTone = 'accent' | 'info' | 'success' | 'warning' | 'error';

const toneText: Record<StatTone, string> = {
  accent: 'text-brand-accent',
  info: 'text-info',
  success: 'text-success',
  warning: 'text-warning',
  error: 'text-error',
};

function StatCard({ icon: Icon, label, value, tone }: { icon: LucideIcon; label: string; value: number | string; tone: StatTone }) {
  return (
    <div className="p-6 rounded-2xl bg-brand-surface border border-brand-border">
      <div className="flex items-center justify-between mb-4">
        <span className="text-brand-text-secondary text-sm">{label}</span>
        <Icon className={`w-5 h-5 ${toneText[tone]}`} aria-hidden="true" />
      </div>
      <div className="text-3xl font-bold text-brand-text">{value}</div>
    </div>
  );
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/admin/dashboard')
      .then(async (r) => {
        if (!r.ok) throw new Error('Falha na requisição');
        return r.json();
      })
      .then((data) => {
        if (data.error) setError(data.error);
        else setStats(data);
      })
      .catch(() => setError('Não foi possível carregar o painel administrativo. Tente novamente em instantes.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96" role="status" aria-live="polite">
        <Loader2 className="w-8 h-8 animate-spin text-brand-accent" aria-hidden="true" />
        <span className="sr-only">Carregando painel administrativo…</span>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="p-6 rounded-2xl bg-error/10 border border-error/30 text-error flex items-center gap-3"
        role="alert"
      >
        <AlertCircle className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
        <span>{error}</span>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-2 text-brand-text">Painel Administrativo</h1>
      <p className="text-brand-text-secondary mb-8">Visão geral da operação do StackPost em tempo real.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <StatCard icon={Users} label="Usuários ativos" value={stats?.users || 0} tone="accent" />
        <StatCard icon={Building2} label="Organizações" value={stats?.organizations || 0} tone="info" />
        <StatCard icon={FileText} label="Publicações hoje" value={stats?.posts || 0} tone="accent" />
        <StatCard icon={CreditCard} label="Pagamentos hoje" value={stats?.payments || 0} tone="success" />
        <StatCard icon={FileText} label="Agendamentos" value={stats?.scheduled || 0} tone="warning" />
        <StatCard icon={AlertCircle} label="Publicações com erro" value={stats?.errors || 0} tone="error" />
      </div>
    </div>
  );
}
