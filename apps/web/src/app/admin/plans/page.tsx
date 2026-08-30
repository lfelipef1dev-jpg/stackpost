'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Search, Crown, Loader2, Download, Filter, Eye, Plus, CheckCircle2, XCircle } from 'lucide-react';

interface Plan {
  id: string;
  slug: string;
  name: string;
  price_cents: number;
  currency: string;
  interval: string;
  trial_days: number;
  is_active: boolean;
  is_public: boolean;
  subscriber_count: number;
  limits: { key: string; value: number }[];
  features: { key: string; value: any }[];
}

const STATUSES = ['all', 'active', 'inactive'];

const STATUS_LABELS: Record<string, string> = {
  all: 'Todos',
  active: 'Ativos',
  inactive: 'Inativos',
};

const formatBRL = (cents: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cents / 100);

export default function AdminPlansPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/admin/plans')
      .then((r) => r.json())
      .then((data) => {
        if (data && data.error) {
          setError(data.error);
        } else {
          setPlans(Array.isArray(data) ? data : []);
        }
      })
      .catch(() => setError('Falha de comunicação com o servidor. Tente novamente.'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = plans.filter((p) => {
    const matchesQuery = p.name.toLowerCase().includes(query.toLowerCase()) || p.slug.toLowerCase().includes(query.toLowerCase());
    const active = statusFilter === 'all' || (statusFilter === 'active' ? p.is_active : !p.is_active);
    return matchesQuery && active;
  });

  function exportCsv() {
    window.open('/api/admin/plans/export', '_blank');
  }

  async function handleArchive(id: string) {
    if (!confirm('Arquivar plano? Usuários ativos não serão afetados imediatamente.')) return;
    const res = await fetch(`/api/admin/plans/${id}`, { method: 'DELETE' });
    if (res.ok) setPlans((prev) => prev.map((p) => (p.id === id ? { ...p, is_active: false, is_public: false } : p)));
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96" role="status" aria-live="polite">
        <Loader2 className="w-8 h-8 animate-spin text-brand-accent" aria-hidden="true" />
        <span className="sr-only">Carregando planos…</span>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="p-6 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 flex items-center gap-3"
        role="alert"
      >
        <XCircle className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
        {error}
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-3xl font-bold">Planos e Limites</h1>
        <Link href="/admin/plans/new" className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-accent text-brand-bg font-bold hover:opacity-90 transition-opacity">
          <Plus className="w-4 h-4" aria-hidden="true" /> Novo plano
        </Link>
      </div>
      <p className="text-brand-text-secondary mb-8">Gerencie planos, limites de uso e recursos disponíveis para cada assinatura.</p>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-text-secondary" aria-hidden="true" />
          <label htmlFor="plan-search" className="sr-only">Buscar planos</label>
          <input
            id="plan-search"
            type="text"
            placeholder="Buscar por nome ou identificador…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl bg-brand-surface border border-brand-border text-brand-text"
          />
        </div>
        <div className="flex items-center gap-2 text-brand-text-secondary">
          <Filter className="w-4 h-4" aria-hidden="true" />
          <label htmlFor="plan-status" className="sr-only">Filtrar por status</label>
          <select id="plan-status" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-4 py-3 rounded-xl bg-brand-surface border border-brand-border text-brand-text">
            {STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
          </select>
        </div>
        <button onClick={exportCsv} className="flex items-center gap-2 px-4 py-3 rounded-xl bg-brand-elevated border border-brand-border hover:bg-brand-surface text-brand-text font-medium transition-colors">
          <Download className="w-4 h-4" aria-hidden="true" /> Exportar CSV
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.length === 0 ? (
          <div className="col-span-full p-12 rounded-2xl bg-brand-surface border border-brand-border text-center text-brand-text-secondary">
            Nenhum plano encontrado com os filtros selecionados.
          </div>
        ) : (
          filtered.map((p) => (
            <div key={p.id} className="p-6 rounded-2xl bg-brand-surface border border-brand-border hover:border-brand-accent/50 transition-colors">
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-brand-accent/10 flex items-center justify-center">
                  <Crown className="w-5 h-5 text-brand-accent" aria-hidden="true" />
                </div>
                {p.is_active ? (
                  <span className="px-2 py-1 rounded-md text-xs font-medium bg-green-500/10 text-green-400">Ativo</span>
                ) : (
                  <span className="px-2 py-1 rounded-md text-xs font-medium bg-red-500/10 text-red-400">Inativo</span>
                )}
              </div>
              <h3 className="text-lg font-bold mb-1">{p.name}</h3>
              <p className="text-sm text-brand-text-secondary mb-4">{p.slug}</p>
              <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                <div className="p-3 rounded-xl bg-brand-elevated">
                  <div className="text-brand-text-secondary">Preço</div>
                  <div className="font-semibold">{formatBRL(p.price_cents)}</div>
                </div>
                <div className="p-3 rounded-xl bg-brand-elevated">
                  <div className="text-brand-text-secondary">Assinantes</div>
                  <div className="font-semibold">{p.subscriber_count}</div>
                </div>
              </div>
              <div className="flex items-center gap-2 mb-4 text-sm text-brand-text-secondary">
                {p.is_public ? (
                  <><CheckCircle2 className="w-3 h-3 text-green-400" aria-hidden="true" /> Público</>
                ) : (
                  <><XCircle className="w-3 h-3 text-red-400" aria-hidden="true" /> Oculto</>
                )}
              </div>
              <Link href={`/admin/plans/${p.id}`} className="flex items-center gap-2 text-sm px-4 py-2 rounded-xl bg-brand-elevated border border-brand-border hover:bg-brand-accent/10 hover:text-brand-accent transition-colors">
                <Eye className="w-4 h-4" aria-hidden="true" /> Gerenciar
              </Link>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
