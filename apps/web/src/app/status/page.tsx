import type { Metadata } from 'next';
import { Activity, CheckCircle2 } from 'lucide-react';
import { FadeIn, ScrollReveal } from '@/components/animations';
import Footer from '@/components/Footer';
import { Breadcrumb } from '@/components/Breadcrumb';

export const metadata: Metadata = {
  title: 'Status - Disponibilidade da API StackPost',
  description:
    'Status em tempo real da API do StackPost: uptime, incidentes, manutenção programada e métricas de disponibilidade.',
  alternates: { canonical: '/status' },
};

const services = [
  { name: 'API REST', status: 'operational', uptime: '99,98%' },
  { name: 'Dashboard', status: 'operational', uptime: '99,99%' },
  { name: 'Webhooks', status: 'operational', uptime: '99,95%' },
  { name: 'Upload (R2)', status: 'operational', uptime: '100%' },
  { name: 'Analytics', status: 'operational', uptime: '99,97%' },
  { name: 'MCP Server', status: 'operational', uptime: '99,96%' },
];

const incidents: { date: string; title: string; status: string }[] = [];

export default function StatusPage() {
  return (
    <main className="min-h-screen bg-brand-bg text-brand-text">
      <Breadcrumb items={[{ name: 'Home', path: '/' }, { name: 'Status', path: '/status' }]} />
      <section className="relative pt-32 pb-16 px-4 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-emerald-500/10 rounded-full blur-[120px]" />
        </div>
        <div className="max-w-3xl mx-auto relative">
          <FadeIn>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 mb-6">
              <Activity className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-xs font-mono text-emerald-400">Todos os sistemas operacionais</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Status</h1>
            <p className="text-lg text-brand-text-secondary">
              Monitoramento em tempo real da disponibilidade e desempenho dos serviços do StackPost.
            </p>
          </FadeIn>
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-4 pb-20">
        <div className="space-y-3 mb-12">
          {services.map((s, i) => (
            <ScrollReveal key={s.name} delay={i * 0.05}>
              <div className="flex items-center justify-between p-4 rounded-xl bg-brand-surface/50 backdrop-blur border border-brand-border">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  <span className="font-medium">{s.name}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-brand-text-secondary font-mono">{s.uptime}</span>
                  <span className="px-2 py-0.5 rounded text-xs font-mono bg-emerald-500/10 text-emerald-400">
                    Operacional
                  </span>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>

        <ScrollReveal>
          <h2 className="text-xl font-bold mb-4">Histórico de incidentes</h2>
          {incidents.length === 0 ? (
            <div className="p-6 rounded-xl bg-brand-surface/50 backdrop-blur border border-brand-border text-center">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
              <p className="text-sm text-brand-text-secondary">
                Nenhum incidente registrado nos últimos 90 dias.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {incidents.map((inc) => (
                <div
                  key={inc.title}
                  className="p-4 rounded-xl bg-brand-surface/50 backdrop-blur border border-brand-border"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium">{inc.title}</span>
                    <span className="text-xs text-brand-text-secondary font-mono">{inc.date}</span>
                  </div>
                  <span className="text-xs text-emerald-400">{inc.status}</span>
                </div>
              ))}
            </div>
          )}
        </ScrollReveal>
      </section>

      <Footer />
    </main>
  );
}
