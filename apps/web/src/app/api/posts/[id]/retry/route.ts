import { logger } from '@/lib/logger';
import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import { getUserFromToken } from '@/lib/auth';
import { publishPost } from '@/lib/publisher';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getUserFromToken(req);
  if (!user) return NextResponse.json({ error: 'Nao autorizado' }, { status: 401 });

  const { id: postId } = await params;
  const supabase = getSupabase();

  try {
    const { data: post, error: postError } = await supabase
      .from('posts')
      .select('*')
      .eq('id', postId)
      .eq('team_id', user.teamId)
      .maybeSingle();
    if (postError || !post) return NextResponse.json({ error: 'Post nao encontrado' }, { status: 404 });

    const { data: ppError } = await supabase
      .from('post_platforms')
      .delete()
      .eq('post_id', postId);
    if (ppError) throw ppError;

    const result = await publishPost(postId);
    return NextResponse.json({ success: true, postId, result });
  } catch (error: any) {
    logger.error('Retry post error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
