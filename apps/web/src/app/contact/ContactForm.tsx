'use client';

import { useState } from 'react';
import { AlertCircle, CheckCircle2, Loader2, Send } from 'lucide-react';
import { TiltCard } from '@/components/TiltCard';
import { SpotlightCard } from '@/components/SpotlightCard';
import { formatError } from '@/lib/errors';

type Status = 'idle' | 'loading' | 'success' | 'error';

export function ContactForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (status === 'loading') return;

    setStatus('loading');
    setError('');

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, subject, message }),
      });

      const data = await res.json();

      if (res.ok) {
        setStatus('success');
        setName('');
        setEmail('');
        setSubject('');
        setMessage('');
      } else {
        setError(formatError(data) || 'Não foi possível enviar sua mensagem. Tente novamente.');
        setStatus('error');
      }
    } catch {
      setError('Falha de conexão. Verifique sua internet e tente novamente.');
      setStatus('error');
    }
  }

  if (status === 'success') {
    return (
      <TiltCard>
        <SpotlightCard className="p-8 text-center" spotlightColor="rgba(34, 197, 94, 0.15)">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-success/10 text-success mb-4">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold font-display text-brand-text mb-2">
            Mensagem enviada com sucesso!
          </h2>
          <p className="text-sm text-brand-text-secondary mb-6">
            Recebemos sua mensagem e nosso time entrará em contato em até 1 dia útil.
          </p>
          <button
            type="button"
            onClick={() => setStatus('idle')}
            className="px-5 py-2.5 rounded-xl bg-brand-elevated border border-brand-border text-brand-text text-sm font-medium hover:bg-brand-surface transition-colors"
          >
            Enviar nova mensagem
          </button>
        </SpotlightCard>
      </TiltCard>
    );
  }

  const disabled = status === 'loading';

  return (
    <TiltCard>
      <SpotlightCard className="p-6 sm:p-8" spotlightColor="rgba(138, 180, 248, 0.15)">
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
            <label htmlFor="name" className="block text-sm text-brand-text-secondary">
              Nome
            </label>
            <input
              id="name"
              name="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
              required
              disabled={disabled}
              className="w-full px-4 py-3 rounded-xl bg-brand-elevated border border-brand-border text-brand-text placeholder:text-brand-text-secondary/60 focus:outline-none focus:border-brand-accent transition-colors disabled:opacity-50"
              placeholder="Seu nome completo"
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="email" className="block text-sm text-brand-text-secondary">
              E-mail
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
              disabled={disabled}
              className="w-full px-4 py-3 rounded-xl bg-brand-elevated border border-brand-border text-brand-text placeholder:text-brand-text-secondary/60 focus:outline-none focus:border-brand-accent transition-colors disabled:opacity-50"
              placeholder="voce@email.com"
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="subject" className="block text-sm text-brand-text-secondary">
              Assunto
            </label>
            <select
              id="subject"
              name="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
              disabled={disabled}
              className="w-full px-4 py-3 rounded-xl bg-brand-elevated border border-brand-border text-brand-text focus:outline-none focus:border-brand-accent transition-colors disabled:opacity-50"
            >
              <option value="" disabled>Selecione um assunto</option>
              <option value="suporte">Suporte técnico</option>
              <option value="vendas">Vendas e planos</option>
              <option value="parcerias">Parcerias</option>
              <option value="api">Dúvidas sobre a API</option>
              <option value="outro">Outro assunto</option>
            </select>
          </div>

          <div className="space-y-1">
            <label htmlFor="message" className="block text-sm text-brand-text-secondary">
              Mensagem
            </label>
            <textarea
              id="message"
              name="message"
              rows={5}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
              disabled={disabled}
              minLength={10}
              className="w-full px-4 py-3 rounded-xl bg-brand-elevated border border-brand-border text-brand-text placeholder:text-brand-text-secondary/60 focus:outline-none focus:border-brand-accent transition-colors disabled:opacity-50 resize-y"
              placeholder="Como podemos ajudar? Conte os detalhes do seu pedido."
            />
          </div>

          <button
            type="submit"
            disabled={disabled}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-brand-accent text-brand-bg font-semibold hover:bg-brand-accent-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {disabled ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Enviar mensagem
              </>
            )}
          </button>
        </form>
      </SpotlightCard>
    </TiltCard>
  );
}
