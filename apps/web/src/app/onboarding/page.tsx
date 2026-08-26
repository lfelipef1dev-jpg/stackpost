'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, Circle, ArrowRight, Loader2, Building2, Users, Key, Instagram } from 'lucide-react';

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [orgName, setOrgName] = useState('');
  const [teamName, setTeamName] = useState('');
  const [loading, setLoading] = useState(false);

  const steps = [
    { icon: Building2, title: 'Criar organizacao', desc: 'Sua empresa ou projeto' },
    { icon: Users, title: 'Criar time', desc: 'Workspace para suas contas' },
    { icon: Key, title: 'Gerar API key', desc: 'Chave para integrar via API' },
    { icon: Instagram, title: 'Conectar conta', desc: 'Vincular rede social' },
  ];

  async function handleComplete() {
    setLoading(true);
    const token = localStorage.getItem('token');
    // Create org and team
    if (orgName) {
      await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ orgName, teamName }),
      });
    }
    router.push('/dashboard');
  }

  function handleConnectInstagram() {
    window.location.href = '/api/oauth/meta';
  }

  function handleGenerateKey() {
    router.push('/settings');
  }

  return (
    <div className="min-h-screen bg-brand-bg flex items-center justify-center p-4">
      <div className="w-full max-w-2xl p-8 rounded-2xl bg-brand-surface border border-brand-border">
        <h1 className="text-3xl font-bold mb-2">Bem-vindo ao StackPost</h1>
        <p className="text-brand-text-secondary mb-8">Vamos configurar sua conta em 4 passos.</p>

        <div className="space-y-4 mb-8">
          {steps.map((s, i) => (
            <div key={i} className={`flex items-center gap-4 p-4 rounded-xl transition ${i === step ? 'bg-brand-elevated border border-brand-accent' : i < step ? 'bg-brand-surface border border-brand-border' : 'bg-brand-surface/50 border border-brand-border/50 opacity-50'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${i < step ? 'bg-success/20' : i === step ? 'bg-brand-accent/20' : 'bg-brand-elevated'}`}>
                {i < step ? <CheckCircle2 className="w-5 h-5 text-success" /> : <s.icon className={`w-5 h-5 ${i === step ? 'text-brand-accent' : 'text-brand-text-secondary'}`} />}
              </div>
              <div className="flex-1">
                <div className="font-medium">{s.title}</div>
                <div className="text-xs text-brand-text-secondary">{s.desc}</div>
              </div>
              {i === step && <ArrowRight className="w-5 h-5 text-brand-accent" />}
            </div>
          ))}
        </div>

        {step === 0 && (
          <div className="space-y-4">
            <input value={orgName} onChange={(e) => setOrgName(e.target.value)} placeholder="Nome da organizacao" className="w-full px-4 py-3 rounded-xl bg-brand-elevated border border-brand-border text-brand-text" />
            <button onClick={() => setStep(1)} disabled={!orgName} className="w-full px-6 py-3 rounded-xl bg-brand-accent text-brand-bg font-semibold hover:bg-brand-accent-hover transition disabled:opacity-50">Proximo</button>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <input value={teamName} onChange={(e) => setTeamName(e.target.value)} placeholder="Nome do time (ex: Marketing)" className="w-full px-4 py-3 rounded-xl bg-brand-elevated border border-brand-border text-brand-text" />
            <div className="flex gap-3">
              <button onClick={() => setStep(0)} className="px-6 py-3 rounded-xl border border-brand-border text-brand-text hover:bg-brand-elevated transition">Voltar</button>
              <button onClick={() => setStep(2)} disabled={!teamName} className="flex-1 px-6 py-3 rounded-xl bg-brand-accent text-brand-bg font-semibold hover:bg-brand-accent-hover transition disabled:opacity-50">Proximo</button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <p className="text-sm text-brand-text-secondary">Voce precisa de uma API key para integrar via API. Gere agora ou depois nas configuracoes.</p>
            <div className="flex gap-3">
              <button onClick={() => setStep(1)} className="px-6 py-3 rounded-xl border border-brand-border text-brand-text hover:bg-brand-elevated transition">Voltar</button>
              <button onClick={handleGenerateKey} className="flex-1 px-6 py-3 rounded-xl bg-brand-elevated border border-brand-border text-brand-text hover:bg-brand-border transition">Gerar agora</button>
              <button onClick={() => setStep(3)} className="flex-1 px-6 py-3 rounded-xl bg-brand-accent text-brand-bg font-semibold hover:bg-brand-accent-hover transition">Pular</button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <p className="text-sm text-brand-text-secondary">Conecte sua primeira conta social para comecar a publicar.</p>
            <button onClick={handleConnectInstagram} className="w-full px-6 py-3 rounded-xl bg-brand-accent text-brand-bg font-semibold hover:bg-brand-accent-hover transition flex items-center justify-center gap-2">
              <Instagram className="w-5 h-5" /> Conectar Instagram
            </button>
            <button onClick={handleComplete} disabled={loading} className="w-full px-6 py-3 rounded-xl border border-brand-border text-brand-text hover:bg-brand-elevated transition flex items-center justify-center gap-2">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Concluir e ir ao dashboard'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
