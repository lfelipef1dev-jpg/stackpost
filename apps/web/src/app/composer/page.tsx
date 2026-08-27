'use client';

import Header from '@/components/Header';
import Footer from '@/components/Footer';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { formatError } from '@/lib/errors';
import { PLATFORMS } from '@/lib/platforms';
import { PlatformIcon } from '@/components/PlatformIcon';
import { Sparkles, Hash, Loader2, MessageSquare } from 'lucide-react';

export default function ComposerPage() {
  const [content, setContent] = useState('');
  const [firstComment, setFirstComment] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [scheduledAt, setScheduledAt] = useState('');
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [hashtagLoading, setHashtagLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [previewPlatform, setPreviewPlatform] = useState('instagram');
  const [mediaPath, setMediaPath] = useState<string | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [derivatives, setDerivatives] = useState<Record<string, string>>({});
  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingAction, setPendingAction] = useState<'schedule' | 'publish' | null>(null);
  const [postType, setPostType] = useState<'POST' | 'REEL' | 'STORY'>('POST');
  const [suggestedTags, setSuggestedTags] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  function togglePlatform(id: string) {
    setSelectedPlatforms((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const token = localStorage.getItem('token');
    if (!token) return;

    setMessage('Enviando arquivo...');

    try {
      // 1. Pedir URL assinada pro Worker (request leve, sem o arquivo)
      const presignRes = await fetch('/api/upload/presign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ fileName: file.name, contentType: file.type, size: file.size }),
      });

      const presignData = await presignRes.json();
      if (!presignRes.ok) {
        setMessage(presignData.error || 'Erro no upload');
        return;
      }

      // 2. PUT direto no Supabase Storage (bypassa o Worker)
      const uploadRes = await fetch(presignData.signedUrl, {
        method: 'PUT',
        headers: { 'Content-Type': file.type || 'application/octet-stream' },
        body: file,
      });

      if (!uploadRes.ok) {
        setMessage('Erro ao enviar arquivo para o storage');
        return;
      }

      // 3. Registrar upload no banco
      const regRes = await fetch('/api/upload/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
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
        setMessage('');
      } else {
        const regData = await regRes.json();
        setMessage(regData.error || 'Erro ao registrar upload');
      }
    } catch (err: any) {
      setMessage(err.message || 'Erro no upload');
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
    setMessage('');

    const token = localStorage.getItem('token');
    if (!token) {
      setMessage('Faca login primeiro');
      setLoading(false);
      return;
    }

    const res = await fetch('/api/posts', {
      method: 'POST',
      body: JSON.stringify({
        content,
        platforms: selectedPlatforms,
        uploadIds: mediaPath ? [mediaPath] : undefined,
        scheduledAt: action === 'schedule' ? scheduledAt : null,
        postType,
        firstComment,
      }),
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    });

    const data = await res.json();

    if (res.ok && action === 'publish') {
      const publishRes = await fetch('/api/posts/publish', {
        method: 'POST',
        body: JSON.stringify({ postId: data.id }),
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      });
      const publishData = await publishRes.json();

      if (firstComment && publishData.status === 'posted') {
        for (const platform of selectedPlatforms) {
          await fetch('/api/comments', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({ postId: data.id, platform, text: firstComment }),
          });
        }
      }

      setMessage(`Publicado! Status: ${publishData.status}`);
    } else if (res.ok) {
      setMessage('Agendado com sucesso!');
      router.push('/calendar');
    } else {
      setMessage(formatError(data.error) || 'Erro ao criar post');
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

  const currentPreviewUrl = derivativeKey && derivatives[derivativeKey]
    ? derivatives[derivativeKey]
    : mediaPreview;

  return (
    <div className="min-h-screen bg-brand-bg">
      <Header activeHref="/composer" />

      <main className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Criar post</h1>

        {message && (
          <div className="mb-6 p-4 rounded-xl bg-brand-accent/10 text-brand-accent border border-brand-accent/20">
            {message}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6">
          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-brand-surface border border-brand-border">
              <label className="block text-sm text-brand-text-secondary mb-2">Conteudo unificado</label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full h-40 px-4 py-3 rounded-xl bg-brand-elevated border border-brand-border text-brand-text focus:outline-none focus:border-brand-accent resize-none"
                placeholder="Escreva algo sobre seu produto..."
              />
              <div className="flex justify-between mt-2 text-xs text-brand-text-secondary">
                <span>{content.length} caracteres</span>
                <div className="flex gap-3">
                  <button
                    onClick={async () => {
                      setAiLoading(true);
                      const token = localStorage.getItem('token');
                      const res = await fetch('/api/ai/caption', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                        body: JSON.stringify({ prompt: content || 'Escreva sobre tecnologia', platform: previewPlatform, tone: 'professional' }),
                      });
                      const data = await res.json();
                      if (data.caption) setContent(data.caption);
                      setAiLoading(false);
                    }}
                    className="text-brand-accent hover:underline flex items-center gap-1"
                  >
                    {aiLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                    Gerar com IA
                  </button>
                  <button
                    onClick={async () => {
                      setHashtagLoading(true);
                      const token = localStorage.getItem('token');
                      const res = await fetch('/api/ai/hashtags', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                        body: JSON.stringify({ content, platform: previewPlatform }),
                      });
                      const data = await res.json();
                      setSuggestedTags(data.hashtags || []);
                      setHashtagLoading(false);
                    }}
                    className="text-brand-accent hover:underline flex items-center gap-1"
                  >
                    {hashtagLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Hash className="w-3 h-3" />}
                    Hashtags
                  </button>
                </div>
              </div>
            </div>

            {suggestedTags.length > 0 && (
              <div className="p-4 rounded-2xl bg-brand-surface border border-brand-border">
                <div className="text-sm text-brand-text-secondary mb-2">Hashtags sugeridas</div>
                <div className="flex flex-wrap gap-2">
                  {suggestedTags.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => setContent((prev) => prev + ' ' + tag)}
                      className="px-3 py-1 rounded-full bg-brand-elevated border border-brand-border text-xs hover:border-brand-accent transition"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="p-6 rounded-2xl bg-brand-surface border border-brand-border">
              <label className="block text-sm text-brand-text-secondary mb-2 flex items-center gap-2"><MessageSquare className="w-4 h-4" /> Primeiro comentario (opcional)</label>
              <textarea
                value={firstComment}
                onChange={(e) => setFirstComment(e.target.value)}
                rows={2}
                className="w-full px-4 py-3 rounded-xl bg-brand-elevated border border-brand-border text-brand-text focus:outline-none focus:border-brand-accent resize-none"
                placeholder="Comentario automatico apos publicar..."
              />
              <p className="text-xs text-brand-text-secondary mt-1">Suportado em: Instagram, Facebook, LinkedIn, YouTube, TikTok, Threads, Reddit, Mastodon, Discord, Slack, Bluesky</p>
            </div>

            <div className="p-6 rounded-2xl bg-brand-surface border border-brand-border">
              <label className="block text-sm text-brand-text-secondary mb-2">Tipo de post</label>
              <div className="flex gap-2">
                {(['POST', 'REEL', 'STORY'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setPostType(t)}
                    className={`px-4 py-2 rounded-lg text-sm transition ${postType === t ? 'bg-brand-accent text-brand-bg' : 'bg-brand-elevated border border-brand-border'}`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-brand-surface border border-brand-border">
              <label className="block text-sm text-brand-text-secondary mb-2">Midia</label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-brand-border rounded-xl p-8 text-center cursor-pointer hover:border-brand-accent transition"
              >
                {mediaPreview ? (
                  <img src={mediaPreview} alt="preview" className="max-h-48 mx-auto rounded-lg" />
                ) : (
                  <div className="text-brand-text-secondary text-sm">
                    Arraste uma imagem ou video, ou <span className="text-brand-accent">clique para selecionar</span>
                  </div>
                )}
              </div>
              {mediaPath && <div className="text-xs text-brand-text-secondary mt-2">Arquivo: {mediaPath}</div>}
            </div>

            <div className="p-6 rounded-2xl bg-brand-surface border border-brand-border">
              <label className="block text-sm text-brand-text-secondary mb-2">Selecionar plataformas</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {PLATFORMS.map((p) => (
                  <label
                    key={p.id}
                    onClick={() => setPreviewPlatform(p.id)}
                    className={`relative flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition ${
                      selectedPlatforms.includes(p.id)
                        ? 'bg-brand-elevated border-brand-accent'
                        : 'bg-brand-surface border-brand-border hover:border-brand-text/30'
                    }`}
                  >
                    <input
                      type="checkbox"
                      value={p.id}
                      checked={selectedPlatforms.includes(p.id)}
                      onChange={() => togglePlatform(p.id)}
                      className="w-4 h-4 accent-brand-accent"
                    />
                    <PlatformIcon id={p.id} size={18} color={p.color} />
                    <span className="text-sm truncate">{p.name}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-brand-surface border border-brand-border">
              <label className="block text-sm text-brand-text-secondary mb-2">Agendar para</label>
              <input
                type="datetime-local"
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-brand-elevated border border-brand-border text-brand-text focus:outline-none focus:border-brand-accent"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => confirmAction('schedule')}
                disabled={loading || selectedPlatforms.length === 0}
                className="flex-1 px-6 py-3 rounded-xl bg-brand-accent text-brand-bg font-semibold hover:bg-brand-accent-hover transition disabled:opacity-50"
              >
                {loading ? 'Salvando...' : 'Agendar'}
              </button>
              <button
                onClick={() => confirmAction('publish')}
                disabled={loading || selectedPlatforms.length === 0}
                className="flex-1 px-6 py-3 rounded-xl border border-brand-border bg-brand-surface text-brand-text hover:bg-brand-elevated transition disabled:opacity-50"
              >
                {loading ? 'Publicando...' : 'Publicar agora'}
              </button>
            </div>
          </div>

          <div className="space-y-6">
            <div className="p-5 rounded-2xl bg-brand-surface border border-brand-border">
              <h3 className="font-semibold mb-4">Preview</h3>
              <select
                value={previewPlatform}
                onChange={(e) => setPreviewPlatform(e.target.value)}
                className="w-full mb-4 px-4 py-2 rounded-xl bg-brand-elevated border border-brand-border text-brand-text"
              >
                {PLATFORMS.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>

              <div className="rounded-xl bg-brand-elevated border border-brand-border overflow-hidden">
                <div className="p-4 border-b border-brand-border">
                  <div className="flex items-center gap-2">
                    <PlatformIcon id={activePlatform.id} size={20} color={activePlatform.color} />
                    <div>
                      <div className="text-sm font-medium">ExpoStacker</div>
                      <div className="text-xs text-brand-text-secondary">@expostacker</div>
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <p className="text-sm whitespace-pre-wrap break-words">{content || 'Seu texto vai aparecer aqui...'}</p>
                </div>
                <div className="aspect-[4/5] bg-black/50 flex items-center justify-center border-t border-brand-border">
                  {currentPreviewUrl ? (
                    <img src={currentPreviewUrl} alt="preview" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-brand-text-secondary text-sm">Preview de imagem</span>
                  )}
                </div>
              </div>

              <div className="mt-4 space-y-2 text-xs text-brand-text-secondary">
                <div className="flex justify-between"><span>ProporÃ§Ã£o</span><span>{activePlatform.aspect}</span></div>
                <div className="flex justify-between"><span>Formatos</span><span>{activePlatform.formats}</span></div>
                <div className="flex justify-between"><span>Limite</span><span>{activePlatform.maxFile}</span></div>
                <div className="flex justify-between"><span>Texto</span><span>{activePlatform.textLimit}</span></div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md p-6 rounded-2xl bg-brand-surface border border-brand-border">
            <h3 className="text-xl font-bold mb-2">
              {pendingAction === 'publish' ? 'Publicar agora?' : 'Agendar post?'}
            </h3>
            <p className="text-brand-text-secondary mb-6">
              {pendingAction === 'publish'
                ? 'Isso vai publicar imediatamente nas plataformas selecionadas. Tem certeza?'
                : 'O post serÃ¡ salvo e publicado no horÃ¡rio agendado.'}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 px-4 py-3 rounded-xl border border-brand-border text-brand-text hover:bg-brand-elevated"
              >
                Cancelar
              </button>
              <button
                onClick={executeAction}
                className="flex-1 px-4 py-3 rounded-xl bg-brand-accent text-brand-bg font-semibold hover:bg-brand-accent-hover"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
      <Footer />
    </div>
  );
}
