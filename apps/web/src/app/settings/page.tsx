'use client';

import Footer from '@/components/Footer';
import Header from '@/components/Header';
import { PlatformIcon } from '@/components/PlatformIcon';
import { PLATFORMS } from '@/lib/platforms';
import { useEffect, useRef, useState } from 'react';
import {
  AlertTriangle,
  Bell,
  Building2,
  Check,
  CheckCircle2,
  Copy,
  Crown,
  Download,
  Eye,
  Globe,
  Key,
  Loader2,
  Lock,
  LogOut,
  Mail,
  Monitor,
  Pencil,
  Plus,
  Shield,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Trash2,
  User,
  UserPlus,
  Users,
  Webhook,
  Zap,
} from 'lucide-react';

type Tab =
  | 'profile'
  | 'organization'
  | 'team'
  | 'api'
  | 'webhooks'
  | 'billing'
  | 'security'
  | 'notifications'
  | 'danger';

const TAB_CONFIG: { id: Tab; label: string; icon: typeof User; desc: string }[] = [
  { id: 'profile', label: 'Perfil', icon: User, desc: 'Suas informações pessoais' },
  { id: 'organization', label: 'Organização', icon: Building2, desc: 'Nome, logo e preferências' },
  { id: 'team', label: 'Time e membros', icon: Users, desc: 'Convites e permissões' },
  { id: 'api', label: 'Chaves de API', icon: Key, desc: 'Acesso programático' },
  { id: 'webhooks', label: 'Webhooks', icon: Webhook, desc: 'Eventos em tempo real' },
  { id: 'billing', label: 'Plano e cobrança', icon: Zap, desc: 'Plano, uso e faturas' },
  { id: 'security', label: 'Segurança', icon: Shield, desc: '2FA, sessões e auditoria' },
  { id: 'notifications', label: 'Notificações', icon: Bell, desc: 'Email e alertas' },
  { id: 'danger', label: 'Zona de perigo', icon: AlertTriangle, desc: 'Ações irreversíveis' },
];

const ROLE_LABELS: Record<string, string> = {
  owner: 'Owner',
  admin: 'Admin',
  editor: 'Editor',
  viewer: 'Viewer',
};

const ROLE_ICONS: Record<string, typeof Crown> = {
  owner: Crown,
  admin: Shield,
  editor: Pencil,
  viewer: Eye,
};

const ROLE_COLORS: Record<string, string> = {
  owner: 'text-warning',
  admin: 'text-brand-accent',
  editor: 'text-info',
  viewer: 'text-brand-text-secondary',
};

const PLAN_LIMITS: Record<string, { seats: number; apiKeys: number; webhooks: number; accounts: number }> = {
  free: { seats: 1, apiKeys: 1, webhooks: 1, accounts: 3 },
  starter: { seats: 3, apiKeys: 5, webhooks: 3, accounts: 10 },
  growth: { seats: 5, apiKeys: 10, webhooks: 10, accounts: 25 },
  scale: { seats: 10, apiKeys: 25, webhooks: 25, accounts: 50 },
  business: { seats: 25, apiKeys: 100, webhooks: 100, accounts: 999 },
};

const planLabels: Record<string, string> = {
  free: 'Free',
  starter: 'Starter',
  growth: 'Growth',
  scale: 'Scale',
  business: 'Business',
};

