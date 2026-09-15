'use client';

import { useEffect, useRef, useState } from 'react';
import { Bug, Loader2, Check, X } from 'lucide-react';
import { useFocusTrap } from '@/lib/useFocusTrap';

const CATEGORIES = [
  { id: 'bug', label: 'Bug / algo quebrado' },
  { id: 'erro', label: 'Erro / mensagem estranha' },
  { id: 'melhoria', label: 'Sugestão de melhoria' },
  { id: 'duvida', label: 'Dúvida' },
  { id: 'outro', label: 'Outro' },
];

export default function ReportButton() {
  const [open, setOpen] = useState(false);
  const [closing, setClosing] = useState(false);
  const [category, setCategory] = useState('bug');
  const [message, setMessage] = useState('');
  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const trapRef = useFocusTrap<HTMLDivElement>(open, () => close());

  const close = () => {
    setClosing(true);
    setTimeout(() => { setOpen(false); setClosing(false); setState('idle'); setMessage(''); }, 180);
  };

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') close(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  async function submit() {
    if (message.trim().length < 5) return;
    setState('sending');
    try {
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category, message, pageUrl: location.href }),
      });
      setState(res.ok ? 'sent' : 'error');
    } catch {
      setState('error');
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="p-2 rounded-lg text-brand-text-secondary hover:text-brand-text hover:bg-brand-elevated transition"
        aria-label="Reportar problema"
        title="Reportar problema"
      >
        <Bug className="w-4 h-4" />
      </button>

      {open && (
        <div
          className={`fixed inset-0 z-[70] flex items-center justify-center p-4 ${closing ? 'menu-overlay-out' : 'menu-overlay-in'}`}
          style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)' }}
          onMouseDown={(e) => { if (e.target === e.currentTarget) close(); }}
        >
          <div
            ref={trapRef}
            role="dialog"
            aria-modal="true"
            aria-label="Reportar problema"
            className={`w-full max-w-md rounded-3xl bg-brand-surface border border-brand-border p-6 shadow-2xl ${closing ? 'menu-panel-out' : 'menu-panel-in'}`}
          >
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand-accent/10 flex items-center justify-center">
                  <Bug className="w-5 h-5 text-brand-accent" />
                </div>
                <h3 className="text-lg font-bold">Reportar problema</h3>
              </div>
              <button onClick={close} className="p-2 rounded-lg text-brand-text-secondary hover:bg-brand-elevated transition" aria-label="Fechar">
                <X className="w-4 h-4" />
              </button>
            </div>

            {state === 'sent' ? (
              <div className="text-center py-6">
                <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
                  <Check className="w-6 h-6 text-success" />
                </div>
                <p className="font-semibold">Recebido!</p>
                <p className="text-sm text-brand-text-secondary mt-1">Vamos analisar e corrigir. Obrigado.</p>
              </div>
            ) : (
              <>
                <div className="flex flex-wrap gap-2 mb-4">
                  {CATEGORIES.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => setCategory(c.id)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition ${
                        category === c.id ? 'bg-brand-accent/15 text-brand-accent border-brand-accent/50' : 'border-brand-border text-brand-text-secondary hover:bg-brand-elevated'
                      }`}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={4}
                  placeholder="Descreva o que aconteceu (o que você clicou, o que esperava)..."
                  className="w-full px-4 py-3 rounded-2xl bg-brand-elevated border border-brand-border text-sm focus:outline-none focus:border-brand-accent resize-none"
                  autoFocus
                />
                {state === 'error' && <p className="text-xs text-error mt-2">Falha ao enviar — tente de novo.</p>}
                <button
                  onClick={submit}
                  disabled={state === 'sending' || message.trim().length < 5}
                  className="mt-4 w-full px-4 py-3 rounded-xl bg-brand-accent text-brand-bg font-semibold hover:bg-brand-accent-hover transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {state === 'sending' ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  Enviar report
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
