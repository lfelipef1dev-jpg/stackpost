'use client';

import { useEffect, useState, useCallback } from 'react';
import { Search, Loader2, Download, Filter, Eye, CheckCircle2, XCircle, Trash2, RefreshCw } from 'lucide-react';

interface Post {
  id: string;
  content: string;
  platforms: string[];
  status: string;
  scheduled_at: string;
  published_at: string;
  created_at: string;
  platform_count: number;
  error?: string;
}

type StatusFilter = 'all' | 'draft' | 'scheduled' | 'posted' | 'error' | 'deleted';

const STATUS_FILTERS: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: 'Todos os status' },
  { value: 'draft', label: 'Rascunho' },
  { value: 'scheduled', label: 'Agendado' },
  { value: 'posted', label: 'Publicado' },
  { value: 'error', label: 'Com erro' },
  { value: 'deleted', label: 'Excluído' },
];

const STATUS_LABELS: Record<string, string> = {
  draft: 'Rascunho',
  scheduled: 'Agendado',
  posted: 'Publicado',
  error: 'Com erro',
  deleted: 'Excluído',
  review: 'Em revisão',
  approved: 'Aprovado',
  processing: 'Processando',
  rejected: 'Rejeitado',
};

const STATUS_BADGE: Record<string, string> = {
  error: 'bg-red-500/10 text-red-400 border border-red-500/30',
  posted: 'bg-green-500/10 text-green-400 border border-green-500/30',
  scheduled: 'bg-brand-accent/10 text-brand-accent border border-brand-accent/30',
  rejected: 'bg-red-500/10 text-red-400 border border-red-500/30',
  deleted: 'bg-brand-elevated text-brand-text-secondary border border-brand-border',
};

const formatDatePtBR = (iso: string | null | undefined) => {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '—';
  }
};

