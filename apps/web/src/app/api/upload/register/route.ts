import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import { getUserFromToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromToken(req);
    if (!user) return NextResponse.json({ error: 'Nao autorizado' }, { status: 401 });

    const { id, fileName, contentType, size, url } = await req.json();
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
      console.error('Register upload error:', error);
      return NextResponse.json({ error: 'Erro ao registrar' }, { status: 500 });
    }

    return NextResponse.json({ ok: true, id });
  } catch (err: any) {
    console.error('Register upload error:', err);
    return NextResponse.json({ error: err.message || 'Erro interno' }, { status: 500 });
  }
}
