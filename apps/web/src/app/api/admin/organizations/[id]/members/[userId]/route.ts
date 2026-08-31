import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import { requireAdmin } from '@/lib/rbac';
import { logAudit } from '@/lib/audit';
import { z } from 'zod';

const patchSchema = z.object({
  role: z.enum(['owner', 'admin', 'editor', 'viewer']),
}).strict();

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string; userId: string }> }) {
  const { admin, error } = await requireAdmin(req, 'organizations.write');
  if (error) return error;

  const { id, userId } = await params;
  const body = await req.json();
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues }, { status: 400 });
  }

  const supabase = getSupabase();
  const { data: teams } = await supabase.from('teams').select('id').eq('organization_id', id);
  const teamIds = (teams || []).map((t: any) => t.id);

  const { data: before } = await supabase
    .from('team_members')
    .select('id, role')
    .in('team_id', teamIds)
    .eq('user_id', userId)
    .single();

  if (!before) {
    return NextResponse.json({ error: 'Membro nao encontrado' }, { status: 404 });
  }

  const { data, error: dbError } = await supabase
    .from('team_members')
    .update({ role: parsed.data.role })
    .in('team_id', teamIds)
    .eq('user_id', userId)
    .select()
    .single();

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 });
  }

  await logAudit({
    userId: admin.id,
    action: 'admin.organization.member.update',
    resource: 'team_members',
    resourceId: before.id,
    metadata: { organization_id: id, user_id: userId, before: before.role, after: parsed.data.role },
    ip: req.headers.get('x-forwarded-for') || undefined,
    userAgent: req.headers.get('user-agent') || undefined,
  });

  return NextResponse.json(data);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string; userId: string }> }) {
  const { admin, error } = await requireAdmin(req, 'organizations.write');
  if (error) return error;

  const { id, userId } = await params;
  const supabase = getSupabase();
  const { data: teams } = await supabase.from('teams').select('id').eq('organization_id', id);
  const teamIds = (teams || []).map((t: any) => t.id);

  const { data: before } = await supabase
    .from('team_members')
    .select('id, role')
    .in('team_id', teamIds)
    .eq('user_id', userId)
    .single();

  if (!before) {
    return NextResponse.json({ error: 'Membro nao encontrado' }, { status: 404 });
  }

  if (before.role === 'owner') {
    return NextResponse.json({ error: 'Nao e possivel remover o dono. Transfira primeiro.' }, { status: 400 });
  }

  const { error: dbError } = await supabase
    .from('team_members')
    .delete()
    .in('team_id', teamIds)
    .eq('user_id', userId);

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 });
  }

  await logAudit({
    userId: admin.id,
    action: 'admin.organization.member.remove',
    resource: 'team_members',
    resourceId: before.id,
    metadata: { organization_id: id, user_id: userId, role: before.role },
    ip: req.headers.get('x-forwarded-for') || undefined,
    userAgent: req.headers.get('user-agent') || undefined,
  });

  return NextResponse.json({ success: true });
}
