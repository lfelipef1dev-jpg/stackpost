import { NextRequest, NextResponse } from 'next/server';
import { ai_rewriteBodySchema } from '@/lib/schemas';
import { getUserFromToken } from '@/lib/auth';

const platformTones: Record<string, string> = {
  instagram: 'Engajador, com emojis e hashtags. Ideal 150-300 caracteres.',
  linkedin: 'Profissional, com call-to-action. Ate 3000 caracteres.',
  x: 'Direto e impactante. Max 280 caracteres.',
  facebook: 'Conversacional. 100-300 caracteres.',
  tiktok: 'Jovem, trending, com hashtags.',
  threads: 'Conversacional, ate 500 caracteres.',
  youtube: 'Descritivo e amigavel. Ate 5000 caracteres.',
  pinterest: 'Inspirador e com palavras-chave.',
};

export async function POST(req: NextRequest) {
  const user = await getUserFromToken(req);
  if (!user) return NextResponse.json({ error: 'Nao autorizado' }, { status: 401 });

  const bodyRaw1 = await req.json().catch(() => ({}));
  const parsed1 = ai_rewriteBodySchema.safeParse(bodyRaw1);
  if (!parsed1.success) return NextResponse.json(parsed1.error.issues, { status: 400 });
  const { content, platform, tone } = bodyRaw1;
  if (!content) return NextResponse.json({ error: 'Conteudo obrigatorio' }, { status: 400 });

  const apiKey = process.env.OPENAI_API_KEY || process.env.NEXUS_IA_API_KEY;
  if (!apiKey) {
    return NextResponse.json({
      rewrite: `${content} ${platform === 'x' ? '#trending' : '#expostacker #socialmedia'}`,
    });
  }

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: `Reescreva o texto abaixo para ${platform || 'Instagram'}. Tom: ${platformTones[platform || 'instagram']}. Retorne apenas a legenda, sem explicacao.` },
        { role: 'user', content },
      ],
      max_tokens: 500,
      temperature: 0.7,
    }),
  });

  const data = await res.json();
  const rewrite = data.choices?.[0]?.message?.content || content;
  return NextResponse.json({ rewrite });
}
