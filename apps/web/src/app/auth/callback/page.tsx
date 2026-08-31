'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

function CallbackContent() {
  const [status, setStatus] = useState('Processando login...');
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/dashboard';

  useEffect(() => {
    const hash = window.location.hash.substring(1);
    const params = new URLSearchParams(hash);
    const accessToken = params.get('access_token');
    const refreshToken = params.get('refresh_token');

    if (!accessToken || !refreshToken) {
      setStatus('Tokens nao encontrados. Redirecionando...');
      window.location.href = '/login?error=tokens_missing';
      return;
    }

    fetch('/api/auth/callback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        access_token: accessToken,
        refresh_token: refreshToken,
        redirect,
      }),
    })
      .then(async (res) => {
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || 'Falha no login');
        }
        return res.json();
      })
      .then((data) => {
        setStatus('Login ok. Redirecionando...');
        const target = data.redirect || '/dashboard';
        window.location.href = target;
      })
      .catch((err) => {
        setStatus('Erro: ' + err.message);
        setTimeout(() => {
          window.location.href = '/login?error=oauth_callback';
        }, 2000);
      });
  }, [redirect]);

  return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin w-8 h-8 border-2 border-brand-accent border-t-transparent rounded-full mx-auto mb-4" />
        <p className="text-brand-text-secondary">{status}</p>
      </div>
    </main>
  );
}

export default function CallbackPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Carregando...</div>}>
      <CallbackContent />
    </Suspense>
  );
}
