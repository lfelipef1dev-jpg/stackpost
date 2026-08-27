'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, X, Zap, Crown, Building2, Star, ChevronRight, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { FadeIn, ScrollReveal, StaggerGroup, StaggerItem } from '@/components/animations';
import Footer from '@/components/Footer';

interface PlanFeature {
  label: string;
  value: string | number | boolean;
  highlight?: boolean;
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
  ctaHref: string;
  features: PlanFeature[];
  included: string[];
}

const plans: Plan[] = [
  {
    id: 'free',
    name: 'Free',
    tagline: 'Para experimentar',
    monthlyPrice: 0,
    yearlyPrice: 0,
    icon: Zap,
    cta: 'Comecar gratis',
    ctaHref: '/register',
    features: [
      { label: 'Posts', value: '20 / mes' },
      { label: 'Comentarios', value: '50 / mes' },
      { label: 'Importacao de posts', value: '5 / conta / mes' },
      { label: 'Importacao de comentarios', value: '25 / post' },
      { label: 'Contas sociais', value: '3' },
      { label: 'Acesso a API', value: true },
      { label: 'Biblioteca de midia', value: true },
      { label: 'Analytics', value: true },
      { label: 'Calendario', value: true },
      { label: 'Postagem em massa', value: true },
      { label: 'Link na bio', value: true },
    ],
    included: [
      'Acesso a API',
      'Biblioteca de midia',
      'Analytics',
      'Calendario',
      'Postagem em massa',
      'Link na bio',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    tagline: 'Para usuarios avancados',
    monthlyPrice: 515,
    yearlyPrice: 5150,
    icon: Sparkles,
    trial: true,
    cta: 'Iniciar teste de 14 dias',
    ctaHref: '/register?plan=pro',
    features: [
      { label: 'Posts', value: '10.000 / mes' },
      { label: 'Comentarios', value: '5.000 / mes' },
      { label: 'Importacao de posts', value: '100 / conta / mes' },
      { label: 'Importacao de comentarios', value: '200 / post' },
      { label: 'Contas sociais', value: 'Ilimitadas' },
      { label: 'Acesso a API', value: true },
      { label: 'Biblioteca de midia', value: true },
      { label: 'Analytics', value: true },
      { label: 'Calendario', value: true },
      { label: 'Postagem em massa', value: true },
      { label: 'Link na bio', value: true },
    ],
    included: [
      'Acesso a API',
      'Biblioteca de midia',
      'Analytics',
      'Calendario',
      'Postagem em massa',
      'Link na bio',
    ],
  },
  {
    id: 'business',
    name: 'Business',
    tagline: 'Para empresas em crescimento',
    monthlyPrice: 2060,
    yearlyPrice: 20600,
    icon: Building2,
    popular: true,
    cta: 'Comecar com Business',
    ctaHref: '/register?plan=business',
    features: [
      { label: 'Posts', value: '100.000 / mes' },
      { label: 'Comentarios', value: '50.000 / mes' },
      { label: 'Importacao de posts', value: '500 / conta / mes' },
      { label: 'Importacao de comentarios', value: '1.000 / post' },
      { label: 'Contas sociais', value: 'Ilimitadas' },
      { label: 'Acesso a API', value: true },
      { label: 'Biblioteca de midia', value: true },
      { label: 'Analytics', value: true },
      { label: 'Calendario', value: true },
      { label: 'Postagem em massa', value: true },
      { label: 'Link na bio', value: true },
    ],
    included: [
      'Acesso a API',
      'Biblioteca de midia',
      'Analytics',
      'Calendario',
      'Postagem em massa',
      'Link na bio',
    ],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    tagline: 'Para grandes organizacoes',
    monthlyPrice: null,
    yearlyPrice: null,
    icon: Crown,
    cta: 'Falar com vendas',
    ctaHref: '/contact',
    features: [
      { label: 'Posts', value: 'Custom' },
      { label: 'Comentarios', value: 'Custom' },
      { label: 'Importacao de posts', value: 'Custom' },
      { label: 'Importacao de comentarios', value: 'Custom' },
      { label: 'Contas sociais', value: 'Ilimitadas' },
      { label: 'Acesso a API', value: true },
      { label: 'Biblioteca de midia', value: true },
      { label: 'Analytics', value: true },
      { label: 'Calendario', value: true },
      { label: 'Postagem em massa', value: true },
      { label: 'Link na bio', value: true },
    ],
    included: [
      'Acesso a API',
      'Biblioteca de midia',
      'Analytics',
      'Calendario',
      'Postagem em massa',
      'Link na bio',
    ],
  },
];

const faqs = [
  {
    q: 'O StackPost cobra por conta social conectada?',
    a: 'Nao. Todos os planos pagos incluem contas sociais ilimitadas. Voce escala por uso de API, posts e armazenamento, nao por numero de contas.',
  },
  {
    q: 'Posso testar antes de pagar?',
    a: 'Sim. O plano free permite conectar contas, publicar e testar a API sem detalhes de pagamento. Os planos Pro e Business oferecem teste gratuito de 14 dias. Voce faz upgrade quando seu uso crescer.',
  },
  {
    q: 'Como funciona a cobranca por uso?',
    a: 'Os planos incluem cotas mensais de posts e armazenamento. Se exceder, voce pode fazer upgrade ou falar com nosso time sobre um plano Enterprise.',
  },
  {
    q: 'Planos Enterprise customizados estao disponiveis?',
    a: 'Sim. Contate nosso time se precisar de limites maiores, SLAs customizados, suporte dedicado, white-label ou termos de cobranca especificos.',
  },
  {
    q: 'Postar no X custa extra?',
    a: 'O X mudou sua API para cobranca por chamada em 2025. Cada post no X custa $0.015, e posts com link custam $0.20. Esses custos sao do X, nao nossos. O saldo pre-pago e visivel no painel de billing.',
  },
  {
    q: 'Os precos sao em reais (BRL)?',
    a: 'Sim. Todos os precos listados estao em reais brasileiros (BRL). O pagamento e processado via Mercado Pago. Para clientes internacionais, entre em contato para cotacao em USD.',
  },
  {
    q: 'O StackPost e uma alternativa ao Ayrshare?',
    a: 'Sim. O StackPost e uma API de redes sociais developer-first para times que querem uma integracao unica entre todas as principais plataformas, com precos transparentes por uso e sem taxas por usuario.',
  },
  {
    q: 'O StackPost e uma alternativa ao Zernio?',
    a: 'Sim. O StackPost e uma alternativa ao Zernio para times que querem contas sociais ilimitadas em todos os planos pagos, com cobranca por uso de API em vez de precos por conta.',
  },
  {
    q: 'O StackPost e uma alternativa ao Buffer, Publer, Metricool ou Postiz?',
    a: 'Sim. O StackPost oferece API unificada para 15 plataformas, MCP server para AI agents, webhooks, analytics historico indefinido, A/B testing, AI caption e multi-user com RBAC - features que essas plataformas nao oferecem.',
  },
];

export default function PlansPage() {
  const router = useRouter();
  const [yearly, setYearly] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [loading, setLoading] = useState(false);

  async function startCheckout(plan: Plan) {
    if (plan.id === 'free') {
      router.push('/register');
      return;
    }
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login?redirect=plans');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/pagamentos/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
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

  return (
    <main className="min-h-screen bg-brand-bg">
      {/* Header */}
      <header className="h-16 border-b border-brand-border bg-brand-surface/50 backdrop-blur-xl sticky top-0 z-20">
        <div className="max-w-7xl mx-auto h-full px-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <img src="/logo.png" alt="StackPost" className="h-14 w-auto" />
          </Link>
          <nav className="hidden md:flex gap-6 text-sm text-brand-text-secondary items-center">
            <Link href="/" className="hover:text-brand-text transition">Inicio</Link>
            <Link href="/plans" className="text-brand-text">Planos</Link>
            <Link href="/login" className="hover:text-brand-text transition">Entrar</Link>
            <Link
              href="/register"
              className="px-4 py-1.5 rounded-lg bg-brand-accent text-brand-bg font-medium hover:bg-brand-accent-hover transition"
            >
              Comecar gratis
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero pricing */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-brand-accent/10 rounded-full blur-[100px]" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 pt-16 pb-8 text-center">
          <FadeIn>
            <span className="text-brand-accent text-sm font-mono tracking-wider uppercase">Planos</span>
          </FadeIn>
          <FadeIn delay={0.06}>
            <h1 className="text-4xl md:text-5xl font-bold mt-4 mb-4">
              Precos transparentes para <span className="text-brand-accent">cada fase</span>
            </h1>
          </FadeIn>
          <FadeIn delay={0.12}>
            <p className="text-brand-text-secondary text-lg max-w-2xl mx-auto mb-8">
              Comece gratis, depois escale conforme o uso. Todos os planos pagos incluem contas sociais ilimitadas em uma unica API.
            </p>
          </FadeIn>
          <FadeIn delay={0.18}>
            <div className="inline-flex items-center gap-3 p-1 rounded-xl bg-brand-surface/50 backdrop-blur border border-brand-border">
              <button
                onClick={() => setYearly(false)}
                className={`px-5 py-2 rounded-lg text-sm font-medium transition ${!yearly ? 'bg-brand-accent text-brand-bg' : 'text-brand-text-secondary hover:text-brand-text'}`}
              >
                Mensal
              </button>
              <button
                onClick={() => setYearly(true)}
                className={`px-5 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2 ${yearly ? 'bg-brand-accent text-brand-bg' : 'text-brand-text-secondary hover:text-brand-text'}`}
              >
                Anual
                <span className="text-xs text-success">-17%</span>
              </button>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Plan cards */}
      <section className="max-w-7xl mx-auto px-4 pb-20">
        <StaggerGroup className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 items-start" stagger={0.08}>
          {plans.map((plan) => {
            const isFree = plan.id === 'free';
            const isPro = plan.id === 'pro';
            const isBusiness = plan.id === 'business';
            const isEnterprise = plan.id === 'enterprise';
            const accent = isFree ? '#94A3B8' : isPro ? '#22D3EE' : isBusiness ? '#8AB4F8' : '#C084FC';

            return (
              <StaggerItem key={plan.id} y={24}>
                <div
                  className="relative rounded-3xl border bg-brand-surface/40 backdrop-blur-sm p-6 flex flex-col h-full transition-all duration-300 hover:-translate-y-1"
                  style={{
                    borderColor: isBusiness ? `${accent}60` : 'var(--brand-border)',
                    boxShadow: isBusiness ? `0 0 40px -12px ${accent}40` : 'none',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = `${accent}80`; e.currentTarget.style.boxShadow = `0 0 40px -8px ${accent}35`; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = isBusiness ? `${accent}60` : 'var(--brand-border)'; e.currentTarget.style.boxShadow = isBusiness ? `0 0 40px -12px ${accent}40` : 'none'; }}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-brand-accent text-brand-bg text-[10px] font-bold tracking-wide uppercase shadow-lg">
                      Mais popular
                    </div>
                  )}
                  {plan.trial && !plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-brand-elevated border border-brand-border text-brand-text text-[10px] font-semibold tracking-wide shadow-lg">
                      14 dias gratis
                    </div>
                  )}

                  <div className="flex items-start justify-between mb-5 min-h-[40px]">
                    <div>
                      <h3 className="text-2xl font-bold tracking-tight">{plan.name}</h3>
                      <p className="text-xs text-brand-text-secondary mt-0.5">{plan.tagline}</p>
                    </div>
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ml-3"
                      style={{ backgroundColor: `${accent}15` }}
                    >
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

                  <button
                    onClick={() => startCheckout(plan)}
                    disabled={loading}
                    className="w-full mb-6 px-5 py-3 rounded-xl font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2"
                    style={{
                      backgroundColor: isBusiness ? accent : 'var(--brand-elevated)',
                      color: isBusiness ? '#0A0A0A' : 'var(--brand-text)',
                      border: `1px solid ${isBusiness ? accent : 'var(--brand-border)'}`,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = isBusiness ? '#A3C4F9' : `${accent}20`;
                      e.currentTarget.style.borderColor = accent;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = isBusiness ? accent : 'var(--brand-elevated)';
                      e.currentTarget.style.borderColor = isBusiness ? accent : 'var(--brand-border)';
                    }}
                  >
                    {plan.id === 'free' ? 'Comecar gratis' : plan.id === 'enterprise' ? 'Falar com vendas' : 'Escolher plano'}
                    <ChevronRight className="w-4 h-4" />
                  </button>

                  <div className="space-y-2.5 flex-1">
                    {plan.features.map((f) => (
                      <div key={f.label} className="flex items-center justify-between py-1.5 border-b border-brand-border/30 last:border-0 text-sm">
                        <div className="flex items-center gap-2 text-brand-text-secondary">
                          {typeof f.value === 'boolean' ? (
                            f.value ? <Check className="w-3.5 h-3.5 text-success" /> : <X className="w-3.5 h-3.5 text-error" />
                          ) : (
                            <span className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: `${accent}25` }} />
                          )}
                          <span>{f.label}</span>
                        </div>
                        {typeof f.value !== 'boolean' && (
                          <span className="font-semibold text-right" style={{ color: f.highlight ? accent : 'var(--brand-text)' }}>{f.value}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </StaggerItem>
            );
          })}
        </StaggerGroup>
      </section>

      {/* Comparison table */}
      <section className="max-w-5xl mx-auto px-4 pb-20">
        <ScrollReveal>
          <div className="p-6 rounded-2xl bg-brand-surface/50 backdrop-blur border border-brand-border">
            <h2 className="text-2xl font-bold mb-6">Comparacao detalhada</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-brand-border">
                    <th className="text-left py-3 px-2 text-brand-text-secondary font-medium">Recurso</th>
                    {plans.map((p) => (
                      <th key={p.id} className={`text-center py-3 px-2 font-semibold ${p.popular ? 'text-brand-accent' : ''}`}>{p.name}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-brand-border/50">
                    <td className="py-3 px-2 text-brand-text-secondary">Preco mensal</td>
                    <td className="text-center py-3 px-2 font-mono">R$ 0</td>
                    <td className="text-center py-3 px-2 font-mono text-brand-accent">R$ 515</td>
                    <td className="text-center py-3 px-2 font-mono">R$ 2.060</td>
                    <td className="text-center py-3 px-2 font-mono">Custom</td>
                  </tr>
                  {plans[0].features.map((_, idx) => (
                    <tr key={idx} className="border-b border-brand-border/50">
                      <td className="py-3 px-2 text-brand-text-secondary">{plans[0].features[idx].label}</td>
                      {plans.map((p) => {
                        const v = p.features[idx].value;
                        return (
                          <td key={p.id} className="text-center py-3 px-2">
                            {typeof v === 'boolean' ? (
                              v ? <Check className="w-4 h-4 text-success mx-auto" /> : <X className="w-4 h-4 text-error mx-auto" />
                            ) : (
                              <span className="font-medium">{v}</span>
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
        </ScrollReveal>
      </section>

      {/* X usage billing */}
      <section className="max-w-3xl mx-auto px-4 pb-16">
        <ScrollReveal className="p-6 rounded-2xl bg-brand-surface/50 backdrop-blur border border-brand-border">
          <h2 className="text-xl font-bold mb-2">Cobranca de uso do X (creditos pre-pagos)</h2>
          <p className="text-sm text-brand-text-secondary mb-4">
            O X mudou sua API para cobranca por chamada em 2025. Os posts no X sao cobrados por uso
            a partir de um saldo pre-pago que voce recarrega no painel de billing.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-brand-border">
                  <th className="text-left py-2 px-3 text-brand-text">Acao</th>
                  <th className="text-right py-2 px-3 text-brand-text">Custo</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-brand-border">
                  <td className="py-2 px-3 text-brand-text-secondary">Post</td>
                  <td className="py-2 px-3 text-right font-mono text-brand-text">$0.015</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 text-brand-text-secondary">Post com link</td>
                  <td className="py-2 px-3 text-right font-mono text-brand-text">$0.20</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-xs text-brand-text-secondary mt-4">
            O composer estima a cobranca antes de publicar. Seu saldo e uso sao visiveis na pagina
            de billing. Se o saldo acabar, os posts no X falham com instrucoes para adicionar fundos,
            enquanto as outras plataformas continuam publicando normalmente.
          </p>
        </ScrollReveal>
      </section>

      {/* Hobbyist */}
      <section className="max-w-3xl mx-auto px-4 pb-16 text-center">
        <ScrollReveal>
          <p className="text-brand-text-secondary">
            Hobbyist e precisa de um plano menor?{' '}
            <a href="mailto:contato@expostacker.com.br" className="text-brand-accent hover:underline">
              Fale com a gente
            </a>{' '}
            e vamos adaptar as suas necessidades.
          </p>
        </ScrollReveal>
      </section>

      {/* Which pricing model */}
      <section className="max-w-3xl mx-auto px-4 pb-16">
        <ScrollReveal className="text-center mb-6">
          <h2 className="text-2xl font-bold mb-3">Qual modelo de cobranca se encaixa?</h2>
          <p className="text-brand-text-secondary">
            Todos os planos sao cobrados por organizacao, nao por usuario ou por conta conectada.
          </p>
        </ScrollReveal>
        <div className="grid md:grid-cols-3 gap-4">
          {[
            { title: 'Por organizacao', desc: 'Cada organizacao tem sua propria cota mensal de posts, comentarios e armazenamento. Times ilimitados dentro da org.' },
            { title: 'Contas ilimitadas', desc: 'Todos os planos pagos incluem contas sociais ilimitadas. Conecte quantas paginas, perfis e canais quiser.' },
            { title: 'Sem taxa por usuario', desc: 'Multi-user com RBAC incluido. Adicione quantos membros precisar, sem custo extra por seat.' },
          ].map((item) => (
            <ScrollReveal key={item.title}>
              <div className="p-5 rounded-xl bg-brand-surface/50 backdrop-blur border border-brand-border hover:border-brand-accent/30 transition h-full">
                <h3 className="font-semibold mb-2 text-brand-text">{item.title}</h3>
                <p className="text-sm text-brand-text-secondary">{item.desc}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="max-w-3xl mx-auto px-4 pb-20">
        <ScrollReveal className="text-center mb-8">
          <h2 className="text-2xl font-bold">Perguntas frequentes</h2>
        </ScrollReveal>
        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <ScrollReveal key={faq.q} delay={i * 0.05}>
              <details className="group p-5 rounded-xl bg-brand-surface/50 backdrop-blur border border-brand-border hover:border-brand-text/20 transition">
                <summary className="cursor-pointer font-medium flex items-center justify-between list-none">
                  {faq.q}
                  <ChevronRight className="w-4 h-4 text-brand-text-secondary group-open:rotate-90 transition" />
                </summary>
                <p className="mt-3 text-sm text-brand-text-secondary">{faq.a}</p>
              </details>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="max-w-7xl mx-auto px-4 py-12 text-center border-t border-brand-border relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[250px] bg-brand-accent/10 rounded-full blur-[100px]" />
        </div>
        <ScrollReveal className="relative">
          <h2 className="text-3xl font-bold mb-6">Pronto para escalar seu conteudo?</h2>
          <p className="text-brand-text-secondary mb-8 max-w-xl mx-auto">
            Teste de graca. Nao precisa de cartao. Mude de plano quando quiser.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-brand-accent text-brand-bg font-semibold hover:bg-brand-accent-hover transition shadow-[0_0_40px_rgba(138,180,248,0.3)]"
          >
            Comecar agora <ChevronRight className="w-4 h-4" />
          </Link>
        </ScrollReveal>
      </section>

      {/* Footer */}
      <Footer />

      {selectedPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={() => setSelectedPlan(null)}>
          <div className="w-full max-w-md p-8 rounded-2xl bg-brand-surface border border-brand-border" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-6">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${selectedPlan.popular ? 'bg-brand-accent/20' : 'bg-brand-elevated'}`}>
                <selectedPlan.icon className={`w-6 h-6 ${selectedPlan.popular ? 'text-brand-accent' : 'text-brand-text-secondary'}`} />
              </div>
              <div>
                <h3 className="text-xl font-bold">{selectedPlan.name}</h3>
                <p className="text-sm text-brand-text-secondary">{selectedPlan.tagline}</p>
              </div>
            </div>

            <div className="mb-6">
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-bold">{formatPrice(selectedPlan)}</span>
                <span className="text-brand-text-secondary text-sm">{formatPeriod(selectedPlan)}</span>
              </div>
              <p className="text-xs text-brand-text-secondary mt-1">por organizacao</p>
            </div>

            <div className="space-y-2 mb-6 max-h-60 overflow-y-auto">
              {selectedPlan.features.map((f) => (
                <div key={f.label} className="flex items-center justify-between text-sm">
                  <span className="text-brand-text-secondary">{f.label}</span>
                  {typeof f.value === 'boolean' ? (
                    f.value ? <Check className="w-4 h-4 text-success" /> : <X className="w-4 h-4 text-error" />
                  ) : (
                    <span className="font-medium text-brand-text">{f.value}</span>
                  )}
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setSelectedPlan(null)}
                className="flex-1 px-4 py-3 rounded-xl border border-brand-border text-brand-text hover:bg-brand-elevated transition"
              >
                Fechar
              </button>
              <button
                onClick={() => startCheckout(selectedPlan)}
                disabled={loading}
                className={`flex-1 px-4 py-3 rounded-xl font-semibold transition ${
                  selectedPlan.popular
                    ? 'bg-brand-accent text-brand-bg hover:bg-brand-accent-hover'
                    : 'bg-brand-elevated border border-brand-border text-brand-text hover:bg-brand-border'
                }`}
              >
                {selectedPlan.id === 'free' ? 'Comecar gratis' : 'Pagar com Mercado Pago'}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
