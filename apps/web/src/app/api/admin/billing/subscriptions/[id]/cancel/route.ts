import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import { requireAdmin } from '@/lib/rbac';
import { logAudit } from '@/lib/audit';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { admin, error } = await requireAdmin(req, 'billing.write');
  if (error) return error;

  const { id } = await params;
  const supabase = getSupabase();

  const { data: before } = await supabase
    .from('subscriptions')
    .select('id, organization_id, plan_id, plan_slug, status, current_period_start, current_period_end')
    .eq('id', id)
    .single();
  if (!before) {
    return NextResponse.json({ error: 'Assinatura nao encontrada' }, { status: 404 });
  }

  const { data, error: dbError } = await supabase
    .from('subscriptions')
    .update({
      status: 'canceled',
      canceled_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select('id, organization_id, plan_id, plan_slug, status, payment_provider, provider_subscription_id, current_period_start, current_period_end, canceled_at, created_at, updated_at')
    .single();

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 });
  }

  await logAudit({
    userId: admin.id,
    action: 'admin.subscription.cancel',
    resource: 'subscriptions',
    resourceId: id,
    metadata: { before, after: data },
    ip: req.headers.get('x-forwarded-for') || undefined,
    userAgent: req.headers.get('user-agent') || undefined,
  });

  return NextResponse.json(data);
}
