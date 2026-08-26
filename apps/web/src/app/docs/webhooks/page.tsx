import type { Metadata } from 'next';
import Link from 'next/link';
import { Webhook, ArrowRight } from 'lucide-react';
import { FadeIn, ScrollReveal } from '@/components/animations';
import { Breadcrumb } from '@/components/Breadcrumb';
import { JsonLd, serviceSchema } from '@/components/JsonLd';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Webhooks - 9 eventos, HMAC-SHA256 e replay',
  description: 'Webhooks do StackPost: 9 categorias de eventos, assinatura HMAC-SHA256, 3 retries com backoff exponencial, replay manual de eventos perdidos e auto-disable apos 7 dias sem sucesso.',
  alternates: { canonical: '/docs/webhooks' },
};

const jsonLd = serviceSchema('StackPost Webhooks', 'Webhooks com HMAC-SHA256, retries e replay.', '/docs/webhooks');

const events = [
  { name: 'post.published', desc: 'Post publicado com sucesso em todas as plataformas' },
  { name: 'post.failed', desc: 'Post falhou em uma ou mais plataformas' },
  { name: 'post.scheduled', desc: 'Post agendado com sucesso' },
  { name: 'post.deleted', desc: 'Post deletado' },
  { name: 'platform.posted', desc: 'Post publicado com sucesso em uma plataforma especifica' },
  { name: 'platform.error', desc: 'Erro ao publicar em uma plataforma especifica' },
  { name: 'social-account.connected', desc: 'Conta social conectada via OAuth' },
  { name: 'social-account.expired', desc: 'Token de conta social expirado' },
  { name: 'social-account.reconnect_needed', desc: 'Reconexao necessaria (auto-reconnect tentou e falhou)' },
];

export default function DocsWebhooksPage() {
  return (
    <main className="min-h-screen bg-brand-bg text-brand-text">
      <JsonLd data={jsonLd} />
      <Breadcrumb items={[{ name: 'Home', path: '/' }, { name: 'Documentacao', path: '/docs' }, { name: 'Webhooks', path: '/docs/webhooks' }]} />
      <section className="relative pt-20 pb-12 px-4">
        <div className="max-w-4xl mx-auto">
          <FadeIn>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-brand-accent/30 bg-brand-accent/8 mb-6">
              <Webhook className="w-3.5 h-3.5 text-brand-accent" />
              <span className="text-xs font-mono text-brand-accent">Webhooks</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Webhooks</h1>
            <p className="text-lg text-brand-text-secondary mb-8 max-w-2xl">
              9 categorias de eventos. Assinatura HMAC-SHA256. 3 retries com backoff exponencial (30s, 90s, 270s).
              Replay manual de eventos perdidos. Auto-disable apos 7 dias sem sucesso.
            </p>
          </FadeIn>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-4 pb-12">
        <ScrollReveal className="mb-6">
          <h2 className="text-2xl font-bold">Eventos</h2>
        </ScrollReveal>
        <div className="space-y-2">
          {events.map((e) => (
            <div key={e.name} className="p-4 rounded-xl bg-brand-surface/50 backdrop-blur border border-brand-border">
              <code className="text-sm font-mono text-brand-accent">{e.name}</code>
              <p className="text-sm text-brand-text-secondary mt-1">{e.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-4 pb-12">
        <ScrollReveal>
          <h2 className="text-2xl font-bold mb-4">Verificacao da assinatura</h2>
          <pre className="p-6 rounded-xl bg-brand-surface border border-brand-border overflow-x-auto text-sm font-mono text-brand-text-secondary"><code>{`// Node.js
import crypto from 'crypto';

const sig = req.headers['x-stackpost-signature'];
const body = JSON.stringify(req.body);
const expected = crypto
  .createHmac('sha256', WEBHOOK_SECRET)
  .update(body)
  .digest('hex');

if (sig !== expected) {
  return res.status(401).send('Invalid signature');
}`}</code></pre>
        </ScrollReveal>
      </section>

      <section className="max-w-3xl mx-auto px-4 pb-20">
        <Link href="/docs" className="inline-flex items-center gap-2 text-brand-accent hover:underline">
          Voltar para documentacao <ArrowRight className="w-4 h-4" />
        </Link>
      </section>

      <Footer />
    </main>
  );
}
