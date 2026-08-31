import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import { requireAdmin } from '@/lib/rbac';
import { logAudit } from '@/lib/audit';
import { z } from 'zod';

const patchSchema = z.object({
  status: z.enum(['pending', 'approved', 'rejected', 'hidden', 'replied']).optional(),
  is_read: z.boolean().optional(),
  reply: z.string().optional(),
}).strict();

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAdmin(req, 'comments.read');
  if (error) return error;

  const { id } = await params;
  const supabase = getSupabase();

  const { data, error: dbError } = await supabase.from('comments').select('*').eq('id', id).single();
  if (dbError || !data) {
    return NextResponse.json({ error: 'Comentario nao encontrado' }, { status: 404 });
  }
  return NextResponse.json(data);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { admin, error } = await requireAdmin(req, 'comments.write');
  if (error) return error;

  const { id } = await params;
  const body = await req.json();
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues }, { status: 400 });
  }

  const supabase = getSupabase();
  const { data: before } = await supabase.from('comments').select('*').eq('id', id).single();
  if (!before) {
    return NextResponse.json({ error: 'Comentario nao encontrado' }, { status: 404 });
  }

  const { data, error: dbError } = await supabase
    .from('comments')
    .update({ ...parsed.data, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 });
  }

  await logAudit({
    userId: admin.id,
    action: 'admin.comment.update',
    resource: 'comments',
    resourceId: id,
    metadata: { before, after: data },
    ip: req.headers.get('x-forwarded-for') || undefined,
    userAgent: req.headers.get('user-agent') || undefined,
  });

  return NextResponse.json(data);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { admin, error } = await requireAdmin(req, 'comments.write');
  if (error) return error;

  const { id } = await params;
  const supabase = getSupabase();

  const { data: before } = await supabase.from('comments').select('*').eq('id', id).single();
  if (!before) {
    return NextResponse.json({ error: 'Comentario nao encontrado' }, { status: 404 });
  }

  const { error: dbError } = await supabase.from('comments').delete().eq('id', id);
  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 });
  }

  await logAudit({
    userId: admin.id,
    action: 'admin.comment.delete',
    resource: 'comments',
    resourceId: id,
    metadata: before,
    ip: req.headers.get('x-forwarded-for') || undefined,
    userAgent: req.headers.get('user-agent') || undefined,
  });

  return NextResponse.json({ success: true });
}
