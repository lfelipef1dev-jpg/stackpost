'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Calculator, TrendingDown, Clock, DollarSign } from 'lucide-react';
import LandingHeader from '@/components/LandingHeader';
import Footer from '@/components/Footer';
import { FadeIn, ScrollReveal } from '@/components/animations';

export default function BuildVsBuyPage() {
  const [platforms, setPlatforms] = useState(5);
  const [developers, setDevelopers] = useState(2);
  const [months, setMonths] = useState(6);

  // Estimativas baseadas em mercado (BR)
  const devCostPerMonth = 12000; // R$ 12k/dev/mes
  const buildCost = developers * devCostPerMonth * months;
  const buildAnnualMaintenance = buildCost * 0.3; // 30% ao ano de manutencao
  const buildTotalYear1 = buildCost + buildAnnualMaintenance;

  // StackPost: plano Scale estimado em R$ 199/mes + uso
  const stackpostMonthly = 199;
  const stackpostYear1 = stackpostMonthly * 12;

  const savings = buildTotalYear1 - stackpostYear1;
  const savingsPercent = Math.round((savings / buildTotalYear1) * 100);
  const timeSaved = months * 30; // dias

  return (
    <main className="min-h-screen bg-brand-bg text-brand-text">
      <LandingHeader />

      {/* Hero */}
      <section className="relative pt-24 pb-12 px-4 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] rounded-full blur-[140px]" style={{ background: '#22C55E15' }} />
          <div className="absolute bottom-0 left-1/3 w-[400px] h-[400px] rounded-full blur-[120px]" style={{ background: '#22C55E10' }} />
        </div>
        <div className="max-w-4xl mx-auto relative text-center">
          <FadeIn>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border mb-6" style={{ borderColor: '#22C55E40', backgroundColor: '#22C55E10' }}>
              <Calculator className="w-3.5 h-3.5" style={{ color: '#22C55E' }} />
              <span className="text-xs font-mono" style={{ color: '#22C55E' }}>Build vs Buy</span>
            </div>
            <h1 className="font-display text-4xl md:text-5xl font-black tracking-tight mb-4" style={{ color: 'color-mix(in srgb, #22C55E 25%, white)' }}>
              Construir ou usar StackPost?
            </h1>
            <p className="text-lg text-brand-text-secondary max-w-2xl mx-auto">
              Calcule quanto custa construir infraestrutura social do zero vs usar StackPost.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* Calculator */}
      <section className="max-w-4xl mx-auto px-4 py-12">
        <ScrollReveal>
          <div className="grid md:grid-cols-2 gap-8">
            {/* Inputs */}
            <div className="p-8 rounded-2xl bg-brand-surface/50 border border-brand-border">
              <h2 className="text-xl font-bold mb-6">Seu cenario</h2>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Plataformas a integrar: <span className="text-brand-accent font-bold">{platforms}</span>
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="15"
                    value={platforms}
                    onChange={(e) => setPlatforms(Number(e.target.value))}
                    className="w-full accent-brand-accent"
                  />
                  <div className="flex justify-between text-xs text-brand-text-secondary mt-1">
                    <span>1</span><span>15</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Desenvolvedores no time: <span className="text-brand-accent font-bold">{developers}</span>
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={developers}
                    onChange={(e) => setDevelopers(Number(e.target.value))}
                    className="w-full accent-brand-accent"
                  />
                  <div className="flex justify-between text-xs text-brand-text-secondary mt-1">
                    <span>1</span><span>10</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Meses de desenvolvimento: <span className="text-brand-accent font-bold">{months}</span>
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="12"
                    value={months}
                    onChange={(e) => setMonths(Number(e.target.value))}
                    className="w-full accent-brand-accent"
                  />
                  <div className="flex justify-between text-xs text-brand-text-secondary mt-1">
                    <span>1</span><span>12</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Results */}
            <div className="space-y-4">
              {/* Build */}
              <div className="p-6 rounded-2xl bg-red-500/5 border border-red-500/20">
                <div className="flex items-center gap-2 mb-3">
                  <Clock className="w-5 h-5 text-red-400" />
                  <h3 className="font-bold text-red-400">Construir do zero</h3>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-brand-text-secondary">Desenvolvimento</span>
                    <span className="font-mono">R$ {buildCost.toLocaleString('pt-BR')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-brand-text-secondary">Manutencao ano 1 (30%)</span>
                    <span className="font-mono">R$ {buildAnnualMaintenance.toLocaleString('pt-BR')}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-red-500/20">
                    <span className="font-bold">Total ano 1</span>
                    <span className="font-mono font-bold text-red-400">R$ {buildTotalYear1.toLocaleString('pt-BR')}</span>
                  </div>
                </div>
              </div>

              {/* StackPost */}
              <div className="p-6 rounded-2xl bg-success/5 border border-success/20">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingDown className="w-5 h-5 text-success" />
                  <h3 className="font-bold text-success">StackPost</h3>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-brand-text-secondary">Plano Scale (R$ 199/mes)</span>
                    <span className="font-mono">R$ {stackpostYear1.toLocaleString('pt-BR')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-brand-text-secondary">Setup</span>
                    <span className="font-mono">R$ 0</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-success/20">
                    <span className="font-bold">Total ano 1</span>
                    <span className="font-mono font-bold text-success">R$ {stackpostYear1.toLocaleString('pt-BR')}</span>
                  </div>
                </div>
              </div>

              {/* Savings */}
              <div className="p-6 rounded-2xl bg-brand-accent/10 border border-brand-accent/30 text-center">
                <div className="text-sm text-brand-text-secondary mb-1">Economia no ano 1</div>
                <div className="text-3xl font-black text-brand-accent mb-1">
                  R$ {savings.toLocaleString('pt-BR')}
                </div>
                <div className="text-sm text-success font-medium">
                  {savingsPercent}% de reducao de custo
                </div>
                <div className="text-xs text-brand-text-secondary mt-2">
                  Tempo economizado: ~{timeSaved} dias
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* Methodology */}
        <ScrollReveal className="mt-8">
          <details className="p-4 rounded-xl bg-brand-surface/30 border border-brand-border/50">
            <summary className="text-sm font-medium cursor-pointer text-brand-text-secondary">
              Metodologia do calculo
            </summary>
            <div className="mt-4 text-xs text-brand-text-secondary space-y-2">
              <p>- Custo de desenvolvedor: R$ 12.000/mes (media mercado BR pleno/senior)</p>
              <p>- Manutencao anual estimada em 30% do custo de desenvolvimento</p>
              <p>- StackPost plano Scale: R$ 199/mes + uso por postagem</p>
              <p>- Nao inclui: custos de infraestrutura (servidores, CDN), OAuth app review, monitoramento</p>
              <p>- Estimativas baseadas em projetos reais de integracao social</p>
            </div>
          </details>
        </ScrollReveal>

        {/* CTA */}
        <ScrollReveal className="mt-12 text-center">
          <Link
            href="/register"
            className="inline-flex items-center gap-2 px-8 py-4 bg-brand-accent text-brand-bg font-bold rounded-lg hover:scale-105 transition-transform"
          >
            Comecar agora <ArrowRight className="w-5 h-5" />
          </Link>
        </ScrollReveal>
      </section>

      <Footer />
    </main>
  );
}
