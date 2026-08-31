import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import { requireAdmin } from '@/lib/rbac';

function escapeCsv(value: unknown) {
  const s = String(value ?? '');
  if (s.includes(',') || s.includes('"') || s.includes('\n')) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

export async function GET(req: NextRequest) {
  const { error } = await requireAdmin(req, 'posts.read');
  if (error) return error;

  const supabase = getSupabase();
  const { data, error: dbError } = await supabase
    .from('posts')
    .select('id, content, platforms, status, scheduled_at, published_at, created_at, user_id, team_id')
    .order('created_at', { ascending: false });

  if (dbError) {
    return NextResponse.json({ error: 'Erro ao exportar' }, { status: 500 });
  }

  const rows = data || [];
  const headers = ['id', 'content', 'platforms', 'status', 'scheduled_at', 'published_at', 'created_at', 'user_id', 'team_id'];
  const lines = [headers.join(','), ...rows.map((r: any) => [
    r.id,
    r.content,
    (r.platforms || []).join(';'),
    r.status,
    r.scheduled_at,
    r.published_at,
    r.created_at,
    r.user_id,
    r.team_id,
  ].map(escapeCsv).join(','))];
  const csv = lines.join('\n');

  const res = new NextResponse(csv, { status: 200 });
  res.headers.set('Content-Type', 'text/csv; charset=utf-8');
  res.headers.set('Content-Disposition', 'attachment; filename="posts.csv"');
  return res;
}
