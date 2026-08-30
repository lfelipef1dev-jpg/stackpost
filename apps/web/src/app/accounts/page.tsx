'use client';

import Image from 'next/image';
import Footer from '@/components/Footer';
import Header from '@/components/Header';
import { PlatformIcon } from '@/components/PlatformIcon';
import { PLATFORMS } from '@/lib/platforms';
import { useEffect, useState, useRef } from 'react';
import {
  RefreshCw, Trash2, AlertCircle, CheckCircle2, Clock, Loader2, Zap,
  Plus, Link2, Users, TrendingUp, X, Search, ArrowDownUp, ChevronDown,
  Shield, Lock, Sparkles, Eye,
} from 'lucide-react';

function SpotlightCard({
  children,
  className = '',
  glow = '#6366F1',
}: {
  children: React.ReactNode;
  className?: string;
  glow?: string;
}) {
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
        backgroundImage: spot.active
          ? `radial-gradient(circle 120px at ${spot.x}px ${spot.y}px, ${glow}0a, transparent)`
          : undefined,
      }}
    >
      <div
        className="absolute inset-0 rounded-3xl pointer-events-none"
        style={{
          boxShadow: spot.active ? `inset 0 0 0 1px ${glow}25` : 'inset 0 0 0 1px transparent',
          transition: 'box-shadow 0.3s',
        }}
      />
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
        setStyle({
          transform: `perspective(1200px) rotateX(${-y * 1.5}deg) rotateY(${x * 1.5}deg)`,
          transition: 'transform 0.15s ease-out',
        });
      }}
      onMouseLeave={() =>
        setStyle({
          transform: 'perspective(1200px) rotateX(0) rotateY(0)',
          transition: 'transform 0.4s ease-out',
        })
      }
      style={style}
      className={`will-change-transform ${className}`}
    >
      {children}
    </div>
  );
}

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

const ROTATING_BANNERS = [
  'Um dashboard, todas as plataformas',
  'OAuth seguro, renovação automática',
  'Gerencie 15 redes em um só lugar',
];

function expiryCountdown(dateStr?: string | null): { text: string; color: string } {
  if (!dateStr) return { text: 'Sem data', color: 'text-brand-text-secondary' };
  const target = new Date(dateStr).getTime();
  const now = Date.now();
  const diff = target - now;
  if (diff <= 0) return { text: 'Expirado', color: 'text-error' };
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(hours / 24);
  if (days >= 7) return { text: `${days}d restantes`, color: 'text-brand-text-secondary' };
  if (hours >= 24) return { text: `${days}d ${hours % 24}h`, color: 'text-warning' };
  return { text: `${hours}h restantes`, color: 'text-error' };
}

