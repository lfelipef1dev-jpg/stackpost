import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import { requireAdmin } from '@/lib/rbac';

export async function GET(req: NextRequest) {
  const { error } = await requireAdmin(req, 'posts.read');
  if (error) return error;

  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status');
  const platform = searchParams.get('platform');
  const teamId = searchParams.get('team_id');
  const from = searchParams.get('from');
  const to = searchParams.get('to');

  const supabase = getSupabase();
  let query = supabase
    .from('posts')
    .select('*')
    .order('created_at', { ascending: false });

  if (status) query = query.eq('status', status);
  if (platform) query = query.contains('platforms', [platform]);
  if (teamId) query = query.eq('team_id', teamId);
  if (from) query = query.gte('created_at', from);
  if (to) query = query.lte('created_at', to);

  const { data, error: dbError } = await query.limit(500);
  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 });
  }

  const enriched = (data || []).map((p: any) => ({
    id: p.id,
    content: p.content || p.title || '',
    platforms: p.platforms || [],
    status: (p.status || 'DRAFT').toLowerCase(),
    scheduled_at: p.scheduled_at,
    published_at: p.published_at,
    errors: p.errors,
    media_type: p.media_type,
    created_at: p.created_at,
    platform_count: (p.platforms || []).length,
  }));

  return NextResponse.json(enriched);
}
