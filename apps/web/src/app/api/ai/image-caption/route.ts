import { NextRequest, NextResponse } from 'next/server';
import { ai_image_captionBodySchema } from '@/lib/schemas';
import { getUserFromToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const user = await getUserFromToken(req);
  if (!user) return NextResponse.json({ error: 'Nao autorizado' }, { status: 401 });

  const bodyRaw1 = await req.json().catch(() => ({}));
  const parsed1 = ai_image_captionBodySchema.safeParse(bodyRaw1);
  if (!parsed1.success) return NextResponse.json(parsed1.error.issues, { status: 400 });
  const { imageUrl, platform, count = 3 } = bodyRaw1;
  if (!imageUrl) return NextResponse.json({ error: 'imageUrl obrigatorio' }, { status: 400 });

  const apiKey = process.env.OPENAI_API_KEY || process.env.NEXUS_IA_API_KEY;
  if (!apiKey) {
    return NextResponse.json({
      captions: [
        'Imagem incrível! 🚀 #expostacker #socialmedia',
        'Novo conteúdo no ar. Confira! ✨',
        'O que achou? Deixe seu comentário 👇',
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
        { role: 'system', content: `Voce e um especialista em social media. Gere ${count} opcoes de legenda em portugues para a imagem fornecida, adequadas para ${platform || 'Instagram'}. Retorne apenas as opcoes, separadas por linha, sem numeracao.` },
        {
          role: 'user',
          content: [
            { type: 'text', text: 'Gere legendas criativas para esta imagem.' },
            { type: 'image_url', image_url: { url: imageUrl } },
          ],
        },
      ],
      max_tokens: 500,
      temperature: 0.8,
    }),
  });

  const data = await res.json();
  const text = data.choices?.[0]?.message?.content || '';
  const captions = text.split('\n').map((s: string) => s.replace(/^\d+[\.)]\s*/, '').trim()).filter(Boolean).slice(0, count);
  return NextResponse.json({ captions });
}
