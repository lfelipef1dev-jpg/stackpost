import { logger } from '@/lib/logger';
import { NextRequest, NextResponse } from 'next/server';
import { accounts_connection_checkBodySchema } from '@/lib/schemas';
import { getSupabase } from '@/lib/supabase';
import { getUserFromToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const user = await getUserFromToken(req);
  if (!user) return NextResponse.json({ error: 'Nao autorizado' }, { status: 401 });

  const bodyRaw1 = await req.json();
  const parsed1 = accounts_connection_checkBodySchema.safeParse(bodyRaw1);
  if (!parsed1.success) return NextResponse.json(parsed1.error.issues, { status: 400 });
  const body = bodyRaw1;
  const { socialAccountId, platform } = body;

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

    let valid = true;
    let needsReconnect = false;
    let detail = 'OK';

    if (account.platform === 'instagram' || account.platform === 'facebook') {
      try {
        const res = await fetch(
          `https://graph.facebook.com/v19.0/me?access_token=${account.access_token}`
        );
        if (!res.ok) {
          valid = false;
          needsReconnect = true;
          detail = 'Token invalido ou expirado';
        }
      } catch {
        valid = false;
        needsReconnect = true;
        detail = 'Erro de conexao';
      }
    } else if (account.platform === 'linkedin') {
      try {
        const res = await fetch('https://api.linkedin.com/v2/me', {
          headers: { Authorization: `Bearer ${account.access_token}` },
        });
        if (!res.ok) {
          valid = false;
          needsReconnect = true;
          detail = 'Token invalido ou expirado';
        }
      } catch {
        valid = false;
        needsReconnect = true;
        detail = 'Erro de conexao';
      }
    }

    const newStatus = valid ? 'active' : 'expired';
    const { error: updateError } = await supabase
      .from('social_accounts')
      .update({ status: newStatus, last_checked_at: new Date().toISOString() })
      .eq('id', socialAccountId);
    if (updateError) throw updateError;

    return NextResponse.json({
      valid,
      needsReconnect,
      status: newStatus,
      detail,
      platform: account.platform,
      username: account.username,
    });
  } catch (error) {
    logger.error((error as string));
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
