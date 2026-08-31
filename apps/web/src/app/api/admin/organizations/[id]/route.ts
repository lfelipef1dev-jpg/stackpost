import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import { requireAdmin } from '@/lib/rbac';
import { logAudit } from '@/lib/audit';
import { z } from 'zod';

const patchSchema = z.object({
  name: z.string().min(1).optional(),
  plan: z.string().optional(),
  plan_status: z.enum(['active', 'past_due', 'canceled', 'trialing', 'paused', 'archived']).optional(),
  status: z.enum(['active', 'archived']).optional(),
  billing_email: z.string().email().optional(),
  billing_name: z.string().optional(),
  tax_id: z.string().optional(),
}).strict();

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { admin, error } = await requireAdmin(req, 'organizations.read');
  if (error) return error;

  const { id } = await params;
  const supabase = getSupabase();

  const { data: org, error: dbError } = await supabase
    .from('organizations')
    .select('id, name, slug, plan, plan_status, status, billing_email, billing_name, tax_id, owner_id, created_at, updated_at')
    .eq('id', id)
    .single();

  if (dbError || !org) {
    return NextResponse.json({ error: 'Organizacao nao encontrada' }, { status: 404 });
  }

  const [{ data: owner }, { data: teams }, { data: subscriptions }] = await Promise.all([
    org.owner_id ? supabase.from('users').select('id, name, email').eq('id', org.owner_id).single() : { data: null },
    supabase.from('teams').select('id, name').eq('organization_id', id),
    supabase.from('subscriptions').select('*').eq('organization_id', id).order('created_at', { ascending: false }).limit(1),
  ]);

  const teamIds = (teams || []).map((t: any) => t.id);
  const { count } = teamIds.length
    ? await supabase.from('team_members').select('*', { count: 'exact', head: true }).in('team_id', teamIds)
    : { count: 0 };

  return NextResponse.json({
    ...org,
    owner: owner || null,
    teams: teams || [],
    subscriptions: subscriptions || [],
    member_count: count || 0,
  });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { admin, error } = await requireAdmin(req, 'organizations.write');
  if (error) return error;

  const { id } = await params;
  const body = await req.json();
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues }, { status: 400 });
  }

  const supabase = getSupabase();
  const { data: before } = await supabase
    .from('organizations')
    .select('id, name, slug, plan, plan_status, status, billing_email, billing_name, tax_id, owner_id, created_at, updated_at')
    .eq('id', id)
    .single();
  if (!before) {
    return NextResponse.json({ error: 'Organizacao nao encontrada' }, { status: 404 });
  }

  const update = { ...parsed.data, updated_at: new Date().toISOString() };
  const { data, error: dbError } = await supabase
    .from('organizations')
    .update(update)
    .eq('id', id)
    .select()
    .single();

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 });
  }

  await logAudit({
    userId: admin.id,
    action: 'admin.organization.update',
    resource: 'organizations',
    resourceId: id,
    metadata: { before, after: data },
    ip: req.headers.get('x-forwarded-for') || undefined,
    userAgent: req.headers.get('user-agent') || undefined,
  });

  return NextResponse.json(data);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { admin, error } = await requireAdmin(req, 'organizations.write');
  if (error) return error;

  const { id } = await params;
  const supabase = getSupabase();

  const { data: before } = await supabase.from('organizations').select('id, name, status').eq('id', id).single();
  if (!before) {
    return NextResponse.json({ error: 'Organizacao nao encontrada' }, { status: 404 });
  }

  const { data, error: dbError } = await supabase
    .from('organizations')
    .update({ status: 'archived', updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 });
  }

  await logAudit({
    userId: admin.id,
    action: 'admin.organization.archive',
    resource: 'organizations',
    resourceId: id,
    metadata: { before, after: data },
    ip: req.headers.get('x-forwarded-for') || undefined,
    userAgent: req.headers.get('user-agent') || undefined,
  });

  return NextResponse.json({ success: true });
}
