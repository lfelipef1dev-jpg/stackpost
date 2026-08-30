import type { Metadata } from 'next';
import Link from 'next/link';
import { Webhook, ArrowRight } from 'lucide-react';
import { ScrollReveal } from '@/components/animations';
import { Breadcrumb } from '@/components/Breadcrumb';
import { DocsHero } from '@/components/DocsHero';
import { JsonLd, serviceSchema } from '@/components/JsonLd';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Webhooks - 9 eventos, HMAC-SHA256 e replay',
  description: 'Webhooks do StackPost: 9 categorias de eventos, assinatura HMAC-SHA256, 3 tentativas com backoff exponencial, replay manual de eventos perdidos e desativação automática após 7 dias sem sucesso.',
  alternates: { canonical: '/docs/webhooks' },
};

const jsonLd = serviceSchema('StackPost Webhooks', 'Webhooks com HMAC-SHA256, retries e replay.', '/docs/webhooks');

const events = [
  { name: 'post.published', desc: 'Post publicado com sucesso em todas as plataformas' },
  { name: 'post.failed', desc: 'Falha ao publicar o post em uma ou mais plataformas' },
  { name: 'post.scheduled', desc: 'Post agendado com sucesso' },
  { name: 'post.deleted', desc: 'Post removido com sucesso' },
  { name: 'platform.posted', desc: 'Post publicado com sucesso em uma plataforma específica' },
  { name: 'platform.error', desc: 'Erro ao publicar em uma plataforma específica' },
  { name: 'social-account.connected', desc: 'Conta social conectada via OAuth' },
  { name: 'social-account.expired', desc: 'Token de acesso da conta social expirado' },
  { name: 'social-account.reconnect_needed', desc: 'Reconexão necessária (auto-reconnect tentou e falhou)' },
];

export default function DocsWebhooksPage() {
  return (
    <main className="min-h-screen bg-brand-bg text-brand-text">
      <JsonLd data={jsonLd} />
      <Breadcrumb items={[{ name: 'Home', path: '/' }, { name: 'Documentação', path: '/docs' }, { name: 'Webhooks', path: '/docs/webhooks' }]} />
      <DocsHero
        icon={Webhook}
        label="Webhooks"
        title="Webhooks"
        description="9 categorias de eventos. Assinatura HMAC-SHA256. 3 tentativas com backoff exponencial (30s, 90s, 270s). Replay manual de eventos perdidos. Desativação automática após 7 dias sem sucesso."
        color="#FF4500"
      />

      <section className="max-w-4xl mx-auto px-4 pb-12">
        <ScrollReveal className="mb-6">
          <h2 className="text-2xl font-bold">Eventos</h2>
        </ScrollReveal>
        <ul className="space-y-2 list-none p-0" aria-label="Lista de eventos de webhook">
          {events.map((e) => (
            <li key={e.name} className="p-4 rounded-xl bg-brand-surface/50 backdrop-blur border border-brand-border">
              <code className="text-sm font-mono text-brand-accent">{e.name}</code>
              <p className="text-sm text-brand-text-secondary mt-1">{e.desc}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="max-w-3xl mx-auto px-4 pb-12">
        <ScrollReveal>
          <h2 className="text-2xl font-bold mb-4">Verificação da assinatura</h2>
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
        <Link href="/docs" className="inline-flex items-center gap-2 text-brand-accent hover:underline" aria-label="Voltar para a documentação">
          Voltar para documentação <ArrowRight className="w-4 h-4" aria-hidden="true" />
        </Link>
      </section>

      <Footer />
    </main>
  );
}
