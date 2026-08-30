'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, AlertCircle, Lock, Mail, ArrowRight } from 'lucide-react';
import { formatError } from '@/lib/errors';

function SpotlightCard({
  children,
  className = '',
  glow = '#8AB4F8',
}: {
  children: React.ReactNode;
  className?: string;
  glow?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [spot, setSpot] = useState({ x: 0, y: 0, active: false });
  return (
    <div
      ref={ref}
      onMouseMove={(e) => {
        if (!ref.current) return;
        const r = ref.current.getBoundingClientRect();
        setSpot({ x: e.clientX - r.left, y: e.clientY - r.top, active: true });
      }}
      onMouseLeave={() => setSpot((s) => ({ ...s, active: false }))}
      className={`relative rounded-3xl bg-brand-surface/60 backdrop-blur-xl border border-brand-border/50 ${className}`}
      style={{
        backgroundImage: spot.active
          ? `radial-gradient(circle 120px at ${spot.x}px ${spot.y}px, ${glow}0a, transparent)`
          : undefined,
      }}
    >
      <div
        className="absolute inset-0 rounded-3xl pointer-events-none"
        style={{
          boxShadow: spot.active ? `inset 0 0 0 1px ${glow}25` : 'inset 0 0 0 1px transparent',
          transition: 'box-shadow 0.3s',
        }}
      />
      {children}
    </div>
  );
}

function TiltCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [style, setStyle] = useState({});
  return (
    <div
      ref={ref}
      onMouseMove={(e) => {
        if (!ref.current) return;
        const r = ref.current.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        setStyle({
          transform: `perspective(1200px) rotateX(${-y * 1.5}deg) rotateY(${x * 1.5}deg)`,
          transition: 'transform 0.15s ease-out',
        });
      }}
      onMouseLeave={() =>
        setStyle({
          transform: 'perspective(1200px) rotateX(0) rotateY(0)',
          transition: 'transform 0.4s ease-out',
        })
      }
      style={style}
      className={`will-change-transform ${className}`}
    >
      {children}
    </div>
  );
}

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || 'dashboard';
  const plan = searchParams.get('plan');

  useEffect(() => {
    if (plan) {
      localStorage.setItem('selectedPlan', plan);
    }
  }, [plan]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await res.json();
      setLoading(false);

      if (res.ok) {
        const savedPlan = localStorage.getItem('selectedPlan');
        if (savedPlan && redirect === 'plans') {
          localStorage.removeItem('selectedPlan');
          router.push(`/plans?plan=${savedPlan}`);
        } else {
          router.push(redirect === 'plans' ? '/plans' : `/${redirect}`);
        }
      } else {
        setError(formatError(data.error) || 'Não foi possível entrar. Verifique seus dados.');
      }
    } catch {
      setLoading(false);
      setError('Falha de conexão. Verifique sua internet e tente novamente.');
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <TiltCard>
          <SpotlightCard className="p-8" glow="#8AB4F8">
            <div className="text-center space-y-2 mb-8">
              <h1 className="text-2xl font-bold">Entrar no StackPost</h1>
              <p className="text-brand-text-secondary text-sm">
                Acesse sua conta para publicar em todas as redes com um único painel.
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-error/10 text-error text-sm flex items-start gap-2">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-1">
                <label className="text-sm text-brand-text-secondary" htmlFor="email">
                  E-mail
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-text-secondary" />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-brand-elevated border border-brand-border text-brand-text focus:outline-none focus:border-brand-accent transition-colors"
                    placeholder="voce@stackpost.com.br"
                    autoComplete="email"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-sm text-brand-text-secondary" htmlFor="password">
                  Senha
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-text-secondary" />
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-brand-elevated border border-brand-border text-brand-text focus:outline-none focus:border-brand-accent transition-colors"
                    placeholder="••••••••"
                    autoComplete="current-password"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full px-6 py-3 rounded-xl bg-brand-accent text-brand-bg font-semibold hover:bg-brand-accent-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Entrando...
                  </>
                ) : (
                  <>
                    Entrar
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <p className="text-center text-brand-text-secondary text-sm mt-6">
              Ainda não tem conta?{' '}
              <a href="/register" className="text-brand-accent hover:underline font-medium">
                Criar conta
              </a>
            </p>
          </SpotlightCard>
        </TiltCard>
      </div>
    </main>
  );
}

const loginFallback = (
  <main className="min-h-screen flex items-center justify-center px-4">
    <div className="w-full max-w-md p-8 rounded-2xl bg-brand-surface border border-brand-border text-center flex items-center justify-center gap-2 text-brand-text-secondary">
      <Loader2 className="w-4 h-4 animate-spin" />
      Carregando...
    </div>
  </main>
);

export default function LoginPage() {
  return (
    <Suspense fallback={loginFallback}>
      <LoginForm />
    </Suspense>
  );
}
