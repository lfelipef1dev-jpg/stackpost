'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Search, Loader2, Filter, Eye, CreditCard, Calendar, TrendingUp, Users, AlertTriangle, Ban } from 'lucide-react';

interface Subscription {
  id: string;
  organization: { id: string; name: string; slug: string | null; owner: { id: string; name: string; email: string } | null };
  plan: { id: string; slug: string; name: string; price_cents: number; currency: string };
  status: string;
  current_period_start: string | null;
  current_period_end: string | null;
  payment_provider: string | null;
  created_at: string;
}

interface Stats {
  mrr: number;
  total_revenue: number;
  revenue_this_month: number;
  active_subscriptions: number;
  trialing: number;
  past_due: number;
  canceled: number;
  total_subscriptions: number;
  by_plan: Record<string, { name: string; count: number; revenue: number }>;
}

const STATUSES = ['all', 'active', 'past_due', 'canceled', 'trialing', 'paused'];

export default function AdminBillingPage() {
  const [subs, setSubs] = useState<Subscription[]>([]);
  const [plans, setPlans] = useState<{ slug: string; name: string }[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [planFilter, setPlanFilter] = useState('all');
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([
      fetch('/api/admin/billing/subscriptions').then(async (r) => { if (!r.ok) throw new Error('Erro em assinaturas'); return r.json(); }),
      fetch('/api/admin/plans').then(async (r) => { if (!r.ok) throw new Error('Erro em planos'); return r.json(); }),
      fetch('/api/admin/billing/stats').then(async (r) => { if (!r.ok) throw new Error('Erro em estatísticas'); return r.json(); }),
    ])
      .then(([subsData, plansData, statsData]) => {
        setSubs(Array.isArray(subsData) ? subsData : []);
        setPlans((Array.isArray(plansData) ? plansData : []).map((p: any) => ({ slug: p.slug, name: p.name })));
        setStats(statsData);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const filtered = subs.filter((s) => {
    const orgName = s.organization?.name?.toLowerCase() || '';
    const owner = s.organization?.owner;
    const matchesQuery = orgName.includes(query.toLowerCase()) || (owner?.name?.toLowerCase() || '').includes(query.toLowerCase()) || (owner?.email?.toLowerCase() || '').includes(query.toLowerCase());
    const matchesStatus = statusFilter === 'all' || s.status === statusFilter;
    const matchesPlan = planFilter === 'all' || s.plan?.slug === planFilter;
    return matchesQuery && matchesStatus && matchesPlan;
  });

  function formatMoney(cents: number) {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cents / 100);
  }

  if (loading) return <div className="flex items-center justify-center h-96"><Loader2 className="w-8 h-8 animate-spin text-brand-accent" /></div>;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-2">Financeiro</h1>
      <p className="text-brand-text-secondary mb-8">Assinaturas, receita recorrente e métricas de billing da plataforma.</p>
      {error && <div className="mb-6 p-4 rounded-xl bg-red-500/10 text-red-400 border border-red-500/30">{error}</div>}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Kpi icon={TrendingUp} label="MRR" value={formatMoney(stats?.mrr || 0)} />
        <Kpi icon={CreditCard} label="Receita total" value={formatMoney(stats?.total_revenue || 0)} />
        <Kpi icon={Calendar} label="Receita do mês" value={formatMoney(stats?.revenue_this_month || 0)} />
        <Kpi icon={Users} label="Assinaturas ativas" value={String(stats?.active_subscriptions || 0)} />
        <Kpi icon={AlertTriangle} label="Em atraso" value={String(stats?.past_due || 0)} />
        <Kpi icon={Ban} label="Canceladas" value={String(stats?.canceled || 0)} />
      </div>

      <div className="p-6 rounded-2xl bg-brand-surface border border-brand-border mb-8">
        <h2 className="text-lg font-bold mb-4">Distribuição por plano</h2>
        <div className="flex items-end gap-4 h-32">
          {Object.entries(stats?.by_plan || {}).map(([slug, p]) => (
            <div key={slug} className="flex-1 flex flex-col items-center gap-2">
              <div className="text-xs text-brand-text-secondary text-center">{p.name}</div>
              <div className="w-full bg-brand-accent rounded-t-xl" style={{ height: `${Math.min((p.count / Math.max(stats?.active_subscriptions || 1, 1)) * 100, 100)}%` }} />
              <div className="text-xs font-bold">{p.count}</div>
            </div>
          ))}
        </div>
        {Object.keys(stats?.by_plan || {}).length === 0 && (
          <div className="text-sm text-brand-text-secondary text-center py-4">Nenhuma assinatura ativa registrada ainda.</div>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Link href="/admin/billing/payments" className="p-4 rounded-2xl bg-brand-surface border border-brand-border hover:border-brand-accent/50 transition-colors">
          <div className="text-sm text-brand-text-secondary">Pagamentos</div>
          <div className="text-lg font-semibold flex items-center gap-2"><CreditCard className="w-4 h-4 text-brand-accent" /> Ver pagamentos</div>
        </Link>
        <Link href="/admin/billing/invoices" className="p-4 rounded-2xl bg-brand-surface border border-brand-border hover:border-brand-accent/50 transition-colors">
          <div className="text-sm text-brand-text-secondary">Faturas</div>
          <div className="text-lg font-semibold flex items-center gap-2"><Calendar className="w-4 h-4 text-brand-accent" /> Ver faturas</div>
        </Link>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-text-secondary" />
          <input type="text" placeholder="Buscar por organização ou proprietário..." value={query} onChange={(e) => setQuery(e.target.value)} className="w-full pl-10 pr-4 py-3 rounded-xl bg-brand-surface border border-brand-border text-brand-text" />
        </div>
        <div className="flex items-center gap-2 text-brand-text-secondary">
          <Filter className="w-4 h-4" />
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-4 py-3 rounded-xl bg-brand-surface border border-brand-border text-brand-text">
            {STATUSES.map((s) => <option key={s} value={s}>{s === 'all' ? 'Todos os status' : s}</option>)}
          </select>
          <select value={planFilter} onChange={(e) => setPlanFilter(e.target.value)} className="px-4 py-3 rounded-xl bg-brand-surface border border-brand-border text-brand-text">
            <option value="all">Todos os planos</option>
            {plans.map((p) => <option key={p.slug} value={p.slug}>{p.name}</option>)}
          </select>
        </div>
      </div>

      <div className="rounded-2xl bg-brand-surface border border-brand-border overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-brand-elevated text-brand-text-secondary"><tr><th className="px-6 py-4">Organização</th><th className="px-6 py-4">Plano</th><th className="px-6 py-4">Status</th><th className="px-6 py-4">Período</th><th className="px-6 py-4">Criada em</th><th className="px-6 py-4">Ações</th></tr></thead>
          <tbody className="divide-y divide-brand-border">
            {filtered.map((s) => (
              <tr key={s.id} className="hover:bg-brand-elevated/50 transition-colors">
                <td className="px-6 py-4"><div className="font-medium">{s.organization?.name || '-'}</div><div className="text-xs text-brand-text-secondary">{s.organization?.owner?.email || '-'}</div></td>
                <td className="px-6 py-4"><span className="font-medium">{s.plan?.name || s.plan?.slug || '-'}</span><div className="text-xs text-brand-text-secondary">{s.payment_provider || 'manual'}</div></td>
                <td className="px-6 py-4"><span className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium ${statusBadge(s.status)}`}>{s.status}</span></td>
                <td className="px-6 py-4 text-xs text-brand-text-secondary">{s.current_period_start ? new Date(s.current_period_start).toLocaleDateString('pt-BR') : '-'}<br/>{s.current_period_end ? new Date(s.current_period_end).toLocaleDateString('pt-BR') : '-'}</td>
                <td className="px-6 py-4 text-brand-text-secondary">{new Date(s.created_at).toLocaleDateString('pt-BR')}</td>
                <td className="px-6 py-4"><Link href={`/admin/billing/subscriptions/${s.id}`} className="text-xs px-3 py-1.5 rounded-lg bg-brand-elevated border border-brand-border hover:bg-brand-accent/10 hover:text-brand-accent transition-colors inline-flex items-center gap-1"><Eye className="w-3 h-3" /> Detalhes</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && !error && <div className="p-8 text-center text-brand-text-secondary">Nenhuma assinatura encontrada para os filtros aplicados.</div>}
      </div>
      <div className="mt-4 text-sm text-brand-text-secondary">{filtered.length} assinatura(s) encontrada(s)</div>
    </div>
  );
}

function statusBadge(status: string): string {
  switch (status) {
    case 'active':
      return 'bg-green-500/10 text-green-400';
    case 'trialing':
      return 'bg-blue-500/10 text-blue-400';
    case 'past_due':
      return 'bg-amber-500/10 text-amber-400';
    case 'canceled':
      return 'bg-red-500/10 text-red-400';
    case 'paused':
      return 'bg-brand-elevated text-brand-text-secondary';
    default:
      return 'bg-brand-elevated text-brand-text-secondary';
  }
}

function Kpi({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="p-5 rounded-2xl bg-brand-surface border border-brand-border flex items-center gap-4">
      <div className="w-12 h-12 rounded-2xl bg-brand-accent/10 flex items-center justify-center"><Icon className="w-6 h-6 text-brand-accent" /></div>
      <div>
        <div className="text-2xl font-bold">{value}</div>
        <div className="text-sm text-brand-text-secondary">{label}</div>
      </div>
    </div>
  );
}
