'use client';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { SpotlightCard } from '@/components/SpotlightCard';
import { TiltCard } from '@/components/TiltCard';

import { useCallback, useEffect, useState } from 'react';
import {
  Link as LinkIcon,
  Plus,
  Trash2,
  Loader2,
  ExternalLink,
  Eye,
  EyeOff,
  ChevronUp,
  ChevronDown,
  AlertCircle,
  GripVertical,
  Sparkles,
} from 'lucide-react';

interface BioLink {
  id: string;
  title: string;
  url: string;
}

export default function LinkInBioPage() {
  const [links, setLinks] = useState<BioLink[]>([]);
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);

  const loadLinks = useCallback(async () => {
    try {
      setError(null);
      const res = await fetch('/api/link-in-bio');
      if (!res.ok) throw new Error('Falha ao carregar links');
      const data = await res.json();
      setLinks(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar links');
    } finally {
      setInitialLoading(false);
    }
  }, []);

  useEffect(() => {
    loadLinks();
  }, [loadLinks]);

  async function handleAdd() {
    if (!title.trim() || !url.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/link-in-bio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: title.trim(), url: url.trim() }),
      });
      if (!res.ok) throw new Error('Falha ao adicionar link');
      setTitle('');
      setUrl('');
      await loadLinks();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao adicionar link');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    setActionId(id);
    setError(null);
    try {
      const res = await fetch(`/api/link-in-bio?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Falha ao remover link');
      await loadLinks();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao remover link');
    } finally {
      setActionId(null);
    }
  }

  async function handleReorder(id: string, direction: 'up' | 'down') {
    setActionId(id);
    setError(null);
    try {
      const res = await fetch('/api/link-in-bio', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, direction }),
      });
      if (!res.ok) throw new Error('Falha ao reordenar link');
      await loadLinks();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao reordenar link');
    } finally {
      setActionId(null);
    }
  }

  return (
    <div className="min-h-screen bg-brand-bg">
      <Header activeHref="/link-in-bio" />

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
            <Sparkles className="w-7 h-7 text-brand-accent" />
            Link na bio
          </h1>
          <p className="text-brand-text-secondary text-sm">
            Crie sua página de links personalizada e centralize todos os seus conteúdos em um só lugar.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-error/10 border border-error/30 flex items-center gap-3 text-error text-sm">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
            <button
              onClick={() => setError(null)}
              className="ml-auto text-error/70 hover:text-error transition"
              aria-label="Fechar aviso"
            >
              ×
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Coluna esquerda — gerenciamento */}
          <div className="space-y-4">
            <SpotlightCard className="p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Plus className="w-5 h-5 text-brand-accent" />
                Novo link
              </h2>
              <div className="space-y-3">
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                  placeholder="Título do link"
                  className="w-full px-4 py-3 rounded-xl bg-brand-elevated border border-brand-border text-brand-text placeholder:text-brand-text-secondary focus:outline-none focus:border-brand-accent transition"
                />
                <input
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                  placeholder="https://..."
                  type="url"
                  className="w-full px-4 py-3 rounded-xl bg-brand-elevated border border-brand-border text-brand-text placeholder:text-brand-text-secondary focus:outline-none focus:border-brand-accent transition"
                />
                <button
                  onClick={handleAdd}
                  disabled={loading || !title.trim() || !url.trim()}
                  className="w-full px-6 py-3 rounded-xl bg-brand-accent text-brand-bg font-semibold hover:bg-brand-accent-hover transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  Adicionar link
                </button>
              </div>
            </SpotlightCard>

            <SpotlightCard className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <GripVertical className="w-5 h-5 text-brand-text-secondary" />
                  Meus links
                </h2>
                <span className="text-xs text-brand-text-secondary">
                  {links.length} {links.length === 1 ? 'link' : 'links'}
                </span>
              </div>

              {initialLoading ? (
                <div className="flex items-center justify-center py-8 text-brand-text-secondary text-sm">
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  Carregando links...
                </div>
              ) : links.length === 0 ? (
                <div className="text-center py-8 text-brand-text-secondary text-sm">
                  Nenhum link ainda. Adicione seu primeiro link acima.
                </div>
              ) : (
                <div className="space-y-2">
                  {links.map((l, i) => (
                    <div
                      key={l.id}
                      className="flex items-center gap-2 p-3 rounded-xl bg-brand-elevated border border-brand-border transition-colors hover:border-brand-accent/40"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">{l.title}</div>
                        <div className="text-xs text-brand-text-secondary truncate">{l.url}</div>
                      </div>
                      <button
                        onClick={() => handleReorder(l.id, 'up')}
                        disabled={i === 0 || actionId === l.id}
                        className="p-1.5 rounded-lg text-brand-text-secondary hover:text-brand-text hover:bg-brand-surface transition disabled:opacity-30 disabled:cursor-not-allowed"
                        aria-label="Mover para cima"
                      >
                        {actionId === l.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <ChevronUp className="w-4 h-4" />
                        )}
                      </button>
                      <button
                        onClick={() => handleReorder(l.id, 'down')}
                        disabled={i === links.length - 1 || actionId === l.id}
                        className="p-1.5 rounded-lg text-brand-text-secondary hover:text-brand-text hover:bg-brand-surface transition disabled:opacity-30 disabled:cursor-not-allowed"
                        aria-label="Mover para baixo"
                      >
                        <ChevronDown className="w-4 h-4" />
                      </button>
                      <a
                        href={l.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-lg text-brand-text-secondary hover:text-brand-accent hover:bg-brand-surface transition"
                        aria-label="Abrir link"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                      <button
                        onClick={() => handleDelete(l.id)}
                        disabled={actionId === l.id}
                        className="p-1.5 rounded-lg text-brand-text-secondary hover:text-error hover:bg-error/10 transition disabled:opacity-30"
                        aria-label="Remover link"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </SpotlightCard>
          </div>

          {/* Coluna direita — preview */}
          <SpotlightCard className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Pré-visualização</h2>
              <button
                onClick={() => setShowPreview(!showPreview)}
                className="p-2 rounded-lg text-brand-text-secondary hover:text-brand-text hover:bg-brand-surface transition"
                aria-label={showPreview ? 'Ocultar pré-visualização' : 'Mostrar pré-visualização'}
              >
                {showPreview ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {showPreview && (
              <TiltCard maxTilt={4} className="mx-auto">
                <div className="max-w-sm mx-auto p-8 rounded-3xl bg-gradient-to-b from-brand-elevated to-brand-surface border border-brand-border text-center">
                  <div className="w-20 h-20 rounded-full bg-brand-accent/20 mx-auto mb-4 flex items-center justify-center">
                    <LinkIcon className="w-8 h-8 text-brand-accent" />
                  </div>
                  <h3 className="font-bold text-lg mb-1">@seuperfil</h3>
                  <p className="text-xs text-brand-text-secondary mb-6">Sua página de links</p>
                  <div className="space-y-3">
                    {links.length === 0 ? (
                      <div className="text-brand-text-secondary text-sm">
                        Adicione links para ver a pré-visualização
                      </div>
                    ) : (
                      links.map((l) => (
                        <a
                          key={l.id}
                          href={l.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block px-4 py-3 rounded-xl bg-brand-accent text-brand-bg font-medium text-sm hover:bg-brand-accent-hover transition"
                        >
                          {l.title}
                        </a>
                      ))
                    )}
                  </div>
                </div>
              </TiltCard>
            )}
          </SpotlightCard>
        </div>
      </main>
      <Footer />
    </div>
  );
}
