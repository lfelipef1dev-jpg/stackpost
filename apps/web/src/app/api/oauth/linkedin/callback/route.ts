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
    const data = await handleLinkedInCallback(code);

    const supabase = getSupabase();
    const { data: team } = await supabase
      .from('teams')
      .select('id')
      .order('created_at', { ascending: true })
      .limit(1)
      .single();
    const teamId = team?.id;

    const { data: existing } = await supabase
      .from('social_accounts')
      .select('id')
      .eq('platform', 'linkedin')
      .eq('username', data.username)
      .maybeSingle();

    if (existing) {
      const { error: updateError } = await supabase
        .from('social_accounts')
        .update({ access_token: data.accessToken, external_id: data.externalId, expires_at: data.expiresAt })
        .eq('id', existing.id);
      if (updateError) throw updateError;
    } else {
      const { error: insertError } = await supabase
        .from('social_accounts')
        .insert({
          team_id: teamId,
          platform: 'linkedin',
          username: data.username,
          access_token: data.accessToken,
          external_id: data.externalId,
          expires_at: data.expiresAt,
        });
      if (insertError) throw insertError;
    }

    return NextResponse.redirect(new URL('/dashboard?connected=linkedin', req.url));
  } catch (error: any) {
    console.error('LinkedIn OAuth error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
