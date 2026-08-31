'use client';

import Header from '@/components/Header';
import Footer from '@/components/Footer';

import { useEffect, useState, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { PLATFORMS } from '@/lib/platforms';
import { PlatformIcon } from '@/components/PlatformIcon';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  X,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileEdit,
  Loader2,
  Calendar as CalIcon,
  List,
  LayoutGrid,
  Filter,
  Share2,
  Sparkles,
  TrendingUp,
  Users,
  Zap,
  BarChart3,
  Megaphone,
  ArrowRight,
  Trash2,
  Copy,
  Edit3,
  Send,
  RotateCcw,
} from 'lucide-react';

const MONTHS = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
const DAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

const WORKSPACES = [
  { id: 'all', name: 'Todas as marcas', client: 'Visão geral' },
  { id: 'stackpost', name: 'StackPost', client: 'Próprio' },
  { id: 'cliente_a', name: 'Cliente A', client: 'Agência' },
  { id: 'cliente_b', name: 'Cliente B', client: 'Agência' },
];

const CAMPAIGNS = ['Black Friday', 'Lançamento', 'Evergreen', 'Dicas', 'Vendas'];

const statusConfig: Record<string, { icon: any; color: string; bg: string; label: string }> = {
  posted: { icon: CheckCircle2, color: 'text-success', bg: 'bg-success/10', label: 'Publicado' },
  scheduled: { icon: Clock, color: 'text-warning', bg: 'bg-warning/10', label: 'Agendado' },
  error: { icon: AlertCircle, color: 'text-error', bg: 'bg-error/10', label: 'Erro' },
  draft: { icon: FileEdit, color: 'text-brand-text-secondary', bg: 'bg-brand-elevated', label: 'Rascunho' },
  processing: { icon: Loader2, color: 'text-info', bg: 'bg-info/10', label: 'Processando' },
  pending: { icon: Clock, color: 'text-orange-400', bg: 'bg-orange-400/10', label: 'Aprovação' },
};

function SpotlightCard({ children, className = '', glow = '#6366F1', onClick }: { children: React.ReactNode; className?: string; glow?: string; onClick?: (e: React.MouseEvent) => void }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [spot, setSpot] = useState({ x: 0, y: 0, active: false });
  const handleMove = (e: React.MouseEvent) => {
    if (!cardRef.current) return;
    const r = cardRef.current.getBoundingClientRect();
    setSpot({ x: e.clientX - r.left, y: e.clientY - r.top, active: true });
  };
  return (
    <div
      ref={cardRef}
      onMouseMove={handleMove}
      onMouseLeave={() => setSpot((s) => ({ ...s, active: false }))}
      onClick={onClick}
      className={`relative overflow-hidden rounded-3xl bg-brand-surface/60 backdrop-blur-xl border border-brand-border/50 ${className}`}
      style={{
        backgroundImage: spot.active ? `radial-gradient(circle 180px at ${spot.x}px ${spot.y}px, ${glow}14, transparent)` : undefined,
      }}
    >
      <div className="absolute inset-0 rounded-3xl pointer-events-none" style={{ boxShadow: spot.active ? `inset 0 0 0 1px ${glow}40` : 'inset 0 0 0 1px transparent', transition: 'box-shadow 0.3s' }} />
      {children}
    </div>
  );
}

