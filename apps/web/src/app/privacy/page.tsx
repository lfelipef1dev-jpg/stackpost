import type { Metadata } from 'next';
import { Shield } from 'lucide-react';
import { FadeIn, ScrollReveal } from '@/components/animations';
import Footer from '@/components/Footer';
import { Breadcrumb } from '@/components/Breadcrumb';

export const metadata: Metadata = {
  title: 'Politica de privacidade - StackPost',
  description: 'Politica de privacidade do StackPost: coleta, uso e protecao de dados de usuarios e contas sociais.',
  alternates: { canonical: '/privacy' },
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-brand-bg text-brand-text">
      <Breadcrumb items={[{ name: 'Home', path: '/' }, { name: 'Privacidade', path: '/privacy' }]} />
      <section className="relative pt-20 pb-12 px-4">
        <div className="max-w-3xl mx-auto">
          <FadeIn>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-brand-accent/30 bg-brand-accent/8 mb-6">
              <Shield className="w-3.5 h-3.5 text-brand-accent" />
              <span className="text-xs font-mono text-brand-accent">Privacidade</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Politica de privacidade</h1>
            <p className="text-sm text-brand-text-secondary">Ultima atualizacao: agosto de 2026</p>
          </FadeIn>
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-4 pb-20 space-y-6">
        <ScrollReveal>
          <div className="p-6 rounded-xl bg-brand-surface/50 backdrop-blur border border-brand-border">
            <h2 className="text-xl font-bold mb-3">1. Dados coletados</h2>
            <p className="text-sm text-brand-text-secondary">
              Coletamos: email, nome, time, contas sociais conectadas (via OAuth), posts criados,
              analytics de posts e logs de uso da API. Nao coletamos dados de navegacao de terceiros.
            </p>
          </div>
        </ScrollReveal>
        <ScrollReveal>
          <div className="p-6 rounded-xl bg-brand-surface/50 backdrop-blur border border-brand-border">
            <h2 className="text-xl font-bold mb-3">2. Uso dos dados</h2>
            <p className="text-sm text-brand-text-secondary">
              Usamos dados para: fornecer o servico, processar publicacoes, calcular analytics,
              cumprir cotas de plano e melhorar o produto. Nao vendemos dados.
            </p>
          </div>
        </ScrollReveal>
        <ScrollReveal>
          <div className="p-6 rounded-xl bg-brand-surface/50 backdrop-blur border border-brand-border">
            <h2 className="text-xl font-bold mb-3">3. Armazenamento</h2>
            <p className="text-sm text-brand-text-secondary">
              Dados sao armazenados em PostgreSQL (Supabase) com RLS ativado.
              Midias em Cloudflare R2. Tokens OAuth criptografados em repouso.
            </p>
          </div>
        </ScrollReveal>
        <ScrollReveal>
          <div className="p-6 rounded-xl bg-brand-surface/50 backdrop-blur border border-brand-border">
            <h2 className="text-xl font-bold mb-3">4. Seus direitos</h2>
            <p className="text-sm text-brand-text-secondary">
              Voce pode: acessar, corrigir, exportar ou deletar seus dados a qualquer momento.
              Contate suporte@expostacker.com.br para exercer esses direitos (LGPD/GDPR).
            </p>
          </div>
        </ScrollReveal>
        <ScrollReveal>
          <div className="p-6 rounded-xl bg-brand-surface/50 backdrop-blur border border-brand-border">
            <h2 className="text-xl font-bold mb-3">5. Retencao</h2>
            <p className="text-sm text-brand-text-secondary">
              Analytics sao retidos por tempo configuravel (default indefinido).
              Posts e midias sao retidos ate o usuario deletar ou a conta ser encerrada.
            </p>
          </div>
        </ScrollReveal>
      </section>

      <Footer />
    </main>
  );
}
