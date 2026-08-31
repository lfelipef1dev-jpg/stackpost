import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import { requireAdmin } from '@/lib/rbac';
import { logAudit } from '@/lib/audit';
import { z } from 'zod';

const schema = z.object({
  new_owner_id: z.string().uuid(),
}).strict();

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { admin, error } = await requireAdmin(req, 'organizations.write');
  if (error) return error;

  const { id } = await params;
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues }, { status: 400 });
  }

  const supabase = getSupabase();
  const { data: org } = await supabase.from('organizations').select('id, name, owner_id').eq('id', id).single();
  if (!org) {
    return NextResponse.json({ error: 'Organizacao nao encontrada' }, { status: 404 });
  }

  const { data: newOwner } = await supabase.from('users').select('id, name, email').eq('id', parsed.data.new_owner_id).single();
  if (!newOwner) {
    return NextResponse.json({ error: 'Novo dono nao encontrado' }, { status: 404 });
  }

  await supabase.from('organizations').update({ owner_id: parsed.data.new_owner_id, updated_at: new Date().toISOString() }).eq('id', id);
  await supabase.from('team_members').upsert(
    { team_id: id, user_id: parsed.data.new_owner_id, role: 'owner' },
    { onConflict: 'team_id,user_id' }
  );

  await logAudit({
    userId: admin.id,
    action: 'admin.organization.transfer',
    resource: 'organizations',
    resourceId: id,
    metadata: { previous_owner: org.owner_id, new_owner: newOwner },
    ip: req.headers.get('x-forwarded-for') || undefined,
    userAgent: req.headers.get('user-agent') || undefined,
  });

  return NextResponse.json({ success: true, owner: newOwner });
}