function TiltCard({ children, className = '', onClick }: { children: React.ReactNode; className?: string; onClick?: (e: React.MouseEvent) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const [style, setStyle] = useState({});
  const onMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const r = ref.current.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    setStyle({ transform: `perspective(1000px) rotateX(${-y * 4}deg) rotateY(${x * 4}deg) scale3d(1.01, 1.01, 1.01)`, transition: 'transform 0.1s ease-out' });
  };
  const onLeave = () => setStyle({ transform: 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)', transition: 'transform 0.4s ease-out' });
  return (
    <div ref={ref} onMouseMove={onMove} onMouseLeave={onLeave} onClick={onClick} style={style} className={`will-change-transform ${className}`}>
      {children}
    </div>
  );
}

export default function CalendarPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [draggedPost, setDraggedPost] = useState<any>(null);
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [view, setView] = useState<'month' | 'list'>('month');
  const [workspace, setWorkspace] = useState('all');
  const [filterStatus, setFilterStatus] = useState<string[]>([]);
  const [filterPlatform, setFilterPlatform] = useState<string[]>([]);
  const [filterCampaign, setFilterCampaign] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [editingPost, setEditingPost] = useState<any | null>(null);
  const [editContent, setEditContent] = useState('');
  const [editScheduledAt, setEditScheduledAt] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setLoading(true);
    fetch('/api/posts')
      .then((res) => res.json())
      .then((data) => {
        const items = Array.isArray(data) ? data : (data.items || []);
        // Enriquecer dados mock para demonstração comercial
        const enriched = items.map((p: any, i: number) => ({
          ...p,
          approval_status: p.approval_status || (i % 5 === 0 ? 'pending' : 'approved'),
          campaign: p.campaign || CAMPAIGNS[i % CAMPAIGNS.length],
          owner: p.owner || (i % 2 === 0 ? 'Você' : 'Equipe'),
          workspace: p.workspace || 'stackpost',
        }));
        setPosts(enriched);
        setLoading(false);
      });
  }, []);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const calendarDays: (Date | null)[] = [];
  for (let i = 0; i < firstDay; i++) calendarDays.push(null);
  for (let d = 1; d <= daysInMonth; d++) calendarDays.push(new Date(year, month, d));
  while (calendarDays.length % 7 !== 0) calendarDays.push(null);

  const filteredPosts = useMemo(() => {
    return posts.filter((p) => {
      if (workspace !== 'all' && p.workspace !== workspace) return false;
      if (filterStatus.length && !filterStatus.includes(p.approval_status === 'pending' ? 'pending' : p.status)) return false;
      if (filterPlatform.length && !p.platforms?.some((x: string) => filterPlatform.includes(x))) return false;
      if (filterCampaign.length && !filterCampaign.includes(p.campaign)) return false;
      return true;
    });
  }, [posts, workspace, filterStatus, filterPlatform, filterCampaign]);

  function postsForDay(date: Date) {
    return filteredPosts.filter((p) => {
      const pdate = new Date(p.scheduled_at || p.created_at);
      return pdate.toDateString() === date.toDateString();
    });
  }

  function prevMonth() {
    setCurrentDate(new Date(year, month - 1, 1));
  }
  function nextMonth() {
    setCurrentDate(new Date(year, month + 1, 1));
  }
  function goToday() {
    setCurrentDate(new Date());
  }

  async function handleDrop(date: Date) {
    if (!draggedPost) return;
    const newDate = new Date(date);
    newDate.setHours(10, 0, 0, 0);

    await fetch('/api/posts', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: draggedPost.id, scheduledAt: newDate.toISOString() }),
    });

    setPosts((prev) =>
      prev.map((p) => (p.id === draggedPost.id ? { ...p, scheduled_at: newDate.toISOString() } : p))
    );
    setDraggedPost(null);
  }

  function toggleFilter<T>(set: React.Dispatch<React.SetStateAction<T[]>>, value: T) {
    set((prev) => prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]);
  }

  function clearFilters() {
    setFilterStatus([]);
    setFilterPlatform([]);
    setFilterCampaign([]);
    setWorkspace('all');
  }

  async function deletePost(postId: string) {
    if (!confirm('Tem certeza que deseja excluir este post?')) return;
    setActionLoading(true);
    const res = await fetch(`/api/posts/${postId}`, {
      method: 'DELETE',
    });
    if (res.ok) {
      setPosts((prev) => prev.filter((p) => p.id !== postId));
      setMessage('Post excluído.');
    } else {
      setMessage('Erro ao excluir post.');
    }
    setActionLoading(false);
  }

  async function approvePost(postId: string, action: 'approve' | 'reject' | 'submit_for_review') {
    setActionLoading(true);
    const res = await fetch('/api/posts/approve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ postId, action }),
    });
    const data = await res.json();
    if (res.ok) {
      setPosts((prev) => prev.map((p) => (p.id === postId ? { ...p, ...data, status: data.status } : p)));
      setMessage(action === 'approve' ? 'Post aprovado.' : action === 'reject' ? 'Post reprovado.' : 'Post enviado para revisão.');
    } else {
      setMessage(data.error || 'Erro na aprovação.');
    }
    setActionLoading(false);
  }

  async function publishNow(postId: string) {
    setActionLoading(true);
    const res = await fetch('/api/posts/publish', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ postId }),
    });
    const data = await res.json();
    if (res.ok) {
      setPosts((prev) => prev.map((p) => (p.id === postId ? { ...p, status: 'posted', published_at: new Date().toISOString() } : p)));
      setMessage(`Publicado! Status: ${data.status}`);
    } else {
      setMessage(data.error || 'Erro ao publicar.');
    }
    setActionLoading(false);
  }

  async function duplicatePost(post: any) {
    setActionLoading(true);
    const res = await fetch('/api/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: `${post.content} (cópia)`,
        platforms: post.platforms,
        uploadIds: post.upload_ids || post.uploadIds,
        scheduledAt: new Date().toISOString(),
        postType: post.post_type || post.postType || 'POST',
        firstComment: post.first_comment || post.firstComment,
      }),
    });
    const data = await res.json();
    if (res.ok) {
      setPosts((prev) => [{ ...data, campaign: post.campaign, owner: post.owner, workspace: post.workspace }, ...prev]);
      setMessage('Post duplicado.');
    } else {
      setMessage(data.error || 'Erro ao duplicar.');
    }
    setActionLoading(false);
  }

  function startEdit(post: any) {
    setEditingPost(post);
    setEditContent(post.content || '');
    const d = new Date(post.scheduled_at || post.created_at);
    const iso = new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
    setEditScheduledAt(iso);
  }

  async function saveEdit() {
    if (!editingPost) return;
    setActionLoading(true);
    const res = await fetch(`/api/posts/${editingPost.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: editContent, scheduledAt: new Date(editScheduledAt).toISOString() }),
    });
    const data = await res.json();
    if (res.ok) {
      setPosts((prev) => prev.map((p) => (p.id === editingPost.id ? { ...p, ...data, campaign: p.campaign, owner: p.owner, workspace: p.workspace } : p)));
      setMessage('Post atualizado.');
      setEditingPost(null);
    } else {
      setMessage(data.error || 'Erro ao salvar.');
    }
    setActionLoading(false);
  }

  function shareCalendar() {
    const url = `${window.location.origin}/calendar/shared?team=${workspace}`;
    navigator.clipboard.writeText(url);
    setMessage('Link de compartilhamento copiado!');
  }

  const monthPosts = filteredPosts.filter((p) => {
    const d = new Date(p.scheduled_at || p.created_at);
    return d.getMonth() === month && d.getFullYear() === year;
  });

  const published = monthPosts.filter((p) => p.status === 'posted').length;
  const scheduled = monthPosts.filter((p) => p.status === 'scheduled' || p.approval_status === 'pending').length;
  const pendingApproval = monthPosts.filter((p) => p.approval_status === 'pending').length;
  const gaps = calendarDays.filter((d) => d && postsForDay(d).length === 0).length;

  const selectedDayPosts = selectedDay ? postsForDay(selectedDay) : [];

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-bg">
        <Header activeHref="/calendar" />
        <main className="max-w-7xl mx-auto px-4 py-8">
          <div className="h-96 flex items-center justify-center text-brand-text-secondary">
            <Loader2 className="w-8 h-8 animate-spin mr-2" /> Carregando calendário...
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-bg">
      <Header activeHref="/calendar" />

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Header comercial */}
        <section className="mb-8 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Calendário de conteúdo</h1>
            <p className="text-brand-text-secondary">Planeje, aprove e publique para todas as marcas em um lugar só.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <TiltCard>
              <button
                onClick={() => router.push('/composer')}
                className="px-5 py-2.5 rounded-2xl bg-brand-accent text-brand-bg font-semibold hover:bg-brand-accent-hover transition flex items-center gap-2"
              >
                <Plus className="w-4 h-4" /> Agendar post
              </button>
            </TiltCard>
            <TiltCard>
              <button
                onClick={shareCalendar}
                className="px-5 py-2.5 rounded-2xl bg-brand-elevated border border-brand-border text-brand-text font-semibold hover:border-brand-accent transition flex items-center gap-2"
              >
                <Share2 className="w-4 h-4" /> Compartilhar calendário
              </button>
            </TiltCard>
          </div>
        </section>

        {/* Métricas de valor */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <TiltCard>
            <SpotlightCard className="p-5" glow="#22C55E">
              <div className="flex items-center justify-between mb-2">
                <CalIcon className="w-5 h-5 text-success" />
                <span className="text-xs text-brand-text-secondary">Este mês</span>
              </div>
              <div className="text-3xl font-bold">{monthPosts.length}</div>
              <div className="text-sm text-brand-text-secondary">posts planejados</div>
            </SpotlightCard>
          </TiltCard>

          <TiltCard>
            <SpotlightCard className="p-5" glow="#3B82F6">
              <div className="flex items-center justify-between mb-2">
                <CheckCircle2 className="w-5 h-5 text-blue-400" />
                <span className="text-xs text-brand-text-secondary">Publicados</span>
              </div>
              <div className="text-3xl font-bold">{published}</div>
              <div className="text-sm text-brand-text-secondary">no ar</div>
            </SpotlightCard>
          </TiltCard>

          <TiltCard>
            <SpotlightCard className="p-5" glow="#F59E0B">
              <div className="flex items-center justify-between mb-2">
                <Clock className="w-5 h-5 text-warning" />
                <span className="text-xs text-brand-text-secondary">Pendentes</span>
              </div>
              <div className="text-3xl font-bold">{pendingApproval}</div>
              <div className="text-sm text-brand-text-secondary">aguardando aprovação</div>
            </SpotlightCard>
          </TiltCard>

          <TiltCard>
            <SpotlightCard className="p-5" glow="#A78BFA">
              <div className="flex items-center justify-between mb-2">
                <Zap className="w-5 h-5 text-purple-400" />
                <span className="text-xs text-brand-text-secondary">Economia</span>
              </div>
              <div className="text-3xl font-bold">{monthPosts.length * 0.5}h</div>
              <div className="text-sm text-brand-text-secondary">economizadas estimadas</div>
            </SpotlightCard>
          </TiltCard>
        </section>

        {/* Upsell contextual */}
        <section className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          {gaps > 5 && (
            <div className="p-4 rounded-2xl bg-warning/10 border border-warning/30 text-warning text-sm flex items-center gap-3">
              <AlertCircle className="w-5 h-5" />
              <div className="flex-1">Você tem {gaps} dias vazios este mês. Preencha com IA?</div>
              <button onClick={() => router.push('/composer')} className="px-3 py-1.5 rounded-lg bg-warning text-brand-bg text-xs font-semibold">Criar</button>
            </div>
          )}
          <div className="p-4 rounded-2xl bg-brand-accent/10 border border-brand-accent/30 text-brand-accent text-sm flex items-center gap-3">
            <Sparkles className="w-5 h-5" />
            <div className="flex-1">Ative aprovações de cliente no plano Business.</div>
            <button onClick={() => router.push('/plans')} className="px-3 py-1.5 rounded-lg bg-brand-accent text-brand-bg text-xs font-semibold">Ver planos</button>
          </div>
          <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/30 text-purple-400 text-sm flex items-center gap-3">
            <Users className="w-5 h-5" />
            <div className="flex-1">Gerencie múltiplas marcas no plano Agency.</div>
            <button onClick={() => router.push('/plans')} className="px-3 py-1.5 rounded-lg bg-purple-500 text-brand-bg text-xs font-semibold">Upgrade</button>
          </div>
        </section>

        {/* Controles */}
        <section className="mb-6 flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <TiltCard>
              <select
                value={workspace}
                onChange={(e) => setWorkspace(e.target.value)}
                className="px-4 py-2.5 rounded-2xl bg-brand-elevated/50 border border-brand-border text-sm focus:outline-none focus:border-brand-accent"
              >
                {WORKSPACES.map((w) => (
                  <option key={w.id} value={w.id}>{w.name} {w.client && `• ${w.client}`}</option>
                ))}
              </select>
            </TiltCard>

            <TiltCard>
              <div className="flex gap-2 p-1.5 rounded-2xl bg-brand-elevated/50 border border-brand-border/50">
                <button onClick={() => setView('month')} className={`px-4 py-2 rounded-xl text-sm font-semibold transition flex items-center gap-1 ${view === 'month' ? 'bg-brand-accent text-brand-bg' : 'text-brand-text-secondary hover:text-brand-text'}`}><LayoutGrid className="w-4 h-4" /> Mês</button>
                <button onClick={() => setView('list')} className={`px-4 py-2 rounded-xl text-sm font-semibold transition flex items-center gap-1 ${view === 'list' ? 'bg-brand-accent text-brand-bg' : 'text-brand-text-secondary hover:text-brand-text'}`}><List className="w-4 h-4" /> Lista</button>
              </div>
            </TiltCard>

            <TiltCard>
              <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-brand-elevated/50 border border-brand-border/50 text-sm">
                <Filter className="w-4 h-4 text-brand-text-secondary" />
                <span className="text-brand-text-secondary">Filtros</span>
              </div>
            </TiltCard>
          </div>

          <div className="flex items-center gap-3">
            <button onClick={prevMonth} className="p-2.5 rounded-2xl bg-brand-elevated/50 border border-brand-border hover:border-brand-accent transition"><ChevronLeft className="w-5 h-5" /></button>
            <button onClick={goToday} className="px-4 py-2.5 rounded-2xl bg-brand-elevated/50 border border-brand-border text-sm font-semibold hover:border-brand-accent transition">Hoje</button>
            <button onClick={nextMonth} className="p-2.5 rounded-2xl bg-brand-elevated/50 border border-brand-border hover:border-brand-accent transition"><ChevronRight className="w-5 h-5" /></button>
          </div>
        </section>

        {/* Filtros chips */}
        <section className="mb-6 flex flex-wrap gap-3 items-start">
          <div className="flex flex-wrap gap-2">
            {Object.entries(statusConfig).map(([status, cfg]) => (
              <button
                key={status}
                onClick={() => toggleFilter(setFilterStatus, status)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition flex items-center gap-1.5 ${
                  filterStatus.includes(status)
                    ? `${cfg.bg} ${cfg.color} border-current`
                    : 'bg-brand-elevated/30 border-brand-border/50 text-brand-text-secondary hover:border-brand-border'
                }`}
              >
                <cfg.icon className="w-3 h-3" /> {cfg.label}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {PLATFORMS.slice(0, 8).map((p) => (
              <button
                key={p.id}
                onClick={() => toggleFilter(setFilterPlatform, p.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition flex items-center gap-1.5 ${
                  filterPlatform.includes(p.id)
                    ? 'bg-brand-elevated/50 border-brand-accent text-brand-text'
                    : 'bg-brand-elevated/30 border-brand-border/50 text-brand-text-secondary hover:border-brand-border'
                }`}
              >
                <PlatformIcon id={p.id} size={12} color={p.color} />
                {p.name}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {CAMPAIGNS.map((c) => (
              <button
                key={c}
                onClick={() => toggleFilter(setFilterCampaign, c)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition ${
                  filterCampaign.includes(c)
                    ? 'bg-purple-500/10 border-purple-500 text-purple-400'
                    : 'bg-brand-elevated/30 border-brand-border/50 text-brand-text-secondary hover:border-brand-border'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
          {(filterStatus.length || filterPlatform.length || filterCampaign.length || workspace !== 'all') && (
            <button onClick={clearFilters} className="px-3 py-1.5 rounded-full text-xs font-medium text-brand-text-secondary hover:text-brand-text transition">Limpar</button>
          )}
        </section>

        {/* Título do mês */}
        <section className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold">{MONTHS[month]} {year}</h2>
          <div className="text-sm text-brand-text-secondary flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            {monthPosts.length} posts visíveis
          </div>
        </section>

        {view === 'month' ? (
          <>
            <div className="grid grid-cols-7 gap-2 mb-2">
              {DAYS.map((d) => (
                <div key={d} className="text-center text-sm text-brand-text-secondary py-2 font-medium">{d}</div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-2">
              {calendarDays.map((date, i) => {
                if (!date) return <div key={i} className="min-h-28 rounded-2xl bg-brand-surface/20 border border-brand-border/20" />;
                const dayPosts = postsForDay(date);
                const isToday = date.toDateString() === today.toDateString();
                const isSelected = selectedDay?.toDateString() === date.toDateString();
                const isWeekend = date.getDay() === 0 || date.getDay() === 6;

                return (
                  <div
                    key={i}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={() => handleDrop(date)}
                    onClick={() => setSelectedDay(date)}
                    className={`min-h-28 p-2 rounded-2xl border cursor-pointer transition flex flex-col relative overflow-hidden ${
                      isSelected
                        ? 'bg-brand-elevated/80 border-brand-accent'
                        : isToday
                        ? 'bg-brand-surface/70 border-brand-accent/50'
                        : isWeekend
                        ? 'bg-brand-surface/20 border-brand-border/30'
                        : 'bg-brand-surface/40 border-brand-border/40 hover:border-brand-text/20'
                    }`}
                    style={{ backgroundImage: isToday ? 'radial-gradient(circle at top right, rgba(138,180,248,0.08), transparent)' : undefined }}
                  >
                    <div className={`flex items-center justify-between mb-1 ${isToday ? 'text-brand-accent font-bold' : 'text-brand-text-secondary'}`}>
                      <span className={`text-sm w-6 h-6 rounded-full flex items-center justify-center ${isToday ? 'bg-brand-accent text-brand-bg' : ''}`}>{date.getDate()}</span>
                      {isToday && <span className="text-[10px] text-brand-accent">Hoje</span>}
                    </div>

                    <div className="space-y-1 flex-1">
                      {dayPosts.slice(0, 3).map((p) => {
                        const statusKey = p.approval_status === 'pending' ? 'pending' : p.status;
                        const cfg = statusConfig[statusKey] || statusConfig.draft;
                        const mainPlatform = p.platforms?.[0] || 'instagram';
                        const platform = PLATFORMS.find((x) => x.id === mainPlatform);

                        return (
                          <div
                            key={p.id}
                            draggable
                            onDragStart={() => setDraggedPost(p)}
                            onClick={(e) => { e.stopPropagation(); setSelectedDay(date); }}
                            className={`text-[10px] p-1.5 rounded-lg ${cfg.bg} ${cfg.color} truncate cursor-move flex items-center gap-1.5 border border-current/10 hover:scale-[1.02] transition`}
                            title={p.content?.slice(0, 80)}
                          >
                            {platform && <PlatformIcon id={platform.id} size={10} color={platform.color} />}
                            <span className="truncate flex-1">{p.content?.slice(0, 14) || 'Sem texto'}</span>
                            <span className="opacity-70 text-[9px]">{new Date(p.scheduled_at || p.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                        );
                      })}
                      {dayPosts.length > 3 && (
                        <div className="text-[10px] text-brand-text-secondary pl-1">+{dayPosts.length - 3} mais</div>
                      )}
                    </div>

                    {dayPosts.length === 0 && !isWeekend && (
                      <button
                        onClick={(e) => { e.stopPropagation(); router.push('/composer'); }}
                        className="mt-auto text-[10px] text-brand-text-secondary hover:text-brand-accent transition text-left"
                      >
                        + Criar post
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <div className="space-y-3">
            {filteredPosts.length === 0 ? (
              <div className="p-8 text-center text-brand-text-secondary rounded-3xl bg-brand-surface/40 border border-brand-border/30">
                Nenhum post encontrado para os filtros selecionados.
              </div>
            ) : (
              filteredPosts.map((p) => {
                const statusKey = p.approval_status === 'pending' ? 'pending' : p.status;
                const cfg = statusConfig[statusKey] || statusConfig.draft;
                return (
                  <TiltCard key={p.id}>
                    <SpotlightCard className="p-4" glow="#6366F1">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium mb-1">{p.content?.slice(0, 120) || 'Sem texto'}</p>
                          <div className="flex flex-wrap gap-2 text-xs text-brand-text-secondary">
                            <span>{new Date(p.scheduled_at || p.created_at).toLocaleString('pt-BR')}</span>
                            <span>•</span>
                            <span>{p.campaign}</span>
                            <span>•</span>
                            <span className="flex items-center gap-1"><PlatformIcon id={p.platforms?.[0] || 'instagram'} size={12} color={PLATFORMS.find(x => x.id === p.platforms?.[0])?.color} /> {p.platforms?.join(', ')}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs px-2 py-1 rounded-full ${cfg.bg} ${cfg.color} border border-current/10`}>{cfg.label}</span>
                          <button onClick={() => setSelectedDay(new Date(p.scheduled_at || p.created_at))} className="p-2 rounded-xl bg-brand-elevated/50 border border-brand-border hover:border-brand-accent transition"><Edit3 className="w-4 h-4" /></button>
                        </div>
                      </div>
                    </SpotlightCard>
                  </TiltCard>
                );
              })
            )}
          </div>
        )}

        {/* Drawer de detalhe do dia */}
        {selectedDay && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-end sm:justify-center p-0 sm:p-4" onClick={() => setSelectedDay(null)}>
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
            <TiltCard className="relative w-full sm:w-[520px] h-[85vh] sm:h-auto max-h-[85vh] overflow-hidden">
              <SpotlightCard className="p-6" glow="#8AB4F8" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h3 className="text-2xl font-bold">{selectedDay.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}</h3>
                    <p className="text-sm text-brand-text-secondary">{selectedDayPosts.length} posts planejados</p>
                  </div>
                  <button onClick={() => setSelectedDay(null)} className="p-2 rounded-xl bg-brand-elevated/50 border border-brand-border hover:border-red-500/50 transition">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {selectedDayPosts.length === 0 ? (
                  <div className="text-center py-10">
                    <div className="w-16 h-16 rounded-2xl bg-brand-accent/10 flex items-center justify-center mx-auto mb-4">
                      <Plus className="w-8 h-8 text-brand-accent" />
                    </div>
                    <h4 className="font-semibold mb-1">Nenhum post neste dia</h4>
                    <p className="text-sm text-brand-text-secondary mb-4">Preencha o calendário e mantenha a consistência.</p>
                    <button onClick={() => router.push('/composer')} className="px-5 py-2.5 rounded-xl bg-brand-accent text-brand-bg font-semibold hover:bg-brand-accent-hover transition">Criar primeiro post</button>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
                    {selectedDayPosts.map((p) => {
                      const statusKey = p.approval_status === 'pending' ? 'pending' : p.status;
                      const cfg = statusConfig[statusKey] || statusConfig.draft;
                      return (
                        <div key={p.id} className="p-4 rounded-2xl bg-brand-elevated/50 border border-brand-border/50 hover:border-brand-accent/50 transition">
                          <div className="flex items-start justify-between mb-2 gap-3">
                            <p className="text-sm line-clamp-3 flex-1">{p.content || 'Sem texto'}</p>
                            <span className={`text-[10px] px-2 py-1 rounded-full ${cfg.bg} ${cfg.color} border border-current/10 whitespace-nowrap`}>{cfg.label}</span>
                          </div>
                          <div className="flex flex-wrap items-center gap-2 mb-3 text-xs text-brand-text-secondary">
                            {p.platforms?.map((pid: string) => {
                              const platform = PLATFORMS.find((x) => x.id === pid);
                              return platform ? (
                                <span key={pid} className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-brand-elevated/70 border border-brand-border/30">
                                  <PlatformIcon id={platform.id} size={12} color={platform.color} />
                                  {platform.name}
                                </span>
                              ) : null;
                            })}
                            <span>• {p.scheduled_at ? new Date(p.scheduled_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : 'Sem horário'}</span>
                            <span>• {p.campaign}</span>
                            {p.approval_status === 'pending' && <span className="text-orange-400">• Aguardando cliente</span>}
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <button onClick={() => startEdit(p)} className="px-3 py-1.5 rounded-lg text-xs bg-brand-elevated border border-brand-border hover:border-brand-accent transition flex items-center gap-1 disabled:opacity-50" disabled={actionLoading}><Edit3 className="w-3 h-3" /> Editar</button>
                            <button onClick={() => duplicatePost(p)} className="px-3 py-1.5 rounded-lg text-xs bg-brand-elevated border border-brand-border hover:border-brand-accent transition flex items-center gap-1 disabled:opacity-50" disabled={actionLoading}><Copy className="w-3 h-3" /> Duplicar</button>
                            {p.approval_status === 'pending' && (
                              <>
                                <button onClick={() => approvePost(p.id, 'approve')} className="px-3 py-1.5 rounded-lg text-xs bg-success/10 border border-success/30 text-success hover:bg-success/20 transition flex items-center gap-1 disabled:opacity-50" disabled={actionLoading}><CheckCircle2 className="w-3 h-3" /> Aprovar</button>
                                <button onClick={() => approvePost(p.id, 'reject')} className="px-3 py-1.5 rounded-lg text-xs bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 transition flex items-center gap-1 disabled:opacity-50" disabled={actionLoading}><RotateCcw className="w-3 h-3" /> Reprovar</button>
                              </>
                            )}
                            {p.approval_status !== 'pending' && p.status === 'draft' && (
                              <button onClick={() => approvePost(p.id, 'submit_for_review')} className="px-3 py-1.5 rounded-lg text-xs bg-orange-400/10 border border-orange-400/30 text-orange-400 hover:bg-orange-400/20 transition flex items-center gap-1 disabled:opacity-50" disabled={actionLoading}><Clock className="w-3 h-3" /> Enviar para aprovação</button>
                            )}
                            {p.status !== 'posted' && p.approval_status !== 'pending' && (
                              <button onClick={() => publishNow(p.id)} className="px-3 py-1.5 rounded-lg text-xs bg-brand-accent text-brand-bg hover:bg-brand-accent-hover transition flex items-center gap-1 disabled:opacity-50" disabled={actionLoading}><Send className="w-3 h-3" /> Publicar agora</button>
                            )}
                            <button onClick={() => deletePost(p.id)} className="px-3 py-1.5 rounded-lg text-xs bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 transition flex items-center gap-1 disabled:opacity-50" disabled={actionLoading}><Trash2 className="w-3 h-3" /> Excluir</button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {selectedDayPosts.length > 0 && (
                  <button onClick={() => setSelectedDay(null)} className="mt-6 w-full px-4 py-3 rounded-2xl border border-brand-border text-brand-text hover:bg-brand-elevated transition">
                    Fechar
                  </button>
                )}
              </SpotlightCard>
            </TiltCard>
          </div>
        )}

        {/* Modal de edição */}
        {editingPost && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={() => setEditingPost(null)}>
            <TiltCard className="relative w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
              <SpotlightCard className="p-6" glow="#8AB4F8">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold">Editar post</h3>
                  <button onClick={() => setEditingPost(null)} className="p-2 rounded-xl bg-brand-elevated/50 border border-brand-border hover:border-red-500/50 transition"><X className="w-5 h-5" /></button>
                </div>
                <label className="text-sm text-brand-text-secondary mb-2 block">Conteúdo</label>
                <textarea value={editContent} onChange={(e) => setEditContent(e.target.value)} className="w-full h-32 px-4 py-3 rounded-xl bg-brand-elevated/50 border border-brand-border text-brand-text focus:outline-none focus:border-brand-accent resize-none mb-4" />
                <label className="text-sm text-brand-text-secondary mb-2 block">Data e horário</label>
                <input type="datetime-local" value={editScheduledAt} onChange={(e) => setEditScheduledAt(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-brand-elevated/50 border border-brand-border text-brand-text focus:outline-none focus:border-brand-accent mb-6" />
                <div className="flex gap-3">
                  <button onClick={() => setEditingPost(null)} className="flex-1 px-4 py-3 rounded-2xl border border-brand-border text-brand-text hover:bg-brand-elevated transition">Cancelar</button>
                  <button onClick={saveEdit} disabled={actionLoading} className="flex-1 px-4 py-3 rounded-2xl bg-brand-accent text-brand-bg font-semibold hover:bg-brand-accent-hover transition disabled:opacity-50">
                    {actionLoading ? 'Salvando...' : 'Salvar'}
                  </button>
                </div>
              </SpotlightCard>
            </TiltCard>
          </div>
        )}

        {/* Área de respiro e próximos passos */}
        <section className="mt-16 mb-12">
          <TiltCard>
            <SpotlightCard className="p-8" glow="#8AB4F8">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                <div>
                  <h3 className="text-2xl font-bold mb-2">Mantenha o ritmo</h3>
                  <p className="text-brand-text-secondary max-w-xl">Calendários consistentes geram audiências. Use o StackPost para planejar semanas inteiras e deixar o trabalho manual para trás.</p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <button onClick={() => router.push('/composer')} className="px-5 py-2.5 rounded-2xl bg-brand-accent text-brand-bg font-semibold hover:bg-brand-accent-hover transition flex items-center gap-2">
                    <Plus className="w-4 h-4" /> Criar post
                  </button>
                  <button onClick={() => setCurrentDate(new Date())} className="px-5 py-2.5 rounded-2xl bg-brand-elevated border border-brand-border text-brand-text font-semibold hover:border-brand-accent transition flex items-center gap-2">
                    <CalIcon className="w-4 h-4" /> Voltar ao mês atual
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8 pt-8 border-t border-brand-border/30">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-brand-accent/10 flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-5 h-5 text-brand-accent" />
                  </div>
                  <div>
                    <div className="font-semibold text-sm">Sugestões com IA</div>
                    <div className="text-xs text-brand-text-secondary mt-1">Gere ideias para dias vazios.</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center flex-shrink-0">
                    <Users className="w-5 h-5 text-success" />
                  </div>
                  <div>
                    <div className="font-semibold text-sm">Aprovação de cliente</div>
                    <div className="text-xs text-brand-text-secondary mt-1">Compartilhe o calendário para revisão.</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-warning/10 flex items-center justify-center flex-shrink-0">
                    <BarChart3 className="w-5 h-5 text-warning" />
                  </div>
                  <div>
                    <div className="font-semibold text-sm">Relatórios mensais</div>
                    <div className="text-xs text-brand-text-secondary mt-1">Acompanhe o que performou.</div>
                  </div>
                </div>
              </div>
            </SpotlightCard>
          </TiltCard>
        </section>

        {/* Toast de mensagem */}
        {message && (
          <div className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-brand-surface border border-brand-border shadow-2xl text-sm flex items-center gap-3">
            {message}
            <button onClick={() => setMessage('')} className="p-1 rounded-lg hover:bg-brand-elevated"><X className="w-4 h-4" /></button>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
