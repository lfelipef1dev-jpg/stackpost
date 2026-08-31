import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import { requireAdmin } from '@/lib/rbac';
import { logAudit } from '@/lib/audit';
import { z } from 'zod';

const postSchema = z.object({
  name: z.string().min(1),
  plan: z.string().optional(),
  owner_id: z.string().uuid().optional(),
}).strict();

export async function GET(req: NextRequest) {
  const { admin, error } = await requireAdmin(req, 'organizations.read');
  if (error) return error;

  const supabase = getSupabase();
  const { data, error: dbError } = await supabase
    .from('organizations')
    .select('id, name, slug, plan, plan_status, status, billing_email, owner_id, created_at, updated_at')
    .order('created_at', { ascending: false });

  if (dbError) {
    return NextResponse.json({ error: 'Erro ao listar organizacoes' }, { status: 500 });
  }

  const orgs = data || [];
  const ownerIds = [...new Set(orgs.map((o: any) => o.owner_id).filter(Boolean))];
  const { data: owners } = ownerIds.length
    ? await supabase.from('users').select('id, name, email').in('id', ownerIds)
    : { data: [] };
  const ownerMap = new Map((owners || []).map((u: any) => [u.id, u]));

  const { data: teams } = await supabase.from('teams').select('id, name, organization_id');
  const teamByOrg = new Map<string, any[]>();
  for (const t of teams || []) {
    const arr = teamByOrg.get(t.organization_id) || [];
    arr.push(t);
    teamByOrg.set(t.organization_id, arr);
  }

  const allTeamIds = (teams || []).map((t: any) => t.id);
  const { data: memberships } = allTeamIds.length
    ? await supabase.from('team_members').select('team_id, user_id, role').in('team_id', allTeamIds)
    : { data: [] };
  const membersByTeam = new Map<string, number>();
  for (const m of memberships || []) {
    membersByTeam.set(m.team_id, (membersByTeam.get(m.team_id) || 0) + 1);
  }

  const enriched = orgs.map((o: any) => {
    const orgTeams = teamByOrg.get(o.id) || [];
    const memberCount = orgTeams.reduce((acc: number, t: any) => acc + (membersByTeam.get(t.id) || 0), 0);
    return { ...o, owner: ownerMap.get(o.owner_id) || null, teams: orgTeams, member_count: memberCount };
  });

  return NextResponse.json(enriched);
}

export async function POST(req: NextRequest) {
  const { admin, error } = await requireAdmin(req, 'organizations.write');
  if (error) return error;

  const body = await req.json();
  const parsed = postSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues }, { status: 400 });
  }

  const supabase = getSupabase();
  const slug = parsed.data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

  const { data, error: dbError } = await supabase
    .from('organizations')
    .insert({
      name: parsed.data.name,
      slug,
      plan: parsed.data.plan || 'free',
      owner_id: parsed.data.owner_id || admin.id,
      plan_status: 'active',
    })
    .select('id, name, slug, plan, owner_id, created_at')
    .single();

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 });
  }

  const { data: team, error: teamError } = await supabase
    .from('teams')
    .insert({
      organization_id: data.id,
      name: 'Default',
      owner_id: data.owner_id,
    })
    .select('id')
    .single();

  if (teamError || !team) {
    return NextResponse.json({ error: 'Erro ao criar equipe' }, { status: 500 });
  }

  await supabase.from('team_members').insert({
    team_id: team.id,
    user_id: data.owner_id,
    role: 'owner',
  });

  await logAudit({
    userId: admin.id,
    action: 'admin.organization.create',
    resource: 'organizations',
    resourceId: data.id,
    metadata: { name: parsed.data.name, plan: parsed.data.plan },
    ip: req.headers.get('x-forwarded-for') || undefined,
    userAgent: req.headers.get('user-agent') || undefined,
  });

  return NextResponse.json(data, { status: 201 });
}
