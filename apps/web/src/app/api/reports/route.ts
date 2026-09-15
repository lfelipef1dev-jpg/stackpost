import { logger } from '@/lib/logger';
import { NextRequest, NextResponse } from 'next/server';
import { reportBodySchema } from '@/lib/schemas';
import { getSupabase } from '@/lib/supabase';
import { getUserFromToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const user = await getUserFromToken(req);
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  const bodyRaw = await req.json();
  const parsed = reportBodySchema.safeParse(bodyRaw);
  if (!parsed.success) return NextResponse.json(parsed.error.issues, { status: 400 });
  const body = parsed.data;

  try {
    const supabase = getSupabase();
    const { error } = await supabase.from('reports').insert({
      team_id: user.teamId,
      user_id: user.id,
      email: user.email || null,
      category: body.category,
      message: body.message,
      page_url: body.pageUrl || null,
    });
    if (error) throw error;
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (err: any) {
    logger.error('Report insert error:', err);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
