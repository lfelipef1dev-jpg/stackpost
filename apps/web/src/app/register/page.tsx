'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { formatError } from '@/lib/errors';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const res = await fetch('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
      headers: { 'Content-Type': 'application/json' },
    });

    const data = await res.json();
    setLoading(false);

    if (res.ok) {
      localStorage.setItem('token', data.token);
      router.push('/dashboard');
    } else {
      setError(formatError(data.error) || 'Erro ao criar conta');
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md p-8 rounded-2xl bg-brand-surface border border-brand-border">
        <div className="text-center space-y-2 mb-8">
          <h1 className="text-2xl font-bold">Criar conta</h1>
          <p className="text-brand-text-secondary text-sm">
            Comece a publicar em todas as redes.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-error/10 text-error text-sm">{error}</div>
        )}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-1">
            <label className="text-sm text-brand-text-secondary">Nome</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-brand-elevated border border-brand-border text-brand-text focus:outline-none focus:border-brand-accent"
              placeholder="Seu nome"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm text-brand-text-secondary">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-brand-elevated border border-brand-border text-brand-text focus:outline-none focus:border-brand-accent"
              placeholder="voce@expostacker.com.br"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm text-brand-text-secondary">Senha</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-brand-elevated border border-brand-border text-brand-text focus:outline-none focus:border-brand-accent"
              placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full px-6 py-3 rounded-xl bg-brand-accent text-brand-bg font-semibold hover:bg-brand-accent-hover transition disabled:opacity-50"
          >
            {loading ? 'Criando...' : 'Criar conta'}
          </button>
        </form>

        <p className="text-center text-brand-text-secondary text-sm mt-6">
          Ja tem conta? <a href="/login" className="text-brand-accent hover:underline">Entrar</a>
        </p>
      </div>
    </main>
  );
}
