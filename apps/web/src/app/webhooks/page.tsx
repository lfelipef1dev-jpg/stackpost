'use client';

import Header from '@/components/Header';
import Footer from '@/components/Footer';

import { useEffect, useState } from 'react';
import { Webhook as WebhookIcon, Plus, Trash2, Copy, Check, Loader2, Activity } from 'lucide-react';

const EVENT_TYPES = [
  'post.published',
  'post.failed',
  'post.scheduled',
  'social-account.connected',
  'social-account.disconnected',
  'social-account.reconnect_needed',
  'comment.published',
  'comment.received',
  'team.member_added',
];

export default function WebhooksPage() {
  const [webhooks, setWebhooks] = useState<any[]>([]);
  const [url, setUrl] = useState('');
  const [events, setEvents] = useState<string[]>(['post.published']);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    loadWebhooks();
  }, []);

  async function loadWebhooks() {
    const token = localStorage.getItem('token');
    if (!token) return;
    const res = await fetch('/api/webhooks', { headers: { Authorization: `Bearer ${token}` } });
    const data = await res.json();
    setWebhooks(Array.isArray(data) ? data : []);
  }

  async function handleAdd() {
    if (!url) return;
    setLoading(true);
    const token = localStorage.getItem('token');
    const res = await fetch('/api/webhooks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ url, events }),
    });
    if (res.ok) {
      setUrl('');
      setEvents(['post.published']);
      await loadWebhooks();
    }
    setLoading(false);
  }

  async function handleDelete(id: string) {
    const token = localStorage.getItem('token');
    await fetch(`/api/webhooks?id=${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
    await loadWebhooks();
  }

  function toggleEvent(event: string) {
    setEvents((prev) => (prev.includes(event) ? prev.filter((e) => e !== event) : [...prev, event]));
  }

  function copyUrl(url: string) {
    navigator.clipboard.writeText(url);
    setCopied(url);
    setTimeout(() => setCopied(null), 2000);
  }

  return (
    <div className="min-h-screen bg-brand-bg">
      <Header activeHref="/webhooks" />

      <main className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Webhooks</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl bg-brand-surface border border-brand-border">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Plus className="w-5 h-5 text-brand-accent" /> Novo webhook
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-brand-text-secondary mb-1">URL de destino</label>
                <input
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://seuapp.com/webhook"
                  className="w-full px-4 py-3 rounded-xl bg-brand-elevated border border-brand-border text-brand-text focus:outline-none focus:border-brand-accent"
                />
              </div>
              <div>
                <label className="block text-sm text-brand-text-secondary mb-2">Eventos</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {EVENT_TYPES.map((event) => (
                    <label
                      key={event}
                      className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer text-sm transition ${
                        events.includes(event)
                          ? 'bg-brand-accent/10 border border-brand-accent/30 text-brand-text'
                          : 'bg-brand-elevated border border-brand-border text-brand-text-secondary hover:border-brand-text/20'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={events.includes(event)}
                        onChange={() => toggleEvent(event)}
                        className="w-3 h-3 accent-brand-accent"
                      />
                      <span className="font-mono text-xs">{event}</span>
                    </label>
                  ))}
                </div>
              </div>
              <button
                onClick={handleAdd}
                disabled={loading || !url}
                className="w-full px-6 py-3 rounded-xl bg-brand-accent text-brand-bg font-semibold hover:bg-brand-accent-hover transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                Adicionar webhook
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {webhooks.length === 0 && (
              <div className="p-6 rounded-2xl bg-brand-surface border border-brand-border text-center">
                <WebhookIcon className="w-8 h-8 text-brand-text-secondary mx-auto mb-2" />
                <p className="text-brand-text-secondary text-sm">Nenhum webhook cadastrado.</p>
              </div>
            )}
            {webhooks.map((w) => (
              <div key={w.id} className="p-5 rounded-2xl bg-brand-surface border border-brand-border">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <code className="text-sm truncate font-mono text-brand-text">{w.url}</code>
                      <button onClick={() => copyUrl(w.url)} className="text-brand-text-secondary hover:text-brand-text">
                        {copied === w.url ? <Check className="w-3 h-3 text-success" /> : <Copy className="w-3 h-3" />}
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {(Array.isArray(w.events) ? w.events : []).map((e: string) => (
                        <span key={e} className="text-[10px] px-2 py-0.5 rounded-full bg-brand-elevated text-brand-text-secondary font-mono">
                          {e}
                        </span>
                      ))}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(w.id)}
                    className="p-2 rounded-lg hover:bg-error/10 text-brand-text-secondary hover:text-error transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex items-center gap-4 text-xs text-brand-text-secondary">
                  <span className={`flex items-center gap-1 ${w.status === 'active' ? 'text-success' : 'text-error'}`}>
                    <Activity className="w-3 h-3" /> {w.status}
                  </span>
                  <span>{w.total_events || 0} eventos</span>
                  <span className="text-success">{w.delivered || 0} entregues</span>
                  {w.failed > 0 && <span className="text-error">{w.failed} falharam</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
