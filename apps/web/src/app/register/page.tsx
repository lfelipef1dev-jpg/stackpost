'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, AlertCircle, Sparkles } from 'lucide-react';
import { formatError } from '@/lib/errors';

/* ------------------------------------------------------------------ */
/* SpotlightCard                                                       */
/* ------------------------------------------------------------------ */
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

/* ------------------------------------------------------------------ */
/* TiltCard                                                            */
/* ------------------------------------------------------------------ */
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

function RegisterForm() {
  const [name, setName] = useState('');
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
    if (loading) return;
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, password }),
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await res.json();

      if (res.ok) {
        const savedPlan = localStorage.getItem('selectedPlan');
        if (savedPlan && redirect === 'plans') {
          localStorage.removeItem('selectedPlan');
          router.push(`/plans?plan=${savedPlan}`);
        } else {
          router.push(redirect === 'plans' ? '/plans' : `/${redirect}`);
        }
      } else {
        setError(formatError(data.error) || 'Não foi possível criar sua conta. Tente novamente.');
        setLoading(false);
      }
    } catch {
      setError('Falha de conexão. Verifique sua internet e tente novamente.');
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <TiltCard>
          <SpotlightCard className="p-8" glow="#8AB4F8">
            <div className="text-center space-y-3 mb-8">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-brand-accent/10 text-brand-accent mb-1">
                <Sparkles className="w-6 h-6" />
              </div>
              <h1 className="text-2xl font-bold font-display text-brand-text">
                Criar sua conta
              </h1>
              <p className="text-brand-text-secondary text-sm">
                Publique em todas as redes com um único painel. Comece grátis em segundos.
              </p>
            </div>

            {error && (
              <div
                role="alert"
                aria-live="assertive"
                className="mb-4 flex items-start gap-2 p-3 rounded-xl bg-error/10 text-error text-sm"
              >
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-1">
                <label htmlFor="name" className="text-sm text-brand-text-secondary">
                  Nome
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoComplete="name"
                  required
                  disabled={loading}
                  className="w-full px-4 py-3 rounded-xl bg-brand-elevated border border-brand-border text-brand-text placeholder:text-brand-text-secondary/60 focus:outline-none focus:border-brand-accent transition-colors disabled:opacity-50"
                  placeholder="Seu nome"
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="email" className="text-sm text-brand-text-secondary">
                  E-mail
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                  disabled={loading}
                  className="w-full px-4 py-3 rounded-xl bg-brand-elevated border border-brand-border text-brand-text placeholder:text-brand-text-secondary/60 focus:outline-none focus:border-brand-accent transition-colors disabled:opacity-50"
                  placeholder="voce@stackpost.com.br"
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="password" className="text-sm text-brand-text-secondary">
                  Senha
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                  minLength={6}
                  required
                  disabled={loading}
                  className="w-full px-4 py-3 rounded-xl bg-brand-elevated border border-brand-border text-brand-text placeholder:text-brand-text-secondary/60 focus:outline-none focus:border-brand-accent transition-colors disabled:opacity-50"
                  placeholder="Mínimo de 6 caracteres"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-brand-accent text-brand-bg font-semibold hover:bg-brand-accent-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                {loading ? 'Criando sua conta...' : 'Criar conta grátis'}
              </button>
            </form>

            <p className="text-center text-brand-text-secondary text-sm mt-6">
              Já tem conta?{' '}
              <a
                href="/login"
                className="text-brand-accent hover:underline transition-colors"
              >
                Entrar
              </a>
            </p>
          </SpotlightCard>
        </TiltCard>
      </div>
    </main>
  );
}

const registerFallback = (
  <main className="min-h-screen flex items-center justify-center px-4">
    <div className="w-full max-w-md p-8 rounded-3xl bg-brand-surface/60 backdrop-blur-xl border border-brand-border/50 text-center text-brand-text-secondary">
      Carregando...
    </div>
  </main>
);

export default function RegisterPage() {
  return (
    <Suspense fallback={registerFallback}>
      <RegisterForm />
    </Suspense>
  );
}
