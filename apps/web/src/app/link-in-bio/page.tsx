'use client';

import { useEffect, useState } from 'react';
import { Link as LinkIcon, Plus, Trash2, Loader2, ExternalLink, Eye, EyeOff } from 'lucide-react';

export default function LinkInBioPage() {
  const [links, setLinks] = useState<any[]>([]);
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(true);

  useEffect(() => {
    loadLinks();
  }, []);

  async function loadLinks() {
    const token = localStorage.getItem('token');
    if (!token) return;
    const res = await fetch('/api/link-in-bio', { headers: { Authorization: `Bearer ${token}` } });
    const data = await res.json();
    setLinks(Array.isArray(data) ? data : []);
  }

  async function handleAdd() {
    if (!title || !url) return;
    setLoading(true);
    const token = localStorage.getItem('token');
    await fetch('/api/link-in-bio', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ title, url }),
    });
    setTitle('');
    setUrl('');
    await loadLinks();
    setLoading(false);
  }

  async function handleDelete(id: string) {
    const token = localStorage.getItem('token');
    await fetch(`/api/link-in-bio?id=${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
    await loadLinks();
  }

  async function handleReorder(id: string, direction: 'up' | 'down') {
    const token = localStorage.getItem('token');
    await fetch('/api/link-in-bio', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ id, direction }),
    });
    await loadLinks();
  }

  return (
    <div className="min-h-screen bg-brand-bg">
      <header className="h-16 border-b border-brand-border bg-brand-surface/50 backdrop-blur sticky top-0 z-20">
        <div className="max-w-7xl mx-auto h-full px-4 flex items-center justify-between">
          <div className="font-display font-bold text-xl text-brand-accent">StackPost</div>
          <nav className="hidden md:flex gap-6 text-sm text-brand-text-secondary">
            <a href="/dashboard" className="hover:text-brand-text">Dashboard</a>
            <a href="/composer" className="hover:text-brand-text">Criar post</a>
            <a href="/link-in-bio" className="text-brand-text">Link na bio</a>
            <a href="/analytics" className="hover:text-brand-text">Analytics</a>
            <a href="/settings" className="hover:text-brand-text">Config</a>
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Link na bio</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="p-6 rounded-2xl bg-brand-surface border border-brand-border">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><Plus className="w-5 h-5 text-brand-accent" /> Novo link</h2>
              <div className="space-y-3">
                <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Titulo do link" className="w-full px-4 py-3 rounded-xl bg-brand-elevated border border-brand-border text-brand-text" />
                <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://..." className="w-full px-4 py-3 rounded-xl bg-brand-elevated border border-brand-border text-brand-text" />
                <button onClick={handleAdd} disabled={loading || !title || !url} className="w-full px-6 py-3 rounded-xl bg-brand-accent text-brand-bg font-semibold hover:bg-brand-accent-hover transition disabled:opacity-50 flex items-center justify-center gap-2">
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  Adicionar
                </button>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-brand-surface border border-brand-border">
              <h2 className="text-lg font-semibold mb-4">Meus links</h2>
              <div className="space-y-2">
                {links.length === 0 && <div className="text-brand-text-secondary text-sm">Nenhum link ainda.</div>}
                {links.map((l, i) => (
                  <div key={l.id} className="flex items-center gap-2 p-3 rounded-xl bg-brand-elevated border border-brand-border">
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{l.title}</div>
                      <div className="text-xs text-brand-text-secondary truncate">{l.url}</div>
                    </div>
                    <button onClick={() => handleReorder(l.id, 'up')} disabled={i === 0} className="text-brand-text-secondary hover:text-brand-text disabled:opacity-30">↑</button>
                    <button onClick={() => handleReorder(l.id, 'down')} disabled={i === links.length - 1} className="text-brand-text-secondary hover:text-brand-text disabled:opacity-30">↓</button>
                    <a href={l.url} target="_blank" rel="noopener noreferrer" className="text-brand-text-secondary hover:text-brand-accent"><ExternalLink className="w-4 h-4" /></a>
                    <button onClick={() => handleDelete(l.id)} className="text-brand-text-secondary hover:text-error"><Trash2 className="w-4 h-4" /></button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-brand-surface border border-brand-border">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Preview</h2>
              <button onClick={() => setShowPreview(!showPreview)} className="text-brand-text-secondary hover:text-brand-text">
                {showPreview ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {showPreview && (
              <div className="max-w-sm mx-auto p-8 rounded-3xl bg-gradient-to-b from-brand-elevated to-brand-surface border border-brand-border text-center">
                <div className="w-20 h-20 rounded-full bg-brand-accent/20 mx-auto mb-4 flex items-center justify-center">
                  <LinkIcon className="w-8 h-8 text-brand-accent" />
                </div>
                <h3 className="font-bold text-lg mb-1">@seuperfil</h3>
                <p className="text-xs text-brand-text-secondary mb-6">Sua pagina de links</p>
                <div className="space-y-3">
                  {links.map((l) => (
                    <a key={l.id} href={l.url} target="_blank" rel="noopener noreferrer" className="block px-4 py-3 rounded-xl bg-brand-accent text-brand-bg font-medium text-sm hover:bg-brand-accent-hover transition">
                      {l.title}
                    </a>
                  ))}
                  {links.length === 0 && <div className="text-brand-text-secondary text-sm">Adicione links para ver o preview</div>}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
