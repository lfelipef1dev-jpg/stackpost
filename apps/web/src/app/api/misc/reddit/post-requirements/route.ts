import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import { getUserFromToken } from '@/lib/auth';

// GET /api/misc/reddit/post-requirements?subreddit=xxx — requisitos de postagem de um subreddit
export async function GET(req: NextRequest) {
  const user = await getUserFromToken(req);
  if (!user) return NextResponse.json({ error: 'Nao autorizado' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const subreddit = searchParams.get('subreddit');
  if (!subreddit) return NextResponse.json({ error: 'subreddit obrigatorio' }, { status: 400 });

  const supabase = getSupabase();
  const { data: account } = await supabase
    .from('social_accounts')
    .select('access_token')
    .eq('team_id', user.teamId)
    .eq('platform', 'reddit')
    .eq('status', 'active')
    .maybeSingle();
  if (!account) return NextResponse.json({ error: 'Reddit nao conectado' }, { status: 400 });

  try {
    // Buscar regras do subreddit
    const rulesRes = await fetch(`https://oauth.reddit.com/r/${subreddit}/about/rules`, {
      headers: { Authorization: `Bearer ${account.access_token}`, 'User-Agent': 'StackPost/1.0' },
    });
    const rulesData = await rulesRes.json();

    // Buscar info do subreddit (requirements)
    const aboutRes = await fetch(`https://oauth.reddit.com/r/${subreddit}/about`, {
      headers: { Authorization: `Bearer ${account.access_token}`, 'User-Agent': 'StackPost/1.0' },
    });
    const aboutData = await aboutRes.json();

    return NextResponse.json({
      subreddit,
      rules: rulesData.data?.rules || [],
      requirements: {
        submissionType: aboutData.data?.submission_type,
        submitText: aboutData.data?.submit_text,
        submitTextHtml: aboutData.data?.submit_text_html,
        isPrivate: aboutData.data?.subreddit_type === 'private',
        minimumCommentKarma: aboutData.data?.minimum_comment_karma,
        minimumLinkKarma: aboutData.data?.minimum_link_karma,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
