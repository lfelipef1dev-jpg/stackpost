import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import { requireAdmin } from '@/lib/rbac';
import { logAudit } from '@/lib/audit';
import { z } from 'zod';

const deductSchema = z.object({
  team_id: z.string().uuid(),
  platform: z.string().min(1),
  amount: z.number().int().positive(),
  description: z.string().optional(),
}).strict();

export async function POST(req: NextRequest) {
  const { admin, error } = await requireAdmin(req, 'credits.write');
  if (error) return error;

  const body = await req.json().catch(() => ({}));
  const parsed = deductSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues }, { status: 400 });
  }

  const { team_id, platform, amount, description } = parsed.data;
  const supabase = getSupabase();
  const now = new Date().toISOString();

  const { data: existing } = await supabase
    .from('x_credit_balances')
    .select('id, balance')
    .eq('team_id', team_id)
    .eq('platform', platform)
    .maybeSingle();

  const current = existing?.balance || 0;
  if (current < amount) {
    return NextResponse.json({ error: 'Saldo insuficiente', balance: current }, { status: 400 });
  }

  const newBalance = current - amount;

  if (existing) {
    const { error: updateError } = await supabase
      .from('x_credit_balances')
      .update({ balance: newBalance, updated_at: now })
      .eq('id', existing.id);
    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }
  } else {
    return NextResponse.json({ error: 'Saldo não encontrado' }, { status: 404 });
  }

  const { data: tx, error: txError } = await supabase
    .from('credit_transactions')
    .insert({
      team_id,
      platform,
      amount: -amount,
      type: 'usage',
      description: description || 'Débito manual de créditos',
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
    action: 'admin.credits.deduct',
    resource: 'credit_transactions',
    resourceId: tx?.id,
    metadata: { team_id, platform, amount, description, new_balance: newBalance },
    ip: req.headers.get('x-forwarded-for') || undefined,
    userAgent: req.headers.get('user-agent') || undefined,
  });

  return NextResponse.json({ success: true, new_balance: newBalance });
}
