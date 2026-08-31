import { logger } from '@/lib/logger';
import { NextRequest, NextResponse } from 'next/server';
import { upload_registerBodySchema } from '@/lib/schemas';
import { getSupabase } from '@/lib/supabase';
import { getUserFromToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromToken(req);
    if (!user) return NextResponse.json({ error: 'Nao autorizado' }, { status: 401 });

    const bodyRaw1 = await req.json();
    const parsed1 = upload_registerBodySchema.safeParse(bodyRaw1);
    if (!parsed1.success) return NextResponse.json(parsed1.error.issues, { status: 400 });
    const { id, fileName, contentType, size, url } = bodyRaw1;
    if (!id || !url) return NextResponse.json({ error: 'id e url obrigatorios' }, { status: 400 });

    const supabase = getSupabase();

    // Upsert - se ja foi inserido pelo presign, atualizar; se nao, inserir
    const { data, error } = await supabase
      .from('uploads')
      .upsert({
        id,
        team_id: user.teamId,
        file_name: fileName || '',
        mime_type: contentType || '',
        size: size || 0,
        url,
      })
      .select()
      .single();

    if (error) {
      logger.error('Register upload error:', error);
      return NextResponse.json({ error: 'Erro ao registrar' }, { status: 500 });
    }

    return NextResponse.json({ ok: true, id });
  } catch (err: any) {
    logger.error('Register upload error:', err);
    return NextResponse.json({ error: err.message || 'Erro interno' }, { status: 500 });
  }
}
