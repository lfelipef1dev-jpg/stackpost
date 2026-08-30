'use client';

import Header from '@/components/Header';
import Footer from '@/components/Footer';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { formatError } from '@/lib/errors';
import { PLATFORMS } from '@/lib/platforms';
import { PlatformIcon } from '@/components/PlatformIcon';
import {
  Sparkles,
  Hash,
  Loader2,
  MessageSquare,
  Image as ImageIcon,
  Video,
  Calendar as CalIcon,
  Send,
  Clock,
  Check,
  X,
  Zap,
  Eye,
  Layers,
  Type,
} from 'lucide-react';

function SpotlightCard({
  children,
  className = '',
  glow = '#6366F1',
}: {
  children: React.ReactNode;
  className?: string;
  glow?: string;
}) {
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
      className={`relative overflow-hidden rounded-3xl bg-brand-surface/60 backdrop-blur-xl border border-brand-border/50 ${className}`}
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
  const onMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const r = ref.current.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    setStyle({
      transform: `perspective(1200px) rotateX(${-y * 1.5}deg) rotateY(${x * 1.5}deg)`,
      transition: 'transform 0.15s ease-out',
    });
  };
  const onLeave = () =>
    setStyle({
      transform: 'perspective(1200px) rotateX(0) rotateY(0)',
      transition: 'transform 0.4s ease-out',
    });
  return (
    <div ref={ref} onMouseMove={onMove} onMouseLeave={onLeave} style={style} className={`will-change-transform ${className}`}>
      {children}
    </div>
  );
}

