import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import { getUserFromToken } from '@/lib/auth';

// POST /api/accounts/unset-channel — desativar canal selecionado (volta para status inactive)
export async function POST(req: NextRequest) {
  const user = await getUserFromToken(req);
  if (!user) return NextResponse.json({ error: 'Nao autorizado' }, { status: 401 });

  const { accountId } = await req.json().catch(() => ({}));
  if (!accountId) return NextResponse.json({ error: 'accountId obrigatorio' }, { status: 400 });

  const supabase = getSupabase();

  try {
    const { data: account, error: accError } = await supabase
      .from('social_accounts')
      .select('id, team_id, platform')
      .eq('id', accountId)
      .eq('team_id', user.teamId)
      .maybeSingle();
    if (accError || !account) return NextResponse.json({ error: 'Conta nao encontrada' }, { status: 404 });

    const { error } = await supabase
      .from('social_accounts')
      .update({ status: 'inactive', platform_account_id: null })
      .eq('id', accountId);

    if (error) throw error;
    return NextResponse.json({ success: true, accountId });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
