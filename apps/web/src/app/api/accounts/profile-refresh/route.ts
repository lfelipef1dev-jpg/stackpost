import { NextRequest, NextResponse } from 'next/server';
import { accounts_profile_refreshBodySchema } from '@/lib/schemas';
import { getSupabase } from '@/lib/supabase';
import { getUserFromToken } from '@/lib/auth';

// POST /api/accounts/profile-refresh — atualizar username/avatar/metadata da conta
export async function POST(req: NextRequest) {
  const user = await getUserFromToken(req);
  if (!user) return NextResponse.json({ error: 'Nao autorizado' }, { status: 401 });

  const bodyRaw1 = await req.json().catch(() => ({}));
  const parsed1 = accounts_profile_refreshBodySchema.safeParse(bodyRaw1);
  if (!parsed1.success) return NextResponse.json(parsed1.error.issues, { status: 400 });
  const { accountId } = bodyRaw1;
  if (!accountId) return NextResponse.json({ error: 'accountId obrigatorio' }, { status: 400 });

  const supabase = getSupabase();

  try {
    const { data: account, error } = await supabase
      .from('social_accounts')
      .select('*')
      .eq('id', accountId)
      .eq('team_id', user.teamId)
      .maybeSingle();
    if (error || !account) return NextResponse.json({ error: 'Conta nao encontrada' }, { status: 404 });

    let updates: any = {};

    if (account.platform === 'instagram') {
      const res = await fetch(
        `https://graph.instagram.com/me?fields=id,username,profile_picture_url&access_token=${account.access_token}`
      );
      const data = await res.json();
      if (data.username) updates.username = data.username;
      if (data.profile_picture_url) {
        updates.platform_metadata = { ...account.platform_metadata, avatar: data.profile_picture_url };
      }
    } else if (account.platform === 'facebook') {
      const pageId = account.platform_account_id || account.external_id;
      const res = await fetch(
        `https://graph.facebook.com/v26.0/${pageId}?fields=name,picture,followers_count&access_token=${account.access_token}`
      );
      const data = await res.json();
      if (data.name) updates.username = data.name;
      if (data.followers_count !== undefined) {
        updates.platform_metadata = { ...account.platform_metadata, followers: data.followers_count, avatar: data.picture?.data?.url };
      }
    } else if (account.platform === 'linkedin') {
      const res = await fetch('https://api.linkedin.com/v2/userinfo', {
        headers: { Authorization: `Bearer ${account.access_token}` },
      });
      const data = await res.json();
      if (data.name) updates.username = data.name;
      if (data.picture) {
        updates.platform_metadata = { ...account.platform_metadata, avatar: data.picture };
      }
    } else if (account.platform === 'youtube') {
      const res = await fetch('https://www.googleapis.com/youtube/v3/channels?part=snippet&mine=true', {
        headers: { Authorization: `Bearer ${account.access_token}` },
      });
      const data = await res.json();
      const ch = data.items?.[0];
      if (ch?.snippet?.title) updates.username = ch.snippet.title;
      if (ch?.snippet?.thumbnails?.default?.url) {
        updates.platform_metadata = { ...account.platform_metadata, avatar: ch.snippet.thumbnails.default.url };
      }
    } else if (account.platform === 'x') {
      const res = await fetch('https://api.twitter.com/2/users/me', {
        headers: { Authorization: `Bearer ${account.access_token}` },
      });
      const data = await res.json();
      if (data.data?.username) updates.username = data.data.username;
      if (data.data?.name) {
        updates.platform_metadata = { ...account.platform_metadata, name: data.data.name };
      }
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ success: true, updated: false, message: 'Nada para atualizar' });
    }

    const { data: updated, error: updError } = await supabase
      .from('social_accounts')
      .update(updates)
      .eq('id', accountId)
      .select()
      .single();
    if (updError) throw updError;

    return NextResponse.json({ success: true, updated: true, account: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
