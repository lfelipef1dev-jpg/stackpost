import { NextRequest, NextResponse } from 'next/server';
import { accounts_connectBodySchema } from '@/lib/schemas';
import { getSupabase } from '@/lib/supabase';
import { getUserFromToken } from '@/lib/auth';

// POST /api/accounts/connect — conectar conta manualmente (OAuth e feito nas rotas /api/oauth/*)
export async function POST(req: NextRequest) {
  const user = await getUserFromToken(req);
  if (!user) return NextResponse.json({ error: 'Nao autorizado' }, { status: 401 });

  const bodyRaw1 = await req.json().catch(() => ({}));
  const parsed1 = accounts_connectBodySchema.safeParse(bodyRaw1);
  if (!parsed1.success) return NextResponse.json(parsed1.error.issues, { status: 400 });
  const { platform, accessToken, refreshToken, externalId, username, platformAccountId, metadata } = bodyRaw1;
  if (!platform || !accessToken) {
    return NextResponse.json({ error: 'platform e accessToken obrigatorios' }, { status: 400 });
  }

  const supabase = getSupabase();

  try {
    const { data: existing } = await supabase
      .from('social_accounts')
      .select('id')
      .eq('team_id', user.teamId)
      .eq('platform', platform)
      .eq('external_id', externalId || '')
      .maybeSingle();

    const accountData = {
      access_token: accessToken,
      refresh_token: refreshToken || null,
      external_id: externalId || null,
      platform_account_id: platformAccountId || null,
      platform_metadata: metadata || {},
      status: 'active',
    };

    if (existing) {
      const { data, error } = await supabase
        .from('social_accounts')
        .update(accountData)
        .eq('id', existing.id)
        .select()
        .single();
      if (error) throw error;
      return NextResponse.json(data);
    }

    const { data, error } = await supabase
      .from('social_accounts')
      .insert({
        team_id: user.teamId,
        platform,
        username: username || 'unknown',
        ...accountData,
      })
      .select()
      .single();
    if (error) throw error;
    return NextResponse.json(data, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
