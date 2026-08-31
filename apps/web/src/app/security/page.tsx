import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Shield, Lock, KeyRound, RefreshCw, Webhook, FileText, Eye, Zap } from 'lucide-react';
import { ScrollReveal, FadeIn } from '@/components/animations';
import { JsonLd, serviceSchema } from '@/components/JsonLd';
import LandingHeader from '@/components/LandingHeader';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Security - StackPost | Infraestrutura social segura',
  description: 'Seguranca por design: encryption at rest, OAuth 2.0, API keys com hash, HMAC webhooks, RBAC, audit logs, data isolation multi-tenant e rate limiting.',
  alternates: { canonical: '/security' },
};

const jsonLd = serviceSchema('Security Center', 'Infraestrutura social segura por design.', '/security');

const securityItems = [
  { icon: Lock, title: 'Encryption at rest', desc: 'Todos os dados sensiveis criptografados em repouso no banco.' },
  { icon: KeyRound, title: 'OAuth 2.0', desc: 'Autenticacao via OAuth 2.0 para todas as plataformas conectadas.' },
  { icon: Shield, title: 'API keys com hash', desc: 'Chaves de API armazenadas com hash, nunca em texto plano.' },
  { icon: Webhook, title: 'HMAC webhooks', desc: 'Webhooks assinados com HMAC-SHA256 para verificacao de origem.' },
  { icon: Eye, title: 'RBAC', desc: 'Owner, Admin, Editor e Viewer com permissoes granulares.' },
  { icon: FileText, title: 'Audit logs', desc: 'Todas as acoes rastreadas com timestamp, usuario e contexto.' },
  { icon: Shield, title: 'Data isolation multi-tenant', desc: 'Cada workspace isolado, sem vazamento entre tenants.' },
  { icon: Zap, title: 'Rate limiting', desc: 'Limites por chave e por workspace para proteger a infraestrutura.' },
];

const complianceItems = [
  { title: 'LGPD', desc: 'Conformidade com a Lei Geral de Protecao de Dados brasileira.' },
  { title: 'GDPR-ready', desc: 'Estrutura preparada para o regulamento europeu de protecao de dados.' },
  { title: 'DPA disponivel', desc: 'Data Processing Agreement disponivel para clientes enterprise.' },
  { title: 'Data retention configuravel', desc: 'Defina por quanto tempo os dados sao mantidos por workspace.' },
];

export default function SecurityPage() {
  return (
    <main className="min-h-screen bg-brand-bg text-brand-text">
      <JsonLd data={jsonLd} />
      <LandingHeader />

      {/* Hero com glow azul */}
      <section className="relative pt-24 pb-20 px-4 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] rounded-full blur-[140px]" style={{ background: '#8AB4F815' }} />
          <div className="absolute bottom-0 left-1/3 w-[400px] h-[400px] rounded-full blur-[120px]" style={{ background: '#8AB4F810' }} />
          <div className="absolute top-0 left-0 w-[300px] h-[300px] rounded-full blur-[100px]" style={{ background: '#8AB4F808' }} />
        </div>
        <div className="max-w-5xl mx-auto relative text-center">
          <FadeIn>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border mb-6" style={{ borderColor: '#8AB4F840', backgroundColor: '#8AB4F810' }}>
              <Shield className="w-3.5 h-3.5" style={{ color: '#8AB4F8' }} />
              <span className="text-xs font-mono" style={{ color: '#8AB4F8' }}>Security</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight" style={{ color: 'color-mix(in srgb, #8AB4F8 25%, white)' }}>
              Seguranca por design
            </h1>
            <p className="text-lg text-brand-text-secondary max-w-2xl mx-auto">
              Infraestrutura social segura desde o primeiro commit. Encryption, RBAC, audit logs e isolamento multi-tenant em todas as camadas.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* Seguranca por design - grid de 8 itens */}
      <section className="max-w-5xl mx-auto px-4 md:px-6 pb-20">
        <ScrollReveal>
          <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center">Seguranca por design</h2>
        </ScrollReveal>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {securityItems.map((item) => (
            <ScrollReveal key={item.title}>
              <div className="h-full p-6 rounded-2xl bg-brand-surface/60 backdrop-blur-xl border border-brand-border/50">
                <div className="w-10 h-10 rounded-xl bg-brand-accent/10 flex items-center justify-center mb-4">
                  <item.icon className="w-5 h-5 text-brand-accent" />
                </div>
                <h3 className="text-base font-bold text-brand-text mb-2">{item.title}</h3>
                <p className="text-sm text-brand-text-secondary">{item.desc}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* Idempotencia e retry */}
      <section className="max-w-5xl mx-auto px-4 md:px-6 pb-20">
        <ScrollReveal>
          <div className="p-8 rounded-2xl bg-brand-surface/60 backdrop-blur-xl border border-brand-border/50">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-brand-accent/10 flex items-center justify-center">
                <RefreshCw className="w-5 h-5 text-brand-accent" />
              </div>
              <h2 className="text-2xl font-bold text-brand-text">Idempotencia e retry</h2>
            </div>
            <p className="text-brand-text-secondary mb-6">
              Publicacoes sao resilientes por padrao. Nada de posts duplicados por erro de rede.
            </p>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <h3 className="font-semibold text-brand-text mb-1">Chaves de idempotencia</h3>
                <p className="text-sm text-brand-text-secondary">Cada request recebe uma chave unica. Retries nao criam duplicatas.</p>
              </div>
              <div>
                <h3 className="font-semibold text-brand-text mb-1">Retry automatico</h3>
                <p className="text-sm text-brand-text-secondary">Falhas transientes sao retratadas com backoff exponencial.</p>
              </div>
              <div>
                <h3 className="font-semibold text-brand-text mb-1">Replay de webhooks</h3>
                <p className="text-sm text-brand-text-secondary">Reenvie qualquer webhook a partir do dashboard ou da API.</p>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* Compliance */}
      <section className="max-w-5xl mx-auto px-4 md:px-6 pb-20">
        <ScrollReveal>
          <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center">Compliance</h2>
        </ScrollReveal>
        <div className="grid sm:grid-cols-2 gap-4">
          {complianceItems.map((item) => (
            <ScrollReveal key={item.title}>
              <div className="h-full p-6 rounded-2xl bg-brand-surface/60 backdrop-blur-xl border border-brand-border/50">
                <h3 className="text-lg font-bold text-brand-text mb-2">{item.title}</h3>
                <p className="text-sm text-brand-text-secondary">{item.desc}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* Documentacao */}
      <section className="max-w-5xl mx-auto px-4 md:px-6 pb-20">
        <ScrollReveal>
          <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center">Documentacao</h2>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/privacy" className="px-6 py-3 rounded-xl border border-brand-border text-brand-text hover:bg-brand-elevated transition">
              Politica de privacidade
            </Link>
            <Link href="/terms" className="px-6 py-3 rounded-xl border border-brand-border text-brand-text hover:bg-brand-elevated transition">
              Termos de uso
            </Link>
            <Link href="/status" className="px-6 py-3 rounded-xl border border-brand-border text-brand-text hover:bg-brand-elevated transition">
              Status do servico
            </Link>
          </div>
        </ScrollReveal>
      </section>

      {/* CTA */}
      <section className="max-w-5xl mx-auto px-4 md:px-6 pb-20 text-center">
        <ScrollReveal>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 px-6 py-3 bg-brand-accent text-brand-bg font-bold rounded-lg hover:scale-105 transition-transform"
          >
            Comecar gratis <ArrowRight className="w-4 h-4" />
          </Link>
        </ScrollReveal>
      </section>

      <Footer />
    </main>
  );
}
