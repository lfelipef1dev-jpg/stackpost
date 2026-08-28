import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import { getUserFromToken } from '@/lib/auth';

// GET /api/misc/facebook/token-debug — debugar token do Facebook
export async function GET(req: NextRequest) {
  const user = await getUserFromToken(req);
  if (!user) return NextResponse.json({ error: 'Nao autorizado' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const accountId = searchParams.get('accountId');
  if (!accountId) return NextResponse.json({ error: 'accountId obrigatorio' }, { status: 400 });

  const supabase = getSupabase();

  try {
    const { data: account } = await supabase
      .from('social_accounts')
      .select('access_token, platform_account_id, expires_at')
      .eq('id', accountId)
      .eq('team_id', user.teamId)
      .eq('platform', 'facebook')
      .maybeSingle();
    if (!account) return NextResponse.json({ error: 'Conta nao encontrada' }, { status: 404 });

    const res = await fetch(
      `https://graph.facebook.com/debug_token?input_token=${account.access_token}&access_token=${process.env.META_APP_ID}|${process.env.META_APP_SECRET}`
    );
    const data = await res.json();
    if (!res.ok) return NextResponse.json({ error: data.error?.message || 'Erro no debug' }, { status: 400 });

    return NextResponse.json({
      data: data.data,
      storedExpiresAt: account.expires_at,
      isValid: data.data?.is_valid,
      expiresAt: data.data?.expires_at ? new Date(data.data.expires_at * 1000).toISOString() : null,
      scopes: data.data?.scopes || [],
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
