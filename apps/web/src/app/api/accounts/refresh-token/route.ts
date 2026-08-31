import { logger } from '@/lib/logger';
import { NextRequest, NextResponse } from 'next/server';
import { accounts_refresh_tokenBodySchema } from '@/lib/schemas';
import { getSupabase } from '@/lib/supabase';
import { getUserFromToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const user = await getUserFromToken(req);
  if (!user) return NextResponse.json({ error: 'Nao autorizado' }, { status: 401 });

  const bodyRaw1 = await req.json();
  const parsed1 = accounts_refresh_tokenBodySchema.safeParse(bodyRaw1);
  if (!parsed1.success) return NextResponse.json(parsed1.error.issues, { status: 400 });
  const body = bodyRaw1;
  const { socialAccountId } = body;

  if (!socialAccountId) {
    return NextResponse.json({ error: 'socialAccountId obrigatorio' }, { status: 400 });
  }

  try {
    const supabase = getSupabase();
    const { data: account, error: accountError } = await supabase
      .from('social_accounts')
      .select('*')
      .eq('id', socialAccountId)
      .eq('team_id', user.teamId)
      .single();

    if (accountError || !account) {
      return NextResponse.json({ error: 'Conta nao encontrada' }, { status: 404 });
    }

    if (!account.refresh_token) {
      return NextResponse.json({ error: 'Sem refresh token. Reconecte a conta.' }, { status: 400 });
    }

    let newToken: string | null = null;
    let newExpiry: Date | null = null;

    if (account.platform === 'instagram' || account.platform === 'facebook') {
      const res = await fetch(
        `https://graph.facebook.com/v19.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${process.env.META_APP_ID}&client_secret=${process.env.META_APP_SECRET}&fb_exchange_token=${account.access_token}`
      );
      const data = await res.json();
      if (data.access_token) {
        newToken = data.access_token;
        newExpiry = new Date(Date.now() + (data.expires_in || 5184000) * 1000);
      }
    } else if (account.platform === 'linkedin') {
      const res = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: account.refresh_token,
          client_id: process.env.LINKEDIN_CLIENT_ID!,
          client_secret: process.env.LINKEDIN_CLIENT_SECRET!,
        }),
      });
      const data = await res.json();
      if (data.access_token) {
        newToken = data.access_token;
        newExpiry = new Date(Date.now() + (data.expires_in || 5184000) * 1000);
      }
    }

    if (!newToken) {
      return NextResponse.json({ error: 'Falha ao renovar token. Reconecte a conta.' }, { status: 400 });
    }

    const { error: updateError } = await supabase
      .from('social_accounts')
      .update({ access_token: newToken, expires_at: newExpiry, status: 'active' })
      .eq('id', socialAccountId);
    if (updateError) throw updateError;

    return NextResponse.json({ success: true, expiresAt: newExpiry });
  } catch (error) {
    logger.error((error as string));
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
