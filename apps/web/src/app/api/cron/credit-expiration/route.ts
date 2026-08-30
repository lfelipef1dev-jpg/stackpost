import { logger } from '@/lib/logger';
import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';

/**
 * Cron: Expiração de créditos.
 * Marca credit_transactions expiradas (expires_at < now() e expired_at IS NULL)
 * e subtrai o valor expirado de x_credit_balances.
 * Valida CRON_SECRET.
 */
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Nao autorizado' }, { status: 401 });
  }

  const supabase = getSupabase();
  const now = new Date().toISOString();

  try {
    // Busca transações de crédito expiradas e não marcadas
    const { data: expired, error } = await supabase
      .from('credit_transactions')
      .select('id, team_id, amount, platform')
      .lt('expires_at', now)
      .is('expired_at', null)
      .gt('amount', 0);

    if (error) throw error;

    let processed = 0;
    const teamDeductions = new Map<string, number>();

    for (const tx of expired || []) {
      // Marca como expirada
      const { error: updateErr } = await supabase
        .from('credit_transactions')
        .update({ expired_at: now })
        .eq('id', tx.id);

      if (updateErr) {
        logger.error(`[cron/credit-expiration] Erro tx ${tx.id}:`, updateErr.message);
        continue;
      }

      // Registra transação de expiração (negativa)
      await supabase.from('credit_transactions').insert({
        team_id: tx.team_id,
        platform: tx.platform,
        amount: -Math.abs(tx.amount),
        type: 'expiration',
        description: `Expiracao de creditos - tx ${tx.id}`,
        reference_id: tx.id,
        created_at: now,
      });

      teamDeductions.set(tx.team_id, (teamDeductions.get(tx.team_id) || 0) + Math.abs(tx.amount));
      processed++;
    }

    // Atualiza x_credit_balances subtraindo o valor expirado por time
    for (const [teamId, deduction] of teamDeductions.entries()) {
      const { data: balance } = await supabase
        .from('x_credit_balances')
        .select('balance')
        .eq('team_id', teamId)
        .maybeSingle();

      const currentBalance = balance?.balance || 0;
      const newBalance = Math.max(0, currentBalance - deduction);

      await supabase
        .from('x_credit_balances')
        .upsert(
          { team_id: teamId, balance: newBalance, updated_at: now },
          { onConflict: 'team_id' },
        );
    }

    return NextResponse.json({
      ok: true,
      cron: 'credit-expiration',
      processed,
      teams_affected: teamDeductions.size,
      timestamp: now,
    });
  } catch (err: any) {
    logger.error('Cron credit-expiration error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  return GET(req);
}
