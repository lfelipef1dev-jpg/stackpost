'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Check, X, Zap, Crown, Building2, Sparkles, ChevronRight, ArrowRight, Shield, RefreshCw, Clock, Users, ChevronDown, Lock, Server, TrendingUp, CreditCard } from 'lucide-react';
import Link from 'next/link';
import { FadeIn, ScrollReveal, StaggerGroup, StaggerItem } from '@/components/animations';
import Footer from '@/components/Footer';

interface PlanFeature {
  label: string;
  value: string | number | boolean;
  full?: string;
}

interface Plan {
  id: string;
  name: string;
  tagline: string;
  monthlyPrice: number | null;
  yearlyPrice: number | null;
  icon: typeof Zap;
  popular?: boolean;
  trial?: boolean;
  cta: string;
  features: PlanFeature[];
}

const plans: Plan[] = [
  {
    id: 'free',
    name: 'Free',
    tagline: 'Para começar sem pagar',
    monthlyPrice: 0,
    yearlyPrice: 0,
    icon: Zap,
    cta: 'Criar conta grátis',
    features: [
      { label: 'Volume/mês', value: '50 + 100', full: '50 posts e 100 comentários por mês' },
      { label: 'Contas sociais', value: '3' },
      { label: 'Usuários', value: '1' },
      { label: 'Workspaces', value: '1' },
      { label: 'Plataformas', value: '15' },
      { label: 'API, SDK e CLI', value: true },
      { label: 'Calendário', value: true },
      { label: 'Link na bio', value: true },
      { label: 'Upload de mídia', value: '100 MB' },
      { label: 'AI caption', value: false },
      { label: 'MCP server', value: false },
      { label: 'Suporte', value: 'comunidade' },
    ],
  },
  {
    id: 'starter',
    name: 'Inicial',
    tagline: 'Para criadores e pequenos times',
    monthlyPrice: 39,
    yearlyPrice: 390,
    icon: Sparkles,
    trial: true,
    cta: 'Testar 14 dias grátis',
    features: [
      { label: 'Volume/mês', value: '2k + 1k', full: '2.000 posts e 1.000 comentários por mês' },
      { label: 'Contas sociais', value: '5' },
      { label: 'Usuários', value: '2' },
      { label: 'Workspaces', value: '1' },
      { label: 'Plataformas', value: '15' },
      { label: 'API, SDK e CLI', value: true },
      { label: 'Calendário', value: true },
      { label: 'Link na bio', value: true },
      { label: 'Upload de mídia', value: '500 MB' },
      { label: 'AI caption', value: false },
      { label: 'MCP server', value: false },
      { label: 'Suporte', value: 'e-mail' },
    ],
  },
  {
    id: 'growth',
    name: 'Crescimento',
    tagline: 'Para agências e SaaS iniciantes',
    monthlyPrice: 89,
    yearlyPrice: 890,
    icon: Building2,
    popular: true,
    trial: true,
    cta: 'Testar 14 dias grátis',
    features: [
      { label: 'Volume/mês', value: '8k + 4k', full: '8.000 posts e 4.000 comentários por mês' },
      { label: 'Contas sociais', value: '20' },
      { label: 'Usuários', value: '5' },
      { label: 'Workspaces', value: '3' },
      { label: 'Plataformas', value: '15' },
      { label: 'API, SDK e CLI', value: true },
      { label: 'Calendário', value: true },
      { label: 'Link na bio', value: true },
      { label: 'Upload de mídia', value: '2 GB' },
      { label: 'AI caption', value: true },
      { label: 'MCP server', value: false },
      { label: 'Suporte', value: 'e-mail prior.' },
    ],
  },
  {
    id: 'scale',
    name: 'Escala',
    tagline: 'Para SaaS e agências em escala',
    monthlyPrice: 197,
    yearlyPrice: 1970,
    icon: Crown,
    trial: true,
    cta: 'Escolher Scale',
    features: [
      { label: 'Volume/mês', value: '40k + 20k', full: '40.000 posts e 20.000 comentários por mês' },
      { label: 'Contas sociais', value: 'Ilimitadas' },
      { label: 'Usuários', value: '20' },
      { label: 'Workspaces', value: '10' },
      { label: 'Plataformas', value: '15' },
      { label: 'API, SDK e CLI', value: true },
      { label: 'Calendário', value: true },
      { label: 'Link na bio', value: true },
      { label: 'Upload de mídia', value: '10 GB' },
      { label: 'AI caption', value: true },
      { label: 'MCP server', value: true },
      { label: 'Suporte', value: 'prioritário' },
    ],
  },
  {
    id: 'business',
    name: 'Empresarial',
    tagline: 'Para grandes operacoes',
    monthlyPrice: 497,
    yearlyPrice: 4970,
    icon: Crown,
    cta: 'Solicitar proposta',
    features: [
      { label: 'Volume/mes', value: '150k + 75k', full: '150.000 posts e 75.000 comentarios por mes' },
      { label: 'Contas sociais', value: 'Ilimitadas' },
      { label: 'Usuarios', value: 'Ilimitados' },
      { label: 'Workspaces', value: 'Ilimitados' },
      { label: 'Plataformas', value: '15 + roadmap' },
      { label: 'API, SDK e CLI', value: true },
      { label: 'Calendario', value: true },
      { label: 'Link na bio', value: true },
      { label: 'Upload de midia', value: '50 GB' },
      { label: 'AI caption', value: true },
      { label: 'MCP server', value: true },
      { label: 'Suporte', value: 'dedicado' },
    ],
  },
];

