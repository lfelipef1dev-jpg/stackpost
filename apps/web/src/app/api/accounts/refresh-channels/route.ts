import { NextRequest, NextResponse } from 'next/server';
import { accounts_refresh_channelsBodySchema } from '@/lib/schemas';
import { getSupabase } from '@/lib/supabase';
import { getUserFromToken } from '@/lib/auth';

// POST /api/accounts/refresh-channels — buscar channels/pages disponiveis da plataforma
export async function POST(req: NextRequest) {
  const user = await getUserFromToken(req);
  if (!user) return NextResponse.json({ error: 'Nao autorizado' }, { status: 401 });

  const bodyRaw1 = await req.json().catch(() => ({}));
  const parsed1 = accounts_refresh_channelsBodySchema.safeParse(bodyRaw1);
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

    let channels: any[] = [];

    if (account.platform === 'facebook') {
      // Buscar Pages do usuario
      const res = await fetch(
        `https://graph.facebook.com/v26.0/me/accounts?fields=id,name,access_token,picture,followers_count&access_token=${account.access_token}`
      );
      const data = await res.json();
      channels = (data.data || []).map((p: any) => ({
        id: p.id,
        name: p.name,
        type: 'page',
        access_token: p.access_token,
        followers: p.followers_count,
        avatar: p.picture?.data?.url,
      }));
    } else if (account.platform === 'linkedin') {
      const res = await fetch(
        'https://api.linkedin.com/v2/organizationalEntityAcls?q=roleAssignee&role=ADMINISTRATOR&projection=(elements*(organizationalEntity~(id,localizedName,vanityName)))',
        { headers: { Authorization: `Bearer ${account.access_token}`, 'X-Restli-Protocol-Version': '2.0.0' } }
      );
      const data = await res.json();
      channels = (data.elements || []).map((el: any) => {
        const org = el.organizationalEntity;
        const orgId = org.match(/\d+$/)?.[0] || org;
        return { id: `urn:li:organization:${orgId}`, name: org.localizedName, type: 'company' };
      });
    } else if (account.platform === 'youtube') {
      const res = await fetch(
        'https://www.googleapis.com/youtube/v3/channels?part=snippet&mine=true',
        { headers: { Authorization: `Bearer ${account.access_token}` } }
      );
      const data = await res.json();
      channels = (data.items || []).map((c: any) => ({
        id: c.id,
        name: c.snippet?.title,
        type: 'channel',
        avatar: c.snippet?.thumbnails?.default?.url,
      }));
    } else if (account.platform === 'pinterest') {
      const res = await fetch('https://api.pinterest.com/v5/boards', {
        headers: { Authorization: `Bearer ${account.access_token}` },
      });
      const data = await res.json();
      channels = (data.items || []).map((b: any) => ({ id: b.id, name: b.name, type: 'board' }));
    } else if (account.platform === 'google_business') {
      const accRes = await fetch('https://mybusinessaccountmanagement.googleapis.com/v1/accounts', {
        headers: { Authorization: `Bearer ${account.access_token}` },
      });
      const accData = await accRes.json();
      for (const acc of accData.accounts || []) {
        const locRes = await fetch(
          `https://mybusinessbusinessinformation.googleapis.com/v1/accounts/${acc.name}/locations?readMask=name,title`,
          { headers: { Authorization: `Bearer ${account.access_token}` } }
        );
        const locData = await locRes.json();
        for (const loc of locData.locations || []) {
          channels.push({ id: loc.name, name: loc.title, type: 'location' });
        }
      }
    } else if (account.platform === 'reddit') {
      const res = await fetch('https://oauth.reddit.com/subreddits/mine/subscriber?limit=50', {
        headers: { Authorization: `Bearer ${account.access_token}`, 'User-Agent': 'StackPost/1.0' },
      });
      const data = await res.json();
      channels = (data.data?.children || []).map((s: any) => ({
        id: s.data?.display_name,
        name: s.data?.display_name_prefixed || s.data?.display_name,
        type: 'subreddit',
      }));
    }

    return NextResponse.json({ accountId, platform: account.platform, channels });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
