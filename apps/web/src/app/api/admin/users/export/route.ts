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
  const { error } = await requireAdmin(req, 'users.read');
  if (error) return error;

  const supabase = getSupabase();
  const { data, error: dbError } = await supabase
    .from('users')
    .select('id, name, email, status, is_superuser, role, created_at, last_login_at')
    .order('created_at', { ascending: false });

  if (dbError) {
    return NextResponse.json({ error: 'Erro ao exportar' }, { status: 500 });
  }

  const rows = data || [];
  const headers = ['id', 'name', 'email', 'status', 'is_superuser', 'role', 'created_at', 'last_login_at'];
  const lines = [headers.join(','), ...rows.map((r) => headers.map((h) => escapeCsv(r[h as keyof typeof r])).join(','))];
  const csv = lines.join('\n');

  const res = new NextResponse(csv, { status: 200 });
  res.headers.set('Content-Type', 'text/csv; charset=utf-8');
  res.headers.set('Content-Disposition', 'attachment; filename="users.csv"');
  return res;
}