const faqs = [
  { q: 'O StackPost cobra por conta social conectada?', a: 'Nao. Voce escala por volume de posts, nao por numero de perfis. Os planos Scale e Business tem contas ilimitadas.' },
  { q: 'Posso testar antes de pagar?', a: 'Sim. O plano Free e para sempre com 50 posts/mes. Starter, Growth e Scale oferecem 14 dias de teste gratis.' },
  { q: 'Como funciona a cobranca do X?', a: 'O X cobra por post da API oficial. Esse custo e pago com creditos X pre-pagos no painel de billing.' },
  { q: 'Os precos sao em reais?', a: 'Sim. Cobranca via Mercado Pago com PIX e cartao. Sem surpresa de cambio.' },
  { q: 'Preciso contrato ou posso cancelar?', a: 'Cancele quando quiser. Sem contrato, sem multa.' },
  { q: 'Qual a diferenca entre Growth e Scale?', a: 'O Scale entrega 5x mais volume: 40.000 posts vs 8.000 do Growth, alem de MCP server, A/B testing e contas ilimitadas.' },
  { q: 'Tem garantia?', a: 'Sim. 7 dias de garantia em todos os planos pagos. Se nao gostar, devolvemos 100%.' },
  { q: 'Posso migrar de plano a qualquer momento?', a: 'Sim. Mude de plano quando quiser. A cobranca e proporcional ate o fim do ciclo atual.' },
];

