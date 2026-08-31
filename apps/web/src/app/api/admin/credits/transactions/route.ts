import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import { requireAdmin } from '@/lib/rbac';

export async function GET(req: NextRequest) {
  const { error } = await requireAdmin(req, 'credits.read');
  if (error) return error;

  const { searchParams } = req.nextUrl;
  const teamId = searchParams.get('team_id');
  const userId = searchParams.get('user_id');
  const type = searchParams.get('type');
  const dateFrom = searchParams.get('date_from');
  const dateTo = searchParams.get('date_to');
  const limit = Math.min(Math.max(Number(searchParams.get('limit') || '1000'), 1), 5000);

  const supabase = getSupabase();
  let query = supabase
    .from('credit_transactions')
    .select('*, team:teams(name), user:users!created_by(name, email)')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (teamId) {
    query = query.eq('team_id', teamId);
  }

  if (userId) {
    query = query.eq('created_by', userId);
  }

  if (type) {
    query = query.eq('type', type);
  }

  if (dateFrom) {
    query = query.gte('created_at', dateFrom);
  }

  if (dateTo) {
    query = query.lte('created_at', `${dateTo}T23:59:59.999Z`);
  }

  const { data, error: dbError } = await query;

  if (dbError) {
    return NextResponse.json({ error: 'Erro ao listar transações' }, { status: 500 });
  }

  return NextResponse.json(data || []);
}
