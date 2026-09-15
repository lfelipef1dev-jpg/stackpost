import { NextRequest, NextResponse } from 'next/server';
import { ai_rewriteBodySchema } from '@/lib/schemas';
import { getUserFromToken } from '@/lib/auth';
import { aiChat } from '@/lib/ai';

const platformTones: Record<string, string> = {
  instagram: 'Engajador, com emojis e hashtags. Ideal 150-300 caracteres.',
  linkedin: 'Profissional, com call-to-action. Até 3000 caracteres.',
  x: 'Direto e impactante. Max 280 caracteres.',
  facebook: 'Conversacional. 100-300 caracteres.',
  tiktok: 'Jovem, trending, com hashtags.',
  threads: 'Conversacional, até 500 caracteres.',
  youtube: 'Descritivo e amigavel. Até 5000 caracteres.',
  pinterest: 'Inspirador e com palavras-chave.',
};

export async function POST(req: NextRequest) {
  const user = await getUserFromToken(req);
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  const bodyRaw1 = await req.json().catch(() => ({}));
  const parsed1 = ai_rewriteBodySchema.safeParse(bodyRaw1);
  if (!parsed1.success) return NextResponse.json(parsed1.error.issues, { status: 400 });
  const { content, platform, tone } = bodyRaw1;
  if (!content) return NextResponse.json({ error: 'Conteúdo obrigatório' }, { status: 400 });

  const rewrite = await aiChat([
    { role: 'system', content: `Reescreva o texto abaixo para ${platform || 'Instagram'}. Tom: ${platformTones[platform || 'instagram']}. Retorne apenas a legenda, sem explicacao.` },
    { role: 'user', content },
  ]);
  return NextResponse.json({
    rewrite: rewrite || `${content} ${platform === 'x' ? '#trending' : '#expostacker #socialmedia'}`,
  });
}