function timeAgo(dateStr?: string | null): string {
  if (!dateStr) return 'Nunca';
  const target = new Date(dateStr).getTime();
  const now = Date.now();
  const diff = now - target;
  if (diff < 0) return 'Agora';
  const min = Math.floor(diff / (1000 * 60));
  if (min < 60) return `Sync há ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `Sync há ${h} h`;
  const d = Math.floor(h / 24);
  return `Sync há ${d} d`;
}

type SortKey = 'last_used' | 'token_expiry' | 'connection_date' | 'platform_az';

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'active' | 'attention'>('all');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<SortKey>('last_used');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [drawerAccount, setDrawerAccount] = useState<any | null>(null);
  const [bannerIndex, setBannerIndex] = useState(0);
  const [bulkConfirm, setBulkConfirm] = useState<null | 'refresh' | 'delete'>(null);

  useEffect(() => {
    loadAccounts();
  }, []);

  useEffect(() => {
    const t = setInterval(() => {
      setBannerIndex((i) => (i + 1) % ROTATING_BANNERS.length);
    }, 4000);
    return () => clearInterval(t);
  }, []);

  async function loadAccounts() {
    setLoading(true);
    try {
      const res = await fetch('/api/accounts');
      const data = await res.json();
      const visible = (Array.isArray(data) ? data : []).filter((a: any) => a.platform !== 'meta_user');
      setAccounts(visible);
    } catch {}
    setLoading(false);
  }

  function handleConnect(platform: string) {
    const route = OAUTH_ROUTES[platform];
    if (route) {
      window.location.href = route;
    }
  }

  async function handleCheck(accountId: string) {
    setChecking(accountId);
    await fetch('/api/accounts/connection-check', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ socialAccountId: accountId }),
    });
    await loadAccounts();
    setChecking(null);
  }

  async function handleRefresh(accountId: string) {
    setChecking(accountId);
    await fetch('/api/accounts/refresh-token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ socialAccountId: accountId }),
    });
    await loadAccounts();
    setChecking(null);
  }

  async function handleDelete(accountId: string) {
    await fetch(`/api/accounts?id=${accountId}`, { method: 'DELETE' });
    await loadAccounts();
  }

  async function handleBulkRefresh() {
    setChecking('bulk');
    await Promise.all(
      selectedIds.map((id) =>
        fetch('/api/accounts/refresh-token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ socialAccountId: id }),
        })
      )
    );
    await loadAccounts();
    setChecking(null);
    setSelectedIds([]);
    setBulkConfirm(null);
  }

  async function handleBulkDelete() {
    await Promise.all(
      selectedIds.map((id) => fetch(`/api/accounts?id=${id}`, { method: 'DELETE' }))
    );
    await loadAccounts();
    setSelectedIds([]);
    setBulkConfirm(null);
  }

  function toggleSelect(id: string) {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  function selectAll() {
    if (selectedIds.length === filteredAndSorted.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredAndSorted.map((a) => a.id));
    }
  }

  const statusConfig: Record<string, { icon: typeof CheckCircle2; color: string; bg: string; label: string; dot: string }> = {
    active: { icon: CheckCircle2, color: 'text-success', bg: 'bg-success/10', label: 'Ativa', dot: 'bg-success' },
    expired: { icon: AlertCircle, color: 'text-error', bg: 'bg-error/10', label: 'Expirada', dot: 'bg-error' },
    reconnect_required: { icon: AlertCircle, color: 'text-warning', bg: 'bg-warning/10', label: 'Reconectar', dot: 'bg-warning' },
    pending: { icon: Clock, color: 'text-brand-text-secondary', bg: 'bg-brand-elevated', label: 'Pendente', dot: 'bg-brand-text-secondary' },
  };

  const filteredAndSorted = accounts
    .filter((a) => {
      if (search) {
        const q = search.toLowerCase();
        const matchName = (a.platform || '').toLowerCase().includes(q);
        const matchUser = (a.username || '').toLowerCase().includes(q);
        if (!matchName && !matchUser) return false;
      }
      if (filter === 'active') return a.status === 'active';
      if (filter === 'attention') return a.status === 'expired' || a.status === 'reconnect_required';
      return true;
    })
    .sort((a, b) => {
      if (sort === 'last_used') {
        return (new Date(b.last_sync_at || 0).getTime()) - (new Date(a.last_sync_at || 0).getTime());
      }
      if (sort === 'token_expiry') {
        return (new Date(a.token_expires_at || 0).getTime()) - (new Date(b.token_expires_at || 0).getTime());
      }
      if (sort === 'connection_date') {
        return (new Date(b.created_at || 0).getTime()) - (new Date(a.created_at || 0).getTime());
      }
      if (sort === 'platform_az') {
        return (a.platform || '').localeCompare(b.platform || '');
      }
      return 0;
    });

  const stats = {
    total: accounts.length,
    active: accounts.filter((a) => a.status === 'active').length,
    expired: accounts.filter((a) => a.status === 'expired' || a.status === 'reconnect_required').length,
    platforms: new Set(accounts.map((a) => a.platform)).size,
  };

  const sortLabels: Record<SortKey, string> = {
    last_used: 'Última utilizada',
    token_expiry: 'Expiração token',
    connection_date: 'Data conexão',
    platform_az: 'Plataforma A-Z',
  };

  return (
    <div className="min-h-screen bg-brand-bg">
      <Header activeHref="/accounts" />

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Header + banner rotativo */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <Link2 className="w-6 h-6 text-brand-accent" />
            <h1 className="text-3xl font-bold">Contas conectadas</h1>
          </div>
          <p className="text-brand-text-secondary text-sm max-w-2xl">
            Conecte suas redes sociais em um só lugar. OAuth seguro, renovação automática de token.
          </p>
          <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-surface/60 border border-brand-border/50 backdrop-blur-xl">
            <Sparkles className="w-4 h-4 text-brand-accent" />
            <span key={bannerIndex} className="text-sm text-brand-text transition-all duration-500">
              {ROTATING_BANNERS[bannerIndex]}
            </span>
          </div>
        </div>

        {/* Stats (4 cards) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <TiltCard>
            <SpotlightCard className="p-5" glow="#6366F1">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-brand-accent/10 flex items-center justify-center">
                  <Link2 className="w-6 h-6 text-brand-accent" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{stats.total}</div>
                  <div className="text-xs text-brand-text-secondary">Total contas</div>
                </div>
              </div>
            </SpotlightCard>
          </TiltCard>
          <TiltCard>
            <SpotlightCard className="p-5" glow="#22C55E">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-success/10 flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-success" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{stats.active}</div>
                  <div className="text-xs text-brand-text-secondary">Ativas</div>
                </div>
              </div>
            </SpotlightCard>
          </TiltCard>
          <TiltCard>
            <SpotlightCard className="p-5" glow="#F87171">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-error/10 flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-error" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{stats.expired}</div>
                  <div className="text-xs text-brand-text-secondary">Expiradas / Atenção</div>
                </div>
              </div>
            </SpotlightCard>
          </TiltCard>
          <TiltCard>
            <SpotlightCard className="p-5" glow="#A78BFA">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-brand-accent/10 flex items-center justify-center">
                  <Users className="w-6 h-6 text-brand-accent" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{stats.platforms}</div>
                  <div className="text-xs text-brand-text-secondary">Plataformas</div>
                </div>
              </div>
            </SpotlightCard>
          </TiltCard>
        </div>

        {/* Grid de plataformas para conectar */}
        <TiltCard>
          <SpotlightCard className="p-6 mb-8" glow="#6366F1">
            <div className="flex items-center gap-2 mb-5">
              <Plus className="w-5 h-5 text-brand-accent" />
              <h2 className="text-lg font-semibold">Conectar nova conta</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {PLATFORMS.map((p) => {
                const connectedCount = accounts.filter((a) => a.platform === p.id).length;
                const isConnected = connectedCount > 0;
                const hasOAuth = !!OAUTH_ROUTES[p.id];
                const allowReconnect = p.id === 'facebook' || p.id === 'google_business' || p.id === 'reddit';
                return (
                  <button
                    key={p.id}
                    onClick={() => handleConnect(p.id)}
                    disabled={isConnected && !allowReconnect}
                    className={`p-4 rounded-2xl border text-center transition disabled:opacity-40 ${
                      hasOAuth
                        ? 'bg-brand-elevated border-brand-border hover:border-brand-accent'
                        : 'bg-brand-elevated/50 border-brand-border/50'
                    }`}
                  >
                    <div className="mx-auto mb-2 w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${p.color}15` }}>
                      <PlatformIcon id={p.id} size={22} color={p.color} />
                    </div>
                    <div className="text-sm font-medium">{p.name}</div>
                    {isConnected ? (
                      <div className="text-[10px] text-success mt-1 flex items-center justify-center gap-1">
                        <CheckCircle2 className="w-2.5 h-2.5" />
                        {connectedCount} conta{connectedCount > 1 ? 's' : ''}
                        {allowReconnect ? ' · +1' : ''}
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
          </SpotlightCard>
        </TiltCard>

        {/* Sticky filter bar */}
        <div className="sticky top-16 z-10 mb-6 -mx-4 px-4 py-3 bg-brand-bg/80 backdrop-blur-xl border-b border-brand-border/50">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-lg font-semibold flex items-center gap-2 whitespace-nowrap">
              <TrendingUp className="w-5 h-5 text-success" />
              Contas ({filteredAndSorted.length})
            </h2>
            <div className="hidden md:flex items-center gap-3 text-xs text-brand-text-secondary">
              <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-success" />{stats.active} ativas</span>
              <span className="flex items-center gap-1"><AlertCircle className="w-3 h-3 text-warning" />{stats.expired} atenção</span>
              <span className="flex items-center gap-1"><Users className="w-3 h-3 text-brand-accent" />{stats.platforms} plataformas</span>
            </div>
            <div className="flex-1 min-w-[180px] relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-text-secondary" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar conta..."
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-brand-elevated border border-brand-border text-sm placeholder:text-brand-text-secondary focus:outline-none focus:border-brand-accent transition"
              />
            </div>
            <div className="flex gap-1 p-1 rounded-xl bg-brand-elevated border border-brand-border">
              {(['all', 'active', 'attention'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                    filter === f ? 'bg-brand-accent text-brand-bg' : 'text-brand-text-secondary hover:text-brand-text'
                  }`}
                >
                  {f === 'all' ? 'Todas' : f === 'active' ? 'Ativas' : 'Atenção'}
                </button>
              ))}
            </div>
            <div className="relative">
              <ArrowDownUp className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-text-secondary pointer-events-none" />
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortKey)}
                className="appearance-none pl-9 pr-8 py-2 rounded-xl bg-brand-elevated border border-brand-border text-sm focus:outline-none focus:border-brand-accent transition cursor-pointer"
              >
                {(Object.keys(sortLabels) as SortKey[]).map((k) => (
                  <option key={k} value={k}>{sortLabels[k]}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-text-secondary pointer-events-none" />
            </div>
            <button
              onClick={selectAll}
              className="px-3 py-2 rounded-xl bg-brand-elevated border border-brand-border text-xs font-medium hover:border-brand-accent transition whitespace-nowrap"
            >
              {selectedIds.length === filteredAndSorted.length && filteredAndSorted.length > 0 ? 'Desselecionar' : 'Selecionar tudo'}
            </button>
          </div>
        </div>

        {/* Grid de contas (3 colunas) */}
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <Loader2 className="w-8 h-8 animate-spin text-brand-accent" />
          </div>
        ) : filteredAndSorted.length === 0 ? (
          <TiltCard>
            <SpotlightCard className="p-10 text-center" glow="#6366F1">
              <Link2 className="w-12 h-12 mx-auto mb-4 text-brand-text-secondary/50" />
              <p className="text-brand-text-secondary text-sm">
                Nenhuma conta encontrada.
                <br />
                Conecte uma conta para começar.
              </p>
            </SpotlightCard>
          </TiltCard>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
            {filteredAndSorted.map((acc) => {
              const config = statusConfig[acc.status] || statusConfig.pending;
              const Icon = config.icon;
              const meta = acc.platform_metadata || {};
              const avatar = typeof meta === 'object' && meta.avatar ? meta.avatar : null;
              const followers = typeof meta === 'object' && meta.followers ? meta.followers : null;
              const platformColor = PLATFORMS.find((p) => p.id === acc.platform)?.color || '#888';
              const expiry = expiryCountdown(acc.token_expires_at);
              const rateLimit = typeof meta === 'object' && meta.rate_limit ? meta.rate_limit : null;
              const ratePct = rateLimit ? (rateLimit.used / rateLimit.total) * 100 : null;
              const isSelected = selectedIds.includes(acc.id);
              return (
                <TiltCard key={acc.id}>
                  <SpotlightCard className="p-4" glow={acc.status === 'active' ? '#22C55E' : '#F87171'}>
                    <div
                      className="cursor-pointer"
                      onClick={() => setDrawerAccount(acc)}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onClick={(e) => e.stopPropagation()}
                            onChange={() => toggleSelect(acc.id)}
                            className="mt-1 w-4 h-4 rounded accent-brand-accent cursor-pointer"
                          />
                          {avatar ? (
                            <Image
                              src={avatar}
                              alt={acc.username}
                              width={44}
                              height={44}
                              unoptimized
                              className="w-11 h-11 rounded-full object-cover border border-brand-border"
                            />
                          ) : (
                            <div
                              className="w-11 h-11 rounded-full flex items-center justify-center"
                              style={{ backgroundColor: `${platformColor}15` }}
                            >
                              <PlatformIcon id={acc.platform} size={20} color={platformColor} />
                            </div>
                          )}
                          <div>
                            <div className="font-semibold capitalize text-sm">{acc.platform.replace('_', ' ')}</div>
                            <div className="text-xs text-brand-text-secondary">@{acc.username}</div>
                            {followers !== null && (
                              <div className="text-[10px] text-brand-text-secondary">{followers.toLocaleString('pt-BR')} seguidores</div>
                            )}
                          </div>
                        </div>
                        <span className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full ${config.bg} ${config.color} font-medium`}>
                          <Icon className="w-3 h-3" />
                          {config.label}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 mb-2">
                        <span className={`w-2 h-2 rounded-full ${config.dot}`} />
                        <span className="text-[11px] text-brand-text-secondary">{timeAgo(acc.last_sync_at)}</span>
                      </div>

                      <div className="flex items-center justify-between text-[11px] mb-3">
                        <span className={`flex items-center gap-1 ${expiry.color}`}>
                          <Clock className="w-3 h-3" />
                          {expiry.text}
                        </span>
                        {ratePct !== null && (
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${ratePct > 80 ? 'bg-error/10 text-error' : 'bg-brand-elevated text-brand-text-secondary'}`}>
                            API {Math.round(ratePct)}%
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleCheck(acc.id)}
                        disabled={checking === acc.id}
                        className="flex-1 px-3 py-2 rounded-xl bg-brand-elevated border border-brand-border text-xs hover:border-brand-accent transition flex items-center justify-center gap-1.5 disabled:opacity-50"
                      >
                        {checking === acc.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Zap className="w-3 h-3" />}
                        Testar
                      </button>
                      <button
                        onClick={() => handleRefresh(acc.id)}
                        disabled={checking === acc.id}
                        className="flex-1 px-3 py-2 rounded-xl bg-brand-elevated border border-brand-border text-xs hover:border-brand-accent transition flex items-center justify-center gap-1.5 disabled:opacity-50"
                      >
                        <RefreshCw className="w-3 h-3" />
                        Renovar
                      </button>
                      <button
                        onClick={() => handleDelete(acc.id)}
                        className="px-3 py-2 rounded-xl hover:bg-error/10 text-brand-text-secondary hover:text-error transition"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </SpotlightCard>
                </TiltCard>
              );
            })}
          </div>
        )}

        {/* Cards informativos inferiores */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <TiltCard>
            <SpotlightCard className="p-6" glow="#6366F1">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-brand-accent" />
                <h3 className="text-lg font-semibold">Dicas de gestão de contas</h3>
              </div>
              <ul className="space-y-3 text-sm text-brand-text-secondary">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                  Renove tokens antes de expirar para evitar interrupções de publicação.
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                  Use o teste de conexão após mudanças de senha ou permissões.
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                  Monitore o indicador de rate-limit para não estourar cotas das APIs.
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                  Conecte múltiplas contas da mesma plataforma para escalar publicação.
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                  Remova contas inativas para manter o dashboard organizado.
                </li>
              </ul>
            </SpotlightCard>
          </TiltCard>
          <TiltCard>
            <SpotlightCard className="p-6" glow="#A78BFA">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-5 h-5 text-brand-accent" />
                <h3 className="text-lg font-semibold">StackPost vs concorrentes</h3>
              </div>
              <div className="space-y-3 text-sm">
                <div className="grid grid-cols-3 gap-2 items-center pb-2 border-b border-brand-border/50">
                  <div className="text-xs text-brand-text-secondary">Recurso</div>
                  <div className="text-xs font-semibold text-brand-accent text-center">StackPost</div>
                  <div className="text-xs text-brand-text-secondary text-center">Outros</div>
                </div>
                <div className="grid grid-cols-3 gap-2 items-center">
                  <div className="text-xs">Plataformas</div>
                  <div className="text-xs font-semibold text-success text-center">15</div>
                  <div className="text-xs text-center text-brand-text-secondary">5-8</div>
                </div>
                <div className="grid grid-cols-3 gap-2 items-center">
                  <div className="text-xs">OAuth 2.0</div>
                  <div className="text-xs font-semibold text-success text-center">Sim</div>
                  <div className="text-xs text-center text-brand-text-secondary">Parcial</div>
                </div>
                <div className="grid grid-cols-3 gap-2 items-center">
                  <div className="text-xs">Renovação auto</div>
                  <div className="text-xs font-semibold text-success text-center">Sim</div>
                  <div className="text-xs text-center text-brand-text-secondary">Não</div>
                </div>
                <div className="grid grid-cols-3 gap-2 items-center">
                  <div className="text-xs">Dashboard único</div>
                  <div className="text-xs font-semibold text-success text-center">Sim</div>
                  <div className="text-xs text-center text-brand-text-secondary">Não</div>
                </div>
                <div className="grid grid-cols-3 gap-2 items-center">
                  <div className="text-xs">Preço</div>
                  <div className="text-xs font-semibold text-success text-center">Acessível</div>
                  <div className="text-xs text-center text-brand-text-secondary">Alto</div>
                </div>
              </div>
            </SpotlightCard>
          </TiltCard>
        </div>
      </main>

      <Footer />

      {/* Social proof */}
      <div className="border-t border-brand-border/50 bg-brand-surface/30">
        <div className="max-w-7xl mx-auto px-4 py-4 text-center text-xs text-brand-text-secondary">
          StackPost · 50.000+ criadores · OAuth 2.0 · Suporte a 15 plataformas
        </div>
      </div>

      {/* Bulk action toolbar */}
      {selectedIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30">
          <div className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-brand-surface border border-brand-border shadow-2xl backdrop-blur-xl">
            <span className="text-sm font-medium">{selectedIds.length} selecionada{selectedIds.length > 1 ? 's' : ''}</span>
            <div className="w-px h-5 bg-brand-border" />
            <button
              onClick={() => setBulkConfirm('refresh')}
              disabled={checking === 'bulk'}
              className="px-3 py-1.5 rounded-xl bg-brand-elevated border border-brand-border text-xs font-medium hover:border-brand-accent transition flex items-center gap-1.5 disabled:opacity-50"
            >
              {checking === 'bulk' ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
              Renovar todas
            </button>
            <button
              onClick={() => setBulkConfirm('delete')}
              className="px-3 py-1.5 rounded-xl bg-error/10 border border-error/30 text-xs font-medium text-error hover:bg-error/20 transition flex items-center gap-1.5"
            >
              <Trash2 className="w-3 h-3" />
              Excluir
            </button>
            <button
              onClick={() => setSelectedIds([])}
              className="px-2 py-1.5 rounded-xl text-brand-text-secondary hover:text-brand-text transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Bulk confirm dialog */}
      {bulkConfirm && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setBulkConfirm(null)}
        >
          <div
            className="max-w-sm w-full p-6 rounded-2xl bg-brand-surface border border-brand-border"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2 mb-3">
              {bulkConfirm === 'delete' ? (
                <AlertCircle className="w-5 h-5 text-error" />
              ) : (
                <RefreshCw className="w-5 h-5 text-brand-accent" />
              )}
              <h3 className="text-lg font-semibold">
                {bulkConfirm === 'delete' ? 'Excluir contas' : 'Renovar tokens'}
              </h3>
            </div>
            <p className="text-sm text-brand-text-secondary mb-5">
              {bulkConfirm === 'delete'
                ? `Tem certeza que deseja excluir ${selectedIds.length} conta${selectedIds.length > 1 ? 's' : ''}? Esta ação não pode ser desfeita.`
                : `Tem certeza que deseja renovar o token de ${selectedIds.length} conta${selectedIds.length > 1 ? 's' : ''}?`}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setBulkConfirm(null)}
                className="flex-1 px-4 py-2 rounded-xl bg-brand-elevated border border-brand-border text-sm font-medium hover:border-brand-accent transition"
              >
                Cancelar
              </button>
              <button
                onClick={bulkConfirm === 'delete' ? handleBulkDelete : handleBulkRefresh}
                className={`flex-1 px-4 py-2 rounded-xl text-sm font-medium transition ${
                  bulkConfirm === 'delete'
                    ? 'bg-error text-white hover:bg-error/90'
                    : 'bg-brand-accent text-brand-bg hover:bg-brand-accent/90'
                }`}
              >
                {bulkConfirm === 'delete' ? 'Excluir' : 'Renovar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detail drawer */}
      {drawerAccount && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          onClick={() => setDrawerAccount(null)}
        >
          <div
            className="absolute right-0 top-0 bottom-0 w-full max-w-md bg-brand-surface border-l border-brand-border overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {(() => {
              const acc = drawerAccount;
              const config = statusConfig[acc.status] || statusConfig.pending;
              const Icon = config.icon;
              const meta = acc.platform_metadata || {};
              const avatar = typeof meta === 'object' && meta.avatar ? meta.avatar : null;
              const followers = typeof meta === 'object' && meta.followers ? meta.followers : null;
              const platformColor = PLATFORMS.find((p) => p.id === acc.platform)?.color || '#888';
              const expiry = expiryCountdown(acc.token_expires_at);
              const scopes = typeof meta === 'object' && Array.isArray(meta.scopes) ? meta.scopes : [];
              return (
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold">Detalhes da conta</h3>
                    <button
                      onClick={() => setDrawerAccount(null)}
                      className="p-2 rounded-xl hover:bg-brand-elevated text-brand-text-secondary hover:text-brand-text transition"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Avatar grande */}
                  <div className="flex flex-col items-center mb-6">
                    {avatar ? (
                      <Image
                        src={avatar}
                        alt={acc.username}
                        width={96}
                        height={96}
                        unoptimized
                        className="w-24 h-24 rounded-full object-cover border-2 border-brand-border"
                      />
                    ) : (
                      <div
                        className="w-24 h-24 rounded-full flex items-center justify-center border-2 border-brand-border"
                        style={{ backgroundColor: `${platformColor}15` }}
                      >
                        <PlatformIcon id={acc.platform} size={44} color={platformColor} />
                      </div>
                    )}
                    <div className="mt-3 font-semibold capitalize text-lg">{acc.platform.replace('_', ' ')}</div>
                    <div className="text-sm text-brand-text-secondary">@{acc.username}</div>
                    <span className={`mt-2 flex items-center gap-1.5 text-xs px-3 py-1 rounded-full ${config.bg} ${config.color} font-medium`}>
                      <Icon className="w-3 h-3" />
                      {config.label}
                    </span>
                  </div>

                  {/* Metadados */}
                  <div className="space-y-3 mb-6">
                    <div className="text-xs font-semibold text-brand-text-secondary uppercase tracking-wide">Metadados</div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-brand-text-secondary">ID</span>
                        <span className="font-mono text-xs">{acc.id}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-brand-text-secondary">Conectado em</span>
                        <span>{acc.created_at ? new Date(acc.created_at).toLocaleDateString('pt-BR') : 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-brand-text-secondary">Último sync</span>
                        <span>{timeAgo(acc.last_sync_at)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-brand-text-secondary">Token expira</span>
                        <span className={expiry.color}>{expiry.text}</span>
                      </div>
                      {followers !== null && (
                        <div className="flex justify-between">
                          <span className="text-brand-text-secondary">Seguidores</span>
                          <span>{followers.toLocaleString('pt-BR')}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Permissões OAuth */}
                  {scopes.length > 0 && (
                    <div className="space-y-3 mb-6">
                      <div className="text-xs font-semibold text-brand-text-secondary uppercase tracking-wide flex items-center gap-1.5">
                        <Shield className="w-3.5 h-3.5" />
                        Permissões OAuth (scopes)
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {scopes.map((s: string) => (
                          <span key={s} className="px-2.5 py-1 rounded-lg bg-brand-elevated border border-brand-border text-xs font-mono">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Info de seguranca */}
                  <div className="space-y-3 mb-6">
                    <div className="text-xs font-semibold text-brand-text-secondary uppercase tracking-wide flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5" />
                      Segurança
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-success" />
                        <span className="text-brand-text-secondary">Token criptografado em repouso</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-success" />
                        <span className="text-brand-text-secondary">OAuth 2.0 com refresh automático</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-success" />
                        <span className="text-brand-text-secondary">RLS habilitado no Supabase</span>
                      </div>
                    </div>
                  </div>

                  {/* Ações */}
                  <div className="space-y-2">
                    <button
                      onClick={() => { handleCheck(acc.id); setDrawerAccount(null); }}
                      disabled={checking === acc.id}
                      className="w-full px-4 py-2.5 rounded-xl bg-brand-elevated border border-brand-border text-sm font-medium hover:border-brand-accent transition flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {checking === acc.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                      Testar conexão
                    </button>
                    <button
                      onClick={() => { handleRefresh(acc.id); setDrawerAccount(null); }}
                      disabled={checking === acc.id}
                      className="w-full px-4 py-2.5 rounded-xl bg-brand-elevated border border-brand-border text-sm font-medium hover:border-brand-accent transition flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      <RefreshCw className="w-4 h-4" />
                      Renovar token
                    </button>
                    <button
                      onClick={() => { handleDelete(acc.id); setDrawerAccount(null); }}
                      className="w-full px-4 py-2.5 rounded-xl bg-error/10 border border-error/30 text-sm font-medium text-error hover:bg-error/20 transition flex items-center justify-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      Desconectar conta
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}
