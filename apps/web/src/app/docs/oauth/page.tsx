import type { Metadata } from 'next';
import Link from 'next/link';
import { Key, ArrowRight, Shield, Lock, RefreshCw, Eye } from 'lucide-react';
import { ScrollReveal } from '@/components/animations';
import { Breadcrumb } from '@/components/Breadcrumb';
import { DocsHero } from '@/components/DocsHero';
import { JsonLd, serviceSchema } from '@/components/JsonLd';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'OAuth — Como conectar contas sociais no StackPost',
  description: 'Entenda como o StackPost conecta Instagram, Facebook, TikTok, YouTube, LinkedIn, X, Pinterest, Reddit, Snapchat e Bluesky via OAuth 2.0, sem armazenar sua senha.',
  alternates: { canonical: '/docs/oauth' },
};

const jsonLd = serviceSchema('StackPost OAuth', 'OAuth 2.0 para conectar contas sociais de forma segura.', '/docs/oauth');

const platforms = [
  { name: 'Instagram', via: 'Meta Graph API (Facebook Login)' },
  { name: 'Facebook', via: 'Meta Graph API' },
  { name: 'TikTok', via: 'TikTok Content API' },
  { name: 'YouTube', via: 'Google OAuth 2.0' },
  { name: 'LinkedIn', via: 'LinkedIn OAuth 2.0' },
  { name: 'X / Twitter', via: 'Twitter API v2 OAuth 2.0' },
  { name: 'Pinterest', via: 'Pinterest API v5' },
  { name: 'Reddit', via: 'Reddit OAuth 2.0' },
  { name: 'Snapchat', via: 'Snapchat Marketing API' },
  { name: 'Bluesky', via: 'AT Protocol (PDS)' },
];

const flowSteps = [
  {
    icon: Shield,
    title: 'Você comanda o acesso',
    desc: 'O StackPost nunca solicita a senha do Instagram, LinkedIn ou de qualquer outra rede. Ao clicar em "Conectar", você é redirecionado para a própria rede social realizar o login.',
  },
  {
    icon: Lock,
    title: 'Permissão limitada e revogável',
    desc: 'Você aprova exatamente o que o StackPost pode fazer: publicar, ler comentários ou acessar métricas. É possível desconectar a conta a qualquer momento no dashboard.',
  },
  {
    icon: RefreshCw,
    title: 'Token seguro e renovável',
    desc: 'Após a aprovação, a rede entrega um token criptografado ao StackPost. Armazenamos access e refresh tokens com segurança e os renovamos automaticamente.',
  },
  {
    icon: Eye,
    title: 'Pronto para publicar',
    desc: 'A conta conectada aparece no dashboard. A partir desse momento, você pode criar posts, agendar publicações e acompanhar resultados sem precisar fazer login novamente.',
  },
];

export default function DocsOauthPage() {
  return (
    <main className="min-h-screen bg-brand-bg text-brand-text">
      <JsonLd data={jsonLd} />
      <Breadcrumb items={[{ name: 'Home', path: '/' }, { name: 'Documentação', path: '/docs' }, { name: 'OAuth', path: '/docs/oauth' }]} />

      <DocsHero
        icon={Key}
        label="OAuth"
        title="Como a conexão funciona"
        description="O StackPost utiliza o padrão OAuth 2.0. Isso significa que você permanece no controle: faz login na rede social e decide o que o nosso sistema pode fazer por você."
        color="#FFFFFF"
      />

      {/* Fluxo para usuários */}
      <section className="max-w-4xl mx-auto px-4 pb-16">
        <ScrollReveal className="mb-6">
          <h2 className="text-2xl font-bold">Para quem usa o dashboard</h2>
        </ScrollReveal>
        <div className="grid sm:grid-cols-2 gap-4">
          {flowSteps.map((f, i) => (
            <ScrollReveal key={f.title} delay={i * 0.05}>
              <div className="p-5 rounded-xl bg-brand-surface/50 backdrop-blur border border-brand-border h-full">
                <f.icon className="w-6 h-6 text-brand-accent mb-3" />
                <h3 className="font-semibold text-lg mb-2">{f.title}</h3>
                <p className="text-sm text-brand-text-secondary leading-relaxed">{f.desc}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* Plataformas suportadas */}
      <section className="max-w-4xl mx-auto px-4 pb-12">
        <ScrollReveal className="mb-6">
          <h2 className="text-2xl font-bold">Plataformas suportadas</h2>
        </ScrollReveal>
        <div className="grid sm:grid-cols-2 gap-4">
          {platforms.map((p) => (
            <div key={p.name} className="p-4 rounded-xl bg-brand-surface/50 backdrop-blur border border-brand-border">
              <h3 className="font-semibold text-brand-text">{p.name}</h3>
              <p className="text-sm text-brand-text-secondary mt-1">{p.via}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Fluxo técnico */}
      <section className="max-w-3xl mx-auto px-4 pb-12">
        <ScrollReveal>
          <h2 className="text-2xl font-bold mb-4">Fluxo técnico</h2>
          <p className="text-brand-text-secondary mb-4">
            Para desenvolvedores que integram o StackPost ao seu próprio SaaS. O fluxo é o mesmo authorization code, com PKCE quando aplicável.
          </p>
          <div className="p-6 rounded-xl bg-brand-surface border border-brand-border overflow-x-auto">
            <ol className="list-decimal list-inside text-sm font-mono text-brand-text-secondary space-y-3">
              <li>Seu usuário clica em "Conectar Instagram" no seu dashboard.</li>
              <li>Seu backend chama <code>GET /api/oauth/meta?team_id=team_123</code> e recebe a URL de autorização.</li>
              <li>O usuário é redirecionado para a Meta, faz login e aprova as permissões.</li>
              <li>A Meta redireciona para <code>/api/oauth/meta/callback?code=...&amp;state=...</code>.</li>
              <li>O StackPost troca o code por tokens e devolve <code>{"{ account_id, platform, username }"}</code>.</li>
              <li>A conta conectada fica disponível para o usuário e você pode publicar via <code>POST /api/posts</code>.</li>
            </ol>
          </div>
        </ScrollReveal>
      </section>

      <section className="max-w-3xl mx-auto px-4 pb-20">
        <Link href="/docs" className="inline-flex items-center gap-2 text-brand-accent hover:text-brand-accent-hover hover:underline">
          Voltar para a documentação <ArrowRight className="w-4 h-4" />
        </Link>
      </section>

      <Footer />
    </main>
  );
}
