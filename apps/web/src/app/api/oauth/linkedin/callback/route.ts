import { logger } from '@/lib/logger';
import { oauth_linkedin_callbackQuerySchema } from '@/lib/schemas';
import { NextRequest, NextResponse } from 'next/server';
import { handleLinkedInCallback } from '@/lib/adapters/linkedin-api';
import { getSupabase } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const queryRaw = Object.fromEntries(searchParams);
  const parsedQuery = oauth_linkedin_callbackQuerySchema.safeParse(queryRaw);
  if (!parsedQuery.success) return NextResponse.json({ error: parsedQuery.error.issues }, { status: 400 });
  const code = searchParams.get('code');
  const state = searchParams.get('state') || 'linkedin';
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://stackpost.expostacker.com.br';

  if (!code) {
    return NextResponse.json({ error: 'Codigo nao informado' }, { status: 400 });
  }

  const teamId = state.includes(':') ? state.split(':')[0] : null;

  try {
    const accounts = await handleLinkedInCallback(code);

    const supabase = getSupabase();

    // Resolver teamId do state ou fallback para primeiro team
    let resolvedTeamId = teamId;
    if (!resolvedTeamId) {
      const { data: team } = await supabase
        .from('teams')
        .select('id')
        .order('created_at', { ascending: true })
        .limit(1)
        .single();
      resolvedTeamId = team?.id;
    }
    if (!resolvedTeamId) throw new Error('Nenhum team encontrado');

    for (const account of accounts) {
      const { data: existing } = await supabase
        .from('social_accounts')
        .select('id')
        .eq('team_id', resolvedTeamId)
        .eq('platform', 'linkedin')
        .eq('external_id', account.externalId)
        .maybeSingle();

      const accountData = {
        access_token: account.accessToken,
        username: account.username,
        external_id: account.externalId,
        platform_account_id: account.externalId,
        platform_metadata: { type: account.type || 'person' },
        expires_at: account.expiresAt,
        status: 'active',
      };

      if (existing) {
        const { error: updateError } = await supabase
          .from('social_accounts')
          .update(accountData)
          .eq('id', existing.id);
        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase
          .from('social_accounts')
          .insert({
            team_id: resolvedTeamId,
            platform: 'linkedin',
            ...accountData,
          });
        if (insertError) throw insertError;
      }
    }

    return NextResponse.redirect(`${siteUrl}/accounts?connected=linkedin&accounts=${accounts.length}`);
  } catch (error: any) {
    logger.error('LinkedIn OAuth error:', error);
    return NextResponse.redirect(`${siteUrl}/accounts?error=${encodeURIComponent(error.message)}`);
  }
}
