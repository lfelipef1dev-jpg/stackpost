import { NextRequest, NextResponse } from 'next/server';
import { ai_image_captionBodySchema } from '@/lib/schemas';
import { getUserFromToken } from '@/lib/auth';
import { aiChat } from '@/lib/ai';

export async function POST(req: NextRequest) {
  const user = await getUserFromToken(req);
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  const bodyRaw1 = await req.json().catch(() => ({}));
  const parsed1 = ai_image_captionBodySchema.safeParse(bodyRaw1);
  if (!parsed1.success) return NextResponse.json(parsed1.error.issues, { status: 400 });
  const { imageUrl, platform, count = 3 } = bodyRaw1;
  if (!imageUrl) return NextResponse.json({ error: 'imageUrl obrigatório' }, { status: 400 });

  const text = await aiChat(
    [
      { role: 'system', content: `Você e um especialista em social media. Gere ${count} opções de legenda em portugues para a imagem fornecida, adequadas para ${platform || 'Instagram'}. Retorne apenas as opções, separadas por linha, sem numeracao.` },
      {
        role: 'user',
        content: [
          { type: 'text', text: 'Gere legendas criativas para esta imagem.' },
          { type: 'image_url', image_url: { url: imageUrl } },
        ],
      },
    ],
    { maxTokens: 500, temperature: 0.8 }
  );
  if (!text) {
    return NextResponse.json({
      captions: [
        'Imagem incrível! 🚀 #expostacker #socialmedia',
        'Novo conteúdo no ar. Confira! ✨',
        'O que achou? Deixe seu comentário 👇',
      ].slice(0, count),
    });
  }
  const captions = text.split('\n').map((s: string) => s.replace(/^\d+[\.)]\s*/, '').trim()).filter(Boolean).slice(0, count);
  return NextResponse.json({ captions });
}
