import type { Metadata } from 'next';
import { Shield } from 'lucide-react';
import { FadeIn, ScrollReveal } from '@/components/animations';
import Footer from '@/components/Footer';
import { Breadcrumb } from '@/components/Breadcrumb';

export const metadata: Metadata = {
  title: 'Política de Privacidade — StackPost',
  description:
    'Política de Privacidade do StackPost: como coletamos, utilizamos e protegemos os dados de usuários e contas sociais conectadas.',
  alternates: { canonical: '/privacy' },
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-brand-bg text-brand-text">
      <Breadcrumb items={[{ name: 'Home', path: '/' }, { name: 'Privacidade', path: '/privacy' }]} />
      <section className="relative pt-20 pb-12 px-4">
        <div className="max-w-3xl mx-auto">
          <FadeIn>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-brand-accent/30 bg-brand-accent/10 mb-6">
              <Shield className="w-3.5 h-3.5 text-brand-accent" />
              <span className="text-xs font-mono text-brand-accent">Privacidade</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Política de Privacidade</h1>
            <p className="text-sm text-brand-text-secondary">Última atualização: agosto de 2026</p>
          </FadeIn>
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-4 pb-20 space-y-6">
        <ScrollReveal>
          <div className="p-6 rounded-xl bg-brand-surface/50 backdrop-blur border border-brand-border">
            <h2 className="text-xl font-bold mb-3">1. Dados coletados</h2>
            <p className="text-sm text-brand-text-secondary leading-relaxed">
              Coletamos apenas as informações necessárias para o funcionamento da plataforma: e-mail,
              nome, equipe, contas sociais conectadas via OAuth, publicações criadas, métricas de
              desempenho e registros de uso da API. Não coletamos dados de navegação de terceiros.
            </p>
          </div>
        </ScrollReveal>
        <ScrollReveal>
          <div className="p-6 rounded-xl bg-brand-surface/50 backdrop-blur border border-brand-border">
            <h2 className="text-xl font-bold mb-3">2. Uso dos dados</h2>
            <p className="text-sm text-brand-text-secondary leading-relaxed">
              Utilizamos os dados para fornecer o serviço, processar publicações, calcular métricas
              de desempenho, aplicar limites dos planos contratados e aprimorar continuamente o
              produto. Em nenhuma hipótese comercializamos dados de usuários.
            </p>
          </div>
        </ScrollReveal>
        <ScrollReveal>
          <div className="p-6 rounded-xl bg-brand-surface/50 backdrop-blur border border-brand-border">
            <h2 className="text-xl font-bold mb-3">3. Armazenamento e segurança</h2>
            <p className="text-sm text-brand-text-secondary leading-relaxed">
              Os dados são armazenados em PostgreSQL (Supabase) com Row Level Security (RLS) ativado
              em todas as tabelas. As mídias são hospedadas no Cloudflare R2 e os tokens OAuth são
              criptografados em repouso, garantindo proteção contra acessos não autorizados.
            </p>
          </div>
        </ScrollReveal>
        <ScrollReveal>
          <div className="p-6 rounded-xl bg-brand-surface/50 backdrop-blur border border-brand-border">
            <h2 className="text-xl font-bold mb-3">4. Seus direitos</h2>
            <p className="text-sm text-brand-text-secondary leading-relaxed">
              Você pode acessar, corrigir, exportar ou excluir seus dados a qualquer momento. Para
              exercer qualquer um desses direitos, em conformidade com a LGPD e o GDPR, entre em
              contato pelo e-mail suporte@stackpost.com.br.
            </p>
          </div>
        </ScrollReveal>
        <ScrollReveal>
          <div className="p-6 rounded-xl bg-brand-surface/50 backdrop-blur border border-brand-border">
            <h2 className="text-xl font-bold mb-3">5. Retenção de dados</h2>
            <p className="text-sm text-brand-text-secondary leading-relaxed">
              As métricas de desempenho são retidas por um período configurável, com retenção
              padrão indefinida enquanto a conta estiver ativa. Publicações e mídias permanecem
              armazenadas até a exclusão solicitada pelo usuário ou o encerramento da conta.
            </p>
          </div>
        </ScrollReveal>
      </section>

      <Footer />
    </main>
  );
}
