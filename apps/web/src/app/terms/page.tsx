import type { Metadata } from 'next';
import { FileText } from 'lucide-react';
import { FadeIn, ScrollReveal } from '@/components/animations';
import Footer from '@/components/Footer';
import { Breadcrumb } from '@/components/Breadcrumb';

export const metadata: Metadata = {
  title: 'Termos de uso - StackPost',
  description: 'Termos de uso do StackPost: regras para uso da API, limites, responsabilidades e SLA.',
  alternates: { canonical: '/terms' },
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-brand-bg text-brand-text">
      <Breadcrumb items={[{ name: 'Home', path: '/' }, { name: 'Termos', path: '/terms' }]} />
      <section className="relative pt-20 pb-12 px-4">
        <div className="max-w-3xl mx-auto">
          <FadeIn>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-brand-accent/30 bg-brand-accent/10 mb-6">
              <FileText className="w-3.5 h-3.5 text-brand-accent" />
              <span className="text-xs font-mono text-brand-accent">Termos</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Termos de uso</h1>
            <p className="text-sm text-brand-text-secondary">Última atualização: agosto de 2026</p>
          </FadeIn>
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-4 pb-20 space-y-6">
        <ScrollReveal>
          <div className="p-6 rounded-xl bg-brand-surface/50 backdrop-blur border border-brand-border">
            <h2 className="text-xl font-bold mb-3">1. Aceitação</h2>
            <p className="text-sm text-brand-text-secondary">
              Ao utilizar o StackPost, você concorda integralmente com estes termos. Caso não concorde, não utilize o serviço.
            </p>
          </div>
        </ScrollReveal>
        <ScrollReveal>
          <div className="p-6 rounded-xl bg-brand-surface/50 backdrop-blur border border-brand-border">
            <h2 className="text-xl font-bold mb-3">2. Uso da API</h2>
            <p className="text-sm text-brand-text-secondary">
              O uso da API está sujeito a limites de taxa (100 req/s, 500 req/10s, 2000 req/min) e cotas específicas por plano.
              A exceder os limites, a API retornará HTTP 429 com o cabeçalho Retry-After.
            </p>
          </div>
        </ScrollReveal>
        <ScrollReveal>
          <div className="p-6 rounded-xl bg-brand-surface/50 backdrop-blur border border-brand-border">
            <h2 className="text-xl font-bold mb-3">3. Contas sociais</h2>
            <p className="text-sm text-brand-text-secondary">
              Você é responsável por possuir acesso legítimo às contas sociais que conecta à plataforma.
              O StackPost não acessa nenhuma conta sem sua autorização explícita via OAuth.
            </p>
          </div>
        </ScrollReveal>
        <ScrollReveal>
          <div className="p-6 rounded-xl bg-brand-surface/50 backdrop-blur border border-brand-border">
            <h2 className="text-xl font-bold mb-3">4. Dados e privacidade</h2>
            <p className="text-sm text-brand-text-secondary">
              Seus dados são armazenados de forma segura e criptografada. As métricas analíticas são retidas por um período configurável.
              Você pode solicitar a remoção dos seus dados a qualquer momento.
            </p>
          </div>
        </ScrollReveal>
        <ScrollReveal>
          <div className="p-6 rounded-xl bg-brand-surface/50 backdrop-blur border border-brand-border">
            <h2 className="text-xl font-bold mb-3">5. Responsabilidade</h2>
            <p className="text-sm text-brand-text-secondary">
              O StackPost é fornecido &quot;como está&quot;. Não garantimos disponibilidade contínua do serviço.
              Eventos de força maior (ex.: quedas de plataformas de terceiros) não são de nossa responsabilidade.
            </p>
          </div>
        </ScrollReveal>
      </section>

      <Footer />
    </main>
  );
}
