import { logger } from '@/lib/logger';
import { usage_daily_limitsQuerySchema } from '@/lib/schemas';
import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import { getUserFromToken } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const user = await getUserFromToken(req);
  if (!user) return NextResponse.json({ error: 'Nao autorizado' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const queryRaw = Object.fromEntries(searchParams);
  const parsedQuery = usage_daily_limitsQuerySchema.safeParse(queryRaw);
  if (!parsedQuery.success) return NextResponse.json({ error: parsedQuery.error.issues }, { status: 400 });
  const socialAccountId = searchParams.get('socialAccountId');
  const date = searchParams.get('date') || new Date().toISOString().split('T')[0];

  if (!socialAccountId) {
    return NextResponse.json({ error: 'socialAccountId obrigatorio' }, { status: 400 });
  }

  const supabase = getSupabase();

  try {
    const { data: account, error: accountError } = await supabase
      .from('social_accounts')
      .select('platform')
      .eq('id', socialAccountId)
      .eq('team_id', user.teamId)
      .maybeSingle();
    if (accountError) throw accountError;

    if (!account) {
      return NextResponse.json({ error: 'Conta nao encontrada' }, { status: 404 });
    }

    const platform = account.platform.toUpperCase();

    const startOfDay = `${date}T00:00:00`;
    const endOfDay = `${date}T23:59:59.999`;

    const { data: posts, error: postsError } = await supabase
      .from('posts')
      .select('status')
      .eq('team_id', user.teamId)
      .contains('platforms', [platform.toLowerCase()])
      .gte('scheduled_at', startOfDay)
      .lt('scheduled_at', endOfDay);
    if (postsError) throw postsError;

    const allPosts = posts || [];
    const postsUsed = allPosts.filter((p: any) => ['posted', 'processing', 'scheduled'].includes(p.status)).length;
    const commentsUsed = allPosts.filter((p: any) => ['posted', 'processing'].includes(p.status)).length;

    return NextResponse.json({
      date,
      socialAccountId,
      platform,
      posts: {
        used: postsUsed,
        limit: 100,
        remaining: 100 - postsUsed,
      },
      comments: {
        used: commentsUsed,
        limit: 50,
        remaining: 50 - commentsUsed,
      },
    });
  } catch (error) {
    logger.error((error as string));
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
