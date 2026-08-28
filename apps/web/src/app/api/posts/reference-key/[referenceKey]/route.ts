import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import { getUserFromToken } from '@/lib/auth';

// GET /api/posts/reference-key/[referenceKey] — buscar post por reference key
export async function GET(req: NextRequest, { params }: { params: Promise<{ referenceKey: string }> }) {
  const user = await getUserFromToken(req);
  if (!user) return NextResponse.json({ error: 'Nao autorizado' }, { status: 401 });

  const { referenceKey } = await params;
  const supabase = getSupabase();

  try {
    const { data: post, error } = await supabase
      .from('posts')
      .select('*, post_platforms(*)')
      .eq('team_id', user.teamId)
      .eq('reference_key', referenceKey)
      .maybeSingle();
    if (error || !post) return NextResponse.json({ error: 'Post nao encontrado' }, { status: 404 });
    return NextResponse.json(post);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
