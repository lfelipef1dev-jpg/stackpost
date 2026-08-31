import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import { requireAdmin } from '@/lib/rbac';

function csvCell(value: string | number | null | undefined) {
  const str = value === null || value === undefined ? '' : String(value).replace(/"/g, '""');
  return `"${str}"`;
}

export async function GET(req: NextRequest) {
  const { error } = await requireAdmin(req, 'credits.read');
  if (error) return error;

  const { searchParams } = req.nextUrl;
  const teamId = searchParams.get('team_id');
  const userId = searchParams.get('user_id');
  const type = searchParams.get('type');
  const dateFrom = searchParams.get('date_from');
  const dateTo = searchParams.get('date_to');

  const supabase = getSupabase();
  let query = supabase
    .from('credit_transactions')
    .select('*, team:teams(name), user:users!created_by(name, email)')
    .order('created_at', { ascending: false })
    .limit(10000);

  if (teamId) query = query.eq('team_id', teamId);
  if (userId) query = query.eq('created_by', userId);
  if (type) query = query.eq('type', type);
  if (dateFrom) query = query.gte('created_at', dateFrom);
  if (dateTo) query = query.lte('created_at', `${dateTo}T23:59:59.999Z`);

  const { data, error: dbError } = await query;

  if (dbError) {
    return NextResponse.json({ error: 'Erro ao exportar transações' }, { status: 500 });
  }

  const headers = ['ID', 'Team', 'User', 'Platform', 'Amount', 'Type', 'Description', 'Created At'];
  const rows = (data || []).map((t: any) => [
    t.id,
    t.team?.name || t.team_id,
    t.user ? `${t.user.name || ''} <${t.user.email || ''}>`.trim() : t.created_by,
    t.platform || '',
    t.amount,
    t.type,
    (t.description || '').replace(/\n/g, ' '),
    t.created_at,
  ]);

  const csv = [headers, ...rows].map((r) => r.map(csvCell).join(',')).join('\n');

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="credit-transactions.csv"',
    },
  });
}