export default function AdminPostsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [error, setError] = useState('');
  const [selected, setSelected] = useState<string[]>([]);
  const [actionLoading, setActionLoading] = useState(false);

  const loadPosts = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    try {
      const r = await fetch('/api/admin/posts');
      if (!r.ok) {
        const j = await r.json().catch(() => ({}));
        throw new Error(j.error || 'Falha ao carregar publicações.');
      }
      const data = await r.json();
      setPosts(data);
      setError('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Falha ao carregar publicações.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  const filtered = posts.filter((p) => {
    const q = query.toLowerCase();
    const matchesQuery = p.content?.toLowerCase().includes(q) || p.id?.toLowerCase().includes(q);
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchesQuery && matchesStatus;
  });

  const allSelected = filtered.length > 0 && selected.length === filtered.length;

  function toggle(id: string) {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  function toggleAll() {
    setSelected(allSelected ? [] : filtered.map((p) => p.id));
  }

  async function batchDelete() {
    if (selected.length === 0) return;
    if (!confirm(`Confirmar exclusão de ${selected.length} publicação(ões)? Esta ação não pode ser desfeita.`)) return;
    setActionLoading(true);
    try {
      const res = await fetch('/api/admin/posts/batch', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selected, action: 'delete' }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || 'Falha ao excluir publicações.');
      }
      setSelected([]);
      await loadPosts(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Falha ao excluir publicações.');
    } finally {
      setActionLoading(false);
    }
  }

  async function approvePost(id: string) {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/posts/${id}/approve`, { method: 'POST' });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || 'Falha ao aprovar publicação.');
      }
      await loadPosts(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Falha ao aprovar publicação.');
    } finally {
      setActionLoading(false);
    }
  }

  async function rejectPost(id: string) {
    const reason = prompt('Informe o motivo da rejeição:');
    if (!reason) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/posts/${id}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || 'Falha ao rejeitar publicação.');
      }
      await loadPosts(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Falha ao rejeitar publicação.');
    } finally {
      setActionLoading(false);
    }
  }

  function exportCsv() {
    window.open('/api/admin/posts/export', '_blank', 'noopener,noreferrer');
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-3" role="status" aria-live="polite">
        <Loader2 className="w-8 h-8 animate-spin text-brand-accent" aria-hidden="true" />
        <span className="text-brand-text-secondary text-sm">Carregando publicações…</span>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-start justify-between mb-2">
        <div>
          <h1 className="text-3xl font-bold text-brand-text">Publicações e Moderação</h1>
          <p className="text-brand-text-secondary mt-1">Gerencie, modere e acompanhe o desempenho das publicações.</p>
        </div>
        <button
          onClick={() => loadPosts(true)}
          disabled={refreshing}
          className="flex items-center gap-2 px-3 py-2 rounded-xl bg-brand-elevated border border-brand-border text-brand-text-secondary hover:text-brand-text text-sm font-medium disabled:opacity-50"
          aria-label="Atualizar lista"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} aria-hidden="true" />
          Atualizar
        </button>
      </div>

      {error && (
        <div
          className="mb-6 p-4 rounded-xl bg-red-500/10 text-red-400 border border-red-500/30 text-sm"
          role="alert"
          aria-live="assertive"
        >
          {error}
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-text-secondary" aria-hidden="true" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por conteúdo ou identificador…"
            aria-label="Buscar publicações"
            className="w-full pl-10 pr-4 py-3 rounded-xl bg-brand-surface border border-brand-border text-brand-text placeholder:text-brand-text-secondary focus:outline-none focus:border-brand-accent"
          />
        </div>
        <div className="flex items-center gap-2 text-brand-text-secondary">
          <Filter className="w-4 h-4" aria-hidden="true" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
            aria-label="Filtrar por status"
            className="px-4 py-3 rounded-xl bg-brand-surface border border-brand-border text-brand-text focus:outline-none focus:border-brand-accent"
          >
            {STATUS_FILTERS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
        <button
          onClick={exportCsv}
          className="flex items-center gap-2 px-4 py-3 rounded-xl bg-brand-elevated border border-brand-border hover:bg-brand-surface text-brand-text font-medium"
          aria-label="Exportar publicações em CSV"
        >
          <Download className="w-4 h-4" aria-hidden="true" /> Exportar CSV
        </button>
      </div>

      {selected.length > 0 && (
        <div className="flex items-center gap-3 mb-4 p-3 rounded-xl bg-brand-elevated border border-brand-border">
          <span className="text-sm text-brand-text-secondary">{selected.length} selecionada(s)</span>
          <button
            onClick={batchDelete}
            disabled={actionLoading}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20 text-sm font-medium disabled:opacity-50"
            aria-label="Excluir publicações selecionadas"
          >
            <Trash2 className="w-4 h-4" aria-hidden="true" /> Excluir selecionadas
          </button>
        </div>
      )}

      <div className="rounded-2xl bg-brand-surface border border-brand-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-brand-elevated text-brand-text-secondary">
              <tr>
                <th className="px-4 py-4 w-12">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleAll}
                    aria-label="Selecionar todas as publicações"
                    className="w-4 h-4"
                  />
                </th>
                <th className="px-6 py-4 font-medium">Publicação</th>
                <th className="px-6 py-4 font-medium">Redes</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Agendado para</th>
                <th className="px-6 py-4 font-medium text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border">
              {filtered.map((p) => {
                const badge = STATUS_BADGE[p.status] || 'bg-brand-elevated text-brand-text-secondary border border-brand-border';
                return (
                  <tr key={p.id} className="hover:bg-brand-elevated/50">
                    <td className="px-4 py-4">
                      <input
                        type="checkbox"
                        checked={selected.includes(p.id)}
                        onChange={() => toggle(p.id)}
                        aria-label={`Selecionar publicação ${p.id.slice(0, 8)}`}
                        className="w-4 h-4"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="max-w-xs truncate font-medium text-brand-text">{p.content || '(sem conteúdo)'}</div>
                      <div className="text-xs text-brand-text-secondary mt-0.5">{p.id.slice(0, 12)}</div>
                      {p.error && <div className="text-xs text-red-400 mt-1">{p.error}</div>}
                    </td>
                    <td className="px-6 py-4 text-brand-text-secondary">{p.platform_count} redes</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-md text-xs font-medium ${badge}`}>
                        {STATUS_LABELS[p.status] || p.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-brand-text-secondary">{formatDatePtBR(p.scheduled_at)}</td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2 justify-end">
                        <a
                          href={`/admin/posts/${p.id}`}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-brand-elevated border border-brand-border hover:bg-brand-accent/10 hover:text-brand-accent text-xs font-medium"
                          aria-label={`Ver detalhes da publicação ${p.id.slice(0, 8)}`}
                        >
                          <Eye className="w-3 h-3" aria-hidden="true" /> Detalhes
                        </a>
                        <button
                          onClick={() => approvePost(p.id)}
                          disabled={actionLoading}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-green-500/10 text-green-400 border border-green-500/30 hover:bg-green-500/20 text-xs font-medium disabled:opacity-50"
                          aria-label="Aprovar publicação"
                          title="Aprovar"
                        >
                          <CheckCircle2 className="w-3 h-3" aria-hidden="true" />
                        </button>
                        <button
                          onClick={() => rejectPost(p.id)}
                          disabled={actionLoading}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20 text-xs font-medium disabled:opacity-50"
                          aria-label="Rejeitar publicação"
                          title="Rejeitar"
                        >
                          <XCircle className="w-3 h-3" aria-hidden="true" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && !error && (
          <div className="p-12 text-center text-brand-text-secondary">
            Nenhuma publicação encontrada com os filtros atuais.
          </div>
        )}
      </div>

      {filtered.length > 0 && (
        <p className="text-xs text-brand-text-secondary mt-4">
          Exibindo {filtered.length} de {posts.length} publicação(ões).
        </p>
      )}
    </div>
  );
}
