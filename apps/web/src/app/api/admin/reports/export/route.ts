import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import { requireAdmin } from '@/lib/rbac';

// GET /api/admin/reports/export — diagnóstico exportável p/ IA
// Retorna erros de publicação recentes com contexto do post
export async function GET(req: NextRequest) {
  const { error } = await requireAdmin(req, 'reports.read');
  if (error) return error;

  const supabase = getSupabase();
  const hours = parseInt(new URL(req.url).searchParams.get('hours') || '72');
  const since = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();

  const { data: failures } = await supabase
    .from('post_platforms')
    .select('post_id, platform, status, errors, updated_at')
    .eq('status', 'error')
    .gte('updated_at', since)
    .order('updated_at', { ascending: false })
    .limit(200);

  const postIds = [...new Set((failures || []).map((f: any) => f.post_id))];
  const { data: posts } = postIds.length
    ? await supabase.from('posts').select('id, content, platforms, scheduled_at, status').in('id', postIds)
    : { data: [] };
  const postMap = new Map((posts || []).map((p: any) => [p.id, p]));

  const report = (failures || []).map((f: any) => {
    const post = postMap.get(f.post_id);
    const err = typeof f.errors === 'string' ? JSON.parse(f.errors || '{}') : f.errors;
    return {
      post_id: f.post_id,
      platform: f.platform,
      error: err?.message || err,
      error_code: err?.code,
      retryable: err?.retryable,
      post_preview: (post?.content || '').slice(0, 80),
      scheduled_at: post?.scheduled_at,
      failed_at: f.updated_at,
    };
  });

  return NextResponse.json({
    generated_at: new Date().toISOString(),
    window_hours: hours,
    total_failures: report.length,
    by_platform: report.reduce((acc: Record<string, number>, r) => {
      acc[r.platform] = (acc[r.platform] || 0) + 1;
      return acc;
    }, {}),
    failures: report,
  });
}
