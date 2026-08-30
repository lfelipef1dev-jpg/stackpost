'use client';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { FadeIn } from '@/components/animations';
import { PlatformIcon } from '@/components/PlatformIcon';
import { PLATFORMS } from '@/lib/platforms';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { CreditCard, Loader2, Check, X, Zap, Sparkles, Building2, Crown, ChevronRight, ArrowRight, TrendingUp, Shield, RefreshCw, Users, HelpCircle, CheckCircle2, Star, Calendar, Clock, MessageCircle, Smartphone } from 'lucide-react';

interface BillingFeature {
  label: string;
  value: string | number | boolean;
}

interface BillingPlan {
  id: string;
  name: string;
  tagline: string;
  monthlyPrice: number | null;
  annualPrice: number | null;
  icon: typeof Zap;
  popular?: boolean;
  accent: string;
  features: BillingFeature[];
  included: string[];
}

function formatBytes(bytes: number) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(i === 0 ? 0 : 1)} ${sizes[i]}`;
}

function AnimatedNumber({ value, prefix = '', suffix = '' }: { value: number; prefix?: string; suffix?: string }) {
  const [display, setDisplay] = useState(0);
  const prev = useRef(0);
  useEffect(() => {
    const start = prev.current;
    const end = value;
    const duration = 800;
    const startTime = performance.now();
    function tick(now: number) {
      const p = Math.min(1, (now - startTime) / duration);
      const ease = 1 - Math.pow(1 - p, 3);
      setDisplay(start + (end - start) * ease);
      if (p < 1) requestAnimationFrame(tick);
      else prev.current = end;
    }
    requestAnimationFrame(tick);
  }, [value]);
  return <span>{prefix}{display.toFixed(2)}{suffix}</span>;
}

function SpotlightCard({ children, className = '', glow = '#6366F1', style }: { children: React.ReactNode; className?: string; glow?: string; style?: React.CSSProperties }) {
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
        ...style,
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

const ORDEM_PLANOS: Record<string, number> = {
  free: 0,
  starter: 1,
  growth: 2,
  scale: 3,
  business: 4,
};

const allFeatures = [
  'Posts / mes',
  'Comentarios / mes',
  'Contas sociais',
  'Usuarios',
  'Workspaces',
  'API, SDK e CLI',
  'Calendario',
  'Link na bio',
  'Upload de midia',
  'AI caption',
  'MCP server',
  'Suporte',
];

const billingPlans: BillingPlan[] = [
  {
    id: 'free',
    name: 'Free',
    tagline: 'Para comecar sem pagar',
    monthlyPrice: 0,
    annualPrice: 0,
    icon: Zap,
    accent: '#94A3B8',
    features: [
      { label: 'Posts / mes', value: '50' },
      { label: 'Comentarios / mes', value: '100' },
      { label: 'Contas sociais', value: '3' },
      { label: 'Usuarios', value: '1' },
      { label: 'Workspaces', value: '1' },
      { label: 'API, SDK e CLI', value: true },
      { label: 'Calendario', value: true },
      { label: 'Link na bio', value: true },
      { label: 'Upload de midia', value: '100 MB' },
      { label: 'AI caption', value: false },
      { label: 'MCP server', value: false },
      { label: 'Suporte', value: 'Comunidade' },
    ],
    included: ['Acesso a API', 'Biblioteca de midia', 'Analytics basico', 'Calendario', 'Postagem manual', 'Link na bio'],
  },
  {
    id: 'starter',
    name: 'Inicial',
    tagline: 'Para criadores e pequenos times',
    monthlyPrice: 39,
    annualPrice: 33,
    icon: Sparkles,
    accent: '#22D3EE',
    features: [
      { label: 'Posts / mes', value: '2.000' },
      { label: 'Comentarios / mes', value: '1.000' },
      { label: 'Contas sociais', value: '5' },
      { label: 'Usuarios', value: '2' },
      { label: 'Workspaces', value: '1' },
      { label: 'API, SDK e CLI', value: true },
      { label: 'Calendario', value: true },
      { label: 'Link na bio', value: true },
      { label: 'Upload de midia', value: '500 MB' },
      { label: 'AI caption', value: false },
      { label: 'MCP server', value: false },
      { label: 'Suporte', value: 'Email' },
    ],
    included: ['Acesso a API', 'Biblioteca de midia', 'Analytics', 'Calendario', 'Postagem em massa', 'Link na bio'],
  },
  {
    id: 'growth',
    name: 'Crescimento',
    tagline: 'Para agencias e SaaS iniciantes',
    monthlyPrice: 89,
    annualPrice: 75,
    icon: Building2,
    popular: true,
    accent: '#A78BFA',
    features: [
      { label: 'Posts / mes', value: '8.000' },
      { label: 'Comentarios / mes', value: '4.000' },
      { label: 'Contas sociais', value: '20' },
      { label: 'Usuarios', value: '5' },
      { label: 'Workspaces', value: '3' },
      { label: 'API, SDK e CLI', value: true },
      { label: 'Calendario', value: true },
      { label: 'Link na bio', value: true },
      { label: 'Upload de midia', value: '2 GB' },
      { label: 'AI caption', value: true },
      { label: 'MCP server', value: false },
      { label: 'Suporte', value: 'Prioritario' },
    ],
    included: ['Acesso a API', 'Biblioteca de midia', 'Analytics', 'Calendario', 'Postagem em massa', 'Link na bio'],
  },
  {
    id: 'scale',
    name: 'Escala',
    tagline: 'Para SaaS e agencias em escala',
    monthlyPrice: 197,
    annualPrice: 167,
    icon: Crown,
    accent: '#60A5FA',
    features: [
      { label: 'Posts / mes', value: '40.000' },
      { label: 'Comentarios / mes', value: '20.000' },
      { label: 'Contas sociais', value: 'Ilimitadas' },
      { label: 'Usuarios', value: '20' },
      { label: 'Workspaces', value: '10' },
      { label: 'API, SDK e CLI', value: true },
      { label: 'Calendario', value: true },
      { label: 'Link na bio', value: true },
      { label: 'Upload de midia', value: '10 GB' },
      { label: 'AI caption', value: true },
      { label: 'MCP server', value: true },
      { label: 'Suporte', value: 'Prioritario' },
    ],
    included: ['Acesso a API', 'Biblioteca de midia', 'Analytics avancado', 'Calendario', 'Postagem em massa', 'Link na bio'],
  },
  {
    id: 'business',
    name: 'Empresarial',
    tagline: 'Para grandes operacoes',
    monthlyPrice: 497,
    annualPrice: 422,
    icon: Crown,
    accent: '#C084FC',
    features: [
      { label: 'Posts / mes', value: '150.000' },
      { label: 'Comentarios / mes', value: '75.000' },
      { label: 'Contas sociais', value: 'Ilimitadas' },
      { label: 'Usuarios', value: 'Ilimitados' },
      { label: 'Workspaces', value: 'Ilimitados' },
      { label: 'API, SDK e CLI', value: true },
      { label: 'Calendario', value: true },
      { label: 'Link na bio', value: true },
      { label: 'Upload de midia', value: '50 GB' },
      { label: 'AI caption', value: true },
      { label: 'MCP server', value: true },
      { label: 'Suporte', value: 'Dedicado' },
    ],
    included: ['Acesso a API', 'Biblioteca de midia', 'Analytics avancado', 'Calendario', 'Postagem em massa', 'Link na bio'],
  },
];

function formatPlanPrice(price: number | null) {
  if (price === null) return 'Custom';
  if (price === 0) return 'R$ 0';
  return `R$ ${price}`;
}

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-2xl bg-brand-surface/40 border border-brand-border/50 overflow-hidden">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between p-5 text-left hover:bg-brand-elevated/30 transition">
        <span className="font-semibold text-sm">{q}</span>
        <ChevronRight className={`w-4 h-4 text-brand-text-secondary transition-transform ${open ? 'rotate-90' : ''}`} />
      </button>
      {open && <div className="px-5 pb-5 text-sm text-brand-text-secondary leading-relaxed">{a}</div>}
    </div>
  );
}

const faqs = [
  { q: 'Posso cancelar a qualquer momento?', a: 'Sim. Nao ha contrato de fidelidade. Voce pode cancelar ou mudar de plano quando quiser, sem multa.' },
  { q: 'Como funciona o teste gratis?', a: 'Planos pagos tem 15 dias de teste gratis. Nao e necessario cartao para comecar. Depois, pague via PIX ou cartao pelo Mercado Pago.' },
  { q: 'O que sao creditos X?', a: 'A API do X/Twitter cobra por post publicado. Voce adiciona creditos e so paga pelo que usar: R$ 0,015 por post de texto e R$ 0,20 por post com link.' },
  { q: 'Posso trocar de plano depois?', a: 'Sim. Ao fazer upgrade, voce mantem todas as contas conectadas, conteudo e dados. O downgrade nao exclui nada, apenas limita os novos usos.' },
  { q: 'Qual a garantia?', a: 'Garantimos 7 dias de reembolso em todos os planos pagos. Se nao gostar, devolvemos 100% do valor.' },
  { q: 'O plano Empresarial e personalizado?', a: 'Sim. O plano Empresarial e para grandes operacoes com volume alto. Entre em contato com vendas para condicoes especiais.' },
];

export default function BillingPage() {
  const router = useRouter();
  const [credits, setCredits] = useState(0);
  const [loading, setLoading] = useState(false);
  const [currentPlan, setCurrentPlan] = useState('free');
  const [organizationCreatedAt, setOrganizationCreatedAt] = useState<string | null>(null);
  const [usage, setUsage] = useState({ posts: { used: 0, limit: 50, remaining: 50 }, comments: { used: 0, limit: 100, remaining: 100 }, uploads: { used: 0, limit: 100 * 1024 * 1024, remaining: 100 * 1024 * 1024 } });
  const [creditAmount, setCreditAmount] = useState(50);
  const [showCreditModal, setShowCreditModal] = useState(false);
  const [isAnnual, setIsAnnual] = useState(false);

  useEffect(() => {
    fetch('/api/usage/monthly')
      .then((res) => res.json())
      .then((data) => {
        const apiPlan = data.plan || 'free';
        const normalizedPlan = billingPlans.some((p) => p.id === apiPlan) ? apiPlan : 'free';
        setCredits(data.credits || 0);
        setCurrentPlan(normalizedPlan);
        setOrganizationCreatedAt(data.organizationCreatedAt || null);
        if (data.posts) setUsage({ posts: data.posts, comments: data.comments, uploads: data.uploads });
      })
      .catch(() => {
        setCurrentPlan('free');
      });
  }, []);

  async function handleUpgrade(planId: string) {
    if (planId === 'free') {
      router.push('/dashboard');
      return;
    }
    if (planId === 'business') {
      window.location.href = 'mailto:contato@stackpost.com.br?subject=Interesse%20no%20plano%20Business';
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/pagamentos/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plano: planId, ciclo: isAnnual ? 'anual' : 'mensal' }),
      });
      const data = await res.json();
      if (res.ok && data.init_point) {
        window.location.href = data.init_point;
      } else {
        alert(data.error || 'Erro ao iniciar pagamento. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  }

  async function addCredits() {
    setLoading(true);
    try {
      const res = await fetch('/api/pagamentos/creditos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ valor: Number(creditAmount) }),
      });
      const data = await res.json();
      if (res.ok && data.init_point) {
        window.location.href = data.init_point;
      } else {
        alert(data.error || 'Erro ao iniciar pagamento de creditos.');
      }
    } finally {
      setLoading(false);
    }
  }

  const nextPayment = billingPlans.find((p) => p.id === currentPlan)?.monthlyPrice ?? null;

  return (
    <div className="min-h-screen bg-brand-bg">
      <Header activeHref="/billing" />

      <main className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-2">Cobranca</h1>
        <p className="text-brand-text-secondary mb-8">Escolha o plano ideal para escalar suas publicacoes.</p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
          {/* Card Plano Atual */}
          <TiltCard className="h-full">
            <SpotlightCard className="h-full p-7 shadow-2xl shadow-brand-accent/5" glow={currentPlan === 'free' ? '#22C55E' : '#6366F1'}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold flex items-center gap-2"><Shield className="w-4 h-4 text-success" /> Voce esta aqui</h2>
                <span className="px-2.5 py-1 rounded-full bg-success/10 text-success text-[10px] font-semibold uppercase tracking-wide border border-success/20">Plano ativo</span>
              </div>
              <div className="text-4xl font-bold capitalize mb-1">{billingPlans.find((p) => p.id === currentPlan)?.name ?? currentPlan}</div>
              <p className="text-sm text-brand-text-secondary mb-4">
                R$ {billingPlans.find((p) => p.id === currentPlan)?.monthlyPrice ?? 'Custom'} /mes · {billingPlans.find((p) => p.id === currentPlan)?.tagline}
              </p>

              <div className="rounded-2xl bg-brand-elevated/50 border border-brand-border/50 p-4 mb-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-[10px] uppercase tracking-wide text-brand-text-secondary mb-1">Posts</div>
                    <div className="font-semibold text-sm">{usage.posts.used.toLocaleString('pt-BR')} / {usage.posts.limit.toLocaleString('pt-BR')}</div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-wide text-brand-text-secondary mb-1">Comentarios</div>
                    <div className="font-semibold text-sm">{usage.comments.used.toLocaleString('pt-BR')} / {usage.comments.limit.toLocaleString('pt-BR')}</div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-wide text-brand-text-secondary mb-1">Upload</div>
                    <div className="font-semibold text-sm">{formatBytes(usage.uploads.used)} / {formatBytes(usage.uploads.limit)}</div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-wide text-brand-text-secondary mb-1">Limite mensal</div>
                    <div className="font-semibold text-sm">{usage.posts.limit.toLocaleString('pt-BR')}</div>
                  </div>
                </div>
              </div>

              <div className="space-y-2.5 mb-5">
                <div className="flex items-center gap-2 text-xs text-success">
                  <Check className="w-4 h-4" />
                  <span>15 plataformas em uma API</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-brand-text-secondary">
                  <Check className="w-4 h-4 text-success" />
                  <span>15 dias de teste em planos pagos</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-brand-text-secondary">
                  <Check className="w-4 h-4 text-success" />
                  <span>Upgrade facil sem perder dados</span>
                </div>
              </div>

              <Link href="#planos" className="w-full block text-center px-4 py-3 rounded-xl bg-brand-elevated border border-brand-border text-sm font-semibold hover:border-brand-accent transition">
                Fazer upgrade
              </Link>
            </SpotlightCard>
          </TiltCard>

          {/* Card Creditos X */}
          <TiltCard className="h-full">
            <SpotlightCard className="h-full p-7 shadow-2xl shadow-brand-accent/5" glow="#F59E0B">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold flex items-center gap-2"><CreditCard className="w-5 h-5 text-warning" /> Creditos X</h2>
                <span className="px-2.5 py-1 rounded-full bg-warning/10 text-warning text-[10px] font-semibold uppercase tracking-wide border border-warning/20">Saldo R$ {credits}</span>
              </div>
              <div className="text-4xl font-bold text-brand-accent mb-1">
                R$ <AnimatedNumber value={credits} />
              </div>
              <p className="text-sm text-brand-text-secondary mb-4">Saldo para publicacoes no X/Twitter</p>

              <div className="rounded-2xl bg-brand-elevated/50 border border-brand-border/50 p-4 mb-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-[10px] uppercase tracking-wide text-brand-text-secondary mb-1">Texto</div>
                    <div className="font-semibold text-sm">R$ 0.015</div>
                    <div className="text-[10px] text-brand-text-secondary">por post</div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-wide text-brand-text-secondary mb-1">Com link</div>
                    <div className="font-semibold text-sm">R$ 0.20</div>
                    <div className="text-[10px] text-brand-text-secondary">por post</div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-wide text-brand-text-secondary mb-1">Posts de texto</div>
                    <div className="font-semibold text-sm">{credits > 0 ? Math.floor(credits / 0.015).toLocaleString('pt-BR') : '0'}</div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-wide text-brand-text-secondary mb-1">Posts com link</div>
                    <div className="font-semibold text-sm">{credits > 0 ? Math.floor(credits / 0.2).toLocaleString('pt-BR') : '0'}</div>
                  </div>
                </div>
              </div>

              <div className="space-y-2.5 mb-5">
                <div className="flex items-center gap-2 text-xs text-success">
                  <Check className="w-4 h-4" />
                  <span>Cobranca apenas pelo X usar</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-brand-text-secondary">
                  <Check className="w-4 h-4 text-success" />
                  <span>Saldo nao expira</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-brand-text-secondary">
                  <Check className="w-4 h-4 text-success" />
                  <span>Recarga rapida via PIX</span>
                </div>
              </div>

              <button onClick={() => setShowCreditModal(true)} disabled={loading} className="w-full px-4 py-3 rounded-xl bg-gradient-to-r from-warning to-amber-500 text-brand-bg font-semibold text-sm hover:opacity-90 transition shadow-lg shadow-warning/20 flex items-center justify-center gap-2">
                <TrendingUp className="w-4 h-4" /> Adicionar creditos
              </button>
            </SpotlightCard>
          </TiltCard>

          {/* Card Proximo Pagamento */}
          <TiltCard className="h-full">
            <SpotlightCard className="h-full p-7 shadow-2xl shadow-brand-accent/5" glow={currentPlan === 'free' ? '#22C55E' : '#EC4899'}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold flex items-center gap-2"><RefreshCw className="w-4 h-4 text-success" /> Pagamento</h2>
                <span className="px-2.5 py-1 rounded-full bg-success/10 text-success text-[10px] font-semibold uppercase tracking-wide border border-success/20">Mensal</span>
              </div>
              <div className="text-4xl font-bold mb-1">
                {currentPlan === 'free' ? 'R$ 0' : <><AnimatedNumber value={nextPayment ?? 0} prefix="R$ " /></>}
              </div>
              <p className="text-sm text-brand-text-secondary mb-4">
                {currentPlan === 'free' ? 'Plano gratuito sem cobranca' : 'Plano ativo, pagamento manual via PIX ou cartao'}
              </p>

              <div className="rounded-2xl bg-brand-elevated/50 border border-brand-border/50 p-4 mb-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-[10px] uppercase tracking-wide text-brand-text-secondary mb-1">Cliente desde</div>
                    <div className="font-semibold text-sm">
                      {organizationCreatedAt ? new Date(organizationCreatedAt).toLocaleDateString('pt-BR') : '-'}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-wide text-brand-text-secondary mb-1">Status</div>
                    <div className="font-semibold text-sm text-success">Ativo</div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-wide text-brand-text-secondary mb-1">Ciclo</div>
                    <div className="font-semibold text-sm">Mensal</div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-wide text-brand-text-secondary mb-1">Renovacao</div>
                    <div className="font-semibold text-sm">Manual</div>
                  </div>
                </div>
              </div>

              <div className="space-y-2.5 mb-5">
                <div className="flex items-center gap-2 text-xs text-success">
                  <Check className="w-4 h-4" />
                  <span>Sem contrato · Cancele quando quiser</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-brand-text-secondary">
                  <Check className="w-4 h-4 text-success" />
                  <span>7 dias de garantia em planos pagos</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-brand-text-secondary">
                  <Check className="w-4 h-4 text-success" />
                  <span>Pagamento seguro via Mercado Pago</span>
                </div>
              </div>

              {currentPlan === 'free' ? (
                <Link href="#planos" className="w-full block text-center px-4 py-3 rounded-xl bg-brand-elevated border border-brand-border text-sm font-semibold hover:border-brand-accent transition">
                  Ver planos pagos
                </Link>
              ) : (
                <Link href="#planos" className="w-full block text-center px-4 py-3 rounded-xl bg-gradient-to-r from-success to-emerald-500 text-brand-bg text-sm font-semibold hover:opacity-90 transition shadow-lg shadow-success/20">
                  Renovar agora
                </Link>
              )}
            </SpotlightCard>
          </TiltCard>
        </div>

        {/* Planos */}
        <section id="planos" className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold mb-3">Escolha seu plano</h2>
            <p className="text-brand-text-secondary max-w-2xl mx-auto mb-6">Comece gratis. Escale quando precisar. Pague apenas pelo que usar.</p>

            <div className="inline-flex items-center gap-2 p-1.5 rounded-2xl bg-brand-elevated border border-brand-border/50">
              <button
                onClick={() => setIsAnnual(false)}
                className={`px-5 py-2 rounded-xl text-sm font-semibold transition ${!isAnnual ? 'bg-brand-accent text-brand-bg' : 'text-brand-text-secondary hover:text-brand-text'}`}
              >
                Mensal
              </button>
              <button
                onClick={() => setIsAnnual(true)}
                className={`px-5 py-2 rounded-xl text-sm font-semibold transition flex items-center gap-2 ${isAnnual ? 'bg-brand-accent text-brand-bg' : 'text-brand-text-secondary hover:text-brand-text'}`}
              >
                Anual <span className="text-[10px] bg-success/20 text-success px-1.5 py-0.5 rounded-full">-15%</span>
              </button>
            </div>
            {isAnnual && <p className="text-xs text-brand-text-secondary mt-3">No anual voce paga 12x o valor acima e economiza 2 meses.</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5 items-stretch">
            {billingPlans.map((plan, index) => {
              const isCurrent = currentPlan === plan.id;
              const isFree = plan.id === 'free';
              const isLower = ORDEM_PLANOS[currentPlan] >= ORDEM_PLANOS[plan.id];
              const price = isAnnual ? plan.annualPrice : plan.monthlyPrice;
              const oldPrice = isAnnual ? plan.monthlyPrice : null;

              return (
                <TiltCard key={plan.id} className="h-full">
                  <SpotlightCard
                    className="h-full p-6 flex flex-col"
                    glow={plan.accent}
                    style={{ borderColor: isCurrent || plan.popular ? `${plan.accent}60` : undefined }}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <plan.icon className="w-5 h-5" style={{ color: plan.accent }} />
                      {isCurrent && (
                        <span className="px-2 py-0.5 rounded-full bg-success/10 text-success text-[10px] font-semibold border border-success/20">Plano atual</span>
                      )}
                      {plan.popular && !isCurrent && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold border" style={{ backgroundColor: `${plan.accent}15`, color: plan.accent, borderColor: `${plan.accent}40` }}>Mais popular</span>
                      )}
                    </div>

                    <h3 className="text-lg font-bold mb-1">{plan.name}</h3>
                    <p className="text-xs text-brand-text-secondary mb-4">{plan.tagline}</p>

                    <div className="mb-4">
                      <div className="text-3xl font-bold flex items-baseline gap-2">
                        {formatPlanPrice(price)}
                        <span className="text-sm font-normal text-brand-text-secondary">/mes</span>
                      </div>
                      {isAnnual && oldPrice && (
                        <div className="text-xs text-brand-text-secondary line-through">R$ {oldPrice}/mes</div>
                      )}
                    </div>

                    <div className="space-y-2 mb-5 flex-1">
                      {plan.features.slice(0, 6).map((feature) => (
                        <div key={feature.label} className="flex items-center gap-2 text-xs">
                          {typeof feature.value === 'boolean' ? (
                            feature.value ? <Check className="w-3.5 h-3.5 text-success" /> : <X className="w-3.5 h-3.5 text-brand-text-secondary" />
                          ) : (
                            <Check className="w-3.5 h-3.5 text-success" />
                          )}
                          <span className={typeof feature.value === 'boolean' && !feature.value ? 'text-brand-text-secondary' : 'text-brand-text'}>
                            {feature.label}: <span className="font-semibold">{String(feature.value)}</span>
                          </span>
                        </div>
                      ))}
                    </div>

                    <button
                      onClick={() => handleUpgrade(plan.id)}
                      disabled={loading || isCurrent}
                      className={`w-full mt-auto px-4 py-2.5 rounded-xl text-sm font-semibold transition flex items-center justify-center gap-1.5 ${
                        isCurrent
                          ? 'bg-brand-elevated border border-brand-border text-brand-text-secondary cursor-not-allowed'
                          : isFree
                          ? 'bg-brand-elevated border border-brand-border text-brand-text hover:border-brand-accent'
                          : 'text-brand-bg hover:opacity-90 shadow-lg'
                      }`}
                      style={!isCurrent && !isFree ? { backgroundImage: `linear-gradient(to right, ${plan.accent}, ${plan.accent}dd)` } : undefined}
                      onMouseEnter={(e) => {
                        if (!isCurrent) {
                          e.currentTarget.style.backgroundImage = `linear-gradient(to right, ${plan.accent}, ${plan.accent})`;
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isCurrent) {
                          e.currentTarget.style.backgroundImage = `linear-gradient(to right, ${plan.accent}, ${plan.accent}dd)`;
                        }
                      }}
                    >
                      {isCurrent ? 'Plano atual' : isFree ? 'Comecar gratis' : plan.id === 'business' ? 'Falar com vendas' : 'Escolher plano'}
                      {!isFree && !isCurrent && plan.id !== 'business' && <ChevronRight className="w-4 h-4" />}
                    </button>
                  </SpotlightCard>
                </TiltCard>
              );
            })}
          </div>
        </section>

        {/* Comparativo */}
        <section className="mb-16 max-w-5xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold mb-3">Compare todos os recursos</h2>
            <p className="text-brand-text-secondary">Veja exatamente o que cada plano oferece.</p>
          </div>
          <div className="rounded-3xl bg-brand-surface/40 border border-brand-border/50 overflow-hidden backdrop-blur-xl">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px]">
                <thead>
                  <tr className="border-b border-brand-border/50">
                    <th className="p-4 text-left text-sm font-semibold text-brand-text-secondary">Recurso</th>
                    {billingPlans.map((p) => (
                      <th key={p.id} className="p-4 text-center text-sm font-semibold min-w-[110px]">{p.name}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {allFeatures.map((feature) => (
                    <tr key={feature} className="border-b border-brand-border/30 last:border-0 hover:bg-brand-elevated/20 transition">
                      <td className="p-4 text-sm text-brand-text-secondary">{feature}</td>
                      {billingPlans.map((plan) => {
                        const f = plan.features.find((x) => x.label === feature);
                        return (
                          <td key={plan.id} className="p-4 text-center text-sm">
                            {f ? (
                              typeof f.value === 'boolean' ? (
                                f.value ? <CheckCircle2 className="w-5 h-5 text-success mx-auto" /> : <span className="text-brand-text-secondary/50">-</span>
                              ) : (
                                <span className="font-semibold">{String(f.value)}</span>
                              )
                            ) : (
                              <span className="text-brand-text-secondary/50">-</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Social proof - plataformas */}
        <section className="mb-16 max-w-5xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-3">Uma API, 15 plataformas</h2>
          <p className="text-brand-text-secondary mb-8">Publique em todas as redes sociais sem trocar de ferramenta.</p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            {PLATFORMS.map((p) => (
              <div key={p.id} className="w-14 h-14 rounded-2xl bg-brand-surface/60 border border-brand-border/50 flex items-center justify-center" style={{ boxShadow: `0 0 20px ${p.color}20` }}>
                <PlatformIcon id={p.id} size={24} color={p.color} />
              </div>
            ))}
          </div>
        </section>

        {/* Trust bar */}
        <section className="max-w-6xl mx-auto px-4 md:px-6 pb-16 pt-12">
          <FadeIn>
            <div className="text-center mb-14">
              <h2 className="text-2xl md:text-3xl font-bold mb-5">Tudo pronto para publicar em escala</h2>
              <p className="text-brand-text-secondary max-w-2xl mx-auto leading-relaxed">Conecte suas contas, importe seu conteudo e comece a publicar em minutos. Sem contrato, sem taxa por conta e com garantia de 7 dias.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="rounded-2xl bg-brand-surface/60 border border-brand-border/50 p-6 text-center">
                <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center mx-auto mb-4"><Shield className="w-6 h-6 text-success" /></div>
                <h3 className="font-semibold mb-1">7 dias de garantia</h3>
                <p className="text-sm text-brand-text-secondary">Nao gostou? Devolvemos 100% do seu dinheiro, sem burocracia.</p>
              </div>
              <div className="rounded-2xl bg-brand-surface/60 border border-brand-border/50 p-6 text-center">
                <div className="w-12 h-12 rounded-xl bg-brand-accent/10 flex items-center justify-center mx-auto mb-4"><Zap className="w-6 h-6 text-brand-accent" /></div>
                <h3 className="font-semibold mb-1">Setup em 10 minutos</h3>
                <p className="text-sm text-brand-text-secondary">Conecte suas contas, importe conteudo e comece a publicar hoje.</p>
              </div>
              <div className="rounded-2xl bg-brand-surface/60 border border-brand-border/50 p-6 text-center">
                <div className="w-12 h-12 rounded-xl bg-warning/10 flex items-center justify-center mx-auto mb-4"><Users className="w-6 h-6 text-warning" /></div>
                <h3 className="font-semibold mb-1">Sem taxa por conta</h3>
                <p className="text-sm text-brand-text-secondary">Voce paga pelo volume de publicacoes, nao por perfil conectado.</p>
              </div>
            </div>

            <div className="mt-10 text-center">
              <p className="text-sm text-brand-text-secondary mb-4">Ainda com duvidas?</p>
              <Link href="/contact" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-elevated border border-brand-border text-brand-text font-semibold hover:border-brand-accent transition">
                Falar com vendas <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </FadeIn>
        </section>

        {/* FAQ */}
        <section className="max-w-3xl mx-auto mb-16">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold mb-3">Perguntas frequentes</h2>
            <p className="text-brand-text-secondary">Tire suas duvidas antes de começar.</p>
          </div>
          <div className="space-y-3">
            {faqs.map((faq) => (
              <FAQItem key={faq.q} q={faq.q} a={faq.a} />
            ))}
          </div>
        </section>
      </main>

      <Footer />

      {/* Modal de creditos */}
      {showCreditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md p-6 rounded-3xl bg-brand-surface border border-brand-border shadow-2xl">
            <h3 className="text-xl font-bold mb-2">Adicionar creditos X</h3>
            <p className="text-sm text-brand-text-secondary mb-6">Escolha o valor para adicionar aos creditos da API do X/Twitter.</p>

            <div className="grid grid-cols-2 gap-3 mb-6">
              {[30, 50, 100, 200, 500].map((opt) => (
                <button
                  key={opt}
                  onClick={() => setCreditAmount(opt)}
                  className={`px-4 py-3 rounded-xl border text-sm font-semibold transition ${creditAmount === opt ? 'bg-brand-accent text-brand-bg border-brand-accent' : 'bg-brand-elevated border-brand-border text-brand-text hover:border-brand-accent'}`}
                >
                  R$ {opt}
                </button>
              ))}
            </div>

            <label className="block text-sm text-brand-text-secondary mb-2">Ou digite um valor personalizado</label>
            <input
              type="number"
              min="30"
              value={creditAmount}
              onChange={(e) => setCreditAmount(Math.max(30, Number(e.target.value)))}
              className="w-full px-4 py-3 rounded-xl bg-brand-elevated border border-brand-border text-brand-text focus:outline-none focus:border-brand-accent mb-6"
            />

            <div className="flex gap-3">
              <button onClick={() => setShowCreditModal(false)} className="flex-1 px-4 py-3 rounded-xl border border-brand-border text-brand-text font-semibold hover:bg-brand-elevated transition">Cancelar</button>
              <button onClick={addCredits} disabled={loading} className="flex-1 px-4 py-3 rounded-xl bg-brand-accent text-brand-bg font-semibold hover:bg-brand-accent-hover transition flex items-center justify-center gap-2">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Continuar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
