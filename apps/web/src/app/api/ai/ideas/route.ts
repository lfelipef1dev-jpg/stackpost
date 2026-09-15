import { NextRequest, NextResponse } from 'next/server';
import { ai_ideasBodySchema } from '@/lib/schemas';
import { getUserFromToken } from '@/lib/auth';
import { aiChat } from '@/lib/ai';

export async function POST(req: NextRequest) {
  const user = await getUserFromToken(req);
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  const bodyRaw1 = await req.json().catch(() => ({}));
  const parsed1 = ai_ideasBodySchema.safeParse(bodyRaw1);
  if (!parsed1.success) return NextResponse.json(parsed1.error.issues, { status: 400 });
  const { niche, count = 5 } = bodyRaw1;

  const text = await aiChat(
    [
      { role: 'system', content: `Gere ${count} ideias de posts para redes sociais${niche ? ` no nicho: ${niche}` : ''}. Retorne apenas as ideias, uma por linha, sem numeracao.` },
      { role: 'user', content: 'Sugestoes de conteúdo' },
    ],
    { maxTokens: 300, temperature: 0.8 }
  );
  if (!text) {
    return NextResponse.json({
      ideas: [
        'Dica de produtividade para quem trabalha com redes sociais',
        'Como usar IA para criar conteúdo em escala',
        'Case de sucesso de um cliente que cresceu 3x',
        'Erros comuns em postagem multi-plataforma',
        'Como montar um calendário de conteúdo de 30 dias',
      ].slice(0, count),
    });
  }
  const ideas = text.split('\n').map((s: string) => s.replace(/^\d+[\.)]\s*/, '').trim()).filter(Boolean).slice(0, count);
  return NextResponse.json({ ideas });
}
