'use client';

import Footer from '@/components/Footer';
import Header from '@/components/Header';
import PlanModal from '@/components/PlanModal';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  FileText,
  Calendar,
  Link2,
  Users,
  BarChart3,
  Sparkles,
  Plus,
  Zap,
  Crown,
  ArrowRight,
  Loader2,
  CheckCircle2,
  AlertCircle,
  X,
  Megaphone,
} from 'lucide-react';
import { FaInstagram, FaFacebook, FaLinkedin, FaTiktok, FaYoutube, FaPinterest, FaSnapchat, FaReddit, FaDiscord, FaWhatsapp, FaTelegram, FaTwitch, FaGoogle, FaThreads, FaXTwitter } from 'react-icons/fa6';
import { IconType } from 'react-icons';

function SpotlightCard({ children, className = '', glow = '#6366F1' }: { children: React.ReactNode; className?: string; glow?: string }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [spot, setSpot] = useState({ x: 0, y: 0, active: false });
  const handleMove = (e: React.MouseEvent) => {
    if (!cardRef.current) return;
    const r = cardRef.current.getBoundingClientRect();
    setSpot({ x: e.clientX - r.left, y: e.clientY - r.top, active: true });
  };
  return (
    <div
      ref={cardRef}
      onMouseMove={handleMove}
      onMouseLeave={() => setSpot((s) => ({ ...s, active: false }))}
      className={`relative overflow-hidden rounded-3xl bg-brand-surface/60 backdrop-blur-xl border border-brand-border/50 ${className}`}
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
  const onMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const r = ref.current.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    setStyle({ transform: `perspective(1200px) rotateX(${-y * 1.5}deg) rotateY(${x * 1.5}deg)`, transition: 'transform 0.15s ease-out' });
  };
  const onLeave = () => setStyle({ transform: 'perspective(1200px) rotateX(0) rotateY(0)', transition: 'transform 0.4s ease-out' });
  return (
    <div ref={ref} onMouseMove={onMove} onMouseLeave={onLeave} style={style} className={`will-change-transform ${className}`}>
      {children}
    </div>
  );
}

const planColors: Record<string, string> = {
  free: '#94A3B8',
  starter: '#22D3EE',
  growth: '#A78BFA',
  scale: '#60A5FA',
  business: '#C084FC',
};

const planNames: Record<string, string> = {
  free: 'Free',
  starter: 'Inicial',
  growth: 'Crescimento',
  scale: 'Escala',
  business: 'Empresarial',
};

const platformColors: Record<string, string> = {
  instagram: '#E4405F',
  facebook: '#1877F2',
  linkedin: '#0A66C2',
  x: '#FFFFFF',
  twitter: '#FFFFFF',
  tiktok: '#FF0050',
  youtube: '#FF0000',
  pinterest: '#BD081C',
  threads: '#FFFFFF',
  bluesky: '#0085FF',
  reddit: '#FF4500',
  snapchat: '#FFFC00',
  discord: '#5865F2',
  whatsapp: '#25D366',
  telegram: '#0088CC',
  twitch: '#9146FF',
  google: '#4285F4',
  mastodon: '#6364FF',
  slack: '#4A154B',
};

const platformIcons: Record<string, IconType> = {
  instagram: FaInstagram,
  facebook: FaFacebook,
  linkedin: FaLinkedin,
  x: FaXTwitter,
  twitter: FaXTwitter,
  tiktok: FaTiktok,
  youtube: FaYoutube,
  pinterest: FaPinterest,
  threads: FaThreads,
  bluesky: FaXTwitter,
  reddit: FaReddit,
  snapchat: FaSnapchat,
  discord: FaDiscord,
  whatsapp: FaWhatsapp,
  telegram: FaTelegram,
  twitch: FaTwitch,
  google: FaGoogle,
  mastodon: FaXTwitter,
  slack: FaXTwitter,
};

function AnimatedNumber({ value }: { value: number }) {
  const [display, setDisplay] = useState(0);
  const prev = useRef(0);
  useEffect(() => {
    const start = prev.current;
    const end = value;
    const duration = 700;
    const startTime = performance.now();
    function tick(now: number) {
      const p = Math.min(1, (now - startTime) / duration);
      const ease = 1 - Math.pow(1 - p, 3);
      setDisplay(Math.round(start + (end - start) * ease));
      if (p < 1) requestAnimationFrame(tick);
      else prev.current = end;
    }
    requestAnimationFrame(tick);
  }, [value]);
  return <span>{display.toLocaleString('pt-BR')}</span>;
}

