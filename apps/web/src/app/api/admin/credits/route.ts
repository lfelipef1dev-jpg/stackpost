import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import { requireAdmin } from '@/lib/rbac';
import { logAudit } from '@/lib/audit';
import { z } from 'zod';

const addSchema = z.object({
  team_id: z.string().uuid(),
  platform: z.string().min(1),
  amount: z.number().int().positive(),
  description: z.string().optional(),
  reason: z.string().min(1).optional(),
}).strict();

export async function GET(req: NextRequest) {
  const { error } = await requireAdmin(req, 'credits.read');
  if (error) return error;

  const supabase = getSupabase();

  const [{ data: transactions, error: txError }, { data: balances, error: balError }] = await Promise.all([
    supabase.from('credit_transactions').select('amount, type'),
    supabase.from('x_credit_balances').select('team_id, platform, balance'),
  ]);

  if (txError || balError) {
    return NextResponse.json({ error: 'Erro ao carregar créditos' }, { status: 500 });
  }

  let totalIssued = 0;
  let totalConsumed = 0;
  let totalExpired = 0;

  for (const t of transactions || []) {
    if (typeof t.amount === 'number') {
      if (t.amount > 0) totalIssued += t.amount;
      if (t.amount < 0) totalConsumed += -t.amount;
    }
    if (t.type === 'expiration') {
      totalExpired += Math.abs(typeof t.amount === 'number' ? t.amount : 0);
    }
  }

  const active = (balances || []).reduce((sum, b) => sum + (typeof b.balance === 'number' ? b.balance : 0), 0);

  const teamIds = [...new Set((balances || []).map((b: any) => b.team_id).filter(Boolean))];
  const { data: teams } = teamIds.length
    ? await supabase.from('teams').select('id, name').in('id', teamIds)
    : { data: [] };

  const teamMap = new Map((teams || []).map((t: any) => [t.id, t]));
  const byTeam = (balances || []).map((b: any) => ({
    team_id: b.team_id,
    team_name: teamMap.get(b.team_id)?.name || '-',
    platform: b.platform,
    balance: b.balance,
  }));

  return NextResponse.json({
    total_issued: totalIssued,
    total_consumed: totalConsumed,
    total_expired: totalExpired,
    active,
    teams: byTeam,
  });
}

export async function POST(req: NextRequest) {
  const { admin, error } = await requireAdmin(req, 'credits.write');
  if (error) return error;

  const body = await req.json().catch(() => ({}));
  const parsed = addSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues }, { status: 400 });
  }

  const { team_id, platform, amount, description, reason } = parsed.data;
  const supabase = getSupabase();
  const now = new Date().toISOString();

  const { data: existing } = await supabase
    .from('x_credit_balances')
    .select('id, balance')
    .eq('team_id', team_id)
    .eq('platform', platform)
    .maybeSingle();

  const newBalance = (existing?.balance || 0) + amount;

  if (existing) {
    const { error: updateError } = await supabase
      .from('x_credit_balances')
      .update({ balance: newBalance, updated_at: now })
      .eq('id', existing.id);
    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }
  } else {
    const { error: insertError } = await supabase
      .from('x_credit_balances')
      .insert({ team_id, platform, balance: newBalance, updated_at: now });
    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }
  }

  const { data: tx, error: txError } = await supabase
    .from('credit_transactions')
    .insert({
      team_id,
      platform,
      amount,
      type: reason || 'manual_adjustment',
      description: description || `Crédito adicionado: ${reason || 'manual'}`,
      created_by: admin.id,
      created_at: now,
    })
    .select('id')
    .single();

  if (txError) {
    return NextResponse.json({ error: txError.message }, { status: 500 });
  }

  await logAudit({
    userId: admin.id,
    action: 'admin.credits.add',
    resource: 'credit_transactions',
    resourceId: tx?.id,
    metadata: { team_id, platform, amount, reason, description },
    ip: req.headers.get('x-forwarded-for') || undefined,
    userAgent: req.headers.get('user-agent') || undefined,
  });

  return NextResponse.json({ success: true, new_balance: newBalance });
}
