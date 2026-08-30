'use client';

import { useEffect, useState } from 'react';
import { Loader2, Calendar, Clock, AlertCircle, Inbox } from 'lucide-react';

interface Post {
  id: string;
  content?: string;
  title?: string;
  platforms?: string[];
  scheduled_at?: string;
  status?: string;
  [k: string]: any;
}

const STATUS_LABELS: Record<string, string> = {
  scheduled: 'Agendado',
  pending: 'Pendente',
  published: 'Publicado',
  failed: 'Falhou',
  draft: 'Rascunho',
};

function formatarDataPtBr(iso?: string): string {
  if (!iso) return '—';
  const data = new Date(iso);
  if (Number.isNaN(data.getTime())) return '—';
  return data.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function AdminSchedulePage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/admin/schedule')
      .then(async (r) => {
        if (!r.ok) {
          let msg = 'Falha ao carregar agendamentos.';
          try {
            const j = await r.json();
            msg = j.error || msg;
          } catch {
            /* resposta sem corpo JSON */
          }
          throw new Error(msg);
        }
        return r.json();
      })
      .then(setPosts)
      .catch((e: unknown) => setError(e instanceof Error ? e.message : 'Falha ao carregar agendamentos.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center" role="status" aria-live="polite" aria-label="Carregando agendamentos">
        <Loader2 className="w-8 h-8 animate-spin text-brand-accent" aria-hidden="true" />
        <span className="sr-only">Carregando agendamentos…</span>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="flex items-start gap-3 p-6 rounded-2xl bg-red-500/10 text-red-400 border border-red-500/30"
        role="alert"
        aria-live="assertive"
      >
        <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" aria-hidden="true" />
        <div>
          <p className="font-semibold">Não foi possível carregar os agendamentos</p>
          <p className="text-sm mt-1">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <header className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Agendamentos</h1>
        <p className="text-brand-text-secondary">Acompanhe a fila de publicações programadas nas suas redes sociais.</p>
      </header>

      {posts.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 p-12 rounded-2xl bg-brand-elevated border border-brand-border text-center">
          <Inbox className="w-10 h-10 text-brand-text-secondary" aria-hidden="true" />
          <p className="text-brand-text-secondary">Nenhum agendamento encontrado no momento.</p>
          <p className="text-sm text-brand-text-secondary">Crie uma nova publicação para vê-la aqui.</p>
        </div>
      ) : (
        <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 list-none p-0 m-0" aria-label="Lista de agendamentos">
          {posts.map((p) => {
            const statusLabel = STATUS_LABELS[p.status || ''] || p.status || '—';
            return (
              <li
                key={p.id}
                className="p-6 rounded-2xl bg-brand-surface border border-brand-border"
                aria-label={`Agendamento para ${formatarDataPtBr(p.scheduled_at)}`}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-brand-accent/10 flex items-center justify-center" aria-hidden="true">
                    <Calendar className="w-5 h-5 text-brand-accent" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold flex items-center gap-2 text-sm">
                      <Clock className="w-3 h-3 shrink-0" aria-hidden="true" />
                      <time dateTime={p.scheduled_at}>{formatarDataPtBr(p.scheduled_at)}</time>
                    </div>
                    <div className="text-xs text-brand-text-secondary truncate">
                      {(p.platforms || []).join(', ') || 'Sem plataformas'}
                    </div>
                  </div>
                </div>
                <p className="text-sm line-clamp-3 mb-3 text-brand-text">
                  {p.content || p.title || 'Sem conteúdo definido.'}
                </p>
                <span className="inline-block px-2 py-1 rounded-md text-xs font-medium bg-brand-elevated text-brand-text-secondary">
                  {statusLabel}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
