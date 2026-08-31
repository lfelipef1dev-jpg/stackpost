import { NextRequest, NextResponse } from 'next/server';
import { accounts_copyBodySchema } from '@/lib/schemas';
import { getSupabase } from '@/lib/supabase';
import { getUserFromToken } from '@/lib/auth';

// POST /api/accounts/copy — copiar conta para outro team (mesmo token, novo team_id)
export async function POST(req: NextRequest) {
  const user = await getUserFromToken(req);
  if (!user) return NextResponse.json({ error: 'Nao autorizado' }, { status: 401 });

  const bodyRaw1 = await req.json().catch(() => ({}));
  const parsed1 = accounts_copyBodySchema.safeParse(bodyRaw1);
  if (!parsed1.success) return NextResponse.json(parsed1.error.issues, { status: 400 });
  const { accountId, targetTeamId } = bodyRaw1;
  if (!accountId || !targetTeamId) {
    return NextResponse.json({ error: 'accountId e targetTeamId obrigatorios' }, { status: 400 });
  }

  const supabase = getSupabase();

  try {
    // Verificar que o usuario tem acesso ao targetTeamId
    const { data: teamMember } = await supabase
      .from('team_members')
      .select('team_id')
      .eq('user_id', user.id)
      .eq('team_id', targetTeamId)
      .maybeSingle();

    if (!teamMember) {
      return NextResponse.json({ error: 'Sem acesso ao team de destino' }, { status: 403 });
    }

    const { data: account, error } = await supabase
      .from('social_accounts')
      .select('*')
      .eq('id', accountId)
      .eq('team_id', user.teamId)
      .maybeSingle();
    if (error || !account) return NextResponse.json({ error: 'Conta nao encontrada' }, { status: 404 });

    // Inserir copia no targetTeamId
    const { data: copy, error: insertError } = await supabase
      .from('social_accounts')
      .insert({
        team_id: targetTeamId,
        platform: account.platform,
        username: account.username,
        access_token: account.access_token,
        refresh_token: account.refresh_token,
        external_id: account.external_id,
        platform_account_id: account.platform_account_id,
        platform_metadata: account.platform_metadata,
        expires_at: account.expires_at,
        status: 'active',
      })
      .select()
      .single();

    if (insertError) throw insertError;
    return NextResponse.json(copy, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