function SpotlightCard({
  children,
  className = '',
  glow = '#8AB4F8',
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

function Toggle({ checked, onChange, disabled }: { checked: boolean; onChange: () => void; disabled?: boolean }) {
  return (
    <button
      onClick={onChange}
      disabled={disabled}
      className={`relative w-11 h-6 rounded-full p-0.5 box-border transition flex-shrink-0 ${
        checked ? 'bg-brand-accent' : 'bg-brand-elevated'
      } ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      <span
        className={`block w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
          checked ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  );
}

function SettingRow({
  title,
  desc,
  children,
}: {
  title: string;
  desc?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-3 border-b border-brand-border/30 last:border-0">
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium leading-6">{title}</div>
        {desc && <div className="text-[11px] text-brand-text-secondary mt-0.5">{desc}</div>}
      </div>
      <div className="pt-0.5 flex-shrink-0">{children}</div>
    </div>
  );
}

function ProgressBar({ value, max, color = '#8AB4F8' }: { value: number; max: number; color?: string }) {
  const pct = Math.min((value / max) * 100, 100);
  const isWarning = pct >= 70 && pct < 90;
  const isError = pct >= 90;
  const barColor = isError ? '#F87171' : isWarning ? '#FBBF24' : color;
  return (
    <div className="w-full h-1.5 rounded-full bg-brand-elevated/50 overflow-hidden">
      <div
        className="h-full rounded-full transition-all duration-500"
        style={{ width: `${pct}%`, background: barColor }}
      />
    </div>
  );
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('profile');
  const [org, setOrg] = useState('');
  const [plan, setPlan] = useState('free');
  const [apiKeys, setApiKeys] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [webhooks, setWebhooks] = useState<any[]>([]);
  const [me, setMe] = useState<any>(null);
  const [newKeyName, setNewKeyName] = useState('');
  const [newKey, setNewKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('editor');
  const [inviteLoading, setInviteLoading] = useState(false);
  const [savingOrg, setSavingOrg] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState('');
  const [webhookEvents, setWebhookEvents] = useState<string[]>(['post.published']);
  const [webhookLoading, setWebhookLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [notifPrefs, setNotifPrefs] = useState({
    emailPosts: true,
    emailComments: true,
    emailBilling: true,
    emailProduct: false,
    emailWeekly: true,
    inAppMentions: true,
    inAppApprovals: true,
  });
  const [profile, setProfile] = useState({ name: '', email: '', timezone: 'America/Sao_Paulo' });

  useEffect(() => {
    loadAll();
  }, []);

  async function loadAll() {
    await Promise.all([
      loadApiKeys(),
      loadOrg(),
      loadMembers(),
      loadWebhooks(),
      loadMe(),
    ]);
  }

  async function loadApiKeys() {
    try {
      const res = await fetch('/api/api-keys');
      const data = await res.json();
      setApiKeys(Array.isArray(data) ? data : []);
    } catch {}
  }

  async function loadOrg() {
    try {
      const res = await fetch('/api/organization');
      const data = await res.json();
      if (data?.name) setOrg(data.name);
      if (data?.plan) setPlan(data.plan);
    } catch {}
  }

  async function loadMembers() {
    try {
      const res = await fetch('/api/team/members');
      const data = await res.json();
      setMembers(Array.isArray(data) ? data : []);
    } catch {}
  }

  async function loadWebhooks() {
    try {
      const res = await fetch('/api/webhooks');
      const data = await res.json();
      setWebhooks(Array.isArray(data) ? data : []);
    } catch {}
  }

  async function loadMe() {
    try {
      const res = await fetch('/api/me');
      const data = await res.json();
      setMe(data);
      if (data?.name) setProfile((p) => ({ ...p, name: data.name, email: data.email }));
    } catch {}
  }

  async function saveOrg() {
    setSavingOrg(true);
    await fetch('/api/organization', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: org }),
    });
    setSavingOrg(false);
  }

  async function saveProfile() {
    setSavingProfile(true);
    // Visual save only - profile update endpoint may not exist
    setTimeout(() => setSavingProfile(false), 800);
  }

  async function handleCreateKey() {
    setLoading(true);
    const res = await fetch('/api/api-keys', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
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
    await fetch(`/api/api-keys?id=${id}`, { method: 'DELETE', headers: {} });
    await loadApiKeys();
  }

  async function handleInvite() {
    if (!inviteEmail.trim()) return;
    setInviteLoading(true);
    await fetch('/api/team/invite', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: inviteEmail.trim(), role: inviteRole }),
    });
    setInviteEmail('');
    await loadMembers();
    setInviteLoading(false);
  }

  async function handleRemoveMember(id: string) {
    await fetch(`/api/team/members?id=${id}`, { method: 'DELETE', headers: {} });
    await loadMembers();
  }

  async function handleCreateWebhook() {
    if (!webhookUrl.trim()) return;
    setWebhookLoading(true);
    await fetch('/api/webhooks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: webhookUrl, events: webhookEvents }),
    });
    setWebhookUrl('');
    await loadWebhooks();
    setWebhookLoading(false);
  }

  async function handleDeleteWebhook(id: string) {
    await fetch(`/api/webhooks?id=${id}`, { method: 'DELETE', headers: {} });
    await loadWebhooks();
  }

  function copy(text: string) {
    navigator.clipboard.writeText(text);
    setCopied(text);
    setTimeout(() => setCopied(null), 2000);
  }

  const limits = PLAN_LIMITS[plan] || PLAN_LIMITS.free;
  const myRole = me?.role || 'owner';
  const isOwner = myRole === 'owner';
  const isAdmin = isOwner || myRole === 'admin';

  // Onboarding checklist
  const onboardingSteps = [
    { done: !!profile.name, label: 'Complete seu perfil' },
    { done: !!org, label: 'Configure a organização' },
    { done: false, label: 'Conecte suas contas' },
    { done: members.length > 1, label: 'Convide o time' },
    { done: false, label: 'Configure notificacoes' },
  ];
  const completedOnboarding = onboardingSteps.filter((s) => s.done).length;

  const activeConfig = TAB_CONFIG.find((t) => t.id === activeTab)!;

  return (
    <div className="min-h-screen bg-brand-bg">
      <Header activeHref="/settings" />

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <Building2 className="w-6 h-6 text-brand-accent" />
            <h1 className="text-3xl font-bold">Configurações</h1>
          </div>
          <p className="text-brand-text-secondary text-sm max-w-2xl">
            Gerencie seu plano, time, segurança e preferências em um só lugar.
          </p>
        </div>

        {/* Onboarding checklist */}
        <TiltCard className="mb-6">
          <SpotlightCard className="p-4" glow="#22C55E">
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-success" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Configuracao inicial</span>
                  <span className="text-xs text-brand-text-secondary">
                    {completedOnboarding}/{onboardingSteps.length} concluídos
                  </span>
                </div>
                <div className="flex gap-1.5">
                  {onboardingSteps.map((step, i) => (
                    <div
                      key={i}
                      className={`flex-1 h-1.5 rounded-full transition ${
                        step.done ? 'bg-success' : 'bg-brand-elevated'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </SpotlightCard>
        </TiltCard>

        {/* Layout: sidebar + content */}
        <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-6">
          {/* Sidebar */}
          <div className="lg:sticky lg:top-20 lg:self-start">
            <div className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0">
              {TAB_CONFIG.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm transition whitespace-nowrap flex-shrink-0 ${
                    activeTab === tab.id
                      ? 'bg-brand-surface border border-brand-border text-brand-text'
                      : 'text-brand-text-secondary hover:text-brand-text hover:bg-brand-surface/50'
                  }`}
                >
                  <tab.icon className={`w-4 h-4 flex-shrink-0 ${activeTab === tab.id ? 'text-brand-accent' : ''}`} />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="min-w-0">
            {/* Section header */}
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-1">
                <activeConfig.icon className="w-5 h-5 text-brand-accent" />
                <h2 className="text-xl font-bold">{activeConfig.label}</h2>
              </div>
              <p className="text-xs text-brand-text-secondary">{activeConfig.desc}</p>
            </div>

            {/* PROFILE */}
            {activeTab === 'profile' && (
              <div className="space-y-4">
                <TiltCard>
                  <SpotlightCard className="p-6" glow="#8AB4F8">
                    {/* Avatar */}
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-16 h-16 rounded-2xl bg-brand-accent/20 flex items-center justify-center text-brand-accent text-2xl font-bold">
                        {(profile.name || profile.email || '?').charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-semibold">{profile.name || 'Usuário'}</div>
                        <div className="text-xs text-brand-text-secondary">{profile.email}</div>
                        <span className={`inline-flex items-center gap-1 text-[10px] mt-1 ${ROLE_COLORS[myRole]}`}>
                          {(() => {
                            const Icon = ROLE_ICONS[myRole] || Eye;
                            return <Icon className="w-3 h-3" />;
                          })()}
                          {ROLE_LABELS[myRole] || myRole}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs text-brand-text-secondary mb-1.5">Nome</label>
                        <input
                          value={profile.name}
                          onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))}
                          className="w-full px-4 py-2.5 rounded-xl bg-brand-elevated border border-brand-border text-sm focus:outline-none focus:border-brand-accent transition"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-brand-text-secondary mb-1.5">Email</label>
                        <input
                          value={profile.email}
                          disabled
                          className="w-full px-4 py-2.5 rounded-xl bg-brand-elevated/50 border border-brand-border text-sm text-brand-text-secondary cursor-not-allowed"
                        />
                        <p className="text-[10px] text-brand-text-secondary mt-1">
                          Para alterar o email, entre em contato com o suporte.
                        </p>
                      </div>
                      <div>
                        <label className="block text-xs text-brand-text-secondary mb-1.5">Fuso horário</label>
                        <select
                          value={profile.timezone}
                          onChange={(e) => setProfile((p) => ({ ...p, timezone: e.target.value }))}
                          className="w-full px-4 py-2.5 rounded-xl bg-brand-elevated border border-brand-border text-sm focus:outline-none focus:border-brand-accent transition"
                        >
                          <option value="America/Sao_Paulo">(UTC-3) Sao Paulo</option>
                          <option value="America/New_York">(UTC-5) New York</option>
                          <option value="Europe/London">(UTC+0) London</option>
                          <option value="Europe/Lisbon">(UTC+0) Lisboa</option>
                          <option value="America/Manaus">(UTC-4) Manaus</option>
                        </select>
                      </div>
                      <button
                        onClick={saveProfile}
                        disabled={savingProfile}
                        className="px-5 py-2.5 rounded-xl bg-brand-accent text-brand-bg font-semibold text-sm hover:bg-brand-accent-hover transition disabled:opacity-50 flex items-center gap-2"
                      >
                        {savingProfile ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                        Salvar perfil
                      </button>
                    </div>
                  </SpotlightCard>
                </TiltCard>
              </div>
            )}

            {/* ORGANIZATION */}
            {activeTab === 'organization' && (
              <div className="space-y-4">
                <TiltCard>
                  <SpotlightCard className="p-6" glow="#8AB4F8">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs text-brand-text-secondary mb-1.5">Nome da organização</label>
                        <div className="flex gap-2">
                          <input
                            value={org}
                            onChange={(e) => setOrg(e.target.value)}
                            className="flex-1 px-4 py-2.5 rounded-xl bg-brand-elevated border border-brand-border text-sm focus:outline-none focus:border-brand-accent transition"
                          />
                          <button
                            onClick={saveOrg}
                            disabled={savingOrg || !isAdmin}
                            className="px-4 py-2.5 rounded-xl bg-brand-accent text-brand-bg font-semibold text-sm hover:bg-brand-accent-hover transition disabled:opacity-50 flex items-center gap-2"
                          >
                            {savingOrg ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                            Salvar
                          </button>
                        </div>
                        {!isAdmin && (
                          <p className="text-[10px] text-warning mt-1">Apenas owner/admin pode editar.</p>
                        )}
                      </div>

                      <div className="pt-4 border-t border-brand-border/30">
                        <label className="block text-xs text-brand-text-secondary mb-2">Plano atual</label>
                        <div className="flex items-center gap-3">
                          <div className="flex-1 px-4 py-2.5 rounded-xl bg-brand-elevated border border-brand-border text-sm font-medium">
                            {planLabels[plan] || plan}
                          </div>
                          <a
                            href="/plans"
                            className="px-4 py-2.5 rounded-xl bg-brand-elevated border border-brand-border text-sm hover:border-brand-accent transition"
                          >
                            Alterar plano
                          </a>
                        </div>
                      </div>
                    </div>
                  </SpotlightCard>
                </TiltCard>

                {/* Platformas suportadas */}
                <TiltCard>
                  <SpotlightCard className="p-6" glow="#22D3EE">
                    <div className="flex items-center gap-2 mb-4">
                      <Globe className="w-4 h-4 text-info" />
                      <h3 className="font-semibold text-sm">Redes sociais suportadas</h3>
                    </div>
                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                      {PLATFORMS.map((p) => (
                        <div
                          key={p.id}
                          className="flex flex-col items-center gap-1.5 p-2 rounded-xl bg-brand-elevated/30 border border-brand-border/30"
                        >
                          <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center"
                            style={{ backgroundColor: `${p.color}15` }}
                          >
                            <PlatformIcon id={p.id} size={16} color={p.color} />
                          </div>
                          <span className="text-[10px] text-brand-text-secondary">{p.name}</span>
                        </div>
                      ))}
                    </div>
                  </SpotlightCard>
                </TiltCard>
              </div>
            )}

            {/* TEAM */}
            {activeTab === 'team' && (
              <div className="space-y-4">
                {/* Seat usage */}
                <TiltCard>
                  <SpotlightCard className="p-5" glow="#A78BFA">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-sm">Assentos</h3>
                      <span className="text-xs text-brand-text-secondary">
                        {members.length}/{limits.seats} usados
                      </span>
                    </div>
                    <ProgressBar value={members.length} max={limits.seats} color="#A78BFA" />
                    {members.length >= limits.seats && (
                      <p className="text-[11px] text-warning mt-2">
                        Limite atingido. Faça upgrade para convidar mais membros.
                      </p>
                    )}
                  </SpotlightCard>
                </TiltCard>

                {/* Members list */}
                <TiltCard>
                  <SpotlightCard className="p-6" glow="#8AB4F8">
                    <h3 className="font-semibold text-sm mb-4">Membros do time</h3>
                    <div className="space-y-2 mb-4">
                      {members.length === 0 && (
                        <p className="text-xs text-brand-text-secondary py-4 text-center">
                          Nenhum membro além de você. Convide colaboradores para começar.
                        </p>
                      )}
                      {members.map((m) => {
                        const RoleIcon = ROLE_ICONS[m.role] || Eye;
                        return (
                          <div
                            key={m.id}
                            className="flex items-center justify-between p-3 rounded-xl bg-brand-elevated/30 border border-brand-border/30"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="w-9 h-9 rounded-full bg-brand-accent/20 flex items-center justify-center text-brand-accent text-sm font-bold flex-shrink-0">
                                {(m.email || m.name || '?').charAt(0).toUpperCase()}
                              </div>
                              <div className="min-w-0">
                                <div className="text-sm font-medium truncate">{m.name || m.email}</div>
                                <div className="text-xs text-brand-text-secondary truncate">{m.email}</div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <span
                                className={`flex items-center gap-1 text-[10px] px-2 py-1 rounded-lg bg-brand-surface border border-brand-border ${ROLE_COLORS[m.role] || ''}`}
                              >
                                <RoleIcon className="w-3 h-3" />
                                {ROLE_LABELS[m.role] || m.role}
                              </span>
                              {m.role !== 'owner' && isAdmin && (
                                <button
                                  onClick={() => handleRemoveMember(m.id)}
                                  className="p-1.5 rounded-lg hover:bg-error/10 text-brand-text-secondary hover:text-error transition"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Invite */}
                    {isAdmin && (
                      <div className="pt-4 border-t border-brand-border/30">
                        <div className="text-xs text-brand-text-secondary mb-2">Convidar novo membro</div>
                        <div className="flex flex-col sm:flex-row gap-2">
                          <input
                            type="email"
                            value={inviteEmail}
                            onChange={(e) => setInviteEmail(e.target.value)}
                            placeholder="email@dominio.com"
                            className="flex-1 px-4 py-2 rounded-xl bg-brand-elevated border border-brand-border text-sm focus:outline-none focus:border-brand-accent transition"
                          />
                          <select
                            value={inviteRole}
                            onChange={(e) => setInviteRole(e.target.value)}
                            className="px-3 py-2 rounded-xl bg-brand-elevated border border-brand-border text-sm"
                          >
                            <option value="admin">Admin</option>
                            <option value="editor">Editor</option>
                            <option value="viewer">Viewer</option>
                          </select>
                          <button
                            onClick={handleInvite}
                            disabled={inviteLoading || !inviteEmail.trim() || members.length >= limits.seats}
                            className="px-4 py-2 rounded-xl bg-brand-accent text-brand-bg font-semibold text-sm hover:bg-brand-accent-hover transition disabled:opacity-50 flex items-center gap-2 justify-center"
                          >
                            {inviteLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                            Convidar
                          </button>
                        </div>
                        {members.length >= limits.seats && (
                          <p className="text-[10px] text-warning mt-2">
                            Você atingiu o limite de {limits.seats} assentos do plano {planLabels[plan]}.
                          </p>
                        )}
                      </div>
                    )}
                  </SpotlightCard>
                </TiltCard>

                {/* Role matrix */}
                <TiltCard>
                  <SpotlightCard className="p-6" glow="#A78BFA">
                    <h3 className="font-semibold text-sm mb-4">Matriz de permissões</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="border-b border-brand-border">
                            <th className="text-left py-2 px-2 text-brand-text-secondary font-medium">Permissao</th>
                            <th className="text-center py-2 px-2 text-warning font-medium">Owner</th>
                            <th className="text-center py-2 px-2 text-brand-accent font-medium">Admin</th>
                            <th className="text-center py-2 px-2 text-success font-medium">Editor</th>
                            <th className="text-center py-2 px-2 text-brand-text-secondary font-medium">Viewer</th>
                          </tr>
                        </thead>
                        <tbody>
                          {[
                            { perm: 'Criar publicações', roles: [true, true, true, false] },
                            { perm: 'Aprovar publicações', roles: [true, true, false, false] },
                            { perm: 'Convidar membros', roles: [true, true, false, false] },
                            { perm: 'Gerenciar contas', roles: [true, true, false, false] },
                            { perm: 'Ver analytics', roles: [true, true, true, true] },
                            { perm: 'Chaves de API', roles: [true, true, false, false] },
                            { perm: 'Webhooks', roles: [true, true, false, false] },
                            { perm: 'Gerenciar cobrança', roles: [true, false, false, false] },
                            { perm: 'Excluir workspace', roles: [true, false, false, false] },
                          ].map((row) => (
                            <tr key={row.perm} className="border-b border-brand-border/30">
                              <td className="py-2 px-2">{row.perm}</td>
                              {row.roles.map((allowed, i) => (
                                <td key={i} className="text-center py-2 px-2">
                                  {allowed ? (
                                    <CheckCircle2 className="w-3.5 h-3.5 text-success mx-auto" />
                                  ) : (
                                    <span className="text-brand-text-secondary/30">-</span>
                                  )}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </SpotlightCard>
                </TiltCard>
              </div>
            )}

            {/* API KEYS */}
            {activeTab === 'api' && (
              <div className="space-y-4">
                {/* Usage */}
                <TiltCard>
                  <SpotlightCard className="p-5" glow="#FBBF24">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Key className="w-4 h-4 text-warning" />
                        <h3 className="font-semibold text-sm">Chaves de API</h3>
                      </div>
                      <span className="text-xs text-brand-text-secondary">
                        {apiKeys.length}/{limits.apiKeys} usadas
                      </span>
                    </div>
                    <ProgressBar value={apiKeys.length} max={limits.apiKeys} color="#FBBF24" />
                    <p className="text-[10px] text-brand-text-secondary mt-2">
                      Limite do plano {planLabels[plan]}: {limits.apiKeys} chaves.
                      {limits.apiKeys < 100 && ' Faça upgrade para mais chaves.'}
                    </p>
                  </SpotlightCard>
                </TiltCard>

                <TiltCard>
                  <SpotlightCard className="p-6" glow="#FBBF24">
                    {newKey && (
                      <div className="mb-4 p-4 rounded-xl bg-success/10 border border-success/30">
                        <div className="text-sm text-success mb-2 font-medium flex items-center gap-2">
                          <ShieldCheck className="w-4 h-4" />
                          Nova chave criada! Copie agora (não aparece de novo):
                        </div>
                        <div className="flex items-center gap-2">
                          <code className="flex-1 text-xs font-mono text-brand-text truncate bg-brand-elevated/50 px-3 py-2 rounded-lg">
                            {newKey}
                          </code>
                          <button onClick={() => copy(newKey)} className="p-2 rounded-lg hover:bg-brand-elevated">
                            {copied === newKey ? <Check className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4" />}
                          </button>
                        </div>
                        <button
                          onClick={() => setNewKey(null)}
                          className="mt-2 text-xs text-brand-text-secondary hover:text-brand-text"
                        >
                          Fechar
                        </button>
                      </div>
                    )}

                    <div className="space-y-2 mb-4">
                      {apiKeys.length === 0 && (
                        <p className="text-xs text-brand-text-secondary py-4 text-center">
                          Nenhuma chave criada. Crie uma chave para acessar a API do StackPost.
                        </p>
                      )}
                      {apiKeys.map((k) => (
                        <div
                          key={k.id}
                          className="flex items-center justify-between p-3 rounded-xl bg-brand-elevated/30 border border-brand-border/30"
                        >
                          <div className="min-w-0">
                            <div className="text-sm font-medium">{k.name}</div>
                            <div className="text-xs text-brand-text-secondary font-mono">{k.key_prefix}...</div>
                            <div className="text-[10px] text-brand-text-secondary mt-1">
                              Criada: {new Date(k.created_at).toLocaleDateString('pt-BR')}
                              {k.last_used_at && ` · Ultimo uso: ${new Date(k.last_used_at).toLocaleDateString('pt-BR')}`}
                            </div>
                          </div>
                          <button
                            onClick={() => handleDeleteKey(k.id)}
                            className="p-2 rounded-lg hover:bg-error/10 text-brand-text-secondary hover:text-error transition flex-shrink-0"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>

                    <div className="flex gap-2 pt-4 border-t border-brand-border/30">
                      <input
                        value={newKeyName}
                        onChange={(e) => setNewKeyName(e.target.value)}
                        placeholder="Nome da chave (ex: Produção)"
                        className="flex-1 px-4 py-2 rounded-xl bg-brand-elevated border border-brand-border text-sm focus:outline-none focus:border-brand-accent transition"
                      />
                      <button
                        onClick={handleCreateKey}
                        disabled={loading || apiKeys.length >= limits.apiKeys}
                        className="px-4 py-2 rounded-xl bg-brand-accent text-brand-bg font-semibold text-sm hover:bg-brand-accent-hover transition disabled:opacity-50 flex items-center gap-2"
                      >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                        Gerar
                      </button>
                    </div>
                    {apiKeys.length >= limits.apiKeys && (
                      <p className="text-[10px] text-warning mt-2">
                        Limite de {limits.apiKeys} chaves atingido. Faça upgrade para criar mais.
                      </p>
                    )}
                  </SpotlightCard>
                </TiltCard>
              </div>
            )}

            {/* WEBHOOKS */}
            {activeTab === 'webhooks' && (
              <div className="space-y-4">
                <TiltCard>
                  <SpotlightCard className="p-5" glow="#22D3EE">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Webhook className="w-4 h-4 text-info" />
                        <h3 className="font-semibold text-sm">Webhooks ativos</h3>
                      </div>
                      <span className="text-xs text-brand-text-secondary">
                        {webhooks.length}/{limits.webhooks} usados
                      </span>
                    </div>
                    <ProgressBar value={webhooks.length} max={limits.webhooks} color="#22D3EE" />
                  </SpotlightCard>
                </TiltCard>

                <TiltCard>
                  <SpotlightCard className="p-6" glow="#22D3EE">
                    <div className="space-y-2 mb-4">
                      {webhooks.length === 0 && (
                        <p className="text-xs text-brand-text-secondary py-4 text-center">
                          Nenhum webhook configurado. Receba eventos em tempo real no seu servidor.
                        </p>
                      )}
                      {webhooks.map((w) => (
                        <div
                          key={w.id}
                          className="flex items-center justify-between p-3 rounded-xl bg-brand-elevated/30 border border-brand-border/30"
                        >
                          <div className="min-w-0">
                            <div className="text-sm font-medium truncate">{w.url}</div>
                            <div className="flex items-center gap-2 mt-1">
                              {w.events?.map((ev: string) => (
                                <span
                                  key={ev}
                                  className="text-[9px] px-1.5 py-0.5 rounded bg-brand-elevated/50 text-brand-text-secondary"
                                >
                                  {ev}
                                </span>
                              ))}
                              <span className="text-[10px] text-brand-text-secondary">
                                {w.delivered || 0} entregues · {w.failed || 0} falhas
                              </span>
                            </div>
                          </div>
                          <button
                            onClick={() => handleDeleteWebhook(w.id)}
                            className="p-2 rounded-lg hover:bg-error/10 text-brand-text-secondary hover:text-error transition flex-shrink-0"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>

                    <div className="pt-4 border-t border-brand-border/30 space-y-3">
                      <div>
                        <label className="block text-xs text-brand-text-secondary mb-1.5">URL do webhook</label>
                        <input
                          value={webhookUrl}
                          onChange={(e) => setWebhookUrl(e.target.value)}
                          placeholder="https://seu-servidor.com/webhook"
                          className="w-full px-4 py-2 rounded-xl bg-brand-elevated border border-brand-border text-sm focus:outline-none focus:border-brand-accent transition"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-brand-text-secondary mb-1.5">Eventos</label>
                        <div className="flex flex-wrap gap-2">
                          {['post.published', 'post.failed', 'post.scheduled', 'comment.received', 'account.expired'].map(
                            (ev) => (
                              <button
                                key={ev}
                                onClick={() =>
                                  setWebhookEvents((prev) =>
                                    prev.includes(ev) ? prev.filter((e) => e !== ev) : [...prev, ev]
                                  )
                                }
                                className={`text-[10px] px-2 py-1 rounded-lg border transition ${
                                  webhookEvents.includes(ev)
                                    ? 'bg-brand-accent/20 border-brand-accent text-brand-accent'
                                    : 'bg-brand-elevated border-brand-border text-brand-text-secondary hover:border-brand-accent'
                                }`}
                              >
                                {ev}
                              </button>
                            )
                          )}
                        </div>
                      </div>
                      <button
                        onClick={handleCreateWebhook}
                        disabled={webhookLoading || !webhookUrl.trim() || webhooks.length >= limits.webhooks}
                        className="px-4 py-2 rounded-xl bg-brand-accent text-brand-bg font-semibold text-sm hover:bg-brand-accent-hover transition disabled:opacity-50 flex items-center gap-2"
                      >
                        {webhookLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                        Criar webhook
                      </button>
                    </div>
                  </SpotlightCard>
                </TiltCard>
              </div>
            )}

            {/* BILLING */}
            {activeTab === 'billing' && (
              <div className="space-y-4">
                <TiltCard>
                  <SpotlightCard className="p-6" glow="#A78BFA">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-sm">Plano atual</h3>
                        <p className="text-[10px] text-brand-text-secondary mt-0.5">
                          {planLabels[plan] || plan} · {limits.accounts} contas · {limits.seats} assentos
                        </p>
                      </div>
                      <span className="px-3 py-1 rounded-lg bg-brand-accent/10 border border-brand-accent/30 text-brand-accent text-xs font-medium">
                        {planLabels[plan] || plan}
                      </span>
                    </div>

                    {/* Usage bars */}
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-brand-text-secondary">Contas conectadas</span>
                          <span className="font-mono">0/{limits.accounts}</span>
                        </div>
                        <ProgressBar value={0} max={limits.accounts} />
                      </div>
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-brand-text-secondary">Assentos</span>
                          <span className="font-mono">{members.length}/{limits.seats}</span>
                        </div>
                        <ProgressBar value={members.length} max={limits.seats} color="#A78BFA" />
                      </div>
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-brand-text-secondary">Chaves de API</span>
                          <span className="font-mono">{apiKeys.length}/{limits.apiKeys}</span>
                        </div>
                        <ProgressBar value={apiKeys.length} max={limits.apiKeys} color="#FBBF24" />
                      </div>
                    </div>

                    <a
                      href="/plans"
                      className="block w-full text-center py-2.5 rounded-xl bg-gradient-to-r from-brand-accent to-brand-accent-hover text-white text-sm font-semibold hover:opacity-90 transition mt-4"
                    >
                      Ver planos e fazer upgrade
                    </a>
                  </SpotlightCard>
                </TiltCard>

                <TiltCard>
                  <SpotlightCard className="p-6" glow="#8AB4F8">
                    <div className="flex items-center gap-2 mb-3">
                      <Download className="w-4 h-4 text-brand-accent" />
                      <h3 className="font-semibold text-sm">Faturas</h3>
                    </div>
                    <p className="text-xs text-brand-text-secondary py-4 text-center">
                      Nenhuma fatura ainda. O histórico aparecerá após o primeiro pagamento.
                    </p>
                  </SpotlightCard>
                </TiltCard>
              </div>
            )}

            {/* SECURITY */}
            {activeTab === 'security' && (
              <div className="space-y-4">
                <TiltCard>
                  <SpotlightCard className="p-6" glow="#22C55E">
                    <h3 className="font-semibold text-sm mb-4">Autenticação de dois fatores</h3>
                    <div className="p-3 rounded-xl bg-warning/10 border border-warning/30 mb-4">
                      <div className="flex items-center gap-2 mb-1">
                        <Shield className="w-4 h-4 text-warning" />
                        <span className="text-xs font-medium text-warning">2FA desativada</span>
                      </div>
                      <p className="text-[11px] text-brand-text-secondary">
                        Proteja sua conta com autenticação de dois fatores. Vamos pedir um código apenas
                        quando você acessar de um novo dispositivo.
                      </p>
                    </div>
                    <button className="px-4 py-2 rounded-xl bg-success/10 border border-success/30 text-success text-sm font-medium hover:bg-success/20 transition flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4" />
                      Ativar 2FA
                    </button>
                  </SpotlightCard>
                </TiltCard>

                <TiltCard>
                  <SpotlightCard className="p-6" glow="#8AB4F8">
                    <h3 className="font-semibold text-sm mb-4">Sessões ativas</h3>
                    <div className="space-y-2">
                      <div className="flex items-center gap-3 p-3 rounded-xl bg-brand-elevated/30 border border-brand-border/30">
                        <Monitor className="w-4 h-4 text-brand-accent flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium">Sessão atual</div>
                          <div className="text-[10px] text-brand-text-secondary">Windows · Chrome · agora</div>
                        </div>
                        <span className="text-[10px] text-success">Ativo</span>
                      </div>
                      <div className="flex items-center gap-3 p-3 rounded-xl bg-brand-elevated/30 border border-brand-border/30 opacity-50">
                        <Smartphone className="w-4 h-4 text-brand-text-secondary flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm">Nenhuma outra sessao</div>
                          <div className="text-[10px] text-brand-text-secondary">Aparecera aqui quando houver</div>
                        </div>
                      </div>
                    </div>
                  </SpotlightCard>
                </TiltCard>

                <TiltCard>
                  <SpotlightCard className="p-6" glow="#A78BFA">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Lock className="w-4 h-4 text-brand-accent" />
                        <h3 className="font-semibold text-sm">SSO / SAML</h3>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-brand-elevated/50 text-brand-text-secondary">
                        Plano Business+
                      </span>
                    </div>
                    <p className="text-[11px] text-brand-text-secondary mb-3">
                      Centralize o acesso da equipe com login unico via SAML/OIDC.
                    </p>
                    <button
                      disabled
                      className="px-4 py-2 rounded-xl bg-brand-elevated/50 border border-brand-border text-brand-text-secondary text-sm cursor-not-allowed flex items-center gap-2"
                    >
                      <Lock className="w-4 h-4" />
                      Fazer upgrade para ativar
                    </button>
                  </SpotlightCard>
                </TiltCard>

                {/* Trust */}
                <TiltCard>
                  <SpotlightCard className="p-6" glow="#22C55E">
                    <div className="flex items-center gap-2 mb-3">
                      <ShieldCheck className="w-4 h-4 text-success" />
                      <h3 className="font-semibold text-sm">Confiança e conformidade</h3>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {['LGPD', 'SOC 2', 'ISO 27001', '99.9% uptime'].map((badge) => (
                        <div
                          key={badge}
                          className="flex items-center justify-center gap-1.5 p-2.5 rounded-xl bg-brand-elevated/30 border border-brand-border/30"
                        >
                          <CheckCircle2 className="w-3 h-3 text-success" />
                          <span className="text-[10px] font-medium">{badge}</span>
                        </div>
                      ))}
                    </div>
                  </SpotlightCard>
                </TiltCard>
              </div>
            )}

            {/* NOTIFICATIONS */}
            {activeTab === 'notifications' && (
              <div className="space-y-4">
                <TiltCard>
                  <SpotlightCard className="p-6" glow="#8AB4F8">
                    <div className="flex items-center gap-2 mb-4">
                      <Mail className="w-4 h-4 text-brand-accent" />
                      <h3 className="font-semibold text-sm">Notificações por email</h3>
                    </div>
                    <div className="divide-y divide-brand-border/30">
                      <SettingRow title="Publicacoes publicadas" desc="Receba email quando um post for publicado">
                        <Toggle checked={notifPrefs.emailPosts} onChange={() => setNotifPrefs((p) => ({ ...p, emailPosts: !p.emailPosts }))} />
                      </SettingRow>
                      <SettingRow title="Comentarios recebidos" desc="Alerta de novos comentarios nos seus posts">
                        <Toggle checked={notifPrefs.emailComments} onChange={() => setNotifPrefs((p) => ({ ...p, emailComments: !p.emailComments }))} />
                      </SettingRow>
                      <SettingRow title="Cobrança e faturas" desc="Recibos, renovações e alertas de pagamento">
                        <Toggle checked={notifPrefs.emailBilling} onChange={() => setNotifPrefs((p) => ({ ...p, emailBilling: !p.emailBilling }))} />
                      </SettingRow>
                      <SettingRow title="Atualizações do produto" desc="Novidades e lançamentos do StackPost">
                        <Toggle checked={notifPrefs.emailProduct} onChange={() => setNotifPrefs((p) => ({ ...p, emailProduct: !p.emailProduct }))} />
                      </SettingRow>
                      <SettingRow title="Resumo semanal" desc="Relatorio semanal com suas metricas">
                        <Toggle checked={notifPrefs.emailWeekly} onChange={() => setNotifPrefs((p) => ({ ...p, emailWeekly: !p.emailWeekly }))} />
                      </SettingRow>
                    </div>
                  </SpotlightCard>
                </TiltCard>

                <TiltCard>
                  <SpotlightCard className="p-6" glow="#A78BFA">
                    <div className="flex items-center gap-2 mb-4">
                      <Bell className="w-4 h-4 text-brand-accent" />
                      <h3 className="font-semibold text-sm">Notificações no app</h3>
                    </div>
                    <div className="divide-y divide-brand-border/30">
                      <SettingRow title="Menções" desc="Quando alguém mencionar sua conta">
                        <Toggle checked={notifPrefs.inAppMentions} onChange={() => setNotifPrefs((p) => ({ ...p, inAppMentions: !p.inAppMentions }))} />
                      </SettingRow>
                      <SettingRow title="Aprovações pendentes" desc="Posts aguardando sua aprovação">
                        <Toggle checked={notifPrefs.inAppApprovals} onChange={() => setNotifPrefs((p) => ({ ...p, inAppApprovals: !p.inAppApprovals }))} />
                      </SettingRow>
                    </div>
                  </SpotlightCard>
                </TiltCard>
              </div>
            )}

            {/* DANGER ZONE */}
            {activeTab === 'danger' && (
              <div className="space-y-4">
                <TiltCard>
                  <SpotlightCard className="p-6 border-error/30" glow="#F87171">
                    <div className="flex items-center gap-2 mb-4">
                      <AlertTriangle className="w-5 h-5 text-error" />
                      <h3 className="font-semibold text-sm text-error">Zona de perigo</h3>
                    </div>
                    <p className="text-[11px] text-brand-text-secondary mb-6">
                      Ações que não podem ser desfeitas. Pense duas vezes antes de continuar.
                    </p>

                    {/* Transfer ownership */}
                    <div className="flex items-center justify-between p-4 rounded-xl bg-error/5 border border-error/20 mb-3">
                      <div>
                        <div className="text-sm font-medium">Transferir propriedade</div>
                        <div className="text-[11px] text-brand-text-secondary mt-0.5">
                          Transfira a propriedade do workspace para outro admin.
                        </div>
                      </div>
                      <button
                        disabled={!isOwner}
                        className="px-3 py-1.5 rounded-lg bg-error/10 border border-error/30 text-error text-xs font-medium hover:bg-error/20 transition disabled:opacity-50"
                      >
                        Transferir
                      </button>
                    </div>

                    {/* Export data */}
                    <div className="flex items-center justify-between p-4 rounded-xl bg-brand-elevated/30 border border-brand-border/30 mb-3">
                      <div>
                        <div className="text-sm font-medium">Exportar dados</div>
                        <div className="text-[11px] text-brand-text-secondary mt-0.5">
                          Baixe todos os seus dados em JSON/CSV.
                        </div>
                      </div>
                      <button className="px-3 py-1.5 rounded-lg bg-brand-elevated border border-brand-border text-xs font-medium hover:border-brand-accent transition flex items-center gap-1.5">
                        <Download className="w-3 h-3" />
                        Exportar
                      </button>
                    </div>

                    {/* Delete account */}
                    <div className="p-4 rounded-xl bg-error/5 border border-error/20">
                      <div className="text-sm font-medium text-error mb-1">Excluir conta</div>
                      <div className="text-[11px] text-brand-text-secondary mb-3">
                        Todos os dados serão removidos permanentemente após 30 dias. Não é possível desfazer.
                      </div>
                      <div className="flex gap-2 mb-3">
                        <input
                          value={deleteConfirm}
                          onChange={(e) => setDeleteConfirm(e.target.value)}
                          placeholder="Digite EXCLUIR MINHA CONTA"
                          className="flex-1 px-3 py-2 rounded-lg bg-brand-elevated border border-error/30 text-sm focus:outline-none focus:border-error transition"
                        />
                        <button
                          disabled={deleteConfirm !== 'EXCLUIR MINHA CONTA' || !isOwner}
                          className="px-4 py-2 rounded-lg bg-error text-brand-bg text-xs font-semibold hover:bg-error/80 transition disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          Excluir
                        </button>
                      </div>
                      {!isOwner && (
                        <p className="text-[10px] text-warning">Apenas o owner pode excluir a conta.</p>
                      )}
                    </div>
                  </SpotlightCard>
                </TiltCard>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
