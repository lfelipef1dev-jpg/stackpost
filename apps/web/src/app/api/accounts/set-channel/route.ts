import { logger } from '@/lib/logger';
import { NextRequest, NextResponse } from 'next/server';
import { accounts_set_channelBodySchema } from '@/lib/schemas';
import { getSupabase } from '@/lib/supabase';

// Define/atualiza o canal selecionado para uma social_account
export async function POST(req: NextRequest) {
  const bodyRaw1 = await req.json().catch(() => ({}));
  const parsed1 = accounts_set_channelBodySchema.safeParse(bodyRaw1);
  if (!parsed1.success) return NextResponse.json(parsed1.error.issues, { status: 400 });
  const body = bodyRaw1;
  const { accountId, platformAccountId, platformMetadata } = body;

  if (!accountId) {
    return NextResponse.json({ error: 'accountId obrigatorio' }, { status: 400 });
  }

  const supabase = getSupabase();

  try {
    const { data: existing, error: findError } = await supabase
      .from('social_accounts')
      .select('id, team_id, platform')
      .eq('id', accountId)
      .maybeSingle();

    if (findError || !existing) {
      return NextResponse.json({ error: 'Conta nao encontrada' }, { status: 404 });
    }

    const updates: Record<string, any> = { status: 'active' };
    if (platformAccountId !== undefined) updates.platform_account_id = platformAccountId;
    if (platformMetadata !== undefined) updates.platform_metadata = platformMetadata;

    const { error: updateError } = await supabase
      .from('social_accounts')
      .update(updates)
      .eq('id', accountId);

    if (updateError) throw updateError;

    // Desativar outras contas do mesmo time/plataforma para manter apenas uma ativa
    const { error: disableError } = await supabase
      .from('social_accounts')
      .update({ status: 'inactive' })
      .eq('team_id', existing.team_id)
      .eq('platform', existing.platform)
      .neq('id', accountId);

    if (disableError) throw disableError;

    return NextResponse.json({ success: true, accountId, ...updates });
  } catch (error: any) {
    logger.error('set-channel error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
