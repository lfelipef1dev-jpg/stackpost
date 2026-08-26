'use client';

import { useEffect, useState } from 'react';
import { Download, Loader2, FileClock, Instagram, Facebook, Linkedin } from 'lucide-react';

export default function ImportsPage() {
  const [imports, setImports] = useState<any[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [selectedAccount, setSelectedAccount] = useState('');
  const [platform, setPlatform] = useState('');
  const [limit, setLimit] = useState(50);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadAccounts();
    loadImports();
  }, []);

  async function loadAccounts() {
    const token = localStorage.getItem('token');
    if (!token) return;
    const res = await fetch('/api/accounts', { headers: { Authorization: `Bearer ${token}` } });
    const data = await res.json();
    setAccounts(Array.isArray(data) ? data : []);
  }

  async function loadImports() {
    const token = localStorage.getItem('token');
    if (!token) return;
    const res = await fetch('/api/imports', { headers: { Authorization: `Bearer ${token}` } });
    const data = await res.json();
    setImports(Array.isArray(data) ? data : []);
  }

  async function handleImport() {
    if (!selectedAccount) return;
    setLoading(true);
    const token = localStorage.getItem('token');
    const account = accounts.find((a) => a.id === selectedAccount);
    await fetch('/api/imports', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        socialAccountId: selectedAccount,
        platform: platform || account?.platform || 'instagram',
        limit,
      }),
    });
    await loadImports();
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-brand-bg">
      <header className="h-16 border-b border-brand-border bg-brand-surface/50 backdrop-blur sticky top-0 z-20">
        <div className="max-w-7xl mx-auto h-full px-4 flex items-center justify-between">
          <div className="font-display font-bold text-xl text-brand-accent">StackPost</div>
          <nav className="hidden md:flex gap-6 text-sm text-brand-text-secondary">
            <a href="/dashboard" className="hover:text-brand-text">Dashboard</a>
            <a href="/composer" className="hover:text-brand-text">Criar post</a>
            <a href="/calendar" className="hover:text-brand-text">Calendario</a>
            <a href="/comments" className="hover:text-brand-text">Comentarios</a>
            <a href="/imports" className="text-brand-text">Importar</a>
            <a href="/analytics" className="hover:text-brand-text">Analytics</a>
            <a href="/settings" className="hover:text-brand-text">Config</a>
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Importar historico</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-brand-surface border border-brand-border">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><Download className="w-5 h-5 text-brand-accent" /> Importar posts</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-brand-text-secondary mb-1">Conta social</label>
                <select value={selectedAccount} onChange={(e) => setSelectedAccount(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-brand-elevated border border-brand-border text-brand-text">
                  <option value="">Selecione...</option>
                  {accounts.map((a) => (
                    <option key={a.id} value={a.id}>{a.platform} - {a.username}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-brand-text-secondary mb-1">Limite (max 100)</label>
                <input type="number" value={limit} onChange={(e) => setLimit(parseInt(e.target.value) || 50)} max={100} className="w-full px-4 py-3 rounded-xl bg-brand-elevated border border-brand-border text-brand-text" />
              </div>
              <button onClick={handleImport} disabled={loading || !selectedAccount} className="w-full px-6 py-3 rounded-xl bg-brand-accent text-brand-bg font-semibold hover:bg-brand-accent-hover transition disabled:opacity-50 flex items-center justify-center gap-2">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                Importar
              </button>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="p-6 rounded-2xl bg-brand-surface border border-brand-border">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><FileClock className="w-5 h-5 text-brand-accent" /> Posts importados ({imports.length})</h2>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {imports.length === 0 && <div className="text-brand-text-secondary text-sm">Nenhum post importado ainda.</div>}
                {imports.map((imp) => (
                  <div key={imp.id} className="p-4 rounded-xl bg-brand-elevated border border-brand-border">
                    <p className="text-sm line-clamp-2">{imp.content || 'Sem texto'}</p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-brand-text-secondary">
                      <span className="capitalize">{imp.platform}</span>
                      {imp.permalink && <a href={imp.permalink} target="_blank" rel="noopener noreferrer" className="text-brand-accent hover:underline">Ver original</a>}
                      {imp.posted_at && <span>{new Date(imp.posted_at).toLocaleDateString('pt-BR')}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
