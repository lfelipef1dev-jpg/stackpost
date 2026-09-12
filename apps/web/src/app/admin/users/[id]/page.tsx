'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Save,
  Trash2,
  Key,
  UserCircle,
  Loader2,
  AlertCircle,
  ArrowLeft,
  Crown,
  CheckCircle2,
  LogIn,
} from 'lucide-react';

type UserStatus = 'active' | 'suspended' | 'pending';

interface UserDetail {
  id: string;
  name: string;
  email: string;
  status: UserStatus;
  is_superuser: boolean;
  role: string;
  created_at: string;
  last_login_at: string | null;
  team_id: string;
}

const STATUS_OPTIONS: { value: UserStatus; label: string }[] = [
  { value: 'active', label: 'Ativo' },
  { value: 'suspended', label: 'Suspenso' },
  { value: 'pending', label: 'Pendente' },
];

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

const formatDateTime = (iso: string) =>
  new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

export default function AdminUserDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [user, setUser] = useState<UserDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [impersonating, setImpersonating] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [tempPassword, setTempPassword] = useState('');

  useEffect(() => {
    let active = true;
    setLoading(true);
    setFetchError(null);
    fetch(`/api/admin/users/${id}`)
      .then(async (r) => {
        if (!r.ok) throw new Error();
        return r.json();
      })
      .then((data) => {
        if (active) setUser(data);
      })
      .catch(() => {
        if (active) setFetchError('Não foi possível carregar os dados deste usuário.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [id]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: user.name,
          email: user.email,
          status: user.status,
          is_superuser: user.is_superuser,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Falha ao salvar');
      setUser(data);
      setMessage({ type: 'success', text: 'Alterações salvas com sucesso.' });
    } catch (err) {
      setMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Não foi possível salvar as alterações. Tente novamente.',
      });
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!user) return;
    if (!window.confirm('Tem certeza que deseja excluir este usuário? Esta ação não pode ser desfeita.')) return;
    setDeleting(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/admin/users/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Falha ao excluir');
      }
      router.push('/admin/users');
    } catch (err) {
      setDeleting(false);
      setMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Não foi possível excluir o usuário. Tente novamente.',
      });
    }
  }

  async function handleResetPassword() {
    setResetting(true);
    setMessage(null);
    setTempPassword('');
    try {
      const res = await fetch(`/api/admin/users/${id}/reset-password`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Falha ao redefinir senha');
      setTempPassword(data.temp_password);
      setMessage({ type: 'success', text: 'Senha redefinida com sucesso.' });
    } catch (err) {
      setMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Não foi possível redefinir a senha. Tente novamente.',
      });
    } finally {
      setResetting(false);
    }
  }

  async function handleImpersonate() {
    setImpersonating(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/admin/users/${id}/impersonate`, { method: 'POST' });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Falha ao acessar');
      }
      window.location.href = '/dashboard';
    } catch (err) {
      setImpersonating(false);
      setMessage({
        type: 'error',
        text:
          err instanceof Error
            ? err.message
            : 'Não foi possível acessar como este usuário. Tente novamente.',
      });
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-3" role="status" aria-live="polite">
        <Loader2 className="w-8 h-8 animate-spin text-brand-accent" aria-hidden="true" />
        <span className="text-sm text-brand-text-secondary">Carregando usuário…</span>
      </div>
    );
  }

  if (fetchError || !user) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4" role="alert" aria-live="assertive">
        <AlertCircle className="w-10 h-10 text-error" aria-hidden="true" />
        <p className="text-brand-text-secondary text-center max-w-md">
          {fetchError || 'Usuário não encontrado.'}
        </p>
        <button
          onClick={() => router.push('/admin/users')}
          className="flex items-center gap-2 text-sm text-brand-accent hover:text-brand-accent-hover transition-colors focus:outline-none focus:ring-2 focus:ring-brand-accent rounded-lg px-3 py-1.5"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" /> Voltar à lista
        </button>
      </div>
    );
  }

  return (
    <div>
      <button
        onClick={() => router.push('/admin/users')}
        className="flex items-center gap-2 text-brand-text-secondary hover:text-brand-text mb-6 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-accent rounded-lg px-2 py-1"
        aria-label="Voltar à lista de usuários"
      >
        <ArrowLeft className="w-4 h-4" aria-hidden="true" /> Voltar
      </button>

      <header className="flex items-center gap-4 mb-8">
        <div className="w-16 h-16 rounded-2xl bg-brand-accent/10 flex items-center justify-center shrink-0">
          <UserCircle className="w-8 h-8 text-brand-accent" aria-hidden="true" />
        </div>
        <div className="min-w-0">
          <h1 className="text-3xl font-bold truncate">{user.name || user.email}</h1>
          <p className="text-brand-text-secondary truncate">{user.email}</p>
        </div>
        {user.is_superuser && (
          <span className="ml-auto inline-flex items-center gap-1 px-3 py-1 rounded-full bg-brand-accent/10 text-brand-accent text-xs font-medium shrink-0">
            <Crown className="w-3 h-3" aria-hidden="true" /> Administrador
          </span>
        )}
      </header>

      {message && (
        <div
          className={`mb-6 p-4 rounded-xl border text-sm flex items-center gap-3 ${
            message.type === 'success'
              ? 'bg-success/10 border-success/30 text-success'
              : 'bg-error/10 border-error/30 text-error'
          }`}
          role={message.type === 'error' ? 'alert' : 'status'}
          aria-live={message.type === 'error' ? 'assertive' : 'polite'}
        >
          {message.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0" aria-hidden="true" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
          )}
          {message.text}
        </div>
      )}

      {tempPassword && (
        <div className="mb-6 p-4 rounded-xl bg-success/10 border border-success/30 text-success">
          <p className="text-sm">
            Senha temporária gerada: <strong className="font-mono">{tempPassword}</strong>
          </p>
          <p className="text-xs mt-1 opacity-80">
            Compartilhe esta senha com o usuário. Ela não será exibida novamente.
          </p>
        </div>
      )}

      <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="space-y-2">
          <label htmlFor="user-name" className="text-sm text-brand-text-secondary block">
            Nome
          </label>
          <input
            id="user-name"
            value={user.name}
            onChange={(e) => setUser({ ...user, name: e.target.value })}
            className="w-full px-4 py-3 rounded-xl bg-brand-surface border border-brand-border text-brand-text focus:outline-none focus:border-brand-accent"
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="user-email" className="text-sm text-brand-text-secondary block">
            E-mail
          </label>
          <input
            id="user-email"
            type="email"
            value={user.email}
            onChange={(e) => setUser({ ...user, email: e.target.value })}
            className="w-full px-4 py-3 rounded-xl bg-brand-surface border border-brand-border text-brand-text focus:outline-none focus:border-brand-accent"
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="user-status" className="text-sm text-brand-text-secondary block">
            Status
          </label>
          <select
            id="user-status"
            value={user.status}
            onChange={(e) => setUser({ ...user, status: e.target.value as UserStatus })}
            className="w-full px-4 py-3 rounded-xl bg-brand-surface border border-brand-border text-brand-text focus:outline-none focus:border-brand-accent"
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <label htmlFor="user-super" className="text-sm text-brand-text-secondary block">
            Nível de acesso
          </label>
          <select
            id="user-super"
            value={user.is_superuser ? 'true' : 'false'}
            onChange={(e) => setUser({ ...user, is_superuser: e.target.value === 'true' })}
            className="w-full px-4 py-3 rounded-xl bg-brand-surface border border-brand-border text-brand-text focus:outline-none focus:border-brand-accent"
          >
            <option value="false">Usuário padrão</option>
            <option value="true">Administrador</option>
          </select>
        </div>

        <div className="md:col-span-2 flex flex-wrap gap-4">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-accent text-brand-bg font-bold hover:opacity-90 disabled:opacity-50 transition-opacity focus:outline-none focus:ring-2 focus:ring-brand-accent"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
            ) : (
              <Save className="w-4 h-4" aria-hidden="true" />
            )}
            Salvar alterações
          </button>
          <button
            type="button"
            onClick={handleResetPassword}
            disabled={resetting}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-elevated border border-brand-border hover:bg-brand-surface font-medium disabled:opacity-50 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-accent"
          >
            {resetting ? (
              <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
            ) : (
              <Key className="w-4 h-4" aria-hidden="true" />
            )}
            Redefinir senha
          </button>
          <button
            type="button"
            onClick={handleImpersonate}
            disabled={impersonating}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-elevated border border-brand-border hover:bg-brand-surface font-medium disabled:opacity-50 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-accent"
          >
            {impersonating ? (
              <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
            ) : (
              <LogIn className="w-4 h-4" aria-hidden="true" />
            )}
            Acessar como usuário
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-error/10 text-error border border-error/30 hover:bg-error/20 font-medium disabled:opacity-50 transition-colors focus:outline-none focus:ring-2 focus:ring-error"
          >
            {deleting ? (
              <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
            ) : (
              <Trash2 className="w-4 h-4" aria-hidden="true" />
            )}
            Excluir
          </button>
        </div>
      </form>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-6" aria-label="Informações da conta">
        <div className="p-6 rounded-2xl bg-brand-surface border border-brand-border">
          <div className="text-sm text-brand-text-secondary mb-1">Criado em</div>
          <div className="text-lg font-semibold">{formatDate(user.created_at)}</div>
        </div>
        <div className="p-6 rounded-2xl bg-brand-surface border border-brand-border">
          <div className="text-sm text-brand-text-secondary mb-1">Último login</div>
          <div className="text-lg font-semibold">
            {user.last_login_at ? formatDateTime(user.last_login_at) : 'Nunca acessou'}
          </div>
        </div>
        <div className="p-6 rounded-2xl bg-brand-surface border border-brand-border">
          <div className="text-sm text-brand-text-secondary mb-1">Equipe</div>
          <div className="text-lg font-semibold font-mono break-all">{user.team_id || '—'}</div>
        </div>
      </section>
    </div>
  );
}
