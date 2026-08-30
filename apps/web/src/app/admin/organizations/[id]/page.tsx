'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Building2, ArrowLeft, Loader2, AlertCircle, Save, UserPlus, UserX, Crown } from 'lucide-react';

interface Organization {
  id: string;
  name: string;
  slug: string;
  plan: string;
  plan_status: string;
  status: string;
  billing_email?: string;
  billing_name?: string;
  tax_id?: string;
  created_at: string;
  owner: { id: string; name: string; email: string } | null;
  teams: { id: string; name: string }[];
  subscriptions: any[];
  member_count: number;
}

interface Member {
  id: string;
  role: string;
  created_at: string;
  user: { id: string; name: string; email: string };
}

const ROLE_LABELS: Record<string, string> = {
  owner: 'Proprietário',
  admin: 'Administrador',
  editor: 'Editor',
  viewer: 'Visualizador',
};

const PLAN_LABELS: Record<string, string> = {
  free: 'Gratuito',
  starter: 'Starter',
  growth: 'Growth',
  scale: 'Scale',
  business: 'Business',
};

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });

export default function AdminOrganizationDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [org, setOrg] = useState<Organization | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('editor');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      fetch(`/api/admin/organizations/${id}`).then((r) => r.json()),
      fetch(`/api/admin/organizations/${id}/members`).then((r) => r.json()),
    ])
      .then(([o, m]) => {
        if (!o || o.error) {
          setError(o?.error || 'Não foi possível carregar a organização.');
        } else {
          setOrg(o);
          setMembers(Array.isArray(m) ? m : []);
        }
      })
      .catch(() => setError('Falha de comunicação com o servidor. Tente novamente.'))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!org) return;
    setSaving(true);
    const res = await fetch(`/api/admin/organizations/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: org.name,
        plan: org.plan,
        status: org.status,
        billing_email: org.billing_email,
        billing_name: org.billing_name,
        tax_id: org.tax_id,
      }),
    });
    const data = await res.json();
    setSaving(false);
    if (res.ok) {
      setMessage('Organização atualizada.');
      setOrg(data);
    } else {
      setMessage(data.error || 'Erro ao salvar.');
    }
  }

  async function handleInvite() {
    if (!inviteEmail) return;
    const res = await fetch(`/api/admin/organizations/${id}/members`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: inviteEmail, role: inviteRole }),
    });
    if (res.ok) {
      setInviteEmail('');
      const m = await fetch(`/api/admin/organizations/${id}/members`).then((r) => r.json());
      setMembers(m);
      setMessage('Membro adicionado.');
    } else {
      const data = await res.json();
      setMessage(data.error || 'Erro ao convidar.');
    }
  }

  async function handleArchive() {
    if (!confirm('Arquivar esta organização?')) return;
    const res = await fetch(`/api/admin/organizations/${id}`, { method: 'DELETE' });
    if (res.ok) router.push('/admin/organizations');
    else setMessage('Erro ao arquivar.');
  }

  async function handleChangeRole(userId: string, role: string) {
    const res = await fetch(`/api/admin/organizations/${id}/members/${userId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role }),
    });
    if (res.ok) {
      const m = await fetch(`/api/admin/organizations/${id}/members`).then((r) => r.json());
      setMembers(m);
    }
  }

  async function handleRemove(userId: string) {
    if (!confirm('Remover membro?')) return;
    const res = await fetch(`/api/admin/organizations/${id}/members/${userId}`, { method: 'DELETE' });
    if (res.ok) {
      setMembers((prev) => prev.filter((m) => m.user.id !== userId));
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96" role="status" aria-live="polite">
        <Loader2 className="w-8 h-8 animate-spin text-brand-accent" aria-hidden="true" />
        <span className="sr-only">Carregando organização…</span>
      </div>
    );
  }

  if (error || !org) {
    return (
      <div
        className="p-6 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 flex items-center gap-3"
        role="alert"
      >
        <AlertCircle className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
        {error || 'Organização não encontrada.'}
      </div>
    );
  }

  return (
    <div>
      <button onClick={() => router.push('/admin/organizations')} className="flex items-center gap-2 text-brand-text-secondary hover:text-brand-text mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" aria-hidden="true" /> Voltar para organizações
      </button>

      <div className="flex items-center gap-4 mb-8">
        <div className="w-16 h-16 rounded-2xl bg-brand-accent/10 flex items-center justify-center">
          <Building2 className="w-8 h-8 text-brand-accent" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">{org.name}</h1>
          <p className="text-brand-text-secondary">{org.slug}</p>
        </div>
      </div>

      {message && (
        <div className="mb-6 p-4 rounded-xl bg-brand-elevated border border-brand-border text-brand-text text-sm" role="status" aria-live="polite">
          {message}
        </div>
      )}

      <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="space-y-2">
          <label htmlFor="org-name" className="text-sm text-brand-text-secondary">Nome</label>
          <input id="org-name" value={org.name} onChange={(e) => setOrg({ ...org, name: e.target.value })} className="w-full px-4 py-3 rounded-xl bg-brand-surface border border-brand-border text-brand-text" />
        </div>
        <div className="space-y-2">
          <label htmlFor="org-plan" className="text-sm text-brand-text-secondary">Plano</label>
          <select id="org-plan" value={org.plan} onChange={(e) => setOrg({ ...org, plan: e.target.value })} className="w-full px-4 py-3 rounded-xl bg-brand-surface border border-brand-border text-brand-text">
            {Object.entries(PLAN_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        </div>
        <div className="space-y-2">
          <label htmlFor="org-status" className="text-sm text-brand-text-secondary">Status</label>
          <select id="org-status" value={org.status} onChange={(e) => setOrg({ ...org, status: e.target.value as any })} className="w-full px-4 py-3 rounded-xl bg-brand-surface border border-brand-border text-brand-text">
            <option value="active">Ativo</option>
            <option value="archived">Arquivado</option>
          </select>
        </div>
        <div className="space-y-2">
          <label htmlFor="org-billing-email" className="text-sm text-brand-text-secondary">E-mail de cobrança</label>
          <input id="org-billing-email" type="email" value={org.billing_email || ''} onChange={(e) => setOrg({ ...org, billing_email: e.target.value })} className="w-full px-4 py-3 rounded-xl bg-brand-surface border border-brand-border text-brand-text" />
        </div>

        <div className="md:col-span-2 flex gap-4">
          <button type="submit" disabled={saving} className="flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-accent text-brand-bg font-bold hover:opacity-90 disabled:opacity-50 transition-opacity">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" /> : <Save className="w-4 h-4" aria-hidden="true" />}
            Salvar alterações
          </button>
          <button type="button" onClick={handleArchive} className="px-6 py-3 rounded-xl bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20 font-medium transition-colors">
            Arquivar organização
          </button>
        </div>
      </form>

      <div className="mb-8 p-6 rounded-2xl bg-brand-surface border border-brand-border">
        <h2 className="text-xl font-bold mb-4">Convidar membro</h2>
        <div className="flex flex-col md:flex-row gap-4">
          <label htmlFor="invite-email" className="sr-only">E-mail do convidado</label>
          <input
            id="invite-email"
            type="email"
            placeholder="email@empresa.com"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            className="flex-1 px-4 py-3 rounded-xl bg-brand-elevated border border-brand-border text-brand-text"
          />
          <label htmlFor="invite-role" className="sr-only">Cargo do convidado</label>
          <select id="invite-role" value={inviteRole} onChange={(e) => setInviteRole(e.target.value)} className="px-4 py-3 rounded-xl bg-brand-elevated border border-brand-border text-brand-text">
            {Object.entries(ROLE_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
          <button onClick={handleInvite} className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-brand-accent text-brand-bg font-bold hover:opacity-90 transition-opacity">
            <UserPlus className="w-4 h-4" aria-hidden="true" /> Convidar
          </button>
        </div>
      </div>

      <div className="rounded-2xl bg-brand-surface border border-brand-border overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-brand-elevated text-brand-text-secondary">
            <tr>
              <th scope="col" className="px-6 py-4 font-medium">Membro</th>
              <th scope="col" className="px-6 py-4 font-medium">Cargo</th>
              <th scope="col" className="px-6 py-4 font-medium">Criado em</th>
              <th scope="col" className="px-6 py-4 font-medium">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-border">
            {members.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-brand-text-secondary">
                  Nenhum membro vinculado a esta organização.
                </td>
              </tr>
            ) : (
              members.map((m) => (
                <tr key={m.id} className="hover:bg-brand-elevated/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium">{m.user.name || '—'}</div>
                    <div className="text-brand-text-secondary">{m.user.email}</div>
                  </td>
                  <td className="px-6 py-4">
                    {m.role === 'owner' ? (
                      <span className="inline-flex items-center gap-1 text-brand-accent font-medium">
                        <Crown className="w-3 h-3" aria-hidden="true" /> {ROLE_LABELS[m.role] || m.role}
                      </span>
                    ) : (
                      ROLE_LABELS[m.role] || m.role
                    )}
                  </td>
                  <td className="px-6 py-4">{formatDate(m.created_at)}</td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <select
                        value={m.role}
                        onChange={(e) => handleChangeRole(m.user.id, e.target.value)}
                        disabled={m.role === 'owner'}
                        aria-label={`Alterar cargo de ${m.user.name || m.user.email}`}
                        className="px-3 py-1.5 rounded-lg bg-brand-elevated border border-brand-border text-xs disabled:opacity-50"
                      >
                        {['admin', 'editor', 'viewer'].map((r) => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
                      </select>
                      <button
                        onClick={() => handleRemove(m.user.id)}
                        disabled={m.role === 'owner'}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20 disabled:opacity-50 text-xs transition-colors"
                      >
                        <UserX className="w-3 h-3" aria-hidden="true" /> Remover
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
