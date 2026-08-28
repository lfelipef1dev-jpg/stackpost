'use client';

import Footer from '@/components/Footer';

import { useEffect, useState } from 'react';
import { PLATFORMS } from '@/lib/platforms';
import { PlatformIcon } from '@/components/PlatformIcon';
import Header from '@/components/Header';
import { RefreshCw, Trash2, AlertCircle, CheckCircle2, Clock, Loader2, Zap } from 'lucide-react';

const OAUTH_ROUTES: Record<string, string> = {
  instagram: '/api/oauth/meta',
  facebook: '/api/oauth/facebook',
  threads: '/api/oauth/threads',
  linkedin: '/api/oauth/linkedin',
  x: '/api/oauth/x',
  twitter: '/api/oauth/x',
  tiktok: '/api/oauth/tiktok',
  youtube: '/api/oauth/youtube',
  pinterest: '/api/oauth/pinterest',
  reddit: '/api/oauth/reddit',
  bluesky: '/api/oauth/bluesky',
  mastodon: '/api/oauth/mastodon',
  discord: '/api/oauth/discord',
  slack: '/api/oauth/slack',
  google_business: '/api/oauth/google-business',
  snapchat: '/api/oauth/snapchat',
};

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState<string | null>(null);

  useEffect(() => {
    loadAccounts();
  }, []);

  async function loadAccounts() {
    const token = localStorage.getItem('token');
    if (!token) return;
    const res = await fetch('/api/accounts', { headers: { Authorization: `Bearer ${token}` } });
    const data = await res.json();
    // Filtrar contas meta_user (token interno para renovacao, nao conta visivel)
    const visible = (Array.isArray(data) ? data : []).filter((a: any) => a.platform !== 'meta_user');
    setAccounts(visible);
  }

  function handleConnect(platform: string) {
    const route = OAUTH_ROUTES[platform];
    if (route) {
      const token = localStorage.getItem('token');
      const separator = route.includes('?') ? '&' : '?';
      window.location.href = `${route}${separator}token=${token}`;
    } else {
      alert(`OAuth para ${platform} ainda nao implementado. Use o formulario manual abaixo.`);
    }
  }

  async function handleCheck(accountId: string) {
    setChecking(accountId);
    const token = localStorage.getItem('token');
    await fetch('/api/accounts/connection-check', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ socialAccountId: accountId }),
    });
    await loadAccounts();
    setChecking(null);
  }

  async function handleRefresh(accountId: string) {
    setChecking(accountId);
    const token = localStorage.getItem('token');
    await fetch('/api/accounts/refresh-token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ socialAccountId: accountId }),
    });
    await loadAccounts();
    setChecking(null);
  }

  async function handleDelete(accountId: string) {
    const token = localStorage.getItem('token');
    await fetch(`/api/accounts?id=${accountId}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
    await loadAccounts();
  }

  const statusIcon: Record<string, typeof CheckCircle2> = {
    active: CheckCircle2,
    expired: AlertCircle,
    reconnect_required: AlertCircle,
    pending: Clock,
  };

  const statusColor: Record<string, string> = {
    active: 'text-success',
    expired: 'text-error',
    reconnect_required: 'text-warning',
    pending: 'text-brand-text-secondary',
  };

  return (
    <div className="min-h-screen bg-brand-bg">
      <Header activeHref="/accounts" />

      <main className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Contas conectadas</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl bg-brand-surface border border-brand-border">
            <h2 className="text-lg font-semibold mb-4">Conectar nova conta</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {PLATFORMS.map((p) => {
                const connectedCount = accounts.filter((a) => a.platform === p.id).length;
                const isConnected = connectedCount > 0;
                const hasOAuth = !!OAUTH_ROUTES[p.id];
                // Permitir reconectar Facebook (multiplas Pages) e outras plataformas multi-conta
                const allowReconnect = p.id === 'facebook' || p.id === 'google_business' || p.id === 'reddit';
                return (
                  <button
                    key={p.id}
                    onClick={() => handleConnect(p.id)}
                    disabled={isConnected && !allowReconnect}
                    className={`p-4 rounded-xl border text-center transition disabled:opacity-50 ${
                      hasOAuth
                        ? 'bg-brand-elevated border-brand-border hover:border-brand-accent'
                        : 'bg-brand-elevated/50 border-brand-border/50'
                    }`}
                  >
                    <div className="mx-auto mb-2"><PlatformIcon id={p.id} size={24} color={p.color} /></div>
                    <div className="text-sm font-medium">{p.name}</div>
                    {isConnected ? (
                      <div className="text-[10px] text-success mt-1">
                        {connectedCount} conta{connectedCount > 1 ? 's' : ''}{allowReconnect ? ' · +1' : ''}
                      </div>
                    ) : hasOAuth ? (
                      <div className="text-[10px] text-brand-accent mt-1">OAuth</div>
                    ) : (
                      <div className="text-[10px] text-brand-text-secondary mt-1">Manual</div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-3">
            <h2 className="text-lg font-semibold mb-4">Contas ativas ({accounts.length})</h2>
            {accounts.length === 0 && (
              <div className="p-6 rounded-2xl bg-brand-surface border border-brand-border text-center text-brand-text-secondary">
                Nenhuma conta conectada. Conecte uma conta para comecar.
              </div>
            )}
            {accounts.map((acc) => {
              const Icon = statusIcon[acc.status] || Clock;
              const color = statusColor[acc.status] || 'text-brand-text-secondary';
              const meta = acc.platform_metadata || {};
              const avatar = typeof meta === 'object' && meta.avatar ? meta.avatar : null;
              const followers = typeof meta === 'object' && meta.followers ? meta.followers : null;
              return (
                <div key={acc.id} className="p-4 rounded-xl bg-brand-surface border border-brand-border">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {avatar ? (
                        <img src={avatar} alt={acc.username} className="w-10 h-10 rounded-full object-cover" />
                      ) : (
                        <PlatformIcon id={acc.platform} size={20} color={PLATFORMS.find((p) => p.id === acc.platform)?.color || '#888'} />
                      )}
                      <div>
                        <div className="font-semibold capitalize">{acc.platform.replace('_', ' ')}</div>
                        <div className="text-sm text-brand-text-secondary">{acc.username}</div>
                        {followers !== null && (
                          <div className="text-[10px] text-brand-text-secondary">{followers} seguidores</div>
                        )}
                      </div>
                    </div>
                    <span className={`flex items-center gap-1 text-xs ${color}`}>
                      <Icon className="w-3 h-3" /> {acc.status}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleCheck(acc.id)} disabled={checking === acc.id} className="flex-1 px-3 py-2 rounded-lg bg-brand-elevated border border-brand-border text-xs hover:bg-brand-border transition flex items-center justify-center gap-1">
                      {checking === acc.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Zap className="w-3 h-3" />}
                      Testar
                    </button>
                    <button onClick={() => handleRefresh(acc.id)} disabled={checking === acc.id} className="flex-1 px-3 py-2 rounded-lg bg-brand-elevated border border-brand-border text-xs hover:bg-brand-border transition flex items-center justify-center gap-1">
                      <RefreshCw className="w-3 h-3" />
                      Renovar
                    </button>
                    <button onClick={() => handleDelete(acc.id)} className="px-3 py-2 rounded-lg hover:bg-error/10 text-brand-text-secondary hover:text-error transition">
                      <Trash2 className="w-3 h-3" />
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
