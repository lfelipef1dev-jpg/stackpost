'use client';

import { useEffect, useState } from 'react';
import { MessageSquare, Send, Trash2, Loader2, Clock, CheckCircle2, AlertCircle } from 'lucide-react';

export default function CommentsPage() {
  const [comments, setComments] = useState<any[]>([]);
  const [posts, setPosts] = useState<any[]>([]);
  const [selectedPost, setSelectedPost] = useState('');
  const [platform, setPlatform] = useState('instagram');
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadComments();
    loadPosts();
  }, []);

  async function loadComments() {
    const token = localStorage.getItem('token');
    if (!token) return;
    const res = await fetch('/api/comments', { headers: { Authorization: `Bearer ${token}` } });
    const data = await res.json();
    setComments(Array.isArray(data) ? data : []);
  }

  async function loadPosts() {
    const token = localStorage.getItem('token');
    if (!token) return;
    const res = await fetch('/api/posts', { headers: { Authorization: `Bearer ${token}` } });
    const data = await res.json();
    setPosts(Array.isArray(data) ? data : []);
  }

  async function handleCreate() {
    if (!selectedPost || !text) return;
    setLoading(true);
    const token = localStorage.getItem('token');
    await fetch('/api/comments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ postId: selectedPost, platform, text }),
    });
    setText('');
    await loadComments();
    setLoading(false);
  }

  async function handleDelete(id: string) {
    const token = localStorage.getItem('token');
    await fetch(`/api/comments?id=${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
    await loadComments();
  }

  const statusIcon: Record<string, typeof CheckCircle2> = {
    posted: CheckCircle2,
    pending: Clock,
    scheduled: Clock,
    error: AlertCircle,
  };

  return (
    <div className="min-h-screen bg-brand-bg">
      <header className="h-16 border-b border-brand-border bg-brand-surface/50 backdrop-blur sticky top-0 z-20">
        <div className="max-w-7xl mx-auto h-full px-4 flex items-center justify-between">
          <div className="font-display font-bold text-xl text-brand-accent">StackPost</div>
          <nav className="hidden md:flex gap-6 text-sm text-brand-text-secondary">
            <a href="/dashboard" className="hover:text-brand-text">Dashboard</a>
            <a href="/composer" className="hover:text-brand-text">Criar post</a>
            <a href="/calendar" className="hover:text-brand-text">Calendario</a>
            <a href="/comments" className="text-brand-text">Comentarios</a>
            <a href="/analytics" className="hover:text-brand-text">Analytics</a>
            <a href="/imports" className="hover:text-brand-text">Importar</a>
            <a href="/settings" className="hover:text-brand-text">Config</a>
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Comentarios</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-brand-surface border border-brand-border">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><MessageSquare className="w-5 h-5 text-brand-accent" /> Novo comentario</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-brand-text-secondary mb-1">Post</label>
                <select value={selectedPost} onChange={(e) => setSelectedPost(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-brand-elevated border border-brand-border text-brand-text">
                  <option value="">Selecione...</option>
                  {posts.map((p) => (
                    <option key={p.id} value={p.id}>{p.content?.slice(0, 40) || 'Sem texto'}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-brand-text-secondary mb-1">Plataforma</label>
                <select value={platform} onChange={(e) => setPlatform(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-brand-elevated border border-brand-border text-brand-text">
                  <option value="instagram">Instagram</option>
                  <option value="facebook">Facebook</option>
                  <option value="linkedin">LinkedIn</option>
                  <option value="youtube">YouTube</option>
                  <option value="tiktok">TikTok</option>
                  <option value="threads">Threads</option>
                  <option value="reddit">Reddit</option>
                  <option value="mastodon">Mastodon</option>
                  <option value="discord">Discord</option>
                  <option value="slack">Slack</option>
                  <option value="bluesky">Bluesky</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-brand-text-secondary mb-1">Texto</label>
                <textarea value={text} onChange={(e) => setText(e.target.value)} rows={3} className="w-full px-4 py-3 rounded-xl bg-brand-elevated border border-brand-border text-brand-text" placeholder="Comentario ou hashtags..." />
              </div>
              <button onClick={handleCreate} disabled={loading || !selectedPost || !text} className="w-full px-6 py-3 rounded-xl bg-brand-accent text-brand-bg font-semibold hover:bg-brand-accent-hover transition disabled:opacity-50 flex items-center justify-center gap-2">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                Criar comentario
              </button>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-3">
            {comments.length === 0 && (
              <div className="p-6 rounded-2xl bg-brand-surface border border-brand-border text-center text-brand-text-secondary">Nenhum comentario ainda.</div>
            )}
            {comments.map((c) => {
              const Icon = statusIcon[c.status] || Clock;
              return (
                <div key={c.id} className="p-4 rounded-xl bg-brand-surface border border-brand-border">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm">{c.text}</p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-brand-text-secondary">
                        <span className="capitalize">{c.platform}</span>
                        <span className={`flex items-center gap-1 ${c.status === 'posted' ? 'text-success' : c.status === 'error' ? 'text-error' : 'text-warning'}`}>
                          <Icon className="w-3 h-3" /> {c.status}
                        </span>
                      </div>
                    </div>
                    <button onClick={() => handleDelete(c.id)} className="p-2 rounded-lg hover:bg-error/10 text-brand-text-secondary hover:text-error transition">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
