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
  const { error } = await requireAdmin(req, 'audit_logs.read');
  if (error) return error;

  const supabase = getSupabase();
  const { data, error: dbError } = await supabase
    .from('audit_logs')
    .select('id, user_id, action, resource, resource_id, metadata, ip_address, created_at')
    .order('created_at', { ascending: false })
    .limit(5000);

  if (dbError) {
    return NextResponse.json({ error: 'Erro ao exportar' }, { status: 500 });
  }

  const rows = data || [];
  const headers = ['id', 'user_id', 'action', 'resource', 'resource_id', 'metadata', 'ip_address', 'created_at'];
  const lines = [headers.join(','), ...rows.map((r: any) => [
    r.id,
    r.user_id,
    r.action,
    r.resource,
    r.resource_id,
    JSON.stringify(r.metadata || {}),
    r.ip_address,
    r.created_at,
  ].map(escapeCsv).join(','))];
  const csv = lines.join('\n');

  const res = new NextResponse(csv, { status: 200 });
  res.headers.set('Content-Type', 'text/csv; charset=utf-8');
  res.headers.set('Content-Disposition', 'attachment; filename="audit-logs.csv"');
  return res;
}
