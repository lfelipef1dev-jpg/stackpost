import { NextRequest, NextResponse } from 'next/server';
import { handleLinkedInCallback } from '@/lib/adapters/linkedin-api';
import { getSupabase } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');

  if (!code) {
    return NextResponse.json({ error: 'Codigo nao informado' }, { status: 400 });
  }

  try {
    const accounts = await handleLinkedInCallback(code);

    const supabase = getSupabase();
    const { data: team } = await supabase
      .from('teams')
      .select('id')
      .order('created_at', { ascending: true })
      .limit(1)
      .single();
    const teamId = team?.id;

    for (const account of accounts) {
      const { data: existing } = await supabase
        .from('social_accounts')
        .select('id')
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
            team_id: teamId,
            platform: 'linkedin',
            ...accountData,
          });
        if (insertError) throw insertError;
      }
    }

    return NextResponse.redirect(new URL('/dashboard?connected=linkedin&accounts=' + accounts.length, req.url));
  } catch (error: any) {
    console.error('LinkedIn OAuth error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
