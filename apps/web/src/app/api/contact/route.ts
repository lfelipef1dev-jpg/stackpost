import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { logger } from '@/lib/logger';
import { getSupabase } from '@/lib/supabase';

const contactSchema = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email().max(200),
  subject: z.string().min(1).max(120),
  message: z.string().min(10).max(5000),
});

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Corpo da requisição inválido.' }, { status: 400 });
  }

  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Dados inválidos.', issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const { name, email, subject, message } = parsed.data;

  try {
    const supabase = getSupabase();
    const { error } = await supabase.from('contact_messages').insert({
      name,
      email,
      subject,
      message,
      status: 'new',
    });

    if (error) {
      // Tabela pode não existir — loga e responde sucesso para não vazar estado interno.
      logger.error('contact_messages insert failed:', error.message);
      return NextResponse.json(
        { error: 'Não foi possível registrar sua mensagem agora. Tente novamente em instantes.' },
        { status: 500 },
      );
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (err) {
    logger.error('contact route error:', String(err));
    return NextResponse.json(
      { error: 'Erro interno. Tente novamente em instantes.' },
      { status: 500 },
    );
  }
}
