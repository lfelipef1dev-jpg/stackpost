'use client';

import Header from '@/components/Header';
import Footer from '@/components/Footer';

import { useEffect, useState, useRef } from 'react';
import {
  Users, Plus, Trash2, Crown, Shield, Eye, Edit3, Loader2, AlertCircle,
  CheckCircle2, Mail, UserPlus, Sparkles,
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/* SpotlightCard                                                       */
/* ------------------------------------------------------------------ */
function SpotlightCard({
  children,
  className = '',
  glow = '#8AB4F8',
}: {
  children: React.ReactNode;
  className?: string;
  glow?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [spot, setSpot] = useState({ x: 0, y: 0, active: false });
  return (
    <div
      ref={ref}
      onMouseMove={(e) => {
        if (!ref.current) return;
        const r = ref.current.getBoundingClientRect();
        setSpot({ x: e.clientX - r.left, y: e.clientY - r.top, active: true });
      }}
      onMouseLeave={() => setSpot((s) => ({ ...s, active: false }))}
      className={`relative rounded-3xl bg-brand-surface/60 backdrop-blur-xl border border-brand-border/50 ${className}`}
      style={{
        backgroundImage: spot.active
          ? `radial-gradient(circle 120px at ${spot.x}px ${spot.y}px, ${glow}0a, transparent)`
          : undefined,
      }}
    >
      <div
        className="absolute inset-0 rounded-3xl pointer-events-none"
        style={{
          boxShadow: spot.active ? `inset 0 0 0 1px ${glow}25` : 'inset 0 0 0 1px transparent',
          transition: 'box-shadow 0.3s',
        }}
      />
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* TiltCard (1.5° sem scale)                                          */
/* ------------------------------------------------------------------ */
function TiltCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [style, setStyle] = useState({});
  return (
    <div
      ref={ref}
      onMouseMove={(e) => {
        if (!ref.current) return;
        const r = ref.current.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        setStyle({
          transform: `perspective(1200px) rotateX(${-y * 1.5}deg) rotateY(${x * 1.5}deg)`,
          transition: 'transform 0.15s ease-out',
        });
      }}
      onMouseLeave={() =>
        setStyle({
          transform: 'perspective(1200px) rotateX(0) rotateY(0)',
          transition: 'transform 0.4s ease-out',
        })
      }
      style={style}
      className={`will-change-transform ${className}`}
    >
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Funções utilitárias                                                 */
/* ------------------------------------------------------------------ */
function initialsOf(email?: string): string {
  if (!email) return '?';
  const name = email.split('@')[0];
  const parts = name.split(/[._-]/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

function formatDate(dateStr?: string | null): string {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
}

/* ------------------------------------------------------------------ */
/* Roles                                                               */
/* ------------------------------------------------------------------ */
const ROLES = [
  { id: 'owner', name: 'Proprietário', icon: Crown, color: 'text-warning', desc: 'Acesso total + cobrança' },
  { id: 'admin', name: 'Administrador', icon: Shield, color: 'text-brand-accent', desc: 'Gerenciar time e contas' },
  { id: 'editor', name: 'Editor', icon: Edit3, color: 'text-success', desc: 'Criar e publicar posts' },
  { id: 'viewer', name: 'Visualizador', icon: Eye, color: 'text-brand-text-secondary', desc: 'Somente leitura' },
];

function getRole(roleId: string) {
  return ROLES.find((r) => r.id === roleId) || ROLES[3];
}

/* ------------------------------------------------------------------ */
/* Página                                                              */
/* ------------------------------------------------------------------ */
export default function TeamPage() {
  const [members, setMembers] = useState<any[]>([]);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('editor');
  const [loading, setLoading] = useState(true);
  const [inviting, setInviting] = useState(false);
  const [actingId, setActingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  useEffect(() => {
    loadMembers();
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(t);
  }, [toast]);

  async function loadMembers() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/team');
      if (!res.ok) throw new Error('Falha ao carregar membros');
      const data = await res.json();
      setMembers(Array.isArray(data) ? data : []);
    } catch {
      setError('Não foi possível carregar o time. Tente novamente.');
      setMembers([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleInvite() {
    const trimmed = email.trim();
    if (!trimmed || inviting) return;
    setInviting(true);
    setError(null);
    try {
      const res = await fetch('/api/team', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmed, role }),
      });
      const data = await res.json();
      if (!res.ok) {
        const msg =
          data?.error ||
          (Array.isArray(data) ? 'E-mail ou papel inválido.' : 'Não foi possível convidar o membro.');
        throw new Error(msg);
      }
      setEmail('');
      setToast({ type: 'success', msg: 'Convite enviado com sucesso.' });
      await loadMembers();
    } catch (e: any) {
      setToast({ type: 'error', msg: e?.message || 'Erro ao convidar membro.' });
    } finally {
      setInviting(false);
    }
  }

  async function handleRemove(id: string) {
    if (actingId) return;
    setActingId(id);
    try {
      const res = await fetch(`/api/team?id=${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || 'Não foi possível remover o membro.');
      }
      setToast({ type: 'success', msg: 'Membro removido do time.' });
      await loadMembers();
    } catch (e: any) {
      setToast({ type: 'error', msg: e?.message || 'Erro ao remover membro.' });
    } finally {
      setActingId(null);
    }
  }

  async function handleChangeRole(id: string, newRole: string) {
    if (actingId) return;
    setActingId(id);
    try {
      const res = await fetch('/api/team', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, role: newRole }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || 'Não foi possível atualizar o papel.');
      }
      setToast({ type: 'success', msg: 'Papel atualizado com sucesso.' });
      await loadMembers();
    } catch (e: any) {
      setToast({ type: 'error', msg: e?.message || 'Erro ao atualizar papel.' });
    } finally {
      setActingId(null);
    }
  }

  const stats = {
    total: members.length,
    owners: members.filter((m) => m.role === 'owner').length,
    admins: members.filter((m) => m.role === 'admin').length,
    editors: members.filter((m) => m.role === 'editor').length,
    viewers: members.filter((m) => m.role === 'viewer').length,
  };

  return (
    <div className="min-h-screen bg-brand-bg">
      <Header activeHref="/team" />

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Cabeçalho */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-brand-text flex items-center gap-3">
            <Users className="w-7 h-7 text-brand-accent" />
            Time
          </h1>
          <p className="text-brand-text-secondary mt-2 max-w-2xl">
            Gerencie quem acessa seu workspace, defina papéis e convide colaboradores para
            publicar, analisar e moderar suas redes sociais em equipe.
          </p>
        </div>

        {/* Stats rápidas */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Membros', value: stats.total, icon: Users, color: 'text-brand-accent' },
            { label: 'Proprietários', value: stats.owners, icon: Crown, color: 'text-warning' },
            { label: 'Administradores', value: stats.admins, icon: Shield, color: 'text-brand-accent' },
            { label: 'Editores', value: stats.editors + stats.viewers, icon: Edit3, color: 'text-success' },
          ].map((s) => (
            <TiltCard key={s.label}>
              <SpotlightCard className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-brand-text">{s.value}</div>
                    <div className="text-xs text-brand-text-secondary mt-1">{s.label}</div>
                  </div>
                  <s.icon className={`w-6 h-6 ${s.color}`} />
                </div>
              </SpotlightCard>
            </TiltCard>
          ))}
        </div>

        {/* Erro global de carregamento */}
        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-error/10 border border-error/30 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-error flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <div className="text-sm font-medium text-error">{error}</div>
              <button
                onClick={loadMembers}
                className="text-xs text-error/80 underline mt-1"
              >
                Tentar novamente
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Convite */}
          <TiltCard className="h-fit">
            <SpotlightCard className="p-6">
              <h2 className="text-lg font-semibold mb-1 flex items-center gap-2 text-brand-text">
                <UserPlus className="w-5 h-5 text-brand-accent" />
                Convidar membro
              </h2>
              <p className="text-xs text-brand-text-secondary mb-4">
                O colaborador precisa ter uma conta ativa no StackPost para receber o convite.
              </p>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-brand-text-secondary mb-1.5 block">E-mail</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-brand-text-secondary absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleInvite()}
                      placeholder="colega@empresa.com"
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-brand-elevated border border-brand-border text-brand-text placeholder:text-brand-text-secondary focus:outline-none focus:border-brand-accent transition"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-brand-text-secondary mb-1.5 block">Papel</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-brand-elevated border border-brand-border text-brand-text focus:outline-none focus:border-brand-accent transition"
                  >
                    {ROLES.filter((r) => r.id !== 'owner').map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name} — {r.desc}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  onClick={handleInvite}
                  disabled={inviting || !email.trim()}
                  className="w-full px-6 py-3 rounded-xl bg-brand-accent text-brand-bg font-semibold hover:bg-brand-accent-hover transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {inviting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  {inviting ? 'Enviando…' : 'Convidar'}
                </button>
              </div>

              <div className="mt-6 pt-5 border-t border-brand-border/50">
                <div className="text-xs font-semibold text-brand-text-secondary uppercase tracking-wide mb-3">
                  Permissões por papel
                </div>
                <div className="space-y-2.5">
                  {ROLES.map((r) => (
                    <div key={r.id} className="flex items-center gap-2.5">
                      <r.icon className={`w-4 h-4 flex-shrink-0 ${r.color}`} />
                      <div className="flex-1 min-w-0">
                        <span className="text-sm text-brand-text font-medium">{r.name}</span>
                        <span className="text-xs text-brand-text-secondary block">{r.desc}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </SpotlightCard>
          </TiltCard>

          {/* Lista de membros */}
          <div className="lg:col-span-2">
            <SpotlightCard className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold flex items-center gap-2 text-brand-text">
                  <Users className="w-5 h-5 text-brand-accent" />
                  Membros ({members.length})
                </h2>
                {members.length > 0 && (
                  <span className="text-xs text-brand-text-secondary flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-brand-accent" />
                    {members.length} {members.length === 1 ? 'colaborador' : 'colaboradores'}
                  </span>
                )}
              </div>

              {/* Loading */}
              {loading && (
                <div className="flex flex-col items-center justify-center py-16 gap-3">
                  <Loader2 className="w-8 h-8 text-brand-accent animate-spin" />
                  <div className="text-sm text-brand-text-secondary">Carregando membros…</div>
                </div>
              )}

              {/* Vazio */}
              {!loading && members.length === 0 && !error && (
                <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-brand-elevated flex items-center justify-center">
                    <Users className="w-7 h-7 text-brand-text-secondary" />
                  </div>
                  <div className="text-sm font-medium text-brand-text">Nenhum membro ainda</div>
                  <div className="text-xs text-brand-text-secondary max-w-xs">
                    Convide colaboradores para publicar, moderar comentários e acompanhar métricas
                    das suas redes sociais em conjunto.
                  </div>
                </div>
              )}

              {/* Lista */}
              {!loading && members.length > 0 && (
                <div className="space-y-3">
                  {members.map((m) => {
                    const r = getRole(m.role);
                    const isOwner = m.role === 'owner';
                    const isActing = actingId === m.id;
                    return (
                      <div
                        key={m.id}
                        className="flex items-center gap-3 p-3 rounded-xl bg-brand-elevated border border-brand-border"
                      >
                        <div className="w-10 h-10 rounded-full bg-brand-accent/20 flex items-center justify-center text-brand-accent font-bold text-sm flex-shrink-0">
                          {initialsOf(m.email)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-brand-text truncate">{m.email || 'Sem e-mail'}</div>
                          <div className={`text-xs flex items-center gap-1 ${r.color}`}>
                            <r.icon className="w-3 h-3" /> {r.name}
                            {m.created_at && (
                              <span className="text-brand-text-secondary ml-1">· desde {formatDate(m.created_at)}</span>
                            )}
                          </div>
                        </div>
                        {isOwner ? (
                          <span className="text-xs px-2.5 py-1 rounded-lg bg-warning/10 text-warning font-medium flex items-center gap-1">
                            <Crown className="w-3 h-3" /> Proprietário
                          </span>
                        ) : (
                          <>
                            <select
                              value={m.role}
                              disabled={isActing}
                              onChange={(e) => handleChangeRole(m.id, e.target.value)}
                              className="text-xs px-2 py-1.5 rounded-lg bg-brand-surface border border-brand-border text-brand-text focus:outline-none focus:border-brand-accent transition disabled:opacity-50"
                            >
                              {ROLES.filter((rr) => rr.id !== 'owner').map((rr) => (
                                <option key={rr.id} value={rr.id}>{rr.name}</option>
                              ))}
                            </select>
                            <button
                              onClick={() => handleRemove(m.id)}
                              disabled={isActing}
                              className="p-2 rounded-lg text-brand-text-secondary hover:bg-error/10 hover:text-error transition disabled:opacity-50"
                              title="Remover do time"
                            >
                              {isActing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                            </button>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </SpotlightCard>
          </div>
        </div>
      </main>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-2">
          <div
            className={`flex items-center gap-2.5 px-4 py-3 rounded-xl border backdrop-blur-xl shadow-lg ${
              toast.type === 'success'
                ? 'bg-success/10 border-success/30 text-success'
                : 'bg-error/10 border-error/30 text-error'
            }`}
          >
            {toast.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
            )}
            <span className="text-sm font-medium">{toast.msg}</span>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
