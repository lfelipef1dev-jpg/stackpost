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
  const { error } = await requireAdmin(req, 'organizations.read');
  if (error) return error;

  const supabase = getSupabase();
  const { data, error: dbError } = await supabase
    .from('organizations')
    .select('id, name, slug, plan, plan_status, status, billing_email, created_at, owner:users(name, email)')
    .order('created_at', { ascending: false });

  if (dbError) {
    return NextResponse.json({ error: 'Erro ao exportar' }, { status: 500 });
  }

  const rows = data || [];
  const headers = ['id', 'name', 'slug', 'plan', 'plan_status', 'status', 'billing_email', 'owner_name', 'owner_email', 'created_at'];
  const lines = [headers.join(','), ...rows.map((r: any) => {
    const owner = r.owner || {};
    const values = [
      r.id, r.name, r.slug, r.plan, r.plan_status, r.status, r.billing_email,
      owner.name, owner.email, r.created_at,
    ];
    return values.map(escapeCsv).join(',');
  })];
  const csv = lines.join('\n');

  const res = new NextResponse(csv, { status: 200 });
  res.headers.set('Content-Type', 'text/csv; charset=utf-8');
  res.headers.set('Content-Disposition', 'attachment; filename="organizations.csv"');
  return res;
}
