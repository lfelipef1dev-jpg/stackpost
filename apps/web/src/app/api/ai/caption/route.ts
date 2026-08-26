import { NextRequest, NextResponse } from 'next/server';
import { getUserFromToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const user = await getUserFromToken(req);
  if (!user) return NextResponse.json({ error: 'Nao autorizado' }, { status: 401 });

  const body = await req.json();
  const { prompt, platform, tone } = body;

  const tones: Record<string, string> = {
    professional: 'profissional e direto',
    casual: 'casual e descontraido',
    funny: 'divertido e bem-humorado',
    inspirational: 'inspirador e motivacional',
    promotional: 'promocional e persuasivo',
  };

  const platformGuides: Record<string, string> = {
    instagram: 'Use ate 2200 caracteres com emojis e hashtags relevantes. Ideal: 150-300 caracteres.',
    linkedin: 'Tom profissional. Use ate 3000 caracteres. Inclua call-to-action.',
    twitter: 'Max 280 caracteres. Direto e impactante.',
    facebook: 'Conversacional. Ate 63206 caracteres, mas idealmente 100-300.',
    tiktok: 'Jovem e trending. Use hashtags do momento.',
    threads: 'Conversacional, ate 500 caracteres.',
  };

  const systemPrompt = `Voce e um especialista em social media. Gere uma legenda para ${platform || 'rede social'}.
Tom: ${tones[tone] || 'profissional'}.
${platformGuides[platform || 'instagram'] || ''}
Retorne apenas a legenda, sem explicacao.`;

  try {
    const apiKey = process.env.OPENAI_API_KEY || process.env.NEXUS_IA_API_KEY;
    if (!apiKey) {
      // Fallback: generate a simple template
      const templates = [
        `${prompt}\n\n#expostacker #socialmedia #content`,
        `Novo post! ${prompt}\n\n#marketing #digital #growth`,
        `${prompt} 🚀\n\n#expostacker #inovacao #tecnologia`,
      ];
      return NextResponse.json({ caption: templates[Math.floor(Math.random() * templates.length)] });
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
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt || 'Escreva uma legenda sobre tecnologia e inovacao' },
        ],
        max_tokens: 500,
        temperature: 0.7,
      }),
    });

    const data = await res.json();
    const caption = data.choices?.[0]?.message?.content || '';

    return NextResponse.json({ caption });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Erro ao gerar legenda' }, { status: 500 });
  }
}