export default function PlansPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [yearly, setYearly] = useState(false);
  const [loading, setLoading] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [currentPlan, setCurrentPlan] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/usage/monthly')
      .then((res) => res.json())
      .then((data) => setCurrentPlan(data.plan || null))
      .catch(() => setCurrentPlan(null));
  }, []);

  useEffect(() => {
    const planId = searchParams.get('plan');
    if (!planId) return;
    const plan = plans.find((p) => p.id === planId);
    if (!plan) return;
    doCheckout(plan);
  }, [searchParams, router]);

  async function doCheckout(plan: Plan) {
    if (plan.id === 'free' || plan.id === 'business') {
      router.push(plan.id === 'free' ? '/register' : '/contact');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/pagamentos/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plano: plan.id }),
      });
      const data = await res.json();
      if (res.ok && data.init_point) {
        window.location.href = data.init_point;
      } else {
        alert(data.error || 'Erro ao iniciar pagamento');
      }
    } finally {
      setLoading(false);
    }
  }

  async function startCheckout(plan: Plan) {
    setSelectedPlan(plan);
  }

  function handleContinue() {
    if (!selectedPlan) return;
    doCheckout(selectedPlan);
    setSelectedPlan(null);
  }

  function handleClose() {
    setSelectedPlan(null);
  }

  function formatPrice(plan: Plan) {
    if (plan.monthlyPrice === null) return 'Custom';
    if (plan.monthlyPrice === 0) return 'R$ 0';
    const price = yearly ? plan.yearlyPrice : plan.monthlyPrice;
    return `R$ ${(price ?? 0).toLocaleString('pt-BR')}`;
  }

  function formatPeriod(plan: Plan) {
    if (plan.monthlyPrice === null) return '';
    if (plan.monthlyPrice === 0) return '/mes';
    return yearly ? '/ano' : '/mes';
  }

  const savings = yearly ? 'Economize 17% no anual' : 'Mude para anual e economize 17%';

  return (
    <main className="min-h-screen bg-brand-bg">
      {/* Hero */}
      <section className="relative overflow-hidden pt-24 pb-12 md:pb-16">
        <div className="absolute inset-0 pointer-events-none hidden md:block" aria-hidden="true">
          <div className="absolute top-[-10%] right-[-10%] w-[40rem] h-[40rem] rounded-full bg-gradient-to-br from-brand-accent/10 to-brand-accent-hover/5 blur-[100px]"></div>
          <div className="absolute bottom-[-10%] left-[-10%] w-[30rem] h-[30rem] rounded-full bg-gradient-to-br from-brand-accent/5 to-transparent blur-[100px]"></div>
        </div>
        <div className="relative max-w-6xl mx-auto px-4 md:px-6 text-center">
          <FadeIn>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-success/10 border border-success/30 text-success text-xs font-medium mb-4">
              <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
              Free generoso: 50 posts/mes sem pagar
            </div>
          </FadeIn>
          <FadeIn delay={0.06}>
            <h1 className="font-display text-4xl md:text-6xl font-black leading-[1.05] tracking-[-0.03em] text-brand-text mb-4">
              Pague <span className="text-brand-accent">bem menos</span> e poste mais
            </h1>
          </FadeIn>
          <FadeIn delay={0.12}>
            <p className="text-brand-text-secondary text-lg md:text-xl max-w-2xl mx-auto mb-6">
              Planos a partir de R$39. Nao cobramos por conta social. Cancele quando quiser.
            </p>
          </FadeIn>
          <FadeIn delay={0.16}>
            <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-brand-text-secondary/80 mb-8">
              <div className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-success" /> 14 dias gratis nos planos pagos</div>
              <div className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-success" /> Cancele a qualquer momento</div>
              <div className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-success" /> Sem taxa por conta social</div>
              <div className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-success" /> 7 dias de garantia</div>
            </div>
          </FadeIn>
          <FadeIn delay={0.22}>
            <div className="inline-flex items-center gap-3 p-1.5 rounded-2xl bg-brand-surface/50 border border-brand-border">
              <button
                onClick={() => setYearly(false)}
                className={`px-5 py-2.5 rounded-xl text-sm font-bold transition ${!yearly ? 'bg-brand-accent text-brand-bg' : 'text-brand-text-secondary hover:text-brand-text'}`}
              >
                Mensal
              </button>
              <button
                onClick={() => setYearly(true)}
                className={`px-5 py-2.5 rounded-xl text-sm font-bold transition flex items-center gap-2 ${yearly ? 'bg-brand-accent text-brand-bg' : 'text-brand-text-secondary hover:text-brand-text'}`}
              >
                Anual <span className="text-xs opacity-90">-17%</span>
              </button>
            </div>
            <p className="text-xs text-brand-text-secondary/60 mt-3 font-mono">{savings}</p>
          </FadeIn>
        </div>
      </section>

      {/* Trust bar */}
      <section className="max-w-6xl mx-auto px-4 md:px-6 pb-8">
        <FadeIn>
          <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10 text-xs md:text-sm text-brand-text-secondary/70">
            <div className="flex items-center gap-2"><Shield className="w-4 h-4 text-brand-accent" /> Pagamento seguro</div>
            <div className="flex items-center gap-2"><RefreshCw className="w-4 h-4 text-brand-accent" /> Reembolso em 7 dias</div>
            <div className="flex items-center gap-2"><Clock className="w-4 h-4 text-brand-accent" /> Setup em menos de 10 min</div>
            <div className="flex items-center gap-2"><Users className="w-4 h-4 text-brand-accent" /> Times ilimitados nos planos pagos</div>
          </div>
        </FadeIn>
      </section>

      {/* Plan cards */}
      <section className="max-w-7xl mx-auto px-4 md:px-6 pb-20">
        <StaggerGroup className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-5 items-stretch" stagger={0.06}>
          {plans.map((plan) => {
            const isFree = plan.id === 'free';
            const isGrowth = plan.id === 'growth';
            const isBusiness = plan.id === 'business';
            const isCurrent = currentPlan === plan.id;
            const hasBadge = plan.popular || (plan.trial && !plan.popular) || isCurrent;
            const accent = isFree ? '#94A3B8' : isGrowth ? '#A78BFA' : isBusiness ? '#C084FC' : plan.id === 'starter' ? '#22D3EE' : '#8AB4F8';

            return (
              <StaggerItem key={plan.id} y={24}>
                <div className="relative">
                  {isCurrent && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10 px-4 py-1 rounded-full text-[10px] font-bold tracking-wide uppercase shadow-lg flex items-center gap-1" style={{ backgroundColor: accent, color: '#0A0A0A' }}>
                      <Crown className="w-3 h-3" /> Plano atual
                    </div>
                  )}
                  {plan.popular && !isCurrent && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10 px-4 py-1 rounded-full bg-gradient-to-r from-brand-accent to-brand-accent-hover text-brand-bg text-[10px] font-bold tracking-wide uppercase shadow-lg">
                      Mais popular
                    </div>
                  )}
                  {plan.trial && !plan.popular && !isCurrent && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10 px-4 py-1 rounded-full bg-brand-elevated border border-brand-border text-brand-text text-[10px] font-semibold tracking-wide shadow-lg">
                      14 dias gratis
                    </div>
                  )}
                  <div
                    className={`rounded-3xl border bg-brand-surface/40 backdrop-blur-sm p-6 flex flex-col h-full transition-all duration-300 hover:-translate-y-1 ${hasBadge ? 'pt-9' : ''}`}
                    style={{
                      borderColor: isCurrent ? accent : (isGrowth ? `${accent}60` : 'var(--brand-border)'),
                      boxShadow: isCurrent ? `0 0 40px -8px ${accent}50` : (isGrowth ? `0 0 40px -12px ${accent}40` : 'none'),
                    }}
                  >

                  <div className="flex items-start justify-between mb-5 min-h-[40px]">
                    <div>
                      <h3 className="text-2xl font-bold tracking-tight">{plan.name}</h3>
                      <p className="text-xs text-brand-text-secondary mt-0.5">{plan.tagline}</p>
                    </div>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ml-3" style={{ backgroundColor: `${accent}15` }}>
                      <plan.icon className="w-5 h-5" style={{ color: accent }} />
                    </div>
                  </div>

                  <div className="mb-5">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-4xl font-bold tracking-tight">{formatPrice(plan)}</span>
                      <span className="text-brand-text-secondary text-sm font-medium">{formatPeriod(plan)}</span>
                    </div>
                    <p className="text-xs text-brand-text-secondary mt-1">por organizacao</p>
                  </div>

                  <div className="space-y-2.5 flex-1 mb-5">
                    {plan.features.map((f) => (
                      <div key={f.label} className="flex items-center justify-between py-1.5 border-b border-brand-border/30 last:border-0 text-sm">
                        <div className="flex items-center gap-2 text-brand-text-secondary">
                          {typeof f.value === 'boolean' ? (
                            f.value ? <Check className="w-3.5 h-3.5 text-success" /> : <X className="w-3.5 h-3.5 text-error" />
                          ) : (
                            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: accent }} />
                          )}
                          <span>{f.label}</span>
                        </div>
                        {typeof f.value !== 'boolean' && (
                          <span title={f.full || String(f.value)} className="font-semibold text-right text-brand-text text-xs whitespace-nowrap">{f.value}</span>
                        )}
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => startCheckout(plan)}
                    disabled={loading}
                    className={`w-full mt-auto px-5 py-3 rounded-xl font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 border ${isGrowth ? 'bg-[#A78BFA] text-[#0A0A0A] border-[#A78BFA]' : 'bg-brand-elevated text-brand-text border-brand-border hover:border-brand-accent'}`}
                  >
                    {isCurrent ? 'Plano atual' : plan.cta}
                    {isCurrent ? <Check className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </StaggerItem>
            );
          })}
        </StaggerGroup>
      </section>

      {/* Social proof */}
      <section className="max-w-6xl mx-auto px-4 md:px-6 pb-20">
        <FadeIn>
          <div className="text-center">
            <p className="text-sm text-brand-text-secondary/80 uppercase tracking-wider mb-6">Construido para quem publica em escala</p>
            <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6">
              {['SaaS', 'Agencias', 'E-commerce', 'Fintechs', 'Clinicas', 'Creator economy'].map((segment) => (
                <div key={segment} className="px-4 py-2 rounded-full bg-brand-surface/50 border border-brand-border text-sm font-medium text-brand-text-secondary">
                  {segment}
                </div>
              ))}
            </div>
          </div>
        </FadeIn>
      </section>

      {/* Value stack */}
      <section className="max-w-5xl mx-auto px-4 md:px-6 pb-20">
        <ScrollReveal>
          <div className="text-center mb-10">
            <h2 className="font-display text-2xl md:text-3xl font-bold mb-3">Tudo que voce precisa para vender mais</h2>
            <p className="text-brand-text-secondary">Uma plataforma. Uma API. Todas as redes.</p>
          </div>
        </ScrollReveal>
        <StaggerGroup className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4" stagger={0.05}>
          {[
            { title: 'Unifique 15 redes', desc: 'Publique uma unica vez para Instagram, TikTok, LinkedIn, YouTube, X e mais.' },
            { title: 'Sem cobranca por conta', desc: 'Conecte quantas contas quiser. Voce paga pelo uso, nao pelo tamanho do time.' },
            { title: 'API e SDK prontos', desc: 'Integre em minutos com REST, SDKs e MCP server para seus agents de IA.' },
            { title: 'Agendamento em massa', desc: 'Programe semanas de conteudo em poucos cliques com calendario visual.' },
            { title: 'Primeiro comentario', desc: 'Adicione CTA automatico no primeiro comentario de cada post.' },
            { title: 'Analytics normalizado', desc: 'Acompanhe resultados de todas as plataformas em um so painel.' },
          ].map((item) => (
            <StaggerItem key={item.title}>
              <div className="p-5 rounded-2xl bg-brand-surface/50 backdrop-blur border border-brand-border hover:border-brand-accent/30 transition h-full">
                <Check className="w-5 h-5 text-success mb-3" />
                <h3 className="font-semibold text-brand-text mb-1">{item.title}</h3>
                <p className="text-sm text-brand-text-secondary">{item.desc}</p>
              </div>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </section>

      {/* Competitor comparison */}
      <section className="max-w-5xl mx-auto px-4 md:px-6 pb-20">
        <ScrollReveal>
          <div className="text-center mb-8">
            <h2 className="font-display text-2xl md:text-3xl font-bold mb-3">A diferenca para outras ferramentas</h2>
            <p className="text-brand-text-secondary">Pare de pagar por canal e de depender de planilhas.</p>
          </div>
        </ScrollReveal>
        <ScrollReveal>
          <div className="rounded-2xl bg-brand-surface/50 backdrop-blur border border-brand-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-brand-surface/95 backdrop-blur z-10">
                  <tr className="border-b border-brand-border">
                    <th className="text-left py-4 px-4 text-brand-text-secondary font-medium">Diferencial</th>
                    <th className="text-center py-4 px-3 font-bold text-brand-accent bg-brand-accent/5 min-w-[140px]">StackPost</th>
                    <th className="text-center py-4 px-3 font-semibold text-brand-text-secondary min-w-[120px]">Ferramentas tradicionais</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { feature: 'Cobranca por conta social', stackpost: 'Nunca', other: 'Comum' },
                    { feature: 'API unificada nativa', stackpost: 'Sim, em todos os planos', other: 'Paga ou indisponivel' },
                    { feature: 'MCP server e CLI', stackpost: 'Incluido', other: 'Raro' },
                    { feature: 'Suporte em portugues', stackpost: 'Sim', other: 'Apenas em ingles' },
                    { feature: 'Cobranca em reais', stackpost: 'PIX e cartao', other: 'Dolar' },
                    { feature: 'Contas ilimitadas', stackpost: 'Sim, sem pagar por canal', other: 'Cobranca por canal' },
                  ].map((row) => (
                    <tr key={row.feature} className="border-b border-brand-border/50 last:border-0 hover:bg-brand-elevated/30 transition">
                      <td className="py-3.5 px-4 text-brand-text-secondary">{row.feature}</td>
                      <td className="text-center py-3.5 px-3 bg-brand-accent/[0.03]">
                        <span className="font-semibold text-xs text-brand-accent">{row.stackpost}</span>
                      </td>
                      <td className="text-center py-3.5 px-3 text-brand-text-secondary text-xs">{row.other}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* Trust badges */}
      <section className="max-w-5xl mx-auto px-4 md:px-6 pb-20">
        <ScrollReveal>
          <div className="text-center mb-8">
            <h2 className="font-display text-2xl md:text-3xl font-bold mb-3">Seguranca e conformidade</h2>
            <p className="text-brand-text-secondary">Infraestrutura preparada para empresas.</p>
          </div>
        </ScrollReveal>
        <StaggerGroup className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4" stagger={0.05}>
          {[
            { icon: Lock, title: 'Criptografia TLS', desc: 'Toda comunicacao criptografada' },
            { icon: Server, title: 'Cloudflare + Supabase', desc: 'Infra global e banco isolado' },
            { icon: TrendingUp, title: 'Uptime 99.9%', desc: 'Monitoramento continuo' },
            { icon: CreditCard, title: 'Mercado Pago', desc: 'Pagamento seguro com PIX' },
          ].map((b) => (
            <StaggerItem key={b.title}>
              <div className="p-5 rounded-2xl bg-brand-surface/50 backdrop-blur border border-brand-border hover:border-brand-accent/30 transition h-full">
                <b.icon className="w-6 h-6 text-brand-accent mb-3" />
                <h3 className="font-semibold text-brand-text mb-1">{b.title}</h3>
                <p className="text-sm text-brand-text-secondary">{b.desc}</p>
              </div>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </section>

      {/* Comparison table */}
      <section className="max-w-5xl mx-auto px-4 md:px-6 pb-20">
        <ScrollReveal>
          <div className="text-center mb-10">
            <h2 className="font-display text-2xl md:text-3xl font-bold mb-3">Compare os planos</h2>
            <p className="text-brand-text-secondary max-w-2xl mx-auto">Veja exatamente o que cada plano entrega e escolha o melhor para o seu momento.</p>
          </div>
        </ScrollReveal>
        <ScrollReveal>
          <div className="rounded-2xl bg-brand-surface/50 backdrop-blur border border-brand-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-brand-surface/95 backdrop-blur z-10">
                  <tr className="border-b border-brand-border">
                    <th className="text-left py-4 px-4 text-brand-text-secondary font-medium">Recurso</th>
                    {plans.map((p) => (
                      <th
                        key={p.id}
                        className={`text-center py-4 px-3 font-semibold min-w-[100px] ${p.popular ? 'bg-brand-accent/5' : ''}`}
                      >
                        <div className="flex flex-col items-center gap-1">
                          <span className={p.popular ? 'text-brand-accent' : 'text-brand-text'}>{p.name}</span>
                          {p.popular && <span className="text-[10px] uppercase tracking-wider text-brand-accent bg-brand-accent/10 px-2 py-0.5 rounded-full">Recomendado</span>}
                          {p.trial && !p.popular && <span className="text-[10px] text-brand-text-secondary">14 dias gratis</span>}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(() => {
                    const allLabels = Array.from(new Set(plans.flatMap((p) => p.features.map((f) => f.label))));
                    const featureMap = new Map(plans.map((p) => [p.id, new Map(p.features.map((f) => [f.label, f.value]))]));
                    return allLabels.map((label) => (
                      <tr key={label} className="border-b border-brand-border/50 last:border-0 hover:bg-brand-elevated/30 transition">
                        <td className="py-3.5 px-4 text-brand-text-secondary">{label}</td>
                        {plans.map((p) => {
                          const v = featureMap.get(p.id)?.get(label) ?? false;
                          const isPopular = p.popular;
                          return (
                            <td key={p.id} className={`text-center py-3.5 px-3 ${isPopular ? 'bg-brand-accent/[0.02]' : ''}`}>
                              {typeof v === 'boolean' ? (
                                v ? (
                                  <div className="flex items-center justify-center gap-1.5 text-success">
                                    <Check className="w-4 h-4" />
                                    <span className="hidden md:inline text-xs">Sim</span>
                                  </div>
                                ) : (
                                  <div className="flex items-center justify-center gap-1.5 text-brand-text-secondary/40">
                                    <X className="w-4 h-4" />
                                    <span className="hidden md:inline text-xs">Nao</span>
                                  </div>
                                )
                              ) : (
                                <span className={`font-semibold text-xs ${isPopular ? 'text-brand-accent' : 'text-brand-text'}`}>{v}</span>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ));
                  })()}
                </tbody>
              </table>
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* FAQ */}
      <section className="max-w-3xl mx-auto px-4 md:px-6 pb-24">
        <ScrollReveal>
          <h2 className="font-display text-2xl md:text-3xl font-bold mb-3 text-center">Perguntas frequentes</h2>
          <p className="text-brand-text-secondary text-center mb-8">Tudo que voce precisa saber para decidir com seguranca.</p>
        </ScrollReveal>
        <StaggerGroup className="space-y-3" stagger={0.05}>
          {faqs.map((faq, i) => (
            <StaggerItem key={faq.q}>
              <div className="rounded-2xl bg-brand-surface/50 border border-brand-border overflow-hidden transition-all duration-200 hover:border-brand-accent/30">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between gap-4 p-5 text-left"
                >
                  <h3 className="font-semibold text-brand-text">{faq.q}</h3>
                  <ChevronDown className={`w-4 h-4 text-brand-text-secondary shrink-0 transition-transform duration-200 ${openFaq === i ? 'rotate-180' : ''}`} />
                </button>
                <div className={`overflow-hidden transition-all duration-200 ${openFaq === i ? 'max-h-40' : 'max-h-0'}`}>
                  <p className="text-sm text-brand-text-secondary leading-relaxed px-5 pb-5">{faq.a}</p>
                </div>
              </div>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </section>

      {/* Why StackPost */}
      <section className="max-w-6xl mx-auto px-4 md:px-6 pb-24">
        <ScrollReveal>
          <div className="p-8 md:p-12 rounded-3xl bg-gradient-to-br from-brand-surface/80 to-brand-surface/40 border border-brand-border relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-brand-accent/10 rounded-full blur-[100px]" />
            <div className="relative grid md:grid-cols-2 gap-10 items-center">
              <div>
                <h2 className="font-display text-2xl md:text-4xl font-bold mb-4">Feito para quem vende na internet</h2>
                <p className="text-brand-text-secondary mb-6">Nao importa se voce gerencia uma marca, uma agencia ou um SaaS. O StackPost foi pensado para escalar sem que voce precise contratar um time de integracao.</p>
                <div className="flex flex-col gap-3">
                  {[
                    'Conecte quantas contas quiser sem pagar por cada uma',
                    'Publique uma vez e chegue a 15 plataformas simultaneamente',
                    'Automatize com API, SDK, CLI e MCP server',
                    'Suporte humano e documentacao clara em portugues',
                  ].map((item) => (
                    <div key={item} className="flex items-start gap-3">
                      <Check className="w-4 h-4 text-success mt-1 shrink-0" />
                      <span className="text-sm text-brand-text-secondary">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="text-center md:text-right">
                <div className="inline-block text-center md:text-left p-6 rounded-2xl bg-brand-elevated/60 border border-brand-border">
                  <p className="text-xs text-brand-text-secondary uppercase tracking-wider mb-1">ROI medio reportado</p>
                  <p className="text-4xl md:text-5xl font-black text-brand-accent mb-2">4.5x</p>
                  <p className="text-sm text-brand-text-secondary">Reducao de tempo de operacao social</p>
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* CTA */}
      <section className="py-20 border-t border-brand-border text-center">
        <ScrollReveal>
          <div className="max-w-3xl mx-auto px-4">
            <h2 className="font-display text-3xl md:text-4xl font-black tracking-tight text-brand-text mb-4">
              Comece gratis. Escalone quando precisar.
            </h2>
            <p className="text-brand-text-secondary mb-8">Teste por 14 dias. Cancele com um clique. Sem ligacao.</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/register"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-brand-accent text-brand-bg font-bold hover:scale-105 transition-transform duration-200 shadow-[0_0_32px_rgba(138,180,248,0.35)]"
              >
                Criar conta gratis <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl border border-brand-border text-brand-text hover:bg-brand-elevated transition"
              >
                Falar com vendas
              </Link>
            </div>
            <p className="text-xs text-brand-text-secondary/60 mt-4 font-mono">Garantia de 7 dias · Sem contrato · Suporte em portugues</p>
          </div>
        </ScrollReveal>
      </section>

      {/* Modal de confirmacao do plano */}
      {selectedPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="relative w-full max-w-md max-h-[90vh] overflow-y-auto rounded-3xl bg-brand-surface border border-brand-border p-6 md:p-8 shadow-2xl">
            <button onClick={handleClose} className="absolute top-4 right-4 p-2 rounded-full hover:bg-brand-elevated text-brand-text-secondary">
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-2xl font-bold mb-1">{selectedPlan.name}</h3>
            <p className="text-sm text-brand-text-secondary mb-6">{selectedPlan.tagline}</p>

            <div className="mb-6 p-5 rounded-2xl bg-brand-elevated border border-brand-border">
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold">{formatPrice(selectedPlan)}</span>
                <span className="text-brand-text-secondary">{formatPeriod(selectedPlan)}</span>
              </div>
              <p className="text-xs text-brand-text-secondary mt-1">por organizacao · 14 dias gratis · 7 dias de garantia</p>
            </div>

            <ul className="space-y-2.5 mb-6 text-sm">
              {selectedPlan.features.map((f) => (
                <li key={f.label} className="flex items-center justify-between">
                  <span className="text-brand-text-secondary">{f.label}</span>
                  {typeof f.value === 'boolean' ? (
                    f.value ? <Check className="w-4 h-4 text-success" /> : <X className="w-4 h-4 text-error" />
                  ) : (
                    <span className="font-semibold text-brand-text whitespace-nowrap" title={f.full || String(f.value)}>{f.value}</span>
                  )}
                </li>
              ))}
            </ul>

            <div className="flex gap-3">
              <button onClick={handleClose} className="flex-1 px-4 py-3 rounded-xl border border-brand-border text-brand-text hover:bg-brand-elevated transition">
                Voltar
              </button>
              <button onClick={handleContinue} disabled={loading} className="flex-1 px-4 py-3 rounded-xl bg-brand-accent text-brand-bg font-semibold hover:scale-105 transition disabled:opacity-50">
                {loading ? 'Processando...' : selectedPlan.id === 'free' ? 'Criar conta gratis' : 'Continuar'}
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </main>
  );
}
