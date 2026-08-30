'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import {
  Search,
  Shield,
  ShieldAlert,
  Loader2,
  Ban,
  CheckCircle2,
  Download,
  Filter,
  Eye,
  AlertCircle,
  Users,
  Clock,
} from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  status: 'active' | 'suspended' | 'pending';
  is_superuser: boolean;
  created_at: string;
  last_login_at: string | null;
}

const STATUS_LABELS: Record<string, string> = {
  all: 'Todos os status',
  active: 'Ativo',
  suspended: 'Suspenso',
  pending: 'Pendente',
};

const SUPER_LABELS: Record<string, string> = {
  all: 'Todos os níveis',
  yes: 'Administradores',
  no: 'Usuários padrão',
};

const STATUSES = Object.keys(STATUS_LABELS);
const SUPER = Object.keys(SUPER_LABELS);

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

const formatLastLogin = (iso: string | null) =>
  iso
    ? new Date(iso).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : 'Nunca acessou';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [superFilter, setSuperFilter] = useState('all');

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    fetch('/api/admin/users')
      .then(async (r) => {
        if (!r.ok) throw new Error('Falha ao carregar usuários');
        return r.json();
      })
      .then((data) => {
        if (active) setUsers(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        if (active) setError('Não foi possível carregar a lista de usuários. Tente novamente em instantes.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const filtered = users.filter((u) => {
    const q = query.toLowerCase();
    const matchesQuery = u.name?.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
    const matchesStatus = statusFilter === 'all' || u.status === statusFilter;
    const matchesSuper = superFilter === 'all' || (superFilter === 'yes' ? u.is_superuser : !u.is_superuser);
    return matchesQuery && matchesStatus && matchesSuper;
  });

  const toggleStatus = useCallback(
    async (id: string, current: string) => {
      setActionError(null);
      setTogglingId(id);
      const next = current === 'active' ? 'suspended' : 'active';
      try {
        const res = await fetch(`/api/admin/users/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: next }),
        });
        if (!res.ok) throw new Error();
        setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, status: next as User['status'] } : u)));
      } catch {
        setActionError('Não foi possível atualizar o status do usuário. Tente novamente.');
      } finally {
        setTogglingId(null);
      }
    },
    [],
  );

  function exportCsv() {
    window.open('/api/admin/users/export', '_blank');
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-3" role="status" aria-live="polite">
        <Loader2 className="w-8 h-8 animate-spin text-brand-accent" aria-hidden="true" />
        <span className="text-sm text-brand-text-secondary">Carregando usuários…</span>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="flex flex-col items-center justify-center h-96 gap-4"
        role="alert"
        aria-live="assertive"
      >
        <AlertCircle className="w-10 h-10 text-error" aria-hidden="true" />
        <p className="text-brand-text-secondary text-center max-w-md">{error}</p>
      </div>
    );
  }

  return (
    <div>
      <header className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Usuários</h1>
        <p className="text-brand-text-secondary">
          Gerencie contas, permissões e o status de todos os usuários da plataforma.
        </p>
      </header>

      {actionError && (
        <div
          className="mb-6 p-4 rounded-xl bg-error/10 border border-error/30 text-error text-sm flex items-center gap-3"
          role="alert"
        >
          <AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
          {actionError}
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <label htmlFor="user-search" className="sr-only">
            Buscar usuário por nome ou e-mail
          </label>
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-text-secondary"
            aria-hidden="true"
          />
          <input
            id="user-search"
            type="text"
            placeholder="Buscar por nome ou e-mail…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl bg-brand-surface border border-brand-border text-brand-text placeholder:text-brand-text-secondary focus:outline-none focus:border-brand-accent"
          />
        </div>
        <div className="flex items-center gap-2 text-brand-text-secondary">
          <Filter className="w-4 h-4" aria-hidden="true" />
          <label htmlFor="status-filter" className="sr-only">
            Filtrar por status
          </label>
          <select
            id="status-filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-3 rounded-xl bg-brand-surface border border-brand-border text-brand-text focus:outline-none focus:border-brand-accent"
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {STATUS_LABELS[s]}
              </option>
            ))}
          </select>
          <label htmlFor="super-filter" className="sr-only">
            Filtrar por nível de acesso
          </label>
          <select
            id="super-filter"
            value={superFilter}
            onChange={(e) => setSuperFilter(e.target.value)}
            className="px-4 py-3 rounded-xl bg-brand-surface border border-brand-border text-brand-text focus:outline-none focus:border-brand-accent"
          >
            {SUPER.map((s) => (
              <option key={s} value={s}>
                {SUPER_LABELS[s]}
              </option>
            ))}
          </select>
        </div>
        <button
          onClick={exportCsv}
          className="flex items-center gap-2 px-4 py-3 rounded-xl bg-brand-elevated border border-brand-border hover:bg-brand-surface text-brand-text font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-brand-accent"
          aria-label="Exportar lista de usuários em CSV"
        >
          <Download className="w-4 h-4" aria-hidden="true" /> Exportar CSV
        </button>
      </div>

      <div className="rounded-2xl bg-brand-surface border border-brand-border overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-brand-elevated text-brand-text-secondary">
            <tr>
              <th scope="col" className="px-6 py-4 font-medium">Nome</th>
              <th scope="col" className="px-6 py-4 font-medium">E-mail</th>
              <th scope="col" className="px-6 py-4 font-medium">Status</th>
              <th scope="col" className="px-6 py-4 font-medium">Acesso</th>
              <th scope="col" className="px-6 py-4 font-medium">Criado em</th>
              <th scope="col" className="px-6 py-4 font-medium">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-border">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-16 text-center">
                  <div className="flex flex-col items-center gap-3 text-brand-text-secondary">
                    <Users className="w-10 h-10 opacity-50" aria-hidden="true" />
                    <p className="text-sm">
                      {users.length === 0
                        ? 'Ainda não há usuários cadastrados na plataforma.'
                        : 'Nenhum usuário corresponde aos filtros aplicados.'}
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              filtered.map((u) => (
                <tr key={u.id} className="hover:bg-brand-elevated/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-brand-text">{u.name || '—'}</td>
                  <td className="px-6 py-4 text-brand-text-secondary">{u.email}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium ${
                        u.status === 'active'
                          ? 'bg-success/10 text-success'
                          : u.status === 'pending'
                            ? 'bg-warning/10 text-warning'
                            : 'bg-error/10 text-error'
                      }`}
                    >
                      {u.status === 'active' ? (
                        <CheckCircle2 className="w-3 h-3" aria-hidden="true" />
                      ) : (
                        <Ban className="w-3 h-3" aria-hidden="true" />
                      )}
                      {STATUS_LABELS[u.status] ?? u.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {u.is_superuser ? (
                      <span className="inline-flex items-center gap-1 text-brand-accent" title="Administrador">
                        <Shield className="w-4 h-4" aria-hidden="true" />
                        <span className="sr-only">Administrador</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-brand-text-secondary" title="Usuário padrão">
                        <ShieldAlert className="w-4 h-4" aria-hidden="true" />
                        <span className="sr-only">Usuário padrão</span>
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-brand-text-secondary">{formatDate(u.created_at)}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/admin/users/${u.id}`}
                        className="text-xs px-3 py-1.5 rounded-lg bg-brand-elevated border border-brand-border hover:bg-brand-accent/10 hover:text-brand-accent transition-colors flex items-center gap-1 focus:outline-none focus:ring-2 focus:ring-brand-accent"
                        aria-label={`Ver detalhes de ${u.name || u.email}`}
                      >
                        <Eye className="w-3 h-3" aria-hidden="true" /> Ver
                      </Link>
                      <button
                        onClick={() => toggleStatus(u.id, u.status)}
                        disabled={togglingId === u.id}
                        className="text-xs px-3 py-1.5 rounded-lg bg-brand-elevated border border-brand-border hover:bg-brand-accent/10 hover:text-brand-accent transition-colors disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-brand-accent"
                        aria-label={
                          u.status === 'active'
                            ? `Suspender ${u.name || u.email}`
                            : `Reativar ${u.name || u.email}`
                        }
                      >
                        {togglingId === u.id ? (
                          <Loader2 className="w-3 h-3 animate-spin" aria-hidden="true" />
                        ) : u.status === 'active' ? (
                          'Suspender'
                        ) : (
                          'Reativar'
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {filtered.length > 0 && (
        <p className="mt-4 text-xs text-brand-text-secondary flex items-center gap-1.5">
          <Clock className="w-3 h-3" aria-hidden="true" />
          {filtered.length} {filtered.length === 1 ? 'usuário encontrado' : 'usuários encontrados'}
        </p>
      )}
    </div>
  );
}
