import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import { requireAdmin } from '@/lib/rbac';
import { logAudit } from '@/lib/audit';
import { z } from 'zod';

const postSchema = z.object({
  limits: z.record(z.string(), z.number().int()),
}).strict();

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { admin, error } = await requireAdmin(req, 'plans.write');
  if (error) return error;

  const { id } = await params;
  const body = await req.json();
  const parsed = postSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues }, { status: 400 });
  }

  const supabase = getSupabase();
  const { data: before } = await supabase.from('plan_limits').select('key, value').eq('plan_id', id);
  const existing = (before || []).map((l: any) => `${l.key}=${l.value}`).join(',');

  for (const [key, value] of Object.entries(parsed.data.limits)) {
    await supabase.from('plan_limits').upsert(
      { plan_id: id, key, value },
      { onConflict: 'plan_id,key' }
    );
  }

  await logAudit({
    userId: admin.id,
    action: 'admin.plan.limits.update',
    resource: 'plan_limits',
    resourceId: id,
    metadata: { before: existing, limits: parsed.data.limits },
    ip: req.headers.get('x-forwarded-for') || undefined,
    userAgent: req.headers.get('user-agent') || undefined,
  });

  const { data } = await supabase.from('plan_limits').select('*').eq('plan_id', id);
  return NextResponse.json(data || []);
}
