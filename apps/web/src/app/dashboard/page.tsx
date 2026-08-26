'use client';

import Footer from '@/components/Footer';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import PlanModal from '@/components/PlanModal';
import Header from '@/components/Header';

export default function DashboardPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    fetch('/api/posts', { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => res.json())
      .then((data) => setPosts(Array.isArray(data) ? data : (data.items || [])));

    fetch('/api/accounts', { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => res.json())
      .then((data) => setAccounts(Array.isArray(data) ? data : (data.items || data.accounts || [])));
  }, [router]);

  const metrics = [
    { label: 'Posts Publicados', value: posts.filter((p) => p.status === 'posted').length, change: '+0%' },
    { label: 'Agendados', value: posts.filter((p) => p.status === 'scheduled').length, change: '+0' },
    { label: 'Contas Conectadas', value: accounts.length, change: '+0' },
    { label: 'Em rascunho', value: posts.filter((p) => p.status === 'draft').length, change: '+0' },
  ];

  const planLabels: Record<string, string> = { free: 'Free', pro: 'Pro', business: 'Business', enterprise: 'Enterprise' };
  const currentPlan = 'free';

  return (
    <div className="min-h-screen">
      <Header activeHref="/dashboard" />

      <main className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {metrics.map((m) => (
            <div
              key={m.label}
              className="p-5 rounded-2xl bg-brand-surface border border-brand-border"
            >
              <div className="text-brand-text-secondary text-sm">{m.label}</div>
              <div className="flex items-end justify-between mt-2">
                <div className="text-3xl font-mono font-bold">{m.value}</div>
                <div className="text-success text-sm font-medium">{m.change}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl bg-brand-surface border border-brand-border">
            <h2 className="text-lg font-semibold mb-4">Posts recentes</h2>
            <div className="space-y-3">
              {posts.length === 0 && (
                <div className="text-brand-text-secondary text-sm">Nenhum post ainda. Crie um em "Criar post".</div>
              )}
              {posts.slice(0, 10).map((post: any) => (
                <div
                  key={post.id}
                  className="p-4 rounded-xl bg-brand-elevated border border-brand-border flex justify-between items-start gap-4"
                >
                  <div className="flex-1 min-w-0">
                    <div className="font-medium line-clamp-1">{post.content?.split('\n')[0]}</div>
                    <div className="text-xs text-brand-text-secondary mt-1">{post.platforms?.join(', ')}</div>
                    <div className="text-xs text-brand-text-secondary mt-1">
                      {post.content?.length} caracteres
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span
                      className={`text-xs px-2 py-1 rounded-md ${
                        post.status === 'posted'
                          ? 'bg-success/10 text-success'
                          : post.status === 'scheduled'
                          ? 'bg-warning/10 text-warning'
                          : 'bg-brand-text/10 text-brand-text-secondary'
                      }`}
                    >
                      {post.status}
                    </span>
                    {post.status !== 'posted' && (
                      <button
                        onClick={async () => {
                          const token = localStorage.getItem('token');
                          await fetch('/api/posts/publish', {
                            method: 'POST',
                            body: JSON.stringify({ postId: post.id }),
                            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                          });
                          window.location.reload();
                        }}
                        className="text-xs px-3 py-1 rounded-md bg-brand-accent text-brand-bg font-medium hover:bg-brand-accent-hover whitespace-nowrap"
                      >
                        Publicar
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-brand-surface border border-brand-border">
            <h2 className="text-lg font-semibold mb-4">Contas conectadas</h2>
            <div className="space-y-3">
              {accounts.length === 0 && (
                <div className="text-brand-text-secondary text-sm">Nenhuma conta conectada.</div>
              )}
              {accounts.map((acc: any) => (
                <div
                  key={acc.id}
                  className="p-3 rounded-xl bg-brand-elevated border border-brand-border flex justify-between items-center"
                >
                  <div>
                    <div className="font-medium capitalize">{acc.platform}</div>
                    <div className="text-xs text-brand-text-secondary">{acc.username}</div>
                  </div>
                  <span className="text-xs px-2 py-1 rounded-md bg-success/10 text-success">
                    {acc.status}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-4 flex gap-2">
              <a
                href="/api/oauth/meta"
                className="text-xs px-3 py-2 rounded-md bg-brand-elevated border border-brand-border hover:bg-brand-border transition"
              >
                Conectar Instagram
              </a>
              <a
                href="/api/oauth/linkedin"
                className="text-xs px-3 py-2 rounded-md bg-brand-elevated border border-brand-border hover:bg-brand-border transition"
              >
                Conectar LinkedIn
              </a>
            </div>
          </div>
        </div>
      </main>

      {showPlanModal && <PlanModal currentPlan={currentPlan} onClose={() => setShowPlanModal(false)} />}
      <Footer />
    </div>
  );
}
