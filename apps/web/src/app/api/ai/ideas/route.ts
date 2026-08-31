import { NextRequest, NextResponse } from 'next/server';
import { ai_ideasBodySchema } from '@/lib/schemas';
import { getUserFromToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const user = await getUserFromToken(req);
  if (!user) return NextResponse.json({ error: 'Nao autorizado' }, { status: 401 });

  const bodyRaw1 = await req.json().catch(() => ({}));
  const parsed1 = ai_ideasBodySchema.safeParse(bodyRaw1);
  if (!parsed1.success) return NextResponse.json(parsed1.error.issues, { status: 400 });
  const { niche, count = 5 } = bodyRaw1;

  const apiKey = process.env.OPENAI_API_KEY || process.env.NEXUS_IA_API_KEY;
  if (!apiKey) {
    return NextResponse.json({
      ideas: [
        'Dica de produtividade para quem trabalha com redes sociais',
        'Como usar IA para criar conteudo em escala',
        'Case de sucesso de um cliente que cresceu 3x',
        'Erros comuns em postagem multi-plataforma',
        'Como montar um calendario de conteudo de 30 dias',
      ].slice(0, count),
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
        { role: 'system', content: `Gere ${count} ideias de posts para redes sociais${niche ? ` no nicho: ${niche}` : ''}. Retorne apenas as ideias, uma por linha, sem numeracao.` },
        { role: 'user', content: 'Sugestoes de conteudo' },
      ],
      max_tokens: 300,
      temperature: 0.8,
    }),
  });

  const data = await res.json();
  const text = data.choices?.[0]?.message?.content || '';
  const ideas = text.split('\n').map((s: string) => s.replace(/^\d+[\.)]\s*/, '').trim()).filter(Boolean).slice(0, count);
  return NextResponse.json({ ideas });
}
