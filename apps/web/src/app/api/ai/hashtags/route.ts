import { logger } from '@/lib/logger';
import { NextRequest, NextResponse } from 'next/server';
import { ai_hashtagsBodySchema } from '@/lib/schemas';
import { getUserFromToken } from '@/lib/auth';

// AI Hashtags - generates relevant hashtags from content
// Uses Nexus IA if configured, otherwise falls back to keyword extraction
export async function POST(req: NextRequest) {
  const user = await getUserFromToken(req);
  if (!user) return NextResponse.json({ error: 'Nao autorizado' }, { status: 401 });

  const bodyRaw1 = await req.json();
  const parsed1 = ai_hashtagsBodySchema.safeParse(bodyRaw1);
  if (!parsed1.success) return NextResponse.json(parsed1.error.issues, { status: 400 });
  const body = bodyRaw1;
  const { content, platform } = body;

  if (!content || content.length < 3) {
    return NextResponse.json({ error: 'Conteudo muito curto' }, { status: 400 });
  }

  // Platform-specific hashtag limits
  const limits: Record<string, number> = {
    instagram: 30,
    tiktok: 5,
    youtube: 15,
    linkedin: 5,
    x: 3,
    threads: 5,
    facebook: 10,
    pinterest: 20,
    reddit: 0,
    bluesky: 0,
    mastodon: 5,
  };
  const maxTags = limits[platform || 'instagram'] ?? 15;

  // Try Nexus IA (or OpenAI) for AI-generated hashtags
  const nexusUrl = process.env.NEXUS_IA_URL || process.env.OPENAI_API_KEY;
  if (nexusUrl) {
    try {
      const aiRes = await fetch(`${process.env.NEXUS_IA_URL || 'https://nexusia.expostacker.com.br'}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            { role: 'system', content: `Gere ${maxTags} hashtags relevantes para ${platform}. Retorne apenas as hashtags separadas por espaco, sem numeracao.` },
            { role: 'user', content: content.slice(0, 500) },
          ],
          max_tokens: 200,
        }),
      });
      if (aiRes.ok) {
        const aiData = await aiRes.json();
        const text = aiData.content || aiData.message || '';
        const hashtags = text.match(/#[\w]+/g) || [];
        if (hashtags.length > 0) {
          return NextResponse.json({ hashtags: hashtags.slice(0, maxTags), source: 'ai' });
        }
      }
    } catch (err) {
      logger.error('AI hashtag generation failed, falling back to keyword extraction:', err);
    }
  }

  // Fallback: keyword extraction
  const platformDefaults: Record<string, string[]> = {
    instagram: ['#instagram', '#reels', '#explore', '#trending', '#viral', '#content', '#socialmedia', '#marketing', '#growth'],
    linkedin: ['#linkedin', '#networking', '#professional', '#career', '#business', '#innovation', '#tech', '#leadership'],
    x: ['#trending', '#viral', '#news'],
    tiktok: ['#tiktok', '#fyp', '#foryou', '#viral', '#trending', '#tiktokbrasil'],
    youtube: ['#youtube', '#shorts', '#video', '#content', '#creator'],
    facebook: ['#facebook', '#socialmedia', '#marketing'],
    threads: ['#threads', '#meta', '#conversation'],
    pinterest: ['#pinterest', '#inspiration', '#ideas', '#diy'],
    reddit: ['#reddit', '#discussion', '#community'],
    bluesky: ['#bluesky', '#social', '#decentralized'],
    mastodon: ['#mastodon', '#federated', '#opensource'],
  };

  const base = platformDefaults[platform || 'instagram'] || platformDefaults.instagram;
  const stopWords = new Set(['que', 'para', 'por', 'com', 'uma', 'umas', 'uns', 'uns', 'the', 'and', 'for', 'you', 'your', 'this', 'that', 'from', 'have', 'are', 'was', 'will']);
  const words = (content || '').toLowerCase()
    .split(/\s+/)
    .filter((w: string) => w.length > 3 && !stopWords.has(w) && /^[a-z0-9]/.test(w));
  const contentTags = words.slice(0, 8).map((w: string) => `#${w.replace(/[^a-z0-9]/g, '')}`);
  const suggestions = [...new Set([...contentTags, ...base])].slice(0, maxTags);

  return NextResponse.json({ hashtags: suggestions, source: 'keyword' });
}
