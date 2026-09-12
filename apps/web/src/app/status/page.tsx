import type { Metadata } from 'next';
import Link from 'next/link';
import { CheckCircle2, AlertCircle, Activity } from 'lucide-react';
import { ScrollReveal } from '@/components/animations';
import { JsonLd, serviceSchema } from '@/components/JsonLd';
import LandingHeader from '@/components/LandingHeader';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Status - StackPost',
  description: 'Status dos serviços do StackPost. Valores reais serão exibidos após integração com o monitoramento de produção.',
  alternates: { canonical: '/status' },
};

const jsonLd = serviceSchema('StackPost Status', 'Status da infraestrutura social.', '/status');

const services = [
  { name: 'API', status: 'operational' },
  { name: 'Dashboard', status: 'operational' },
  { name: 'Webhooks', status: 'operational' },
  { name: 'Instagram', status: 'operational' },
  { name: 'Facebook', status: 'operational' },
  { name: 'LinkedIn', status: 'operational' },
  { name: 'Discord', status: 'operational' },
  { name: 'OAuth', status: 'operational' },
  { name: 'Analytics', status: 'operational' },
  { name: 'MCP Server', status: 'operational' },
];

const incidents: { date: string; title: string; status: string; level: string }[] = [];

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
          <p className="text-brand-text-secondary mb-4">Status de referência dos serviços do StackPost.</p>
          <p className="text-sm text-brand-text-secondary/70 mb-8">Valores de uptime e incidentes serão exibidos após integração com monitoramento de produção.</p>

          <div className="flex items-center gap-3 p-4 rounded-xl bg-success/5 border border-success/20 mb-8">
            <CheckCircle2 className="w-6 h-6 text-success" />
            <div>
              <div className="font-semibold text-success">Todos os sistemas operacionais</div>
              <div className="text-sm text-brand-text-secondary">Última verificação: agora</div>
            </div>
          </div>
        </ScrollReveal>
      </section>

      <section className="max-w-4xl mx-auto px-4 md:px-6 pb-12">
        <ScrollReveal>
          <h2 className="text-xl font-bold mb-4">Serviços</h2>
          <div className="space-y-2">
            {services.map((s) => (
              <div key={s.name} className="flex items-center justify-between p-4 rounded-xl bg-brand-surface/50 border border-brand-border">
                <div className="flex items-center gap-3">
                  <StatusIcon status={s.status} />
                  <span className="font-medium">{s.name}</span>
                </div>
                <div className="flex items-center gap-4">
                  <StatusBadge status={s.status} />
                </div>
              </div>
            ))}
          </div>
        </ScrollReveal>
      </section>

      <section className="max-w-4xl mx-auto px-4 md:px-6 pb-20">
        <ScrollReveal>
          <h2 className="text-xl font-bold mb-4">Histórico de incidentes</h2>
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
            Esta página exibe referências de status. Dados reais serão integrados ao monitoramento de produção.
          </p>
        </ScrollReveal>
      </section>

      <Footer />
    </main>
  );
}
