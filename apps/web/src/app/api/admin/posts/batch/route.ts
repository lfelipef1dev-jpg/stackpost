import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import { requireAdmin } from '@/lib/rbac';
import { logAudit } from '@/lib/audit';
import { z } from 'zod';

const schema = z.object({
  ids: z.array(z.string().uuid()),
  action: z.enum(['approve', 'delete', 'reschedule']),
  scheduled_at: z.string().datetime().optional(),
}).strict();

export async function PATCH(req: NextRequest) {
  const { admin, error } = await requireAdmin(req, 'posts.write');
  if (error) return error;

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues }, { status: 400 });
  }

  const supabase = getSupabase();
  const { ids, action, scheduled_at } = parsed.data;

  if (action === 'delete') {
    const { data: before } = await supabase.from('posts').select('id').in('id', ids);
    await supabase.from('posts').delete().in('id', ids);
    await logAudit({
      userId: admin.id,
      action: 'admin.post.batch_delete',
      resource: 'posts',
      metadata: { ids, count: before?.length || 0 },
      ip: req.headers.get('x-forwarded-for') || undefined,
      userAgent: req.headers.get('user-agent') || undefined,
    });
    return NextResponse.json({ success: true, deleted: ids.length });
  }

  if (action === 'approve') {
    const { data } = await supabase
      .from('posts')
      .update({ status: 'approved', updated_at: new Date().toISOString() })
      .in('id', ids)
      .select('id');
    await logAudit({
      userId: admin.id,
      action: 'admin.post.batch_approve',
      resource: 'posts',
      metadata: { ids, count: data?.length },
      ip: req.headers.get('x-forwarded-for') || undefined,
      userAgent: req.headers.get('user-agent') || undefined,
    });
    return NextResponse.json({ success: true, approved: data?.length || 0 });
  }

  if (action === 'reschedule' && scheduled_at) {
    const { data } = await supabase
      .from('posts')
      .update({ scheduled_at, status: 'scheduled', updated_at: new Date().toISOString() })
      .in('id', ids)
      .select('id');
    await logAudit({
      userId: admin.id,
      action: 'admin.post.batch_reschedule',
      resource: 'posts',
      metadata: { ids, scheduled_at },
      ip: req.headers.get('x-forwarded-for') || undefined,
      userAgent: req.headers.get('user-agent') || undefined,
    });
    return NextResponse.json({ success: true, rescheduled: data?.length || 0 });
  }

  return NextResponse.json({ error: 'Acao invalida' }, { status: 400 });
}
