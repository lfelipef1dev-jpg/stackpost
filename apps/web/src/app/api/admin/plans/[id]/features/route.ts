import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import { requireAdmin } from '@/lib/rbac';
import { logAudit } from '@/lib/audit';
import { z } from 'zod';

const postSchema = z.object({
  features: z.record(z.string(), z.any()),
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
  const { data: existing } = await supabase.from('plan_features').select('key').eq('plan_id', id);
  const existingKeys = new Set((existing || []).map((f: any) => f.key));

  const updates: { plan_id: string; key: string; value: any }[] = [];
  const inserts: { plan_id: string; key: string; value: any }[] = [];

  for (const [key, value] of Object.entries(parsed.data.features)) {
    const payload = { plan_id: id, key, value: typeof value === 'boolean' ? value : value };
    if (existingKeys.has(key)) updates.push(payload);
    else inserts.push(payload);
  }

  if (inserts.length) await supabase.from('plan_features').insert(inserts);
  for (const u of updates) {
    await supabase.from('plan_features').update({ value: u.value }).eq('plan_id', id).eq('key', u.key);
  }

  await logAudit({
    userId: admin.id,
    action: 'admin.plan.features.update',
    resource: 'plan_features',
    resourceId: id,
    metadata: parsed.data.features,
    ip: req.headers.get('x-forwarded-for') || undefined,
    userAgent: req.headers.get('user-agent') || undefined,
  });

  const { data } = await supabase.from('plan_features').select('*').eq('plan_id', id);
  return NextResponse.json(data || []);
}
