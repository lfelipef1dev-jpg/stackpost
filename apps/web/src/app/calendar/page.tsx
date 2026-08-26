'use client';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

import { useEffect, useState } from 'react';
import { Calendar as CalIcon, ChevronLeft, ChevronRight, Clock, CheckCircle2, AlertCircle, Loader2, FileEdit } from 'lucide-react';

const MONTHS = ['Janeiro', 'Fevereiro', 'Marco', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
const DAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'];

const statusConfig: Record<string, { icon: typeof CheckCircle2; color: string; bg: string }> = {
  posted: { icon: CheckCircle2, color: 'text-success', bg: 'bg-success/10' },
  scheduled: { icon: Clock, color: 'text-warning', bg: 'bg-warning/10' },
  error: { icon: AlertCircle, color: 'text-error', bg: 'bg-error/10' },
  draft: { icon: FileEdit, color: 'text-brand-text-secondary', bg: 'bg-brand-elevated' },
  processing: { icon: Loader2, color: 'text-info', bg: 'bg-info/10' },
};

export default function CalendarPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [draggedPost, setDraggedPost] = useState<any>(null);
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    fetch('/api/posts', { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => res.json())
      .then((data) => setPosts(Array.isArray(data) ? data : (data.items || [])));
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

  function postsForDay(date: Date) {
    return posts.filter((p) => {
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
    const token = localStorage.getItem('token');
    const newDate = new Date(date);
    newDate.setHours(10, 0, 0, 0);

    await fetch('/api/posts', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ id: draggedPost.id, scheduledAt: newDate.toISOString() }),
    });

    setPosts((prev) =>
      prev.map((p) => (p.id === draggedPost.id ? { ...p, scheduled_at: newDate.toISOString() } : p))
    );
    setDraggedPost(null);
  }

  const selectedDayPosts = selectedDay ? postsForDay(selectedDay) : [];

  return (
    <div className="min-h-screen bg-brand-bg">
      <Header activeHref="/calendar" />

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Calendario</h1>
          <div className="flex items-center gap-3">
            <button onClick={prevMonth} className="p-2 rounded-lg bg-brand-surface border border-brand-border hover:bg-brand-elevated transition">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button onClick={goToday} className="px-4 py-2 rounded-lg bg-brand-surface border border-brand-border text-sm hover:bg-brand-elevated transition">
              Hoje
            </button>
            <button onClick={nextMonth} className="p-2 rounded-lg bg-brand-surface border border-brand-border hover:bg-brand-elevated transition">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">{MONTHS[month]} {year}</h2>
          <div className="flex gap-3 text-xs text-brand-text-secondary">
            {Object.entries(statusConfig).map(([status, cfg]) => (
              <span key={status} className="flex items-center gap-1 capitalize">
                <cfg.icon className={`w-3 h-3 ${cfg.color}`} /> {status}
              </span>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-7 gap-2 mb-2">
          {DAYS.map((d) => (
            <div key={d} className="text-center text-sm text-brand-text-secondary py-2 font-medium">{d}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-2">
          {calendarDays.map((date, i) => {
            if (!date) return <div key={i} className="min-h-24 rounded-xl bg-brand-surface/30 border border-brand-border/30" />;
            const dayPosts = postsForDay(date);
            const isToday = date.toDateString() === today.toDateString();
            const isSelected = selectedDay?.toDateString() === date.toDateString();

            return (
              <div
                key={i}
                draggable={dayPosts.length > 0}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => handleDrop(date)}
                onClick={() => setSelectedDay(date)}
                className={`min-h-24 p-2 rounded-xl border cursor-pointer transition ${
                  isSelected
                    ? 'bg-brand-elevated border-brand-accent'
                    : isToday
                    ? 'bg-brand-surface border-brand-accent/40'
                    : 'bg-brand-surface border-brand-border hover:border-brand-text/20'
                }`}
              >
                <div className={`text-sm mb-1 ${isToday ? 'text-brand-accent font-bold' : 'text-brand-text-secondary'}`}>
                  {date.getDate()}
                </div>
                <div className="space-y-1">
                  {dayPosts.slice(0, 3).map((p) => {
                    const cfg = statusConfig[p.status] || statusConfig.draft;
                    return (
                      <div
                        key={p.id}
                        draggable
                        onDragStart={() => setDraggedPost(p)}
                        className={`text-[10px] p-1 rounded ${cfg.bg} ${cfg.color} truncate cursor-move`}
                        title={p.content?.slice(0, 50)}
                      >
                        <cfg.icon className="w-2.5 h-2.5 inline mr-1" />
                        {p.content?.slice(0, 18) || 'Sem texto'}
                      </div>
                    );
                  })}
                  {dayPosts.length > 3 && (
                    <div className="text-[10px] text-brand-text-secondary">+{dayPosts.length - 3} mais</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {selectedDay && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={() => setSelectedDay(null)}>
            <div className="w-full max-w-lg p-6 rounded-2xl bg-brand-surface border border-brand-border" onClick={(e) => e.stopPropagation()}>
              <h3 className="text-xl font-bold mb-4">
                {selectedDay.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
              </h3>
              {selectedDayPosts.length === 0 ? (
                <p className="text-brand-text-secondary text-sm">Nenhum post neste dia.</p>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {selectedDayPosts.map((p) => {
                    const cfg = statusConfig[p.status] || statusConfig.draft;
                    return (
                      <div key={p.id} className="p-4 rounded-xl bg-brand-elevated border border-brand-border">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm line-clamp-2">{p.content || 'Sem texto'}</p>
                          </div>
                          <span className={`text-xs px-2 py-1 rounded-md ${cfg.bg} ${cfg.color} capitalize ml-2`}>{p.status}</span>
                        </div>
                        <div className="text-xs text-brand-text-secondary">
                          {p.platforms?.join(', ')}
                          {p.scheduled_at && ` • ${new Date(p.scheduled_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              <button onClick={() => setSelectedDay(null)} className="mt-4 w-full px-4 py-2 rounded-xl border border-brand-border text-brand-text hover:bg-brand-elevated transition">
                Fechar
              </button>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
