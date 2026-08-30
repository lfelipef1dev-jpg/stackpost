'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Search, Building2, Loader2, Download, Filter, Eye, Plus, AlertCircle, Users } from 'lucide-react';

interface Organization {
  id: string;
  name: string;
  slug: string;
  plan: string;
  plan_status: string;
  status: string;
  created_at: string;
  owner: { name: string; email: string } | null;
  teams: { id: string; name: string }[];
  member_count: number;
}

const PLANS = ['all', 'free', 'starter', 'growth', 'scale', 'business'];
const STATUSES = ['all', 'active', 'archived', 'past_due'];

const dateFormatter = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
});

const PLAN_LABELS: Record<string, string> = {
  free: 'Free',
  starter: 'Starter',
  growth: 'Growth',
  scale: 'Scale',
  business: 'Business',
};

const STATUS_LABELS: Record<string, string> = {
  active: 'Ativa',
  archived: 'Arquivada',
  past_due: 'Pagamento pendente',
};

function formatDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '—';
  return dateFormatter.format(date);
}

export default function AdminOrganizationsPage() {
  const [orgs, setOrgs] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [planFilter, setPlanFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    fetch('/api/admin/organizations')
      .then(async (r) => {
        if (!r.ok) throw new Error('Falha ao carregar organizações.');
        return r.json();
      })
      .then((data) => {
        if (active) setOrgs(data || []);
      })
      .catch((err) => {
        if (active) {
          setError(err instanceof Error ? err.message : 'Erro inesperado ao carregar organizações.');
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const filtered = useMemo(
    () =>
      orgs.filter((o) => {
        const q = query.toLowerCase();
        const matchesQuery =
          o.name?.toLowerCase().includes(q) || o.slug?.toLowerCase().includes(q);
        const matchesPlan = planFilter === 'all' || o.plan === planFilter;
        const matchesStatus =
          statusFilter === 'all' ||
          o.status === statusFilter ||
          (statusFilter === 'past_due' && o.plan_status === 'past_due');
        return matchesQuery && matchesPlan && matchesStatus;
      }),
    [orgs, query, planFilter, statusFilter],
  );

  function exportCsv() {
    window.open('/api/admin/organizations/export', '_blank');
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96" role="status" aria-live="polite">
        <Loader2 className="w-8 h-8 animate-spin text-brand-accent" aria-hidden="true" />
        <span className="sr-only">Carregando organizações…</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4" role="alert">
        <AlertCircle className="w-10 h-10 text-error" aria-hidden="true" />
        <p className="text-brand-text-secondary text-center max-w-md">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 rounded-xl bg-brand-accent text-brand-bg font-medium hover:bg-brand-accent-hover transition"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-2">
        <div>
          <h1 className="text-3xl font-bold">Organizações</h1>
          <p className="text-brand-text-secondary mt-1">
            Gerencie workspaces, empresas e assinaturas ativas na plataforma.
          </p>
        </div>
        <button
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-accent text-brand-bg font-bold hover:bg-brand-accent-hover transition"
        >
          <Plus className="w-4 h-4" aria-hidden="true" /> Nova organização
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6 mt-6">
        <div className="relative flex-1">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-text-secondary"
            aria-hidden="true"
          />
          <input
            type="text"
            placeholder="Buscar por nome ou slug…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Buscar organizações"
            className="w-full pl-10 pr-4 py-3 rounded-xl bg-brand-surface border border-brand-border text-brand-text focus:outline-none focus:border-brand-accent"
          />
        </div>
        <div className="flex items-center gap-2 text-brand-text-secondary">
          <Filter className="w-4 h-4" aria-hidden="true" />
          <select
            value={planFilter}
            onChange={(e) => setPlanFilter(e.target.value)}
            aria-label="Filtrar por plano"
            className="px-4 py-3 rounded-xl bg-brand-surface border border-brand-border text-brand-text focus:outline-none focus:border-brand-accent"
          >
            {PLANS.map((p) => (
              <option key={p} value={p}>
                {p === 'all' ? 'Todos os planos' : PLAN_LABELS[p] || p}
              </option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            aria-label="Filtrar por status"
            className="px-4 py-3 rounded-xl bg-brand-surface border border-brand-border text-brand-text focus:outline-none focus:border-brand-accent"
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s === 'all' ? 'Todos os status' : STATUS_LABELS[s] || s}
              </option>
            ))}
          </select>
        </div>
        <button
          onClick={exportCsv}
          className="flex items-center gap-2 px-4 py-3 rounded-xl bg-brand-elevated border border-brand-border hover:bg-brand-surface text-brand-text font-medium transition"
        >
          <Download className="w-4 h-4" aria-hidden="true" /> Exportar CSV
        </button>
      </div>

      <p className="text-sm text-brand-text-secondary mb-4" aria-live="polite">
        {filtered.length} {filtered.length === 1 ? 'organização encontrada' : 'organizações encontradas'}
      </p>

      {filtered.length === 0 ? (
        <div className="rounded-2xl bg-brand-surface border border-brand-border p-12 text-center">
          <Building2 className="w-10 h-10 text-brand-text-secondary mx-auto mb-4" aria-hidden="true" />
          <h3 className="text-lg font-bold mb-2">Nenhuma organização encontrada</h3>
          <p className="text-brand-text-secondary text-sm max-w-md mx-auto">
            Ajuste os filtros de busca ou cadastre uma nova organização para começar.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((o) => {
            const isActive = o.status === 'active';
            const statusLabel = STATUS_LABELS[o.status] || o.status;
            return (
              <div
                key={o.id}
                className="p-6 rounded-2xl bg-brand-surface border border-brand-border hover:border-brand-accent/50 transition-colors"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-brand-accent/10 flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-brand-accent" aria-hidden="true" />
                  </div>
                  <span
                    className={`px-2 py-1 rounded-md text-xs font-medium ${
                      isActive
                        ? 'bg-success/10 text-success'
                        : 'bg-error/10 text-error'
                    }`}
                  >
                    {statusLabel}
                  </span>
                </div>
                <h3 className="text-lg font-bold mb-1">{o.name}</h3>
                <p className="text-sm text-brand-text-secondary mb-4">
                  {o.owner?.name || o.owner?.email || 'Sem responsável'}
                </p>
                <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                  <div className="p-3 rounded-xl bg-brand-elevated">
                    <div className="text-brand-text-secondary">Plano</div>
                    <div className="font-semibold">{PLAN_LABELS[o.plan] || o.plan}</div>
                  </div>
                  <div className="p-3 rounded-xl bg-brand-elevated">
                    <div className="text-brand-text-secondary">Membros</div>
                    <div className="font-semibold">{o.member_count}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs text-brand-text-secondary mb-4">
                  <Users className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>
                    {o.teams.length} {o.teams.length === 1 ? 'equipe' : 'equipes'} · Criada em{' '}
                    {formatDate(o.created_at)}
                  </span>
                </div>
                <Link
                  href={`/admin/organizations/${o.id}`}
                  className="flex items-center gap-2 text-sm px-4 py-2 rounded-xl bg-brand-elevated border border-brand-border hover:bg-brand-accent/10 hover:text-brand-accent transition"
                >
                  <Eye className="w-4 h-4" aria-hidden="true" /> Gerenciar organização
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
