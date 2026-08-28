import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import { getUserFromToken } from '@/lib/auth';

// POST /api/accounts/disconnect — desconectar conta (marcar inativa + limpar token)
export async function POST(req: NextRequest) {
  const user = await getUserFromToken(req);
  if (!user) return NextResponse.json({ error: 'Nao autorizado' }, { status: 401 });

  const { accountId } = await req.json().catch(() => ({}));
  if (!accountId) return NextResponse.json({ error: 'accountId obrigatorio' }, { status: 400 });

  const supabase = getSupabase();

  try {
    const { data, error } = await supabase
      .from('social_accounts')
      .update({
        status: 'disconnected',
        access_token: null,
        refresh_token: null,
      })
      .eq('id', accountId)
      .eq('team_id', user.teamId)
      .select()
      .maybeSingle();

    if (error) throw error;
    if (!data) return NextResponse.json({ error: 'Conta nao encontrada' }, { status: 404 });

    return NextResponse.json({ success: true, accountId });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
