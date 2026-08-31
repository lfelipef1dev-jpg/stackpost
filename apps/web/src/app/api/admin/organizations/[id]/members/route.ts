import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import { requireAdmin } from '@/lib/rbac';
import { logAudit } from '@/lib/audit';
import { z } from 'zod';

const postSchema = z.object({
  email: z.string().email(),
  role: z.enum(['owner', 'admin', 'editor', 'viewer']).default('editor'),
}).strict();

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { admin, error } = await requireAdmin(req, 'organizations.read');
  if (error) return error;

  const { id } = await params;
  const supabase = getSupabase();

  const { data: org } = await supabase.from('organizations').select('id').eq('id', id).single();
  if (!org) {
    return NextResponse.json({ error: 'Organizacao nao encontrada' }, { status: 404 });
  }

  const { data: teams } = await supabase.from('teams').select('id').eq('organization_id', id);
  const teamIds = (teams || []).map((t: any) => t.id);

  const { data, error: dbError } = await supabase
    .from('team_members')
    .select('id, role, created_at, user:users(id, name, email)')
    .in('team_id', teamIds)
    .order('created_at', { ascending: false });

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 });
  }

  return NextResponse.json(data || []);
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { admin, error } = await requireAdmin(req, 'organizations.write');
  if (error) return error;

  const { id } = await params;
  const body = await req.json();
  const parsed = postSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues }, { status: 400 });
  }

  const supabase = getSupabase();
  const { data: org } = await supabase.from('organizations').select('id, teams:teams(id)').eq('id', id).single();
  if (!org || !org.teams?.[0]) {
    return NextResponse.json({ error: 'Organizacao nao encontrada' }, { status: 404 });
  }

  const { data: user } = await supabase.from('users').select('id').eq('email', parsed.data.email).single();
  if (!user) {
    return NextResponse.json({ error: 'Usuario nao encontrado' }, { status: 404 });
  }

  const teamId = org.teams[0].id;
  const { data, error: dbError } = await supabase
    .from('team_members')
    .upsert({ team_id: teamId, user_id: user.id, role: parsed.data.role }, { onConflict: 'team_id,user_id' })
    .select()
    .single();

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 });
  }

  await logAudit({
    userId: admin.id,
    action: 'admin.organization.member.add',
    resource: 'team_members',
    resourceId: data.id,
    metadata: { organization_id: id, user_id: user.id, role: parsed.data.role },
    ip: req.headers.get('x-forwarded-for') || undefined,
    userAgent: req.headers.get('user-agent') || undefined,
  });

  return NextResponse.json(data, { status: 201 });
}
