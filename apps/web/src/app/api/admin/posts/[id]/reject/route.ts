import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import { requireAdmin } from '@/lib/rbac';
import { logAudit } from '@/lib/audit';
import { z } from 'zod';

const schema = z.object({
  reason: z.string().min(1),
}).strict();

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { admin, error } = await requireAdmin(req, 'posts.write');
  if (error) return error;

  const { id } = await params;
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues }, { status: 400 });
  }

  const supabase = getSupabase();
  const { data, error: dbError } = await supabase
    .from('posts')
    .update({ status: 'rejected', updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 });
  }

  await logAudit({
    userId: admin.id,
    action: 'admin.post.reject',
    resource: 'posts',
    resourceId: id,
    metadata: { reason: parsed.data.reason, post: data },
    ip: req.headers.get('x-forwarded-for') || undefined,
    userAgent: req.headers.get('user-agent') || undefined,
  });

  return NextResponse.json(data);
}
