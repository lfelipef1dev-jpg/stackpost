import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import { requireAdmin } from '@/lib/rbac';
import { logAudit } from '@/lib/audit';
import { z } from 'zod';

const patchSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  status: z.enum(['active', 'suspended', 'pending']).optional(),
  is_superuser: z.boolean().optional(),
}).strict();

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { admin, error } = await requireAdmin(req, 'users.read');
  if (error) return error;

  const { id } = await params;
  const supabase = getSupabase();

  const { data, error: dbError } = await supabase
    .from('users')
    .select('id, name, email, status, is_superuser, role, created_at, last_login_at, team_id, login_count')
    .eq('id', id)
    .single();

  if (dbError || !data) {
    return NextResponse.json({ error: 'Usuario nao encontrado' }, { status: 404 });
  }

  return NextResponse.json(data);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { admin, error } = await requireAdmin(req, 'users.write');
  if (error) return error;

  const { id } = await params;
  const body = await req.json();
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues }, { status: 400 });
  }

  const supabase = getSupabase();
  const { data: before } = await supabase.from('users').select('id, name, email, status, is_superuser').eq('id', id).single();
  if (!before) {
    return NextResponse.json({ error: 'Usuario nao encontrado' }, { status: 404 });
  }

  const { data, error: dbError } = await supabase
    .from('users')
    .update(parsed.data)
    .eq('id', id)
    .select('id, name, email, status, is_superuser, role, created_at, last_login_at, team_id, login_count')
    .single();

  if (dbError) {
    return NextResponse.json({ error: 'Erro ao atualizar usuario' }, { status: 500 });
  }

  await logAudit({
    userId: admin.id,
    action: 'admin.user.update',
    resource: 'users',
    resourceId: id,
    metadata: { before, after: data },
    ip: req.headers.get('x-forwarded-for') || undefined,
    userAgent: req.headers.get('user-agent') || undefined,
  });

  return NextResponse.json(data);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { admin, error } = await requireAdmin(req, 'users.write');
  if (error) return error;

  const { id } = await params;
  const supabase = getSupabase();

  const { data: before } = await supabase.from('users').select('id, name, email').eq('id', id).single();
  if (!before) {
    return NextResponse.json({ error: 'Usuario nao encontrado' }, { status: 404 });
  }

  if (id === admin.id) {
    return NextResponse.json({ error: 'Nao pode excluir a si mesmo' }, { status: 400 });
  }

  const { error: dbError } = await supabase.from('users').delete().eq('id', id);
  if (dbError) {
    return NextResponse.json({ error: 'Erro ao excluir usuario' }, { status: 500 });
  }

  await logAudit({
    userId: admin.id,
    action: 'admin.user.delete',
    resource: 'users',
    resourceId: id,
    metadata: { before },
    ip: req.headers.get('x-forwarded-for') || undefined,
    userAgent: req.headers.get('user-agent') || undefined,
  });

  return NextResponse.json({ success: true });
}
