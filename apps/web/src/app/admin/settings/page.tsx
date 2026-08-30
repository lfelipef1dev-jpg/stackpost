'use client';

import { useEffect, useState } from 'react';
import { Loader2, Settings, Save, AlertCircle, CheckCircle2 } from 'lucide-react';

interface Setting { id: string; key: string; value: string; }

type Mensagem = { tipo: 'sucesso' | 'erro'; texto: string } | null;

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Setting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [mensagem, setMensagem] = useState<Mensagem>(null);
  const [newKey, setNewKey] = useState('');
  const [newValue, setNewValue] = useState('');
  const [salvandoId, setSalvandoId] = useState<string | null>(null);
  const [adicionando, setAdicionando] = useState(false);

  useEffect(() => {
    fetch('/api/admin/settings')
      .then(async (r) => {
        if (!r.ok) throw new Error('Falha ao carregar configurações.');
        return r.json();
      })
      .then(setSettings)
      .catch((e: unknown) => setError(e instanceof Error ? e.message : 'Não foi possível carregar as configurações.'))
      .finally(() => setLoading(false));
  }, []);

  async function update(s: Setting) {
    setSalvandoId(s.id);
    setMensagem(null);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(s),
      });
      if (!res.ok) {
        let msg = 'Falha ao salvar a configuração.';
        try {
          const j = await res.json();
          msg = j.error || msg;
        } catch {
          /* resposta sem corpo JSON */
        }
        throw new Error(msg);
      }
      setMensagem({ tipo: 'sucesso', texto: `Configuração "${s.key}" salva com sucesso.` });
    } catch (e: unknown) {
      setMensagem({ tipo: 'erro', texto: e instanceof Error ? e.message : 'Falha ao salvar a configuração.' });
    } finally {
      setSalvandoId(null);
    }
  }

  async function add() {
    if (!newKey.trim()) {
      setMensagem({ tipo: 'erro', texto: 'Informe uma chave para a nova configuração.' });
      return;
    }
    setAdicionando(true);
    setMensagem(null);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: newKey.trim(), value: newValue }),
      });
      if (!res.ok) {
        let msg = 'Falha ao adicionar a configuração.';
        try {
          const j = await res.json();
          msg = j.error || msg;
        } catch {
          /* resposta sem corpo JSON */
        }
        throw new Error(msg);
      }
      const s = await res.json();
      setSettings((prev) => [...prev, s]);
      setNewKey('');
      setNewValue('');
      setMensagem({ tipo: 'sucesso', texto: `Configuração "${s.key}" adicionada com sucesso.` });
    } catch (e: unknown) {
      setMensagem({ tipo: 'erro', texto: e instanceof Error ? e.message : 'Falha ao adicionar a configuração.' });
    } finally {
      setAdicionando(false);
    }
  }

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center" role="status" aria-live="polite" aria-label="Carregando configurações">
        <Loader2 className="w-8 h-8 animate-spin text-brand-accent" aria-hidden="true" />
        <span className="sr-only">Carregando configurações…</span>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="flex items-start gap-3 p-6 rounded-2xl bg-red-500/10 text-red-400 border border-red-500/30"
        role="alert"
        aria-live="assertive"
      >
        <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" aria-hidden="true" />
        <div>
          <p className="font-semibold">Não foi possível carregar as configurações</p>
          <p className="text-sm mt-1">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <header className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Configurações</h1>
        <p className="text-brand-text-secondary">Gerencie as variáveis e parâmetros do sistema.</p>
      </header>

      {mensagem && (
        <div
          className={`mb-6 flex items-start gap-3 p-4 rounded-xl border text-sm ${
            mensagem.tipo === 'sucesso'
              ? 'bg-brand-accent/10 border-brand-accent/30 text-brand-text'
              : 'bg-red-500/10 border-red-500/30 text-red-400'
          }`}
          role={mensagem.tipo === 'erro' ? 'alert' : 'status'}
          aria-live="polite"
        >
          {mensagem.tipo === 'sucesso' ? (
            <CheckCircle2 className="w-5 h-5 mt-0.5 shrink-0 text-brand-accent" aria-hidden="true" />
          ) : (
            <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" aria-hidden="true" />
          )}
          <span>{mensagem.texto}</span>
        </div>
      )}

      <section className="rounded-2xl bg-brand-surface border border-brand-border overflow-hidden mb-8" aria-label="Configurações existentes">
        <table className="w-full text-sm text-left">
          <thead className="bg-brand-elevated text-brand-text-secondary">
            <tr>
              <th scope="col" className="px-6 py-4 font-semibold">Chave</th>
              <th scope="col" className="px-6 py-4 font-semibold">Valor</th>
              <th scope="col" className="px-6 py-4 font-semibold">Ação</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-border">
            {settings.map((s) => (
              <tr key={s.id} className="hover:bg-brand-elevated/50">
                <th scope="row" className="px-6 py-4 font-medium text-left">{s.key}</th>
                <td className="px-6 py-4">
                  <label htmlFor={`valor-${s.id}`} className="sr-only">Valor da configuração {s.key}</label>
                  <input
                    id={`valor-${s.id}`}
                    value={s.value}
                    onChange={(e) => setSettings((prev) => prev.map((x) => x.id === s.id ? { ...x, value: e.target.value } : x))}
                    className="w-full px-3 py-2 rounded-lg bg-brand-bg border border-brand-border text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-accent"
                  />
                </td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => update(s)}
                    disabled={salvandoId === s.id}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-brand-accent text-brand-bg text-xs font-bold disabled:opacity-60 disabled:cursor-not-allowed"
                    aria-label={`Salvar configuração ${s.key}`}
                  >
                    {salvandoId === s.id ? (
                      <Loader2 className="w-3 h-3 animate-spin" aria-hidden="true" />
                    ) : (
                      <Save className="w-3 h-3" aria-hidden="true" />
                    )}
                    Salvar
                  </button>
                </td>
              </tr>
            ))}
            {settings.length === 0 && (
              <tr>
                <td colSpan={3} className="px-6 py-8 text-center text-brand-text-secondary">
                  Nenhuma configuração cadastrada. Adicione uma nova abaixo.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>

      <section className="p-6 rounded-2xl bg-brand-surface border border-brand-border" aria-label="Adicionar nova configuração">
        <h2 className="font-bold mb-4">Nova configuração</h2>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label htmlFor="nova-chave" className="block text-sm font-medium mb-1.5 text-brand-text-secondary">Chave</label>
            <input
              id="nova-chave"
              value={newKey}
              onChange={(e) => setNewKey(e.target.value)}
              placeholder="ex.: NOTIFICACAO_EMAIL"
              className="w-full px-4 py-3 rounded-xl bg-brand-bg border border-brand-border text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-accent"
            />
          </div>
          <div className="flex-1">
            <label htmlFor="novo-valor" className="block text-sm font-medium mb-1.5 text-brand-text-secondary">Valor</label>
            <input
              id="novo-valor"
              value={newValue}
              onChange={(e) => setNewValue(e.target.value)}
              placeholder="ex.: true"
              className="w-full px-4 py-3 rounded-xl bg-brand-bg border border-brand-border text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-accent"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={add}
              disabled={adicionando}
              className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-brand-accent text-brand-bg font-bold disabled:opacity-60 disabled:cursor-not-allowed w-full sm:w-auto"
              aria-label="Adicionar nova configuração"
            >
              {adicionando ? (
                <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
              ) : (
                <Settings className="w-4 h-4" aria-hidden="true" />
              )}
              Adicionar
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
