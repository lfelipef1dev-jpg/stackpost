import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import { requireAdmin } from '@/lib/rbac';
import { logAudit } from '@/lib/audit';
import { z } from 'zod';

const patchSchema = z.object({
  content: z.string().optional(),
  status: z.enum(['draft', 'review', 'approved', 'scheduled', 'processing', 'posted', 'error', 'rejected']).optional(),
  scheduled_at: z.string().datetime().optional().nullable(),
}).strict();

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAdmin(req, 'posts.read');
  if (error) return error;

  const { id } = await params;
  const supabase = getSupabase();

  const { data, error: dbError } = await supabase
    .from('posts')
    .select('*')
    .eq('id', id)
    .single();

  if (dbError || !data) {
    return NextResponse.json({ error: 'Post nao encontrado' }, { status: 404 });
  }

  const { data: user } = data.user_id
    ? await supabase.from('users').select('id, name, email').eq('id', data.user_id).single()
    : { data: null };

  return NextResponse.json({ ...data, user });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { admin, error } = await requireAdmin(req, 'posts.write');
  if (error) return error;

  const { id } = await params;
  const body = await req.json();
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues }, { status: 400 });
  }

  const supabase = getSupabase();
  const { data: before } = await supabase.from('posts').select('id, content, status, scheduled_at').eq('id', id).single();
  if (!before) {
    return NextResponse.json({ error: 'Post nao encontrado' }, { status: 404 });
  }

  const { data, error: dbError } = await supabase
    .from('posts')
    .update({ ...parsed.data, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 });
  }

  await logAudit({
    userId: admin.id,
    action: 'admin.post.update',
    resource: 'posts',
    resourceId: id,
    metadata: { before, after: data },
    ip: req.headers.get('x-forwarded-for') || undefined,
    userAgent: req.headers.get('user-agent') || undefined,
  });

  return NextResponse.json(data);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { admin, error } = await requireAdmin(req, 'posts.write');
  if (error) return error;

  const { id } = await params;
  const supabase = getSupabase();

  const { data: before } = await supabase.from('posts').select('id, content, status, user_id').eq('id', id).single();
  if (!before) {
    return NextResponse.json({ error: 'Post nao encontrado' }, { status: 404 });
  }

  const { error: dbError } = await supabase.from('posts').delete().eq('id', id);
  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 });
  }

  await logAudit({
    userId: admin.id,
    action: 'admin.post.delete',
    resource: 'posts',
    resourceId: id,
    metadata: before,
    ip: req.headers.get('x-forwarded-for') || undefined,
    userAgent: req.headers.get('user-agent') || undefined,
  });

  return NextResponse.json({ success: true });
}
