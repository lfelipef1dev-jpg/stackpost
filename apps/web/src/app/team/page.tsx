'use client';

import { useEffect, useState } from 'react';
import { Users, Plus, Trash2, Crown, Shield, Eye, Edit3, Loader2 } from 'lucide-react';

const ROLES = [
  { id: 'owner', name: 'Owner', icon: Crown, color: 'text-warning', desc: 'Acesso total + billing' },
  { id: 'admin', name: 'Admin', icon: Shield, color: 'text-brand-accent', desc: 'Gerenciar time e contas' },
  { id: 'editor', name: 'Editor', icon: Edit3, color: 'text-success', desc: 'Criar e publicar posts' },
  { id: 'viewer', name: 'Viewer', icon: Eye, color: 'text-brand-text-secondary', desc: 'Visualizar apenas' },
];

export default function TeamPage() {
  const [members, setMembers] = useState<any[]>([]);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('editor');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadMembers();
  }, []);

  async function loadMembers() {
    const token = localStorage.getItem('token');
    if (!token) return;
    const res = await fetch('/api/team', { headers: { Authorization: `Bearer ${token}` } });
    const data = await res.json();
    setMembers(Array.isArray(data) ? data : []);
  }

  async function handleInvite() {
    if (!email) return;
    setLoading(true);
    const token = localStorage.getItem('token');
    await fetch('/api/team', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ email, role }),
    });
    setEmail('');
    await loadMembers();
    setLoading(false);
  }

  async function handleRemove(id: string) {
    const token = localStorage.getItem('token');
    await fetch(`/api/team?id=${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
    await loadMembers();
  }

  async function handleChangeRole(id: string, newRole: string) {
    const token = localStorage.getItem('token');
    await fetch('/api/team', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ id, role: newRole }),
    });
    await loadMembers();
  }

  function getRoleIcon(role: string) {
    const r = ROLES.find((r) => r.id === role);
    return r || ROLES[3];
  }

  return (
    <div className="min-h-screen bg-brand-bg">
      <header className="h-16 border-b border-brand-border bg-brand-surface/50 backdrop-blur sticky top-0 z-20">
        <div className="max-w-7xl mx-auto h-full px-4 flex items-center justify-between">
          <div className="font-display font-bold text-xl text-brand-accent">StackPost</div>
          <nav className="hidden md:flex gap-6 text-sm text-brand-text-secondary">
            <a href="/dashboard" className="hover:text-brand-text">Dashboard</a>
            <a href="/team" className="text-brand-text">Time</a>
            <a href="/analytics" className="hover:text-brand-text">Analytics</a>
            <a href="/billing" className="hover:text-brand-text">Billing</a>
            <a href="/settings" className="hover:text-brand-text">Config</a>
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Time</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-brand-surface border border-brand-border">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><Plus className="w-5 h-5 text-brand-accent" /> Convidar membro</h2>
            <div className="space-y-3">
              <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@empresa.com" className="w-full px-4 py-3 rounded-xl bg-brand-elevated border border-brand-border text-brand-text" />
              <select value={role} onChange={(e) => setRole(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-brand-elevated border border-brand-border text-brand-text">
                {ROLES.map((r) => (
                  <option key={r.id} value={r.id}>{r.name} - {r.desc}</option>
                ))}
              </select>
              <button onClick={handleInvite} disabled={loading || !email} className="w-full px-6 py-3 rounded-xl bg-brand-accent text-brand-bg font-semibold hover:bg-brand-accent-hover transition disabled:opacity-50 flex items-center justify-center gap-2">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                Convidar
              </button>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="p-6 rounded-2xl bg-brand-surface border border-brand-border">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><Users className="w-5 h-5 text-brand-accent" /> Membros ({members.length})</h2>
              <div className="space-y-3">
                {members.length === 0 && <div className="text-brand-text-secondary text-sm">Nenhum membro ainda.</div>}
                {members.map((m) => {
                  const r = getRoleIcon(m.role);
                  return (
                    <div key={m.id} className="flex items-center gap-3 p-3 rounded-xl bg-brand-elevated border border-brand-border">
                      <div className="w-10 h-10 rounded-full bg-brand-accent/20 flex items-center justify-center text-brand-accent font-bold">
                        {(m.email || '?')[0].toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">{m.email}</div>
                        <div className={`text-xs flex items-center gap-1 ${r.color}`}>
                          <r.icon className="w-3 h-3" /> {r.name}
                        </div>
                      </div>
                      {m.role !== 'owner' && (
                        <>
                          <select value={m.role} onChange={(e) => handleChangeRole(m.id, e.target.value)} className="text-xs px-2 py-1 rounded-lg bg-brand-surface border border-brand-border text-brand-text">
                            {ROLES.filter((r) => r.id !== 'owner').map((r) => (
                              <option key={r.id} value={r.id}>{r.name}</option>
                            ))}
                          </select>
                          <button onClick={() => handleRemove(m.id)} className="p-2 rounded-lg hover:bg-error/10 text-brand-text-secondary hover:text-error transition">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
