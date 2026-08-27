import { NextRequest, NextResponse } from 'next/server';
import { handleInstagramCallback } from '@/lib/adapters/instagram-api';
import { getSupabase } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state') || 'instagram';

  if (!code) {
    return NextResponse.json({ error: 'Codigo nao informado' }, { status: 400 });
  }

  // Extrair teamId do state (formato: teamId:instagram)
  const teamId = state.includes(':') ? state.split(':')[0] : null;

  try {
    const data = await handleInstagramCallback(code);

    const supabase = getSupabase();

    // Se temos teamId do state, usar; senao buscar pelo username ou primeiro team
    let resolvedTeamId = teamId;
    if (!resolvedTeamId) {
      const { data: firstTeam } = await supabase
        .from('teams')
        .select('id')
        .order('created_at', { ascending: true })
        .limit(1)
        .single();
      resolvedTeamId = firstTeam?.id;
    }

    if (!resolvedTeamId) {
      throw new Error('Nenhum team encontrado');
    }

    const { data: existing } = await supabase
      .from('social_accounts')
      .select('id')
      .eq('team_id', resolvedTeamId)
      .eq('platform', 'instagram')
      .maybeSingle();

    if (existing) {
      const { error: updateError } = await supabase
        .from('social_accounts')
        .update({
          access_token: data.accessToken,
          external_id: data.instagramId,
          expires_at: data.expiresAt,
          status: 'active',
        })
        .eq('id', existing.id);
      if (updateError) throw updateError;
    } else {
      const { error: insertError } = await supabase
        .from('social_accounts')
        .insert({
          team_id: resolvedTeamId,
          platform: 'instagram',
          username: data.username,
          access_token: data.accessToken,
          external_id: data.instagramId,
          expires_at: data.expiresAt,
          status: 'active',
        });
      if (insertError) throw insertError;
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://stackpost.expostacker.com.br';
    return NextResponse.redirect(`${siteUrl}/accounts?connected=instagram`);
  } catch (error: any) {
    console.error('Meta OAuth error:', error);
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://stackpost.expostacker.com.br';
    return NextResponse.redirect(`${siteUrl}/accounts?error=${encodeURIComponent(error.message)}`);
  }
}
