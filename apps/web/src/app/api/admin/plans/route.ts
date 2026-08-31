import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import { requireAdmin } from '@/lib/rbac';
import { logAudit } from '@/lib/audit';
import { z } from 'zod';

const postSchema = z.object({
  slug: z.string().min(1),
  name: z.string().min(1),
  description: z.string().optional(),
  price_cents: z.number().int().min(0),
  currency: z.string().default('BRL'),
  interval: z.enum(['month', 'year', 'lifetime']).default('month'),
  trial_days: z.number().int().min(0).default(0),
  is_active: z.boolean().default(true),
  is_public: z.boolean().default(true),
  sort_order: z.number().int().default(0),
}).strict();

export async function GET(req: NextRequest) {
  const { error } = await requireAdmin(req, 'plans.read');
  if (error) return error;

  const supabase = getSupabase();
  const { data, error: dbError } = await supabase
    .from('plans')
    .select('*, limits:plan_limits(*), features:plan_features(*)')
    .order('sort_order', { ascending: true });

  if (dbError) {
    return NextResponse.json({ error: 'Erro ao listar planos' }, { status: 500 });
  }

  const { data: subs } = await supabase.from('subscriptions').select('plan_id, status');
  const counts = new Map<string, number>();
  for (const s of subs || []) {
    counts.set(s.plan_id, (counts.get(s.plan_id) || 0) + 1);
  }

  const enriched = (data || []).map((p: any) => ({
    ...p,
    subscriber_count: counts.get(p.id) || 0,
    total_subscribers: (subs || []).length,
  }));

  return NextResponse.json(enriched);
}

export async function POST(req: NextRequest) {
  const { admin, error } = await requireAdmin(req, 'plans.write');
  if (error) return error;

  const body = await req.json();
  const parsed = postSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues }, { status: 400 });
  }

  const supabase = getSupabase();
  const { data, error: dbError } = await supabase
    .from('plans')
    .insert(parsed.data)
    .select()
    .single();

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 });
  }

  await logAudit({
    userId: admin.id,
    action: 'admin.plan.create',
    resource: 'plans',
    resourceId: data.id,
    metadata: parsed.data,
    ip: req.headers.get('x-forwarded-for') || undefined,
    userAgent: req.headers.get('user-agent') || undefined,
  });

  return NextResponse.json(data, { status: 201 });
}
