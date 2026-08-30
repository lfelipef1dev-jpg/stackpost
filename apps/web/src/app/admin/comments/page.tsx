'use client';

import { useEffect, useState } from 'react';
import { Loader2, MessageSquare, AlertCircle, Search } from 'lucide-react';

interface Comment {
  id: string;
  [k: string]: any;
}

export default function AdminCommentsPage() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch('/api/admin/comments')
      .then(async (r) => {
        if (!r.ok) {
          const j = await r.json().catch(() => ({}));
          throw new Error(j.error || 'Não foi possível carregar os comentários.');
        }
        return r.json();
      })
      .then(setComments)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const filtered = search
    ? comments.filter((c) =>
        JSON.stringify(c).toLowerCase().includes(search.toLowerCase())
      )
    : comments;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96" role="status" aria-live="polite">
        <Loader2 className="w-8 h-8 animate-spin text-brand-accent" aria-hidden="true" />
        <span className="sr-only">Carregando comentários...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="p-6 rounded-2xl bg-red-500/10 text-red-400 border border-red-500/30 flex items-center gap-3"
        role="alert"
      >
        <AlertCircle className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
        <span>{error}</span>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-4 mb-2">
        <div className="w-12 h-12 rounded-2xl bg-brand-accent/10 flex items-center justify-center">
          <MessageSquare className="w-6 h-6 text-brand-accent" aria-hidden="true" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Comentários</h1>
          <p className="text-brand-text-secondary">Moderar comentários e respostas das publicações.</p>
        </div>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-text-secondary" aria-hidden="true" />
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar comentários..."
          className="w-full pl-11 pr-4 py-3 rounded-xl bg-brand-surface border border-brand-border text-brand-text focus:outline-none focus:border-brand-accent"
          aria-label="Buscar comentários"
        />
      </div>

      <div className="grid grid-cols-1 gap-6">
        {filtered.map((c) => (
          <div key={c.id} className="p-6 rounded-2xl bg-brand-surface border border-brand-border">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-brand-accent/10 flex items-center justify-center flex-shrink-0">
                <MessageSquare className="w-5 h-5 text-brand-accent" aria-hidden="true" />
              </div>
              <div className="font-mono text-xs text-brand-text-secondary break-all">{c.id}</div>
            </div>
            <pre className="text-xs overflow-auto p-4 rounded-xl bg-brand-bg border border-brand-border max-h-80" aria-label="Detalhes do comentário">
              {JSON.stringify(c, null, 2)}
            </pre>
          </div>
        ))}
        {filtered.length === 0 && comments.length > 0 && (
          <div className="p-6 rounded-2xl bg-brand-elevated text-brand-text-secondary text-center">
            Nenhum comentário encontrado para a busca &ldquo;{search}&rdquo;.
          </div>
        )}
        {comments.length === 0 && (
          <div className="p-6 rounded-2xl bg-brand-elevated text-brand-text-secondary text-center">
            Nenhum comentário registrado no momento.
          </div>
        )}
      </div>
    </div>
  );
}
