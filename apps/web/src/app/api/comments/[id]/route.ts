import { logger } from '@/lib/logger';
import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import { getUserFromToken } from '@/lib/auth';

// GET /api/comments/[id] — buscar comment
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getUserFromToken(req);
  if (!user) return NextResponse.json({ error: 'Nao autorizado' }, { status: 401 });

  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('comments')
    .select('*, posts!inner(team_id)')
    .eq('id', id)
    .single();
  if (error || !data) return NextResponse.json({ error: 'Comment nao encontrado' }, { status: 404 });
  if (data.posts?.team_id !== user.teamId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  return NextResponse.json(data);
}

// DELETE /api/comments/[id] — deletar comment
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getUserFromToken(req);
  if (!user) return NextResponse.json({ error: 'Nao autorizado' }, { status: 401 });

  const supabase = getSupabase();
  const { data: comment, error: cError } = await supabase
    .from('comments')
    .select('*, posts!inner(team_id, platforms)')
    .eq('id', id)
    .single();
  if (cError || !comment) return NextResponse.json({ error: 'Comment nao encontrado' }, { status: 404 });
  if (comment.posts?.team_id !== user.teamId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  // Se tem external_id, tentar deletar na plataforma
  if (comment.external_id && comment.platform) {
    try {
      const { data: account } = await supabase
        .from('social_accounts')
        .select('access_token, platform')
        .eq('team_id', user.teamId)
        .eq('platform', comment.platform)
        .eq('status', 'active')
        .maybeSingle();

      if (account?.access_token) {
        if (comment.platform === 'instagram' || comment.platform === 'facebook') {
          await fetch(`https://graph.facebook.com/v26.0/${comment.external_id}?access_token=${account.access_token}`, {
            method: 'DELETE',
          });
        } else if (comment.platform === 'linkedin') {
          // LinkedIn nao suporta delete de comment via API publica
        } else if (comment.platform === 'x') {
          await fetch(`https://api.twitter.com/2/tweets/${comment.external_id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${account.access_token}` },
          });
        }
      }
    } catch (err) {
      logger.warn('Delete comment on platform error:', err);
    }
  }

  const { error: delError } = await supabase.from('comments').delete().eq('id', id);
  if (delError) throw delError;

  return NextResponse.json({ success: true });
}
