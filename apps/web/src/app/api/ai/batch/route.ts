import { NextRequest, NextResponse } from 'next/server';
import { ai_batchBodySchema } from '@/lib/schemas';
import { getUserFromToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const user = await getUserFromToken(req);
  if (!user) return NextResponse.json({ error: 'Nao autorizado' }, { status: 401 });

  const bodyRaw1 = await req.json().catch(() => ({}));
  const parsed1 = ai_batchBodySchema.safeParse(bodyRaw1);
  if (!parsed1.success) return NextResponse.json(parsed1.error.issues, { status: 400 });
  const { topic, days = 7, platform } = bodyRaw1;
  if (!topic) return NextResponse.json({ error: 'Tema obrigatorio' }, { status: 400 });

  const apiKey = process.env.OPENAI_API_KEY || process.env.NEXUS_IA_API_KEY;
  if (!apiKey) {
    const posts = Array.from({ length: days }, (_, i) => ({
      content: `${topic} — parte ${i + 1}. #expostacker #socialmedia`,
      scheduledAt: new Date(Date.now() + i * 86400000).toISOString(),
    }));
    return NextResponse.json({ posts });
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
        { role: 'system', content: `Gere ${days} posts para ${platform || 'Instagram'} sobre "${topic}". Cada post deve ter conteudo unico e curto. Retorne apenas os posts, um por linha, sem numeracao.` },
        { role: 'user', content: topic },
      ],
      max_tokens: 700,
      temperature: 0.8,
    }),
  });

  const data = await res.json();
  const text = data.choices?.[0]?.message?.content || '';
  const contents = text.split('\n').map((s: string) => s.replace(/^\d+[\.)]\s*/, '').trim()).filter(Boolean).slice(0, days);
  const posts = contents.map((content: string, i: number) => ({
    content,
    scheduledAt: new Date(Date.now() + i * 86400000).toISOString(),
  }));
  return NextResponse.json({ posts });
}
