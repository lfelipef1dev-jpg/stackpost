'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Loader2, AlertCircle, Save, Trash2, CheckCircle2 } from 'lucide-react';

interface PostMedia {
  url?: string;
  type?: string;
}

interface PostErrors {
  message?: string;
  [key: string]: unknown;
}

interface Post {
  id: string;
  content: string;
  platforms: string[];
  status: string;
  scheduled_at: string;
  published_at: string;
  created_at: string;
  media: PostMedia | PostMedia[] | null;
  errors: PostErrors | null;
  user: { name: string; email: string } | null;
}

const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: 'draft', label: 'Rascunho' },
  { value: 'review', label: 'Em revisão' },
  { value: 'approved', label: 'Aprovado' },
  { value: 'scheduled', label: 'Agendado' },
  { value: 'processing', label: 'Processando' },
  { value: 'posted', label: 'Publicado' },
  { value: 'error', label: 'Com erro' },
  { value: 'rejected', label: 'Rejeitado' },
];

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

export default function AdminPostDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadPost = useCallback(async () => {
    try {
      const r = await fetch(`/api/admin/posts/${id}`);
      if (!r.ok) {
        const j = await r.json().catch(() => ({}));
        throw new Error(j.error || 'Publicação não encontrada.');
      }
      const data = await r.json();
      setPost(data);
      setError('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Falha ao carregar publicação.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadPost();
  }, [loadPost]);

  async function handleSave() {
    if (!post) return;
    setSaving(true);
    setSuccess('');
    setError('');
    try {
      const res = await fetch(`/api/admin/posts/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: post.content, status: post.status }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || 'Falha ao salvar alterações.');
      }
      setSuccess('Alterações salvas com sucesso.');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Falha ao salvar alterações.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm('Confirmar exclusão desta publicação? Esta ação não pode ser desfeita.')) return;
    setDeleting(true);
    setError('');
    try {
      const res = await fetch(`/api/admin/posts/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || 'Falha ao excluir publicação.');
      }
      router.push('/admin/posts');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Falha ao excluir publicação.');
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-3" role="status" aria-live="polite">
        <Loader2 className="w-8 h-8 animate-spin text-brand-accent" aria-hidden="true" />
        <span className="text-brand-text-secondary text-sm">Carregando publicação…</span>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="p-6 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 flex items-center gap-3" role="alert">
        <AlertCircle className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
        <span>Publicação não encontrada ou falha ao carregar.</span>
      </div>
    );
  }

  return (
    <div>
      <button
        onClick={() => router.push('/admin/posts')}
        className="flex items-center gap-2 text-brand-text-secondary hover:text-brand-text mb-6 text-sm font-medium"
        aria-label="Voltar para lista de publicações"
      >
        <ArrowLeft className="w-4 h-4" aria-hidden="true" /> Voltar para publicações
      </button>

      <h1 className="text-3xl font-bold text-brand-text mb-2">Detalhes da Publicação</h1>
      <p className="text-brand-text-secondary mb-6 text-sm">Identificador: {post.id}</p>

      {error && (
        <div
          className="mb-6 p-4 rounded-xl bg-red-500/10 text-red-400 border border-red-500/30 text-sm"
          role="alert"
          aria-live="assertive"
        >
          {error}
        </div>
      )}
      {success && (
        <div
          className="mb-6 p-4 rounded-xl bg-green-500/10 text-green-400 border border-green-500/30 text-sm flex items-center gap-2"
          role="status"
          aria-live="polite"
        >
          <CheckCircle2 className="w-4 h-4" aria-hidden="true" /> {success}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="space-y-2">
          <label htmlFor="post-content" className="text-sm text-brand-text-secondary font-medium">
            Conteúdo
          </label>
          <textarea
            id="post-content"
            value={post.content}
            onChange={(e) => setPost({ ...post, content: e.target.value })}
            rows={8}
            className="w-full px-4 py-3 rounded-xl bg-brand-surface border border-brand-border text-brand-text focus:outline-none focus:border-brand-accent resize-y"
            aria-describedby="post-content-help"
          />
          <p id="post-content-help" className="text-xs text-brand-text-secondary">
            Edite o conteúdo que será publicado nas redes conectadas.
          </p>
        </div>

        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-brand-elevated border border-brand-border">
            <label htmlFor="post-status" className="text-sm text-brand-text-secondary font-medium block mb-2">
              Status
            </label>
            <select
              id="post-status"
              value={post.status}
              onChange={(e) => setPost({ ...post, status: e.target.value })}
              className="w-full px-4 py-3 rounded-xl bg-brand-surface border border-brand-border text-brand-text focus:outline-none focus:border-brand-accent"
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          <div className="p-4 rounded-xl bg-brand-elevated border border-brand-border">
            <div className="text-sm text-brand-text-secondary font-medium mb-1">Autor</div>
            <div className="font-medium text-brand-text">{post.user?.name || '—'}</div>
            {post.user?.email && <div className="text-xs text-brand-text-secondary mt-0.5">{post.user.email}</div>}
          </div>

          <div className="p-4 rounded-xl bg-brand-elevated border border-brand-border">
            <div className="text-sm text-brand-text-secondary font-medium mb-1">Redes conectadas</div>
            <div className="font-medium text-brand-text">
              {post.platforms?.length ? post.platforms.join(', ') : '—'}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-brand-elevated border border-brand-border">
            <div className="text-sm text-brand-text-secondary font-medium mb-1">Criado em</div>
            <div className="font-medium text-brand-text">{formatDatePtBR(post.created_at)}</div>
          </div>

          <div className="p-4 rounded-xl bg-brand-elevated border border-brand-border">
            <div className="text-sm text-brand-text-secondary font-medium mb-1">Agendado para</div>
            <div className="font-medium text-brand-text">{formatDatePtBR(post.scheduled_at)}</div>
          </div>

          {post.published_at && (
            <div className="p-4 rounded-xl bg-brand-elevated border border-brand-border">
              <div className="text-sm text-brand-text-secondary font-medium mb-1">Publicado em</div>
              <div className="font-medium text-brand-text">{formatDatePtBR(post.published_at)}</div>
            </div>
          )}

          {post.errors && Object.keys(post.errors).length > 0 && (
            <div className="p-4 rounded-xl bg-red-500/10 text-red-400 border border-red-500/30">
              <div className="text-sm font-medium mb-2">Erros registrados</div>
              <pre className="text-xs overflow-auto whitespace-pre-wrap break-words">
                {JSON.stringify(post.errors, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-4">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-accent text-brand-bg font-bold hover:bg-brand-accent-hover disabled:opacity-50"
          aria-label="Salvar alterações"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" /> : <Save className="w-4 h-4" aria-hidden="true" />}
          {saving ? 'Salvando…' : 'Salvar alterações'}
        </button>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20 font-medium disabled:opacity-50"
          aria-label="Excluir publicação"
        >
          {deleting ? <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" /> : <Trash2 className="w-4 h-4" aria-hidden="true" />}
          {deleting ? 'Excluindo…' : 'Excluir'}
        </button>
      </div>
    </div>
  );
}
