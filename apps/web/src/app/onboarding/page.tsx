'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  CheckCircle2,
  ArrowRight,
  Loader2,
  Building2,
  Users,
  Key,
  Instagram,
  AlertCircle,
} from 'lucide-react';

type StepStatus = 'pending' | 'active' | 'done';

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [orgName, setOrgName] = useState('');
  const [teamName, setTeamName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const steps = [
    {
      icon: Building2,
      title: 'Criar organização',
      desc: 'Sua empresa, agência ou projeto principal',
    },
    {
      icon: Users,
      title: 'Criar time',
      desc: 'Workspace colaborativo para suas contas sociais',
    },
    {
      icon: Key,
      title: 'Gerar API key',
      desc: 'Chave para integrar seus sistemas via API',
    },
    {
      icon: Instagram,
      title: 'Conectar conta',
      desc: 'Vincule sua primeira rede social em segundos',
    },
  ];

  function stepStatus(index: number): StepStatus {
    if (index < step) return 'done';
    if (index === step) return 'active';
    return 'pending';
  }

  async function handleComplete() {
    setError(null);
    setLoading(true);
    try {
      if (orgName) {
        const res = await fetch('/api/onboarding', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orgName, teamName }),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => null);
          throw new Error(data?.error || 'Não foi possível salvar sua organização.');
        }
      }
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ocorreu um erro inesperado.');
      setLoading(false);
    }
  }

  function handleConnectInstagram() {
    window.location.href = '/api/oauth/meta';
  }

  function handleGenerateKey() {
    router.push('/settings');
  }

  return (
    <div className="min-h-screen bg-brand-bg flex items-center justify-center p-4">
      <div className="w-full max-w-2xl p-8 rounded-2xl bg-brand-surface border border-brand-border shadow-2xl">
        <h1 className="text-3xl font-bold mb-2 text-brand-text">Bem-vindo ao StackPost</h1>
        <p className="text-brand-text-secondary mb-8">
          Configure sua conta em poucos passos e comece a publicar em todas as suas redes sociais
          a partir de um só lugar.
        </p>

        <div className="space-y-3 mb-8">
          {steps.map((s, i) => {
            const status = stepStatus(i);
            return (
              <div
                key={i}
                className={[
                  'flex items-center gap-4 p-4 rounded-xl transition-colors',
                  status === 'active'
                    ? 'bg-brand-elevated border border-brand-accent'
                    : status === 'done'
                      ? 'bg-brand-surface border border-brand-border'
                      : 'bg-brand-surface/50 border border-brand-border/50 opacity-50',
                ].join(' ')}
                aria-current={status === 'active' ? 'step' : undefined}
              >
                <div
                  className={[
                    'w-10 h-10 rounded-full flex items-center justify-center shrink-0',
                    status === 'done'
                      ? 'bg-success/20'
                      : status === 'active'
                        ? 'bg-brand-accent/20'
                        : 'bg-brand-elevated',
                  ].join(' ')}
                >
                  {status === 'done' ? (
                    <CheckCircle2 className="w-5 h-5 text-success" aria-label="Concluído" />
                  ) : (
                    <s.icon
                      className={[
                        'w-5 h-5',
                        status === 'active'
                          ? 'text-brand-accent'
                          : 'text-brand-text-secondary',
                      ].join(' ')}
                    />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-brand-text">{s.title}</div>
                  <div className="text-xs text-brand-text-secondary">{s.desc}</div>
                </div>
                {status === 'active' && (
                  <ArrowRight className="w-5 h-5 text-brand-accent shrink-0" aria-hidden />
                )}
              </div>
            );
          })}
        </div>

        {error && (
          <div
            role="alert"
            className="mb-4 flex items-start gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-sm text-red-400"
          >
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {step === 0 && (
          <div className="space-y-4">
            <label htmlFor="org-name" className="sr-only">
              Nome da organização
            </label>
            <input
              id="org-name"
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
              placeholder="Nome da organização"
              autoComplete="organization"
              className="w-full px-4 py-3 rounded-xl bg-brand-elevated border border-brand-border text-brand-text placeholder:text-brand-text-secondary focus:outline-none focus:border-brand-accent transition-colors"
            />
            <button
              type="button"
              onClick={() => setStep(1)}
              disabled={!orgName.trim()}
              className="w-full px-6 py-3 rounded-xl bg-brand-accent text-brand-bg font-semibold hover:bg-brand-accent-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Próximo
            </button>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <label htmlFor="team-name" className="sr-only">
              Nome do time
            </label>
            <input
              id="team-name"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              placeholder="Nome do time (ex.: Marketing)"
              autoComplete="organization-title"
              className="w-full px-4 py-3 rounded-xl bg-brand-elevated border border-brand-border text-brand-text placeholder:text-brand-text-secondary focus:outline-none focus:border-brand-accent transition-colors"
            />
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStep(0)}
                className="px-6 py-3 rounded-xl border border-brand-border text-brand-text hover:bg-brand-elevated transition-colors"
              >
                Voltar
              </button>
              <button
                type="button"
                onClick={() => setStep(2)}
                disabled={!teamName.trim()}
                className="flex-1 px-6 py-3 rounded-xl bg-brand-accent text-brand-bg font-semibold hover:bg-brand-accent-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Próximo
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <p className="text-sm text-brand-text-secondary">
              Você precisa de uma API key para integrar seus sistemas via API. Gere agora ou deixe
              para depois nas configurações.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-6 py-3 rounded-xl border border-brand-border text-brand-text hover:bg-brand-elevated transition-colors"
              >
                Voltar
              </button>
              <button
                type="button"
                onClick={handleGenerateKey}
                className="flex-1 px-6 py-3 rounded-xl bg-brand-elevated border border-brand-border text-brand-text hover:bg-brand-border transition-colors"
              >
                Gerar agora
              </button>
              <button
                type="button"
                onClick={() => setStep(3)}
                className="flex-1 px-6 py-3 rounded-xl bg-brand-accent text-brand-bg font-semibold hover:bg-brand-accent-hover transition-colors"
              >
                Pular
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <p className="text-sm text-brand-text-secondary">
              Conecte sua primeira conta social para começar a publicar e acompanhar resultados em
              tempo real.
            </p>
            <button
              type="button"
              onClick={handleConnectInstagram}
              className="w-full px-6 py-3 rounded-xl bg-brand-accent text-brand-bg font-semibold hover:bg-brand-accent-hover transition-colors flex items-center justify-center gap-2"
            >
              <Instagram className="w-5 h-5" /> Conectar Instagram
            </button>
            <button
              type="button"
              onClick={handleComplete}
              disabled={loading}
              className="w-full px-6 py-3 rounded-xl border border-brand-border text-brand-text hover:bg-brand-elevated transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Salvando...
                </>
              ) : (
                'Concluir e ir ao dashboard'
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
