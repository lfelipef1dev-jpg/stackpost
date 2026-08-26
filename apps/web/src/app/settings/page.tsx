'use client';

import Header from '@/components/Header';
import Footer from '@/components/Footer';

import { useEffect, useState } from 'react';
import { Key, Plus, Trash2, Copy, Check, Loader2, Eye } from 'lucide-react';

export default function SettingsPage() {
  const [org, setOrg] = useState('ExpoStacker');
  const [plan, setPlan] = useState('free');
  const [apiKeys, setApiKeys] = useState<any[]>([]);
  const [newKeyName, setNewKeyName] = useState('');
  const [newKey, setNewKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [showPlanModal, setShowPlanModal] = useState(false);

  useEffect(() => {
    loadApiKeys();
  }, []);

  async function loadApiKeys() {
    const token = localStorage.getItem('token');
    if (!token) return;
    const res = await fetch('/api/api-keys', { headers: { Authorization: `Bearer ${token}` } });
    const data = await res.json();
    setApiKeys(Array.isArray(data) ? data : []);
  }

  async function handleCreateKey() {
    setLoading(true);
    const token = localStorage.getItem('token');
    const res = await fetch('/api/api-keys', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ name: newKeyName || 'Default' }),
    });
    const data = await res.json();
    if (res.ok) {
      setNewKey(data.key);
      setNewKeyName('');
      await loadApiKeys();
    }
    setLoading(false);
  }

  async function handleDeleteKey(id: string) {
    const token = localStorage.getItem('token');
    await fetch(`/api/api-keys?id=${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
    await loadApiKeys();
  }

  function copy(text: string) {
    navigator.clipboard.writeText(text);
    setCopied(text);
    setTimeout(() => setCopied(null), 2000);
  }

  const planLabels: Record<string, string> = { free: 'Free', pro: 'Pro', business: 'Business', enterprise: 'Enterprise' };

  return (
    <div className="min-h-screen bg-brand-bg">
      <Header activeHref="/settings" />

      <main className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Configuracoes</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl bg-brand-surface border border-brand-border">
            <h2 className="text-lg font-semibold mb-4">Organizacao</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-brand-text-secondary mb-1">Nome</label>
                <input
                  value={org}
                  onChange={(e) => setOrg(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-brand-elevated border border-brand-border text-brand-text"
                />
              </div>
              <div>
                <label className="block text-sm text-brand-text-secondary mb-1">Plano atual</label>
                <div className="flex items-center gap-3">
                  <div className="flex-1 px-4 py-3 rounded-xl bg-brand-elevated border border-brand-border text-brand-text">
                    {planLabels[plan]}
                  </div>
                  <button
                    onClick={() => setShowPlanModal(true)}
                    className="px-6 py-3 rounded-xl bg-brand-accent text-brand-bg font-semibold hover:bg-brand-accent-hover transition"
                  >
                    Mudar plano
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-brand-surface border border-brand-border">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Key className="w-5 h-5 text-brand-accent" /> API Keys
            </h2>

            {newKey && (
              <div className="mb-4 p-4 rounded-xl bg-success/10 border border-success/30">
                <div className="text-sm text-success mb-2 font-medium">Nova chave criada! Copie agora (nao aparece de novo):</div>
                <div className="flex items-center gap-2">
                <code className="flex-1 text-xs font-mono text-brand-text truncate">{newKey}</code>
                  <button onClick={() => copy(newKey)} className="p-1 rounded hover:bg-brand-elevated">
                    {copied === newKey ? <Check className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
                <button onClick={() => setNewKey(null)} className="mt-2 text-xs text-brand-text-secondary hover:text-brand-text">
                  Fechar
                </button>
              </div>
            )}

            <div className="space-y-3 mb-4">
              {apiKeys.length === 0 && (
                <div className="text-brand-text-secondary text-sm">Nenhuma chave criada ainda.</div>
              )}
              {apiKeys.map((k) => (
                <div key={k.id} className="flex items-center justify-between p-3 rounded-xl bg-brand-elevated border border-brand-border">
                  <div>
                    <div className="text-sm font-medium">{k.name}</div>
                    <div className="text-xs text-brand-text-secondary font-mono">{k.key_prefix}...</div>
                    <div className="text-[10px] text-brand-text-secondary mt-1">
                      Criada: {new Date(k.created_at).toLocaleDateString('pt-BR')}
                      {k.last_used_at && ` â€¢ Ultimo uso: ${new Date(k.last_used_at).toLocaleDateString('pt-BR')}`}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteKey(k.id)}
                    className="p-2 rounded-lg hover:bg-error/10 text-brand-text-secondary hover:text-error transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                placeholder="Nome da chave"
                className="flex-1 px-4 py-2 rounded-xl bg-brand-elevated border border-brand-border text-brand-text text-sm"
              />
              <button
                onClick={handleCreateKey}
                disabled={loading}
                className="px-4 py-2 rounded-xl bg-brand-accent text-brand-bg font-semibold hover:bg-brand-accent-hover transition disabled:opacity-50 flex items-center gap-2"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                Gerar
              </button>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-brand-surface border border-brand-border lg:col-span-2">
            <h2 className="text-lg font-semibold mb-4">Redes sociais suportadas</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-3 text-sm text-brand-text-secondary">
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="hover:text-brand-accent">Instagram</a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="hover:text-brand-accent">LinkedIn</a>
              <a href="https://x.com" target="_blank" rel="noopener noreferrer" className="hover:text-brand-accent">X</a>
              <a href="https://tiktok.com" target="_blank" rel="noopener noreferrer" className="hover:text-brand-accent">TikTok</a>
              <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="hover:text-brand-accent">YouTube</a>
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="hover:text-brand-accent">Facebook</a>
              <a href="https://pinterest.com" target="_blank" rel="noopener noreferrer" className="hover:text-brand-accent">Pinterest</a>
              <a href="https://threads.net" target="_blank" rel="noopener noreferrer" className="hover:text-brand-accent">Threads</a>
              <a href="https://reddit.com" target="_blank" rel="noopener noreferrer" className="hover:text-brand-accent">Reddit</a>
              <a href="https://blueskyweb.xyz" target="_blank" rel="noopener noreferrer" className="hover:text-brand-accent">Bluesky</a>
              <a href="https://joinmastodon.org" target="_blank" rel="noopener noreferrer" className="hover:text-brand-accent">Mastodon</a>
              <a href="https://discord.com" target="_blank" rel="noopener noreferrer" className="hover:text-brand-accent">Discord</a>
              <a href="https://slack.com" target="_blank" rel="noopener noreferrer" className="hover:text-brand-accent">Slack</a>
              <a href="https://google.com/business" target="_blank" rel="noopener noreferrer" className="hover:text-brand-accent">Google Business</a>
              <a href="https://snapchat.com" target="_blank" rel="noopener noreferrer" className="hover:text-brand-accent">Snapchat</a>
            </div>
          </div>
        </div>
      </main>

      {showPlanModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={() => setShowPlanModal(false)}>
          <div className="w-full max-w-md p-6 rounded-2xl bg-brand-surface border border-brand-border" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-bold mb-4">Mudar de plano</h3>
            <p className="text-brand-text-secondary mb-4">Acesse a pagina de planos para escolher.</p>
            <a href="/plans" className="block w-full text-center px-6 py-3 rounded-xl bg-brand-accent text-brand-bg font-semibold hover:bg-brand-accent-hover transition">
              Ver planos
            </a>
          </div>
        </div>
      )}
      <Footer />
    </div>
  );
}
