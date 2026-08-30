'use client';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { PlatformIcon } from '@/components/PlatformIcon';
import { PLATFORMS } from '@/lib/platforms';

import { useEffect, useRef, useState } from 'react';
import { MessageSquare, Send, Trash2, Loader2, Clock, CheckCircle2, AlertCircle } from 'lucide-react';

function SpotlightCard({ children, className = '', glow = '#8AB4F8' }: { children: React.ReactNode; className?: string; glow?: string }) {
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
        backgroundImage: spot.active ? `radial-gradient(circle 120px at ${spot.x}px ${spot.y}px, ${glow}0a, transparent)` : undefined,
      }}
    >
      <div className="absolute inset-0 rounded-3xl pointer-events-none" style={{ boxShadow: spot.active ? `inset 0 0 0 1px ${glow}25` : 'inset 0 0 0 1px transparent', transition: 'box-shadow 0.3s' }} />
      {children}
    </div>
  );
}

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
        setStyle({ transform: `perspective(1200px) rotateX(${-y * 1.5}deg) rotateY(${x * 1.5}deg)`, transition: 'transform 0.15s ease-out' });
      }}
      onMouseLeave={() => setStyle({ transform: 'perspective(1200px) rotateX(0) rotateY(0)', transition: 'transform 0.4s ease-out' })}
      style={style}
      className={`will-change-transform ${className}`}
    >
      {children}
    </div>
  );
}

export default function CommentsPage() {
  const [comments, setComments] = useState<any[]>([]);
  const [posts, setPosts] = useState<any[]>([]);
  const [selectedPost, setSelectedPost] = useState('');
  const [platform, setPlatform] = useState('instagram');
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    loadComments();
    loadPosts();
  }, []);

  async function loadComments() {
    try {
      const res = await fetch('/api/comments');
      const data = await res.json();
      setComments(Array.isArray(data) ? data : []);
    } catch {
      setComments([]);
    } finally {
      setInitialLoading(false);
    }
  }

  async function loadPosts() {
    try {
      const res = await fetch('/api/posts');
      const data = await res.json();
      setPosts(Array.isArray(data) ? data : (data.items || []));
    } catch {
      setPosts([]);
    }
  }

  async function handleCreate() {
    if (!selectedPost || !text) return;
    setLoading(true);
    try {
      await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId: selectedPost, platform, text }),
      });
      setText('');
      await loadComments();
    } catch {
      // erro silencioso
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      await fetch(`/api/comments?id=${id}`, { method: 'DELETE' });
      await loadComments();
    } catch {
      // erro silencioso
    }
  }

  const statusIcon: Record<string, typeof CheckCircle2> = {
    posted: CheckCircle2,
    pending: Clock,
    scheduled: Clock,
    error: AlertCircle,
  };

  return (
    <div className="min-h-screen bg-brand-bg">
      <Header activeHref="/comments" />

      <main className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-2">Comentários</h1>
        <p className="text-brand-text-secondary mb-8">Crie e gerencie comentários para suas publicações em todas as plataformas.</p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
          <TiltCard className="h-full">
            <SpotlightCard className="h-full p-6" glow="#8AB4F8">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><MessageSquare className="w-5 h-5 text-brand-accent" /> Novo comentário</h2>
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
                  {PLATFORMS.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-brand-text-secondary mb-1">Texto</label>
                <textarea value={text} onChange={(e) => setText(e.target.value)} rows={3} className="w-full px-4 py-3 rounded-xl bg-brand-elevated border border-brand-border text-brand-text" placeholder="Comentário ou hashtags..." />
              </div>
              <button onClick={handleCreate} disabled={loading || !selectedPost || !text} className="w-full px-6 py-3 rounded-xl bg-brand-accent text-brand-bg font-semibold hover:bg-brand-accent-hover transition disabled:opacity-50 flex items-center justify-center gap-2">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                Criar comentário
              </button>
            </div>
            </SpotlightCard>
          </TiltCard>

          <div className="lg:col-span-2 space-y-3">
            {initialLoading && (
              <div className="p-6 rounded-2xl bg-brand-surface border border-brand-border text-center">
                <Loader2 className="w-5 h-5 text-brand-text-secondary animate-spin mx-auto mb-2" />
                <p className="text-brand-text-secondary text-sm">Carregando comentários...</p>
              </div>
            )}
            {!initialLoading && comments.length === 0 && (
              <div className="p-8 rounded-2xl bg-brand-surface border border-brand-border text-center">
                <MessageSquare className="w-10 h-10 text-brand-text-secondary mx-auto mb-3 opacity-50" />
                <p className="text-brand-text-secondary text-sm mb-2">Nenhum comentário ainda.</p>
                <p className="text-brand-text-secondary text-xs">Selecione um post e crie seu primeiro comentário ao lado.</p>
              </div>
            )}
            {comments.map((c) => {
              const Icon = statusIcon[c.status] || Clock;
              const platformData = PLATFORMS.find((p) => p.id === c.platform);
              return (
                <div key={c.id} className="p-4 rounded-xl bg-brand-surface border border-brand-border">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm">{c.text}</p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-brand-text-secondary">
                        {platformData && (
                          <span className="flex items-center gap-1 capitalize">
                            <PlatformIcon id={platformData.id} size={12} color={platformData.color} />
                            {platformData.name}
                          </span>
                        )}
                        {!platformData && <span className="capitalize">{c.platform}</span>}
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
      <Footer />
    </div>
  );
}
