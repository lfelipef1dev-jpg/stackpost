'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, AlertCircle, Lock, Mail, ArrowRight } from 'lucide-react';
import { formatError } from '@/lib/errors';

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}

function DiscordIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.32 4.39A18.3 18.3 0 0 0 15.9 2.5a.66.66 0 0 0-.7.33 13.6 13.6 0 0 0-.61 1.28A16.8 16.8 0 0 0 9.4 4.1a.66.66 0 0 0-.76-.08 18.6 18.6 0 0 0-4.42 2.8.6.6 0 0 0-.25.46C3.25 14 6.4 18.7 9.43 21.05a.6.6 0 0 0 .75.08 14.2 14.2 0 0 0 3.3-2.47 14.7 14.7 0 0 0 3.3 2.47.6.6 0 0 0 .74-.08c3.03-2.35 6.18-7.04 5.47-13.53a.6.6 0 0 0-.26-.46 19.1 19.1 0 0 0-4.41-2.79zm-8.3 9.32a2.6 2.6 0 0 1-2.3-2.93 2.6 2.6 0 0 1 2.3-2.93 2.6 2.6 0 0 1 2.3 2.93 2.6 2.6 0 0 1-2.3 2.93zm7.15 0a2.6 2.6 0 0 1-2.3-2.93 2.6 2.6 0 0 1 2.3-2.93 2.6 2.6 0 0 1 2.3 2.93 2.6 2.6 0 0 1-2.3 2.93z" />
    </svg>
  );
}

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
  const redirect = searchParams.get('redirect') || '/dashboard';
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
        // Decodificar redirect se estiver encoded
        const decodedRedirect = decodeURIComponent(redirect);
        // Se o redirect comeca com /, usar direto. Senao, prefixar com /
        const target = decodedRedirect.startsWith('/') ? decodedRedirect : `/${decodedRedirect}`;
        router.push(target);
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

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-brand-border" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-2 bg-brand-surface/60 text-brand-text-secondary">ou continue com</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <a
                href={`/api/auth/oauth?provider=google&redirect=${encodeURIComponent(redirect)}`}
                className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-brand-elevated border border-brand-border text-brand-text font-semibold text-sm hover:border-brand-accent/40 hover:bg-brand-elevated/80 transition-colors"
              >
                <GoogleIcon className="w-4 h-4" />
                Google
              </a>
              <a
                href={`/api/auth/oauth?provider=discord&redirect=${encodeURIComponent(redirect)}`}
                className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-brand-elevated border border-brand-border text-brand-text font-semibold text-sm hover:border-brand-accent/40 hover:bg-brand-elevated/80 transition-colors"
              >
                <DiscordIcon className="w-4 h-4" />
                Discord
              </a>
            </div>

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
