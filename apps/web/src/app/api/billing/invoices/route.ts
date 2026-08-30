import { logger } from '@/lib/logger';
import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import { getUserFromToken } from '@/lib/auth';

/**
 * GET /api/billing/invoices
 * Retorna faturas da organização do usuário logado.
 */
export async function GET(req: NextRequest) {
  const user = await getUserFromToken(req);
  if (!user) {
    return NextResponse.json({ error: 'Nao autorizado.' }, { status: 401 });
  }

  const supabase = getSupabase();

  const { data: team, error: teamError } = await supabase
    .from('teams')
    .select('id, organization_id')
    .eq('id', user.teamId)
    .single();

  if (teamError || !team) {
    return NextResponse.json({ error: 'Time nao encontrado.' }, { status: 404 });
  }

  try {
    const { data: invoices, error } = await supabase
      .from('invoices')
      .select('id, invoice_number, status, period_start, period_end, subtotal_cents, discount_cents, tax_cents, total_cents, amount_due_cents, paid_at, due_date, pdf_url, line_items, created_at')
      .eq('organization_id', team.organization_id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({
      invoices: invoices || [],
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    logger.error('[billing/invoices] Erro:', msg);
    return NextResponse.json({ error: 'Erro ao buscar faturas.' }, { status: 500 });
  }
}