export default function DashboardPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [currentPlan, setCurrentPlan] = useState('free');
  const [usage, setUsage] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    Promise.all([
      fetch('/api/posts').then((r) => r.json()),
      fetch('/api/accounts').then((r) => r.json()),
      fetch('/api/me').then((r) => r.json()),
      fetch('/api/usage/monthly').then((r) => r.json()),
    ])
      .then(([postsData, accountsData, meData, usageData]) => {
        setPosts(Array.isArray(postsData) ? postsData : (postsData.items || []));
        setAccounts(Array.isArray(accountsData) ? accountsData : (accountsData.items || accountsData.accounts || []));
        setUser(meData?.user || null);
        setCurrentPlan(meData?.organization?.plan || 'free');
        setUsage(usageData);
      })
      .catch(() => setCurrentPlan('free'))
      .finally(() => setLoading(false));
  }, [router]);

  const posted = posts.filter((p) => p.status === 'posted').length;
  const scheduled = posts.filter((p) => p.status === 'scheduled').length;
  const drafts = posts.filter((p) => p.status === 'draft').length;

  const metrics = [
    { label: 'Posts Publicados', value: posted, change: '+0%', icon: FileText, color: '#22C55E', glow: '#22C55E' },
    { label: 'Agendados', value: scheduled, change: '+0', icon: Calendar, color: '#F59E0B', glow: '#F59E0B' },
    { label: 'Contas Conectadas', value: accounts.length, change: '+0', icon: Users, color: '#3B82F6', glow: '#3B82F6' },
    { label: 'Rascunhos', value: drafts, change: '+0', icon: FileText, color: '#A78BFA', glow: '#A78BFA' },
  ];

  const planLimit = usage?.posts?.limit || 50;
  const used = usage?.posts?.used || 0;
  const percent = Math.min(100, Math.round((used / planLimit) * 100));

  const quickActions = [
    { label: 'Criar post', href: '/composer', icon: Plus, color: '#22C55E' },
    { label: 'Conectar conta', href: '/accounts', icon: Link2, color: '#3B82F6' },
    { label: 'Ver calendário', href: '/calendar', icon: Calendar, color: '#F59E0B' },
    { label: 'Métricas', href: '/analytics', icon: BarChart3, color: '#A78BFA' },
  ];

  const activationSteps = [
    { label: 'Conectar sua primeira conta', done: accounts.length > 0, href: '/accounts' },
    { label: 'Criar primeiro post', done: posts.length > 0, href: '/composer' },
    { label: 'Agendar uma publicação', done: scheduled > 0, href: '/calendar' },
    { label: 'Publicar para 1 plataforma', done: posted > 0, href: '/composer' },
  ];
  const completedSteps = activationSteps.filter((s) => s.done).length;

  const bannerMessages = [
    ...(!accounts.length ? [{ type: 'warning', text: 'Conecte uma conta social para começar a publicar.', cta: 'Conectar agora', href: '/accounts' }] : []),
    ...(percent >= 80 ? [{ type: 'alert', text: 'Você usou 80% do seu limite mensal de posts.', cta: 'Fazer upgrade', href: '/billing' }] : []),
    ...((currentPlan === 'free' && accounts.length > 0 && percent < 80) ? [{ type: 'info', text: 'Aproveite 15 dias de teste em qualquer plano pago.', cta: 'Ver planos', href: '/billing' }] : []),
  ] as { type: string; text: string; cta: string; href: string }[];
  const activeBanner = bannerMessages[0];

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-bg">
        <Header activeHref="/dashboard" />
        <main className="max-w-7xl mx-auto px-4 py-8 flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-10 h-10 animate-spin text-brand-accent" />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-bg">
      <Header activeHref="/dashboard" />

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Banner contextual */}
        {activeBanner && (
          <div className="mb-6">
            <div className={`rounded-2xl p-4 border flex items-start sm:items-center justify-between gap-4 ${
              activeBanner.type === 'warning' ? 'bg-warning/10 border-warning/30 text-warning' :
              activeBanner.type === 'alert' ? 'bg-error/10 border-error/30 text-error' :
              'bg-brand-accent/10 border-brand-accent/30 text-brand-accent'
            }`}>
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <p className="text-sm font-medium">{activeBanner.text}</p>
              </div>
              <Link href={activeBanner.href} className={`text-sm font-semibold px-4 py-2 rounded-xl flex items-center gap-1 transition ${
                activeBanner.type === 'warning' ? 'bg-warning text-brand-bg hover:bg-warning/90' :
                activeBanner.type === 'alert' ? 'bg-error text-white hover:bg-error/90' :
                'bg-brand-accent text-brand-bg hover:bg-brand-accent-hover'
              }`}>
                {activeBanner.cta} <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}

        {/* Hero */}
        <section className="mb-10 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Bem-vindo de volta{user?.name ? `, ${user.name.split(' ')[0]}` : ''}</h1>
            <p className="text-brand-text-secondary">Aqui está o resumo do seu StackPost hoje.</p>
          </div>
          <Link href="/composer" className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-brand-accent text-brand-bg font-semibold hover:bg-brand-accent-hover transition shadow-lg shadow-brand-accent/20">
            <Plus className="w-5 h-5" /> Criar post
          </Link>
        </section>

        {/* Checklist de ativacao */}
        <div className="mb-10 rounded-3xl bg-brand-surface/60 border border-brand-border/50 p-6 backdrop-blur-xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Zap className="w-5 h-5 text-brand-accent" />
              {completedSteps === activationSteps.length ? 'Setup concluído' : 'Ative seu StackPost'}
            </h2>
            <span className="text-sm text-brand-text-secondary">{completedSteps} de {activationSteps.length} passos</span>
          </div>
          <div className="h-2 w-full rounded-full bg-brand-elevated overflow-hidden mb-5">
            <div className="h-full rounded-full bg-gradient-to-r from-brand-accent to-success transition-all duration-500" style={{ width: `${(completedSteps / activationSteps.length) * 100}%` }} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {activationSteps.map((s) => (
              <Link
                key={s.label}
                href={s.href}
                className={`p-4 rounded-2xl border transition flex items-center gap-3 ${
                  s.done ? 'bg-success/10 border-success/30 text-success' : 'bg-brand-elevated/50 border-brand-border/50 hover:border-brand-accent/50'
                }`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${s.done ? 'bg-success' : 'bg-brand-elevated border border-brand-border'}`}>
                  {s.done ? <CheckCircle2 className="w-4 h-4 text-brand-bg" /> : <span className="text-xs font-bold text-brand-text-secondary">!</span>}
                </div>
                <span className={`text-sm font-medium ${s.done ? 'line-through opacity-70' : 'text-brand-text'}`}>{s.label}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Métricas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {metrics.map((m) => (
            <TiltCard key={m.label}>
              <SpotlightCard className="p-5" glow={m.glow}>
                <div className="flex items-center justify-between mb-3">
                  <m.icon className="w-5 h-5" style={{ color: m.color }} />
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-success/10 text-success border border-success/20">{m.change}</span>
                </div>
                <div className="text-brand-text-secondary text-sm mb-1">{m.label}</div>
                <div className="text-3xl font-bold">
                  <AnimatedNumber value={m.value} />
                </div>
              </SpotlightCard>
            </TiltCard>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
          {/* Uso do plano */}
          <TiltCard className="lg:col-span-2">
            <SpotlightCard className="p-6 h-full" glow={planColors[currentPlan] || '#6366F1'}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${planColors[currentPlan]}15` }}>
                    <Crown className="w-5 h-5" style={{ color: planColors[currentPlan] }} />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold">Plano {planNames[currentPlan] || currentPlan}</h2>
                    <p className="text-xs text-brand-text-secondary">Limite mensal de publicações</p>
                  </div>
                </div>
                <Link href="/billing" className="text-sm font-semibold text-brand-accent hover:text-brand-accent-hover transition flex items-center gap-1">
                  Upgrade <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="text-brand-text-secondary">{used.toLocaleString('pt-BR')} de {planLimit.toLocaleString('pt-BR')} posts</span>
                <span className="font-semibold" style={{ color: percent >= 90 ? '#EF4444' : percent >= 70 ? '#F59E0B' : '#22C55E' }}>{percent}%</span>
              </div>
              <div className="h-3 w-full rounded-full bg-brand-elevated overflow-hidden mb-4">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${percent}%`,
                    background: `linear-gradient(to right, ${planColors[currentPlan]}, ${planColors[currentPlan]}88)`,
                  }}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="rounded-2xl bg-brand-elevated/50 border border-brand-border/50 p-3 text-center">
                  <div className="text-[10px] uppercase tracking-wide text-brand-text-secondary mb-1">Posts</div>
                  <div className="font-semibold">{usage?.posts?.used ?? 0}</div>
                </div>
                <div className="rounded-2xl bg-brand-elevated/50 border border-brand-border/50 p-3 text-center">
                  <div className="text-[10px] uppercase tracking-wide text-brand-text-secondary mb-1">Comentários</div>
                  <div className="font-semibold">{usage?.comments?.used ?? 0}</div>
                </div>
                <div className="rounded-2xl bg-brand-elevated/50 border border-brand-border/50 p-3 text-center">
                  <div className="text-[10px] uppercase tracking-wide text-brand-text-secondary mb-1">Upload</div>
                  <div className="font-semibold">{(usage?.uploads?.used ?? 0) > 0 ? `${(usage.uploads.used / 1024 / 1024).toFixed(0)} MB` : '0 MB'}</div>
                </div>
              </div>
            </SpotlightCard>
          </TiltCard>

          {/* Acoes rapidas */}
          <TiltCard>
            <SpotlightCard className="p-6 h-full" glow="#F59E0B">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><Zap className="w-5 h-5 text-warning" /> Ações rápidas</h2>
              <div className="grid grid-cols-2 gap-3">
                {quickActions.map((a) => (
                  <Link
                    key={a.label}
                    href={a.href}
                    className="p-4 rounded-2xl bg-brand-elevated/50 border border-brand-border/50 hover:border-brand-border transition flex flex-col items-center gap-2 group"
                  >
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${a.color}15` }}>
                      <a.icon className="w-5 h-5" style={{ color: a.color }} />
                    </div>
                    <span className="text-sm font-medium">{a.label}</span>
                  </Link>
                ))}
              </div>
            </SpotlightCard>
          </TiltCard>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Posts recentes - Carrossel */}
          <TiltCard>
            <SpotlightCard className="p-6 h-full" glow="#A78BFA">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold flex items-center gap-2"><FileText className="w-5 h-5 text-brand-accent" /> Posts recentes</h2>
                <Link href="/composer" className="text-sm font-semibold text-brand-accent hover:text-brand-accent-hover transition">Criar</Link>
              </div>

              {posts.length === 0 ? (
                <div className="text-center py-10 px-4">
                  <div className="w-16 h-16 rounded-2xl bg-brand-accent/10 flex items-center justify-center mx-auto mb-4">
                    <Sparkles className="w-8 h-8 text-brand-accent" />
                  </div>
                  <h3 className="font-semibold mb-1">Nenhum post ainda</h3>
                  <p className="text-sm text-brand-text-secondary mb-4">Crie seu primeiro post e publique em todas as suas contas conectadas.</p>

                  <Link href="/composer" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-accent text-brand-bg text-sm font-semibold hover:bg-brand-accent-hover transition">
                    <Plus className="w-4 h-4" /> Criar primeiro post
                  </Link>
                </div>
              ) : (
                <div className="relative group">
                  <div
                    className="hide-scrollbar flex gap-4 overflow-x-auto pb-4 scroll-smooth snap-x snap-mandatory"
                  >
                    {posts.slice(0, 12).map((post: any) => {
                      const thumb = post.media_url || post.uploads?.[0]?.url || post.image_url;
                      const platforms = post.platforms || [];
                      const PlatformIcon = platformIcons[platforms[0]] || FaXTwitter;
                      const platformColor = platformColors[platforms[0]] || '#6366F1';
                      return (
                        <div
                          key={post.id}
                          className="snap-start flex-shrink-0 w-64 rounded-2xl bg-brand-elevated/50 border border-brand-border/50 overflow-hidden hover:border-brand-accent/30 transition flex flex-col"
                        >
                          <div className="h-32 bg-brand-elevated border-b border-brand-border/50 flex items-center justify-center relative">
                            {thumb ? (
                              <img src={thumb} alt={`Thumbnail do post em ${platforms[0] || 'rede social'}`} className="w-full h-full object-cover" loading="lazy" />
                            ) : (
                              <div className="flex flex-col items-center text-brand-text-secondary">
                                <PlatformIcon className="w-10 h-10 mb-2" color={platformColor} />
                                <span className="text-xs uppercase tracking-wide">{platforms[0] || 'Post'}</span>
                              </div>
                            )}
                            <span
                              className={`absolute top-2 right-2 text-[10px] px-2 py-0.5 rounded-full border ${
                                post.status === 'posted'
                                  ? 'bg-success/10 text-success border-success/20'
                                  : post.status === 'scheduled'
                                  ? 'bg-warning/10 text-warning border-warning/20'
                                  : 'bg-brand-text/10 text-brand-text-secondary border-brand-border/50'
                              }`}
                            >
                              {post.status}
                            </span>
                          </div>
                          <div className="p-4 flex-1 flex flex-col">
                            <p className="text-sm line-clamp-3 mb-3">{post.content?.split('\n')[0] || 'Sem conteúdo'}</p>
                            <div className="mt-auto flex items-center justify-between">
                              <span className="text-[10px] text-brand-text-secondary">{post.content?.length || 0} caracteres</span>
                              {post.status !== 'posted' && (
                                <button
                                  onClick={async () => {
                                    await fetch('/api/posts/publish', {
                                      method: 'POST',
                                      body: JSON.stringify({ postId: post.id }),
                                      headers: { 'Content-Type': 'application/json' },
                                    });
                                    window.location.reload();
                                  }}
                                  className="text-xs px-3 py-1.5 rounded-lg bg-brand-accent text-brand-bg font-medium hover:bg-brand-accent-hover whitespace-nowrap"
                                >
                                  Publicar
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </SpotlightCard>
          </TiltCard>

          {/* Contas conectadas */}
          <TiltCard>
            <SpotlightCard className="p-6 h-full" glow="#3B82F6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold flex items-center gap-2"><Users className="w-5 h-5 text-info" /> Contas conectadas</h2>
                <Link href="/accounts" className="text-sm font-semibold text-brand-accent hover:text-brand-accent-hover transition">Gerenciar</Link>
              </div>
              <div className="space-y-3">
                {accounts.length === 0 && (
                  <div className="text-center py-10 px-4">
                    <div className="w-16 h-16 rounded-2xl bg-info/10 flex items-center justify-center mx-auto mb-4">
                      <Link2 className="w-8 h-8 text-info" />
                    </div>
                    <h3 className="font-semibold mb-1">Nenhuma conta conectada</h3>
                    <p className="text-sm text-brand-text-secondary mb-4">Conecte Instagram, LinkedIn ou outras redes para começar.</p>
                    <div className="flex flex-wrap justify-center gap-2">
                      <a href="/api/oauth/meta" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#E4405F] to-[#F77737] text-white text-sm font-semibold hover:opacity-90 transition">
                        <FaInstagram className="w-4 h-4" /> Instagram
                      </a>
                      <a href="/api/oauth/linkedin" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0A66C2] text-white text-sm font-semibold hover:opacity-90 transition">
                        <FaLinkedin className="w-4 h-4" /> LinkedIn
                      </a>
                    </div>
                  </div>
                )}
                {accounts.map((acc: any) => {
                  const Icon = platformIcons[acc.platform] || FaXTwitter;
                  return (
                    <div
                      key={acc.id}
                      className="p-4 rounded-2xl bg-brand-elevated/50 border border-brand-border/50 flex justify-between items-center hover:border-brand-border transition"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${platformColors[acc.platform] || '#6366F1'}15` }}>
                          <Icon className="w-5 h-5" color={platformColors[acc.platform] || '#6366F1'} />
                        </div>
                        <div>
                          <div className="font-medium capitalize">{acc.platform}</div>
                          <div className="text-xs text-brand-text-secondary">{acc.username}</div>
                        </div>
                      </div>
                      <span className="text-xs px-2 py-1 rounded-md bg-success/10 text-success border border-success/20">
                        {acc.status}
                      </span>
                    </div>
                  );
                })}
              </div>
            </SpotlightCard>
          </TiltCard>
        </div>
      </main>

      {showPlanModal && <PlanModal currentPlan={currentPlan} onClose={() => setShowPlanModal(false)} />}
      <Footer />
    </div>
  );
}
