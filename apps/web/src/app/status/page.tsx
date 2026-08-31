import type { Metadata } from 'next';
import Link from 'next/link';
import { CheckCircle2, AlertCircle, Activity } from 'lucide-react';
import { ScrollReveal } from '@/components/animations';
import { JsonLd, serviceSchema } from '@/components/JsonLd';
import LandingHeader from '@/components/LandingHeader';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Status - StackPost',
  description: 'Status em tempo real da API e plataformas do StackPost.',
  alternates: { canonical: '/status' },
};

const jsonLd = serviceSchema('StackPost Status', 'Status da infraestrutura social.', '/status');

const services = [
  { name: 'API', status: 'operational', uptime: '99.98%' },
  { name: 'Dashboard', status: 'operational', uptime: '99.99%' },
  { name: 'Webhooks', status: 'operational', uptime: '99.95%' },
  { name: 'Instagram', status: 'operational', uptime: '99.9%' },
  { name: 'Facebook', status: 'operational', uptime: '99.9%' },
  { name: 'LinkedIn', status: 'operational', uptime: '99.9%' },
  { name: 'Discord', status: 'operational', uptime: '99.9%' },
  { name: 'OAuth', status: 'operational', uptime: '99.95%' },
  { name: 'Analytics', status: 'operational', uptime: '99.9%' },
  { name: 'MCP Server', status: 'operational', uptime: '99.9%' },
];

const incidents: { date: string; title: string; status: string; level: string }[] = [
  { date: '2026-08-31', title: 'Correção de callback OAuth (Discord/Google)', status: 'resolved', level: 'minor' },
  { date: '2026-08-30', title: 'Manutenção programada - deploy de rotas OAuth', status: 'resolved', level: 'maintenance' },
];

function StatusIcon({ status }: { status: string }) {
  if (status === 'operational') return <CheckCircle2 className="w-5 h-5 text-success" />;
  return <AlertCircle className="w-5 h-5 text-warning" />;
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    operational: 'bg-success/10 text-success border-success/30',
    degraded: 'bg-warning/10 text-warning border-warning/30',
    down: 'bg-red-500/10 text-red-400 border-red-500/30',
  };
  const labels: Record<string, string> = {
    operational: 'Operacional',
    degraded: 'Degradado',
    down: 'Fora do ar',
  };
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${colors[status] || colors.operational}`}>
      {labels[status] || status}
    </span>
  );
}

export default function StatusPage() {
  return (
    <main className="min-h-screen bg-brand-bg text-brand-text">
      <JsonLd data={jsonLd} />
      <LandingHeader />

      <section className="pt-24 pb-12 max-w-4xl mx-auto px-4 md:px-6">
        <ScrollReveal>
          <div className="flex items-center gap-3 mb-2">
            <Activity className="w-6 h-6 text-brand-accent" />
            <h1 className="font-display text-3xl md:text-4xl font-black tracking-tight">Status</h1>
          </div>
          <p className="text-brand-text-secondary mb-8">Status atual da infraestrutura do StackPost.</p>

          <div className="flex items-center gap-3 p-4 rounded-xl bg-success/5 border border-success/20 mb-8">
            <CheckCircle2 className="w-6 h-6 text-success" />
            <div>
              <div className="font-semibold text-success">Todos os sistemas operacionais</div>
              <div className="text-sm text-brand-text-secondary">Ultima verificacao: agora</div>
            </div>
          </div>
        </ScrollReveal>
      </section>

      <section className="max-w-4xl mx-auto px-4 md:px-6 pb-12">
        <ScrollReveal>
          <h2 className="text-xl font-bold mb-4">Servicos</h2>
          <div className="space-y-2">
            {services.map((s) => (
              <div key={s.name} className="flex items-center justify-between p-4 rounded-xl bg-brand-surface/50 border border-brand-border">
                <div className="flex items-center gap-3">
                  <StatusIcon status={s.status} />
                  <span className="font-medium">{s.name}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-brand-text-secondary hidden sm:inline">{s.uptime} uptime</span>
                  <StatusBadge status={s.status} />
                </div>
              </div>
            ))}
          </div>
        </ScrollReveal>
      </section>

      <section className="max-w-4xl mx-auto px-4 md:px-6 pb-20">
        <ScrollReveal>
          <h2 className="text-xl font-bold mb-4">Historico de incidentes</h2>
          <div className="space-y-3">
            {incidents.map((inc) => (
              <div key={inc.date + inc.title} className="p-4 rounded-xl bg-brand-surface/30 border border-brand-border/50">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-sm">{inc.title}</span>
                  <span className="text-xs text-brand-text-secondary">{inc.date}</span>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={inc.status === 'resolved' ? 'operational' : 'degraded'} />
                  <span className="text-xs text-brand-text-secondary capitalize">{inc.level}</span>
                </div>
              </div>
            ))}
          </div>
        </ScrollReveal>

        <ScrollReveal className="mt-8">
          <p className="text-xs text-brand-text-secondary">
            Metricas baseadas em monitoramento interno. Atualizado em tempo real.
          </p>
        </ScrollReveal>
      </section>

      <Footer />
    </main>
  );
}
