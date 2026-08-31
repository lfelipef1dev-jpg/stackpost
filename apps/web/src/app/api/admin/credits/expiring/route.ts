import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import { requireAdmin } from '@/lib/rbac';

const EXPIRATION_DAYS = 365;

export async function GET(req: NextRequest) {
  const { error } = await requireAdmin(req, 'credits.read');
  if (error) return error;

  const days = Number(req.nextUrl.searchParams.get('days') || '0');
  const windows = days > 0 ? [days] : [1, 7, 30];

  const supabase = getSupabase();
  const result: Record<string, { count: number; amount: number; items: any[] }> = {};

  const now = new Date();

  for (const d of windows) {
    const start = new Date(now.getTime() - (EXPIRATION_DAYS - d) * 24 * 60 * 60 * 1000).toISOString();
    const end = new Date(now.getTime() - (EXPIRATION_DAYS - d - 1) * 24 * 60 * 60 * 1000).toISOString();

    const { data, error: dbError } = await supabase
      .from('credit_transactions')
      .select('*')
      .eq('type', 'purchase')
      .gte('created_at', start)
      .lte('created_at', end)
      .order('created_at', { ascending: false });

    if (dbError) {
      return NextResponse.json({ error: 'Erro ao buscar créditos a vencer' }, { status: 500 });
    }

    const items = data || [];
    const amount = items.reduce((sum, it) => sum + (typeof it.amount === 'number' ? it.amount : 0), 0);
    result[`${d}d`] = { count: items.length, amount, items };
  }

  return NextResponse.json(result);
}