export default function ComposerPage() {
  const [content, setContent] = useState('');
  const [firstComment, setFirstComment] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [scheduledAt, setScheduledAt] = useState('');
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [hashtagLoading, setHashtagLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'info' | 'success' | 'error'>('info');
  const [previewPlatform, setPreviewPlatform] = useState('instagram');
  const [mediaPath, setMediaPath] = useState<string | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [derivatives, setDerivatives] = useState<Record<string, string>>({});
  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingAction, setPendingAction] = useState<'schedule' | 'publish' | null>(null);
  const [postType, setPostType] = useState<'POST' | 'REEL' | 'STORY'>('POST');
  const [suggestedTags, setSuggestedTags] = useState<string[]>([]);
  const [charCount, setCharCount] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    setCharCount(content.length);
  }, [content]);

  function togglePlatform(id: string) {
    setSelectedPlatforms((prev) => (prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]));
  }

  function flash(msg: string, type: 'info' | 'success' | 'error' = 'info') {
    setMessage(msg);
    setMessageType(type);
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    flash('Enviando arquivo...');

    try {
      const presignRes = await fetch('/api/upload/presign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileName: file.name, contentType: file.type, size: file.size }),
      });

      const presignData = await presignRes.json();
      if (!presignRes.ok) {
        flash(presignData.error || 'Erro no upload', 'error');
        return;
      }

      const uploadRes = await fetch(presignData.signedUrl, {
        method: 'PUT',
        headers: { 'Content-Type': file.type || 'application/octet-stream' },
        body: file,
      });

      if (!uploadRes.ok) {
        flash('Erro ao enviar arquivo para o storage', 'error');
        return;
      }

      const regRes = await fetch('/api/upload/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: presignData.id,
          fileName: file.name,
          contentType: file.type,
          size: file.size,
          url: presignData.publicUrl,
        }),
      });

      if (regRes.ok) {
        setMediaPath(presignData.id);
        setMediaPreview(URL.createObjectURL(file));
        setDerivatives(presignData.derivatives || {});
        flash('');
      } else {
        const regData = await regRes.json();
        flash(regData.error || 'Erro ao registrar upload', 'error');
      }
    } catch (err: any) {
      flash(err.message || 'Erro no upload', 'error');
    }
  }

  function confirmAction(action: 'schedule' | 'publish') {
    setPendingAction(action);
    setShowConfirm(true);
  }

  async function executeAction() {
    if (!pendingAction) return;
    await handleSubmit(pendingAction);
    setShowConfirm(false);
    setPendingAction(null);
  }

  async function handleSubmit(action: 'schedule' | 'publish') {
    setLoading(true);
    flash('');

    let isoScheduledAt: string | null = null;
    if (action === 'schedule' && scheduledAt) {
      const d = new Date(scheduledAt);
      isoScheduledAt = d.toISOString();
    }

    const res = await fetch('/api/posts', {
      method: 'POST',
      body: JSON.stringify({
        content,
        platforms: selectedPlatforms,
        uploadIds: mediaPath ? [mediaPath] : undefined,
        scheduledAt: isoScheduledAt,
        postType,
        firstComment,
      }),
      headers: { 'Content-Type': 'application/json' },
    });

    const data = await res.json();

    if (res.ok && action === 'publish') {
      const publishRes = await fetch('/api/posts/publish', {
        method: 'POST',
        body: JSON.stringify({ postId: data.id }),
        headers: { 'Content-Type': 'application/json' },
      });
      const publishData = await publishRes.json();

      if (firstComment && publishData.status === 'posted') {
        for (const platform of selectedPlatforms) {
          await fetch('/api/comments', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ postId: data.id, platform, text: firstComment }),
          });
        }
      }

      flash(`Publicado! Status: ${publishData.status}`, 'success');
    } else if (res.ok) {
      flash('Agendado com sucesso!', 'success');
      setTimeout(() => router.push('/calendar'), 1500);
    } else {
      flash(formatError(data.error) || 'Erro ao criar post', 'error');
    }

    setLoading(false);
  }

  const activePlatform = PLATFORMS.find((p) => p.id === previewPlatform) || PLATFORMS[0];

  const derivativeKey =
    previewPlatform === 'instagram'
      ? 'instagram_4x5'
      : previewPlatform === 'linkedin'
      ? 'linkedin_1.9x1'
      : null;

  const currentPreviewUrl =
    derivativeKey && derivatives[derivativeKey] ? derivatives[derivativeKey] : mediaPreview;

  const postTypeConfig = [
    { id: 'POST' as const, label: 'Post', icon: Type, glow: '#6366F1' },
    { id: 'REEL' as const, label: 'Reel', icon: Video, glow: '#EC4899' },
    { id: 'STORY' as const, label: 'Story', icon: Zap, glow: '#F59E0B' },
  ];

  return (
    <div className="min-h-screen bg-brand-bg">
      <Header activeHref="/composer" />

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <Layers className="w-6 h-6 text-brand-accent" />
            <h1 className="text-3xl font-bold">Criar post</h1>
          </div>
          <p className="text-brand-text-secondary text-sm max-w-2xl">
            Escreva uma vez, publique em todas as redes. Selecione plataformas, adicione mídia e agende ou publique agora.
          </p>
        </div>

        {/* Message */}
        {message && (
          <div
            className={`mb-6 p-4 rounded-2xl border flex items-center gap-3 ${
              messageType === 'success'
                ? 'bg-success/10 text-success border-success/30'
                : messageType === 'error'
                ? 'bg-error/10 text-error border-error/30'
                : 'bg-brand-accent/10 text-brand-accent border-brand-accent/30'
            }`}
          >
            {messageType === 'success' ? (
              <Check className="w-5 h-5 flex-shrink-0" />
            ) : messageType === 'error' ? (
              <X className="w-5 h-5 flex-shrink-0" />
            ) : (
              <Loader2 className="w-5 h-5 flex-shrink-0 animate-spin" />
            )}
            <span className="text-sm font-medium">{message}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-6">
          {/* Coluna esquerda - formulário */}
          <div className="space-y-6">
            {/* Conteúdo unificado */}
            <TiltCard>
              <SpotlightCard className="p-6" glow="#6366F1">
                <div className="flex items-center gap-2 mb-4">
                  <Type className="w-4 h-4 text-brand-accent" />
                  <label className="text-sm font-semibold">Conteúdo unificado</label>
                </div>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full h-40 px-4 py-3 rounded-2xl bg-brand-elevated border border-brand-border text-brand-text focus:outline-none focus:border-brand-accent resize-none transition"
                  placeholder="Escreva algo sobre seu produto..."
                />
                <div className="flex justify-between mt-3 text-xs text-brand-text-secondary">
                  <span className={charCount > 2000 ? 'text-error font-medium' : ''}>{charCount} caracteres</span>
                  <div className="flex gap-4">
                    <button
                      onClick={async () => {
                        setAiLoading(true);
                        try {
                          const res = await fetch('/api/ai/caption', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              prompt: content || 'Escreva sobre tecnologia',
                              platform: previewPlatform,
                              tone: 'professional',
                            }),
                          });
                          const data = await res.json();
                          if (data.caption) setContent(data.caption);
                        } catch {}
                        setAiLoading(false);
                      }}
                      className="text-brand-accent hover:underline flex items-center gap-1.5 transition"
                    >
                      {aiLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                      Gerar com IA
                    </button>
                    <button
                      onClick={async () => {
                        setHashtagLoading(true);
                        try {
                          const res = await fetch('/api/ai/hashtags', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ content, platform: previewPlatform }),
                          });
                          const data = await res.json();
                          setSuggestedTags(data.hashtags || []);
                        } catch {}
                        setHashtagLoading(false);
                      }}
                      className="text-brand-accent hover:underline flex items-center gap-1.5 transition"
                    >
                      {hashtagLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Hash className="w-3 h-3" />}
                      Hashtags
                    </button>
                  </div>
                </div>
              </SpotlightCard>
            </TiltCard>

            {/* Hashtags sugeridas */}
            {suggestedTags.length > 0 && (
              <TiltCard>
                <SpotlightCard className="p-5" glow="#A78BFA">
                  <div className="text-sm font-semibold mb-3 flex items-center gap-2">
                    <Hash className="w-4 h-4 text-brand-accent" />
                    Hashtags sugeridas
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {suggestedTags.map((tag) => (
                      <button
                        key={tag}
                        onClick={() => setContent((prev) => prev + ' ' + tag)}
                        className="px-3 py-1.5 rounded-full bg-brand-elevated border border-brand-border text-xs hover:border-brand-accent hover:text-brand-accent transition"
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </SpotlightCard>
              </TiltCard>
            )}

            {/* Primeiro comentário */}
            <TiltCard>
              <SpotlightCard className="p-6" glow="#22D3EE">
                <div className="flex items-center gap-2 mb-3">
                  <MessageSquare className="w-4 h-4 text-info" />
                  <label className="text-sm font-semibold">Primeiro comentário (opcional)</label>
                </div>
                <textarea
                  value={firstComment}
                  onChange={(e) => setFirstComment(e.target.value)}
                  rows={2}
                  className="w-full px-4 py-3 rounded-2xl bg-brand-elevated border border-brand-border text-brand-text focus:outline-none focus:border-brand-accent resize-none transition"
                  placeholder="Comentário automático após publicar..."
                />
                <p className="text-xs text-brand-text-secondary mt-2">
                  Suportado em: Instagram, Facebook, LinkedIn, YouTube, TikTok, Threads, Reddit, Mastodon, Discord, Slack, Bluesky
                </p>
              </SpotlightCard>
            </TiltCard>

            {/* Tipo de post */}
            <TiltCard>
              <SpotlightCard className="p-6" glow="#F59E0B">
                <label className="block text-sm font-semibold mb-4">Tipo de post</label>
                <div className="grid grid-cols-3 gap-3">
                  {postTypeConfig.map((t) => {
                    const Icon = t.icon;
                    const isActive = postType === t.id;
                    return (
                      <button
                        key={t.id}
                        onClick={() => setPostType(t.id)}
                        className={`flex flex-col items-center gap-2 p-4 rounded-2xl border transition ${
                          isActive
                            ? 'bg-brand-elevated border-2'
                            : 'bg-brand-surface border-brand-border hover:border-brand-text/30'
                        }`}
                        style={isActive ? { borderColor: t.glow, boxShadow: `0 0 20px ${t.glow}20` } : undefined}
                      >
                        <Icon className="w-5 h-5" style={{ color: isActive ? t.glow : undefined }} />
                        <span className="text-sm font-medium">{t.label}</span>
                      </button>
                    );
                  })}
                </div>
              </SpotlightCard>
            </TiltCard>

            {/* Mídia */}
            <TiltCard>
              <SpotlightCard className="p-6" glow="#22C55E">
                <div className="flex items-center gap-2 mb-4">
                  <ImageIcon className="w-4 h-4 text-success" />
                  <label className="text-sm font-semibold">Mídia</label>
                </div>
                <input ref={fileInputRef} type="file" accept="image/*,video/*" onChange={handleFileChange} className="hidden" />
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-brand-border rounded-2xl p-10 text-center cursor-pointer hover:border-brand-accent transition group"
                >
                  {mediaPreview ? (
                    <img src={mediaPreview} alt="preview" className="max-h-56 mx-auto rounded-xl shadow-lg" />
                  ) : (
                    <div className="text-brand-text-secondary">
                      <ImageIcon className="w-10 h-10 mx-auto mb-3 text-brand-text-secondary/50 group-hover:text-brand-accent transition" />
                      <div className="text-sm">
                        Arraste uma imagem ou vídeo, ou <span className="text-brand-accent font-medium">clique para selecionar</span>
                      </div>
                    </div>
                  )}
                </div>
                {mediaPath && (
                  <div className="mt-3 flex items-center gap-2 text-xs text-brand-text-secondary">
                    <Check className="w-3 h-3 text-success" />
                    Arquivo: <span className="font-mono">{mediaPath}</span>
                  </div>
                )}
              </SpotlightCard>
            </TiltCard>

            {/* Plataformas */}
            <TiltCard>
              <SpotlightCard className="p-6" glow="#8AB4F8">
                <div className="flex items-center justify-between mb-4">
                  <label className="text-sm font-semibold">Selecionar plataformas</label>
                  <span className="text-xs text-brand-text-secondary">
                    {selectedPlatforms.length} selecionada{selectedPlatforms.length !== 1 ? 's' : ''}
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {PLATFORMS.map((p) => {
                    const isSelected = selectedPlatforms.includes(p.id);
                    return (
                      <button
                        key={p.id}
                        onClick={() => {
                          togglePlatform(p.id);
                          setPreviewPlatform(p.id);
                        }}
                        className={`relative flex items-center gap-3 p-3 rounded-2xl border transition ${
                          isSelected
                            ? 'bg-brand-elevated border-brand-accent shadow-lg shadow-brand-accent/10'
                            : 'bg-brand-surface border-brand-border hover:border-brand-text/30'
                        }`}
                      >
                        <div
                          className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: `${p.color}15` }}
                        >
                          <PlatformIcon id={p.id} size={18} color={p.color} />
                        </div>
                        <span className="text-sm truncate">{p.name}</span>
                        {isSelected && (
                          <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-brand-accent flex items-center justify-center">
                            <Check className="w-2.5 h-2.5 text-brand-bg" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </SpotlightCard>
            </TiltCard>

            {/* Agendamento */}
            <TiltCard>
              <SpotlightCard className="p-6" glow="#FBBF24">
                <div className="flex items-center gap-2 mb-3">
                  <CalIcon className="w-4 h-4 text-warning" />
                  <label className="text-sm font-semibold">Agendar para</label>
                </div>
                <input
                  type="datetime-local"
                  value={scheduledAt}
                  onChange={(e) => setScheduledAt(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-brand-elevated border border-brand-border text-brand-text focus:outline-none focus:border-brand-accent transition"
                />
                <p className="text-xs text-brand-text-secondary mt-2">
                  Deixe em branco para publicar imediatamente após clicar em &quot;Publicar agora&quot;.
                </p>
              </SpotlightCard>
            </TiltCard>

            {/* Botões de ação */}
            <div className="flex gap-3">
              <button
                onClick={() => confirmAction('schedule')}
                disabled={loading || selectedPlatforms.length === 0}
                className="flex-1 px-6 py-4 rounded-2xl bg-brand-elevated border border-brand-border text-brand-text font-semibold hover:border-brand-accent transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Clock className="w-4 h-4" />}
                Agendar
              </button>
              <button
                onClick={() => confirmAction('publish')}
                disabled={loading || selectedPlatforms.length === 0}
                className="flex-1 px-6 py-4 rounded-2xl bg-brand-accent text-brand-bg font-semibold hover:bg-brand-accent-hover transition disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-brand-accent/20"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                Publicar agora
              </button>
            </div>
          </div>

          {/* Coluna direita - preview */}
          <div className="space-y-6 lg:sticky lg:top-20 lg:self-start">
            <TiltCard>
              <SpotlightCard className="p-5" glow={activePlatform.color || '#6366F1'}>
                <div className="flex items-center gap-2 mb-4">
                  <Eye className="w-4 h-4 text-brand-accent" />
                  <h3 className="font-semibold">Preview</h3>
                </div>
                <select
                  value={previewPlatform}
                  onChange={(e) => setPreviewPlatform(e.target.value)}
                  className="w-full mb-4 px-4 py-2.5 rounded-xl bg-brand-elevated border border-brand-border text-brand-text text-sm focus:outline-none focus:border-brand-accent transition"
                >
                  {PLATFORMS.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>

                {/* Card de preview estilo rede social */}
                <div className="rounded-2xl bg-brand-elevated border border-brand-border overflow-hidden">
                  <div className="p-4 border-b border-brand-border">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm"
                        style={{ backgroundColor: activePlatform.color || '#6366F1' }}
                      >
                        S
                      </div>
                      <div>
                        <div className="text-sm font-semibold">StackPost</div>
                        <div className="text-xs text-brand-text-secondary">@stackpost</div>
                      </div>
                    </div>
                  </div>
                  <div className="p-4">
                    <p className="text-sm whitespace-pre-wrap break-words min-h-[60px]">
                      {content || 'Seu texto vai aparecer aqui...'}
                    </p>
                  </div>
                  <div className="aspect-[4/5] bg-black/40 flex items-center justify-center border-t border-brand-border">
                    {currentPreviewUrl ? (
                      <img src={currentPreviewUrl} alt="preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-brand-text-secondary text-sm flex flex-col items-center gap-2">
                        <ImageIcon className="w-8 h-8 opacity-50" />
                        <span>Preview de imagem</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Especificacoes da plataforma */}
                <div className="mt-4 space-y-2 text-xs">
                  <div className="flex justify-between text-brand-text-secondary">
                    <span>Proporção</span>
                    <span className="font-medium text-brand-text">{activePlatform.aspect}</span>
                  </div>
                  <div className="flex justify-between text-brand-text-secondary">
                    <span>Formatos</span>
                    <span className="font-medium text-brand-text">{activePlatform.formats}</span>
                  </div>
                  <div className="flex justify-between text-brand-text-secondary">
                    <span>Limite</span>
                    <span className="font-medium text-brand-text">{activePlatform.maxFile}</span>
                  </div>
                  <div className="flex justify-between text-brand-text-secondary">
                    <span>Texto</span>
                    <span className="font-medium text-brand-text">{activePlatform.textLimit}</span>
                  </div>
                </div>
              </SpotlightCard>
            </TiltCard>

            {/* Dicas da plataforma */}
            <TiltCard>
              <SpotlightCard className="p-5" glow="#F59E0B">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="w-4 h-4 text-warning" />
                  <h3 className="font-semibold">Dicas de {activePlatform.name}</h3>
                </div>
                <div className="space-y-2.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-brand-text-secondary">Proporção ideal</span>
                    <span className="font-medium">{activePlatform.aspect}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-brand-text-secondary">Formatos</span>
                    <span className="font-medium text-right">{activePlatform.formats}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-brand-text-secondary">Limite de texto</span>
                    <span className="font-medium">{activePlatform.textLimit}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-brand-text-secondary">Tamanho máx.</span>
                    <span className="font-medium">{activePlatform.maxFile}</span>
                  </div>
                </div>
                <div className="mt-4 p-3 rounded-xl bg-brand-elevated/50 border border-brand-border/30">
                  <div className="text-brand-text-secondary text-xs mb-1">Dica de engajamento</div>
                  <div className="font-medium text-sm">
                    Responda comentários nas primeiras 2 horas para impulsionar o alcance.
                  </div>
                </div>
              </SpotlightCard>
            </TiltCard>

            {/* Resumo */}
            <TiltCard>
              <SpotlightCard className="p-5" glow="#22C55E">
                <h3 className="font-semibold mb-4 text-sm">Resumo</h3>
                <div className="space-y-3 text-xs">
                  <div className="flex justify-between">
                    <span className="text-brand-text-secondary">Plataformas</span>
                    <span className="font-medium">{selectedPlatforms.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-brand-text-secondary">Caracteres</span>
                    <span className="font-medium">{charCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-brand-text-secondary">Mídia</span>
                    <span className="font-medium">{mediaPath ? 'Sim' : 'Não'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-brand-text-secondary">Tipo</span>
                    <span className="font-medium">{postType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-brand-text-secondary">Agendado</span>
                    <span className="font-medium">{scheduledAt ? 'Sim' : 'Agora'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-brand-text-secondary">1º comentário</span>
                    <span className="font-medium">{firstComment ? 'Sim' : 'Não'}</span>
                  </div>
                </div>
              </SpotlightCard>
            </TiltCard>
          </div>
        </div>
      </main>

      {/* Modal de confirmação */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <TiltCard className="w-full max-w-md">
            <SpotlightCard className="p-6" glow={pendingAction === 'publish' ? '#22C55E' : '#FBBF24'}>
              <div className="flex items-center gap-3 mb-4">
                {pendingAction === 'publish' ? (
                  <Send className="w-6 h-6 text-success" />
                ) : (
                  <Clock className="w-6 h-6 text-warning" />
                )}
                <h3 className="text-xl font-bold">
                  {pendingAction === 'publish' ? 'Publicar agora?' : 'Agendar post?'}
                </h3>
              </div>
              <p className="text-brand-text-secondary mb-6 text-sm">
                {pendingAction === 'publish'
                  ? 'Isso vai publicar imediatamente nas plataformas selecionadas. Tem certeza?'
                  : 'O post sera salvo e publicado no horario agendado.'}
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowConfirm(false)}
                  className="flex-1 px-4 py-3 rounded-xl border border-brand-border text-brand-text hover:bg-brand-elevated transition"
                >
                  Cancelar
                </button>
                <button
                  onClick={executeAction}
                  className="flex-1 px-4 py-3 rounded-xl bg-brand-accent text-brand-bg font-semibold hover:bg-brand-accent-hover transition flex items-center justify-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  Confirmar
                </button>
              </div>
            </SpotlightCard>
          </TiltCard>
        </div>
      )}

      <Footer />
    </div>
  );
}
