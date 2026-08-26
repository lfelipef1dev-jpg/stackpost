import { NextRequest, NextResponse } from 'next/server';
import { getUserFromToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const user = await getUserFromToken(req);
  if (!user) return NextResponse.json({ error: 'Nao autorizado' }, { status: 401 });

  const body = await req.json();
  const { content, platform } = body;

  const hashtagSets: Record<string, string[]> = {
    instagram: ['#instagram', '#reels', '#explore', '#trending', '#viral', '#content', '#socialmedia', '#marketing', '#expostacker', '#growth'],
    linkedin: ['#linkedin', '#networking', '#professional', '#career', '#business', '#innovation', '#tech', '#growth', '#leadership'],
    twitter: ['#twitter', '#trending', '#viral'],
    tiktok: ['#tiktok', '#fyp', '#foryou', '#viral', '#trending', '#tiktokbrasil'],
    youtube: ['#youtube', '#shorts', '#video', '#content', '#creator'],
    facebook: ['#facebook', '#socialmedia', '#marketing'],
    threads: ['#threads', '#meta', '#conversation'],
    pinterest: ['#pinterest', '#inspiration', '#ideas', '#diy'],
    reddit: ['#reddit', '#discussion', '#community'],
    bluesky: ['#bluesky', '#social', '#decentralized'],
    mastodon: ['#mastodon', '#federated', '#opensource'],
  };

  const base = hashtagSets[platform || 'instagram'] || hashtagSets.instagram;

  const words = (content || '').toLowerCase().split(/\s+/).filter((w: string) => w.length > 3);
  const contentTags = words.slice(0, 5).map((w: string) => `#${w.replace(/[^a-z0-9]/g, '')}`);

  const suggestions = [...new Set([...contentTags, ...base])].slice(0, 15);

  return NextResponse.json({ hashtags: suggestions });
}
