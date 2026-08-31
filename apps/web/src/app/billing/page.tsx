'use client';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { FadeIn } from '@/components/animations';
import { PlatformIcon } from '@/components/PlatformIcon';
import { PLATFORMS } from '@/lib/platforms';
import { platforms as PLATFORM_CARDS, type PlatformCardData } from '@/components/PlatformCards';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { CreditCard, Loader2, Check, X, Zap, Sparkles, Building2, Crown, ChevronRight, ArrowRight, TrendingUp, Shield, RefreshCw, Users, HelpCircle, CheckCircle2, Star, Calendar, Clock, MessageCircle, Smartphone, ExternalLink } from 'lucide-react';

interface BillingFeature {
  label: string;
  value: string | number | boolean;
}

interface BillingPlan {
  id: string;
  name: string;
  tagline: string;
  description: string;
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
  'Posts / mês',
  'Comentários / mês',
  'Contas sociais',
  'Usuários',
  'Workspaces',
  'API, SDK e CLI',
  'Calendário',
  'Link na bio',
  'Upload de mídia',
  'AI caption',
  'MCP server',
  'Suporte',
];

const billingPlans: BillingPlan[] = [
  {
    id: 'free',
    name: 'Free',
    tagline: 'Para começar sem pagar',
    description: 'Conecte até 3 contas nas 15 plataformas disponíveis. Publique 50 posts e 100 comentários por mês com API completa, calendário e analytics — sem cartão de crédito.',
    monthlyPrice: 0,
    annualPrice: 0,
    icon: Zap,
    accent: '#94A3B8',
    features: [
      { label: 'Posts / mês', value: '50' },
      { label: 'Comentários / mês', value: '100' },
      { label: 'Contas sociais', value: '3' },
      { label: 'Usuários', value: '1' },
      { label: 'Workspaces', value: '1' },
      { label: 'API, SDK e CLI', value: true },
      { label: 'Calendário', value: true },
      { label: 'Link na bio', value: true },
      { label: 'Upload de mídia', value: '100 MB' },
      { label: 'AI caption', value: false },
      { label: 'MCP server', value: false },
      { label: 'Suporte', value: 'Comunidade' },
    ],
    included: ['Acesso a API', 'Biblioteca de mídia', 'Analytics básico', 'Calendário', 'Postagem manual', 'Link na bio'],
  },
  {
    id: 'starter',
    name: 'Inicial',
    tagline: 'Para criadores e pequenos times',
    description: 'Conecte até 5 contas nas 15 plataformas e publique 2.000 posts por mês. Ideal para criadores de conteúdo e pequenos negócios que começam a automatizar publicação e engajamento.',
    monthlyPrice: 39,
    annualPrice: 33,
    icon: Sparkles,
    accent: '#22D3EE',
    features: [
      { label: 'Posts / mês', value: '2.000' },
      { label: 'Comentários / mês', value: '1.000' },
      { label: 'Contas sociais', value: '5' },
      { label: 'Usuários', value: '2' },
      { label: 'Workspaces', value: '1' },
      { label: 'API, SDK e CLI', value: true },
      { label: 'Calendário', value: true },
      { label: 'Link na bio', value: true },
      { label: 'Upload de mídia', value: '500 MB' },
      { label: 'AI caption', value: false },
      { label: 'MCP server', value: false },
      { label: 'Suporte', value: 'Email' },
    ],
    included: ['Acesso a API', 'Biblioteca de mídia', 'Analytics', 'Calendário', 'Postagem em massa', 'Link na bio'],
  },
  {
    id: 'growth',
    name: 'Crescimento',
    tagline: 'Para agências e SaaS iniciantes',
    description: 'Conecte até 20 contas nas 15 plataformas com 8.000 posts e 4.000 comentários mensais. Para times que precisam de calendário editorial, analytics avançado, AI caption e múltiplos workspaces.',
    monthlyPrice: 89,
    annualPrice: 75,
    icon: Building2,
    popular: true,
    accent: '#A78BFA',
    features: [
      { label: 'Posts / mês', value: '8.000' },
      { label: 'Comentários / mês', value: '4.000' },
      { label: 'Contas sociais', value: '20' },
      { label: 'Usuários', value: '5' },
      { label: 'Workspaces', value: '3' },
      { label: 'API, SDK e CLI', value: true },
      { label: 'Calendário', value: true },
      { label: 'Link na bio', value: true },
      { label: 'Upload de mídia', value: '2 GB' },
      { label: 'AI caption', value: true },
      { label: 'MCP server', value: false },
      { label: 'Suporte', value: 'Prioritário' },
    ],
    included: ['Acesso a API', 'Biblioteca de mídia', 'Analytics', 'Calendário', 'Postagem em massa', 'Link na bio'],
  },
  {
    id: 'scale',
    name: 'Escala',
    tagline: 'Para SaaS e agências em escala',
    description: 'Contas ilimitadas nas 15 plataformas e 40.000 posts/mês. Para SaaS e agências que publicam em alto volume com API, SDK, CLI e MCP server completos. Suporte prioritário dedicado.',
    monthlyPrice: 197,
    annualPrice: 167,
    icon: Crown,
    accent: '#60A5FA',
    features: [
      { label: 'Posts / mês', value: '40.000' },
      { label: 'Comentários / mês', value: '20.000' },
      { label: 'Contas sociais', value: 'Ilimitadas' },
      { label: 'Usuários', value: '20' },
      { label: 'Workspaces', value: '10' },
      { label: 'API, SDK e CLI', value: true },
      { label: 'Calendário', value: true },
      { label: 'Link na bio', value: true },
      { label: 'Upload de mídia', value: '10 GB' },
      { label: 'AI caption', value: true },
      { label: 'MCP server', value: true },
      { label: 'Suporte', value: 'Prioritário' },
    ],
    included: ['Acesso a API', 'Biblioteca de mídia', 'Analytics avançado', 'Calendário', 'Postagem em massa', 'Link na bio'],
  },
  {
    id: 'business',
    name: 'Empresarial',
    tagline: 'Para grandes operações',
    description: 'Tudo ilimitado: contas nas 15 plataformas, usuários e workspaces. 150.000 posts/mês com SLA dedicado, MCP server e suporte prioritário. Para grandes operações que precisam de escala e confiabilidade.',
    monthlyPrice: 497,
    annualPrice: 422,
    icon: Crown,
    accent: '#C084FC',
    features: [
      { label: 'Posts / mês', value: '150.000' },
      { label: 'Comentários / mês', value: '75.000' },
      { label: 'Contas sociais', value: 'Ilimitadas' },
      { label: 'Usuários', value: 'Ilimitados' },
      { label: 'Workspaces', value: 'Ilimitados' },
      { label: 'API, SDK e CLI', value: true },
      { label: 'Calendário', value: true },
      { label: 'Link na bio', value: true },
      { label: 'Upload de mídia', value: '50 GB' },
      { label: 'AI caption', value: true },
      { label: 'MCP server', value: true },
      { label: 'Suporte', value: 'Dedicado' },
    ],
    included: ['Acesso a API', 'Biblioteca de mídia', 'Analytics avançado', 'Calendário', 'Postagem em massa', 'Link na bio'],
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
  { q: 'Posso cancelar a qualquer momento?', a: 'Sim. Não há contrato de fidelidade. Você pode cancelar ou mudar de plano quando quiser, sem multa.' },
  { q: 'Como funciona o teste grátis?', a: 'Planos pagos têm 15 dias de teste grátis. Não é necessário cartão para começar. Depois, pague via PIX ou cartão pelo Mercado Pago.' },
  { q: 'O que são créditos X?', a: 'A API do X/Twitter cobra por post publicado. Você adiciona créditos e só paga pelo que usar: R$ 0,015 por post de texto e R$ 0,20 por post com link.' },
  { q: 'Posso trocar de plano depois?', a: 'Sim. Ao fazer upgrade, você mantém todas as contas conectadas, conteúdo e dados. O downgrade não exclui nada, apenas limita os novos usos.' },
  { q: 'Qual a garantia?', a: 'Garantimos 7 dias de reembolso em todos os planos pagos. Se não gostar, devolvemos 100% do valor.' },
  { q: 'O plano Empresarial é personalizado?', a: 'Sim. O plano Empresarial é para grandes operações com volume alto. Entre em contato com vendas para condições especiais.' },
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
  const [selectedPlan, setSelectedPlan] = useState<BillingPlan | null>(null);
  const [selectedPlatform, setSelectedPlatform] = useState<PlatformCardData | null>(null);
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
        alert(data.error || 'Erro ao iniciar pagamento de créditos.');
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
        <h1 className="text-3xl font-bold mb-2">Cobrança</h1>
        <p className="text-brand-text-secondary mb-8">Escolha o plano ideal para escalar suas publicações.</p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
          {/* Card Plano Atual */}
          <TiltCard className="h-full">
            <SpotlightCard className="h-full p-7 flex flex-col shadow-2xl shadow-brand-accent/5" glow={currentPlan === 'free' ? '#22C55E' : '#6366F1'}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold flex items-center gap-2"><Shield className="w-4 h-4 text-success" /> Você está aqui</h2>
                <span className="px-2.5 py-1 rounded-full bg-success/10 text-success text-[10px] font-semibold uppercase tracking-wide border border-success/20">Plano ativo</span>
              </div>
              <div className="text-4xl font-bold capitalize mb-1">{billingPlans.find((p) => p.id === currentPlan)?.name ?? currentPlan}</div>
              <p className="text-sm text-brand-text-secondary mb-4">
                R$ {billingPlans.find((p) => p.id === currentPlan)?.monthlyPrice ?? 'Custom'} /mês · {billingPlans.find((p) => p.id === currentPlan)?.tagline}
              </p>

              <div className="rounded-2xl bg-brand-elevated/50 border border-brand-border/50 p-4 mb-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-[10px] uppercase tracking-wide text-brand-text-secondary mb-1">Posts</div>
                    <div className="font-semibold text-sm">{usage.posts.used.toLocaleString('pt-BR')} / {usage.posts.limit.toLocaleString('pt-BR')}</div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-wide text-brand-text-secondary mb-1">Comentários</div>
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
                  <span>Upgrade fácil sem perder dados</span>
                </div>
              </div>

              <Link href="#planos" className="w-full mt-auto block text-center px-4 py-3 rounded-xl bg-brand-elevated border border-brand-border text-sm font-semibold hover:border-brand-accent transition">
                Fazer upgrade
              </Link>
            </SpotlightCard>
          </TiltCard>

          {/* Card Créditos X */}
          <TiltCard className="h-full">
            <SpotlightCard className="h-full p-7 flex flex-col shadow-2xl shadow-brand-accent/5" glow="#F59E0B">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold flex items-center gap-2"><CreditCard className="w-5 h-5 text-warning" /> Créditos X</h2>
                <span className="px-2.5 py-1 rounded-full bg-warning/10 text-warning text-[10px] font-semibold uppercase tracking-wide border border-warning/20">Saldo R$ {credits}</span>
              </div>
              <div className="text-4xl font-bold text-brand-accent mb-1">
                R$ <AnimatedNumber value={credits} />
              </div>
              <p className="text-sm text-brand-text-secondary mb-4">Saldo para publicações no X/Twitter</p>

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
                  <span>Cobrança apenas ao usar o X</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-brand-text-secondary">
                  <Check className="w-4 h-4 text-success" />
                  <span>Saldo não expira</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-brand-text-secondary">
                  <Check className="w-4 h-4 text-success" />
                  <span>Recarga rápida via PIX</span>
                </div>
              </div>

              <button onClick={() => setShowCreditModal(true)} disabled={loading} className="w-full mt-auto px-4 py-3 rounded-xl bg-gradient-to-r from-warning to-amber-500 text-brand-bg font-semibold text-sm hover:opacity-90 transition shadow-lg shadow-warning/20 flex items-center justify-center gap-2">
                <TrendingUp className="w-4 h-4" /> Adicionar créditos
              </button>
            </SpotlightCard>
          </TiltCard>

          {/* Card Proximo Pagamento */}
          <TiltCard className="h-full">
            <SpotlightCard className="h-full p-7 flex flex-col shadow-2xl shadow-brand-accent/5" glow={currentPlan === 'free' ? '#22C55E' : '#EC4899'}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold flex items-center gap-2"><RefreshCw className="w-4 h-4 text-success" /> Pagamento</h2>
                <span className="px-2.5 py-1 rounded-full bg-success/10 text-success text-[10px] font-semibold uppercase tracking-wide border border-success/20">Mensal</span>
              </div>
              <div className="text-4xl font-bold mb-1">
                {currentPlan === 'free' ? 'R$ 0' : <><AnimatedNumber value={nextPayment ?? 0} prefix="R$ " /></>}
              </div>
              <p className="text-sm text-brand-text-secondary mb-4">
                {currentPlan === 'free' ? 'Plano gratuito sem cobrança' : 'Plano ativo, pagamento manual via PIX ou cartão'}
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
                    <div className="text-[10px] uppercase tracking-wide text-brand-text-secondary mb-1">Renovação</div>
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
                <Link href="#planos" className="w-full mt-auto block text-center px-4 py-3 rounded-xl bg-brand-elevated border border-brand-border text-sm font-semibold hover:border-brand-accent transition">
                  Ver planos pagos
                </Link>
              ) : (
                <Link href="#planos" className="w-full mt-auto block text-center px-4 py-3 rounded-xl bg-gradient-to-r from-success to-emerald-500 text-brand-bg text-sm font-semibold hover:opacity-90 transition shadow-lg shadow-success/20">
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
            <p className="text-brand-text-secondary max-w-2xl mx-auto mb-6">Comece grátis. Escale quando precisar. Pague apenas pelo que usar.</p>

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
            {isAnnual && <p className="text-xs text-brand-text-secondary mt-3">No anual você paga 12x o valor acima e economiza 2 meses.</p>}
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
                    className="h-full p-7 flex flex-col"
                    glow={plan.accent}
                    style={{ borderColor: isCurrent || plan.popular ? `${plan.accent}60` : undefined }}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <plan.icon className="w-5 h-5" style={{ color: plan.accent }} />
                      {isCurrent && (
                        <span className="px-2 py-0.5 rounded-full bg-success/10 text-success text-[10px] font-semibold border border-success/20">Plano atual</span>
                      )}
                      {plan.popular && !isCurrent && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold border" style={{ backgroundColor: `${plan.accent}15`, color: plan.accent, borderColor: `${plan.accent}40` }}>Mais popular</span>
                      )}
                    </div>

                    <h3 className="text-lg font-bold mb-1">{plan.name}</h3>
                    <p className="text-xs text-brand-text-secondary mb-5">{plan.tagline}</p>

                    <div className="mb-5">
                      <div className="text-3xl font-bold flex items-baseline gap-2">
                        {formatPlanPrice(price)}
                        <span className="text-sm font-normal text-brand-text-secondary">/mês</span>
                      </div>
                      {isAnnual && oldPrice && (
                        <div className="text-xs text-brand-text-secondary line-through">R$ {oldPrice}/mês</div>
                      )}
                    </div>

                    <div className="space-y-3 mb-6 flex-1">
                      {plan.features.map((feature) => (
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
                      onClick={() => {
                        if (isFree) {
                          router.push('/dashboard');
                          return;
                        }
                        if (plan.id === 'business') {
                          window.location.href = 'mailto:contato@stackpost.com.br?subject=Interesse%20no%20plano%20Business';
                          return;
                        }
                        if (isCurrent) return;
                        setSelectedPlan(plan);
                      }}
                      disabled={loading || isCurrent}
                      className={`w-full mt-auto px-4 py-3 rounded-xl text-sm font-semibold transition flex items-center justify-center gap-1.5 ${
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
                      {isCurrent ? 'Plano atual' : isFree ? 'Começar grátis' : plan.id === 'business' ? 'Falar com vendas' : 'Escolher plano'}
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
            {PLATFORM_CARDS.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setSelectedPlatform(p)}
                className="w-14 h-14 rounded-2xl bg-brand-surface/60 border border-brand-border/50 flex items-center justify-center transition-all duration-200 hover:scale-110 hover:border-brand-accent/50 cursor-pointer"
                style={{ boxShadow: `0 0 20px ${p.color}20` }}
                aria-label={p.name}
              >
                <PlatformIcon id={p.id} size={24} color={p.color} />
              </button>
            ))}
          </div>
        </section>

        {/* Trust bar */}
        <section className="max-w-6xl mx-auto px-4 md:px-6 pb-16 pt-12">
          <FadeIn>
            <div className="text-center mb-14">
              <h2 className="text-2xl md:text-3xl font-bold mb-5">Tudo pronto para publicar em escala</h2>
              <p className="text-brand-text-secondary max-w-2xl mx-auto leading-relaxed">Conecte suas contas, importe seu conteúdo e comece a publicar em minutos. Sem contrato, sem taxa por conta e com garantia de 7 dias.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="rounded-2xl bg-brand-surface/60 border border-brand-border/50 p-6 text-center">
                <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center mx-auto mb-4"><Shield className="w-6 h-6 text-success" /></div>
                <h3 className="font-semibold mb-1">7 dias de garantia</h3>
                <p className="text-sm text-brand-text-secondary">Não gostou? Devolvemos 100% do seu dinheiro, sem burocracia.</p>
              </div>
              <div className="rounded-2xl bg-brand-surface/60 border border-brand-border/50 p-6 text-center">
                <div className="w-12 h-12 rounded-xl bg-brand-accent/10 flex items-center justify-center mx-auto mb-4"><Zap className="w-6 h-6 text-brand-accent" /></div>
                <h3 className="font-semibold mb-1">Setup em 10 minutos</h3>
                <p className="text-sm text-brand-text-secondary">Conecte suas contas, importe conteúdo e comece a publicar hoje.</p>
              </div>
              <div className="rounded-2xl bg-brand-surface/60 border border-brand-border/50 p-6 text-center">
                <div className="w-12 h-12 rounded-xl bg-warning/10 flex items-center justify-center mx-auto mb-4"><Users className="w-6 h-6 text-warning" /></div>
                <h3 className="font-semibold mb-1">Sem taxa por conta</h3>
                <p className="text-sm text-brand-text-secondary">Você paga pelo volume de publicações, não por perfil conectado.</p>
              </div>
            </div>

            <div className="mt-10 text-center">
              <p className="text-sm text-brand-text-secondary mb-4">Ainda com dúvidas?</p>
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
            <p className="text-brand-text-secondary">Tire suas dúvidas antes de começar.</p>
          </div>
          <div className="space-y-3">
            {faqs.map((faq) => (
              <FAQItem key={faq.q} q={faq.q} a={faq.a} />
            ))}
          </div>
        </section>
      </main>

      <Footer />

      {/* Modal de plataforma (copia exata do homepage) */}
      {selectedPlatform && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedPlatform(null)}
          role="dialog"
          aria-modal="true"
          aria-label={`Detalhes de ${selectedPlatform.name}`}
        >
          <div className="absolute inset-0 bg-brand-bg/80 backdrop-blur-sm" aria-hidden="true" onClick={() => setSelectedPlatform(null)}></div>
          <div
            className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border border-brand-border bg-brand-surface shadow-[0_0_80px_rgba(0,0,0,0.8)] p-6 md:p-10 transform transition-all duration-300 ease-out"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedPlatform(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-brand-elevated text-brand-text hover:text-brand-accent transition-colors"
              aria-label="Fechar"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-4 mb-6">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center border border-brand-border"
                style={{ backgroundColor: `${selectedPlatform.color}15` }}
              >
                <PlatformIcon id={selectedPlatform.id} size={40} color={selectedPlatform.color} className="w-10 h-10 drop-shadow-[0_0_30px_var(--platform-color)]" style={{ '--platform-color': selectedPlatform.color } as React.CSSProperties} />
              </div>
              <div>
                <h3 className="font-display text-2xl md:text-3xl font-black text-brand-text" style={{ color: selectedPlatform.color }}>
                  {selectedPlatform.name}
                </h3>
                <p className="text-sm text-brand-text-secondary">{selectedPlatform.tagline}</p>
              </div>
            </div>

            {/* Mockup de browser */}
            <div className="relative mb-6 rounded-2xl overflow-hidden border border-brand-border">
              <div className="flex items-center gap-2 px-3 py-2.5 bg-brand-surface/80 border-b border-brand-border">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500/80"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-green-500/80"></span>
                <div className="flex-1 ml-2 px-2.5 py-1 rounded-md bg-brand-bg/60 text-[10px] text-brand-text-secondary font-mono truncate border border-brand-border">
                  {selectedPlatform.domain}
                </div>
              </div>
              <div className="h-48 flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${selectedPlatform.color}15 0%, transparent 60%)` }}>
                <PlatformIcon id={selectedPlatform.id} size={80} color={selectedPlatform.color} className="w-20 h-20 drop-shadow-[0_0_50px_var(--platform-color)]" style={{ '--platform-color': selectedPlatform.color } as React.CSSProperties} />
              </div>
            </div>

            <p className="text-brand-text-secondary leading-relaxed mb-6">{selectedPlatform.description}</p>

            <div className="mb-6">
              <h4 className="text-xs font-mono font-bold text-brand-accent uppercase tracking-[0.2em] mb-3">O que é possível publicar</h4>
              <div className="flex flex-wrap gap-2">
                {selectedPlatform.supports.map((s) => (
                  <span key={s} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-brand-border bg-brand-elevated/60 text-xs text-brand-text">
                    <Check className="w-3 h-3 text-success" /> {s}
                  </span>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <h4 className="text-xs font-mono font-bold text-brand-accent uppercase tracking-[0.2em] mb-3">Limites técnicos</h4>
              <div className="grid grid-cols-2 gap-3">
                {selectedPlatform.details.map((d) => (
                  <div key={d.label} className="p-3 rounded-xl bg-brand-elevated/40 border border-brand-border">
                    <span className="text-[10px] text-brand-text-secondary uppercase tracking-wider">{d.label}</span>
                    <span className="block text-sm font-semibold text-brand-text mt-1">{d.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-2xl border border-brand-border bg-brand-elevated/40 mb-6">
              <div className="flex items-center gap-3 mb-4">
                <Users className="w-5 h-5 text-brand-accent" />
                <div>
                  <span className="block text-2xl font-black text-brand-accent font-mono leading-none">{selectedPlatform.metric.value}</span>
                  <span className="text-xs text-brand-text-secondary">{selectedPlatform.metric.label}</span>
                </div>
              </div>
              <a
                href={selectedPlatform.docsHref}
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-bold text-sm transition-transform hover:scale-105"
                style={{ backgroundColor: selectedPlatform.color, color: '#0A0A0A' }}
              >
                Conectar conta <ArrowRight className="w-4 h-4" />
              </a>
            </div>

            <a
              href={selectedPlatform.docsHref}
              className="inline-flex items-center justify-center w-full min-h-[48px] px-4 py-2 border border-brand-border text-brand-text font-semibold text-sm rounded-lg hover:border-brand-accent/60 hover:text-brand-accent transition-colors bg-brand-surface/40"
            >
              Ver documentação <ExternalLink className="w-4 h-4 ml-1" />
            </a>
          </div>
        </div>
      )}

      {/* Modal de confirmacao do plano — versão profissional */}
      <AnimatePresence>
        {selectedPlan && (() => {
          const accent = selectedPlan.accent;
          const contasSociais = selectedPlan.features.find((f) => f.label === 'Contas sociais')?.value;
          const contasTexto = contasSociais === 'Ilimitadas' || contasSociais === 'Ilimitados'
            ? 'contas ilimitadas'
            : `até ${contasSociais} contas`;
          return (
            <motion.div
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setSelectedPlan(null)}
            >
              <div className="absolute inset-0 bg-black/80 backdrop-blur-md" />

              <motion.div
                className="relative w-full max-w-lg rounded-2xl bg-brand-surface border border-brand-border shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 20 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                onClick={(e) => e.stopPropagation()}
                style={{ boxShadow: `0 0 60px ${accent}25, 0 20px 50px rgba(0,0,0,0.5)` }}
              >
                {/* Header compacto sticky */}
                <div
                  className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b border-brand-border/50 backdrop-blur-xl"
                  style={{ background: `linear-gradient(135deg, ${accent}10 0%, var(--brand-surface) 100%)` }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center border shrink-0"
                      style={{ backgroundColor: `${accent}15`, borderColor: `${accent}30` }}
                    >
                      <selectedPlan.icon className="w-5 h-5" style={{ color: accent }} />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-lg font-bold text-brand-text leading-tight truncate">{selectedPlan.name}</h3>
                      <p className="text-xs text-brand-text-secondary truncate">{selectedPlan.tagline}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedPlan(null)}
                    className="p-2 rounded-lg hover:bg-brand-elevated text-brand-text-secondary transition-colors shrink-0"
                    aria-label="Fechar"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Conteúdo com scroll */}
                <div className="overflow-y-auto px-6 py-5 space-y-5">
                  {/* Descrição comercial */}
                  <p className="text-sm text-brand-text leading-relaxed">{selectedPlan.description}</p>

                  {/* Preço */}
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black text-brand-text">
                      {formatPlanPrice(isAnnual ? selectedPlan.annualPrice : selectedPlan.monthlyPrice)}
                    </span>
                    <span className="text-brand-text-secondary text-sm">{isAnnual ? '/ano' : '/mês'}</span>
                  </div>
                  <p className="text-xs text-brand-text-secondary -mt-3">por organização · 14 dias grátis · 7 dias de garantia</p>

                  {/* Features */}
                  <div>
                    <h4 className="text-[11px] font-mono font-bold text-brand-accent uppercase tracking-[0.2em] mb-2">O que está incluído</h4>
                    <motion.ul
                      className="space-y-1.5 text-sm"
                      initial="hidden"
                      animate="visible"
                      variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.03 } } }}
                    >
                      {selectedPlan.features.map((f) => (
                        <motion.li
                          key={f.label}
                          className="flex items-center justify-between py-1 border-b border-brand-border/20"
                          variants={{
                            hidden: { opacity: 0, x: -8 },
                            visible: { opacity: 1, x: 0, transition: { duration: 0.25, ease: [0.16, 1, 0.3, 1] } },
                          }}
                        >
                          <span className="text-brand-text-secondary">{f.label}</span>
                          {typeof f.value === 'boolean' ? (
                            f.value ? <Check className="w-3.5 h-3.5 text-success" /> : <X className="w-3.5 h-3.5 text-error" />
                          ) : (
                            <span className="font-semibold text-brand-text whitespace-nowrap text-xs" title={String(f.value)}>{f.value}</span>
                          )}
                        </motion.li>
                      ))}
                    </motion.ul>
                  </div>

                  {/* Redes sociais */}
                  <div
                    className="p-4 rounded-xl border"
                    style={{ background: `${accent}08`, borderColor: `${accent}20` }}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-[11px] font-mono font-bold uppercase tracking-[0.2em]" style={{ color: accent }}>
                        {contasTexto}
                      </h4>
                      <span className="text-[10px] font-mono text-brand-text-secondary">15 plataformas</span>
                    </div>

                    <motion.div
                      className="grid grid-cols-5 gap-2 mb-3"
                      initial="hidden"
                      animate="visible"
                      variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.04 } } }}
                    >
                      {PLATFORMS.map((p) => (
                        <motion.div
                          key={p.id}
                          className="aspect-square rounded-lg bg-brand-surface/80 border border-brand-border flex items-center justify-center"
                          style={{ boxShadow: `0 0 10px ${p.color}15` }}
                          title={p.name}
                          variants={{
                            hidden: { opacity: 0, scale: 0.5 },
                            visible: { opacity: 1, scale: 1, transition: { duration: 0.25, ease: [0.16, 1, 0.3, 1] } },
                          }}
                          whileHover={{ scale: 1.15, boxShadow: `0 0 16px ${p.color}40` }}
                        >
                          <PlatformIcon id={p.id} size={18} color={p.color} className="w-4 h-4" />
                        </motion.div>
                      ))}
                    </motion.div>

                    <p className="text-[11px] text-brand-text-secondary leading-relaxed">
                      Todas as 15 plataformas disponíveis em todos os planos. O limite é apenas a quantidade de contas conectadas ao mesmo tempo.
                    </p>
                  </div>
                </div>

                {/* CTAs sticky no rodapé */}
                <div className="sticky bottom-0 flex gap-3 px-6 py-4 border-t border-brand-border/50 bg-brand-surface/95 backdrop-blur-xl">
                  <button
                    onClick={() => setSelectedPlan(null)}
                    className="flex-1 px-4 py-3 rounded-xl border border-brand-border text-brand-text hover:bg-brand-elevated transition font-semibold text-sm"
                  >
                    Voltar
                  </button>
                  <motion.button
                    onClick={() => { handleUpgrade(selectedPlan.id); setSelectedPlan(null); }}
                    disabled={loading}
                    className="flex-1 px-4 py-3 rounded-xl font-bold text-sm disabled:opacity-50"
                    style={{ backgroundColor: accent, color: '#0A0A0A', boxShadow: `0 0 20px ${accent}30` }}
                    whileHover={{ scale: loading ? 1 : 1.02, boxShadow: `0 0 30px ${accent}50` }}
                    whileTap={{ scale: 0.97 }}
                  >
                    {loading ? 'Processando...' : selectedPlan.id === 'free' ? 'Criar conta grátis' : 'Continuar'}
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          );
        })()}
      </AnimatePresence>

      {/* Modal de créditos */}
      {showCreditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md p-6 rounded-3xl bg-brand-surface border border-brand-border shadow-2xl">
            <h3 className="text-xl font-bold mb-2">Adicionar créditos X</h3>
            <p className="text-sm text-brand-text-secondary mb-6">Escolha o valor para adicionar aos créditos da API do X/Twitter.</p>

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
