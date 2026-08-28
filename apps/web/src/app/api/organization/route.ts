import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import { getUserFromToken } from '@/lib/auth';

// GET /api/organization — info da organizacao do usuario
export async function GET(req: NextRequest) {
  const user = await getUserFromToken(req);
  if (!user) return NextResponse.json({ error: 'Nao autorizado' }, { status: 401 });

  const supabase = getSupabase();

  try {
    // Buscar team do usuario
    const { data: team, error: teamError } = await supabase
      .from('teams')
      .select('*, organizations(*)')
      .eq('id', user.teamId)
      .maybeSingle();
    if (teamError || !team) return NextResponse.json({ error: 'Team nao encontrado' }, { status: 404 });

    // Buscar membros
    const { data: members } = await supabase
      .from('team_members')
      .select('id, user_id, role, created_at, users(id, name, email)')
      .eq('team_id', user.teamId);

    return NextResponse.json({
      organization: team.organizations,
      team: { ...team, organizations: undefined },
      members: members || [],
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PATCH /api/organization — atualizar organizacao
export async function PATCH(req: NextRequest) {
  const user = await getUserFromToken(req);
  if (!user) return NextResponse.json({ error: 'Nao autorizado' }, { status: 401 });

  if (user.role !== 'owner' && user.role !== 'admin') {
    return NextResponse.json({ error: 'Sem permissao (requer owner/admin)' }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const supabase = getSupabase();

  try {
    const { data: team } = await supabase
      .from('teams')
      .select('organization_id')
      .eq('id', user.teamId)
      .maybeSingle();
    if (!team?.organization_id) return NextResponse.json({ error: 'Organizacao nao encontrada' }, { status: 404 });

    const updates: any = {};
    if (body.name !== undefined) updates.name = body.name;
    if (body.plan !== undefined) updates.plan = body.plan;
    if (body.settings !== undefined) updates.settings = body.settings;

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'Nada para atualizar' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('organizations')
      .update(updates)
      .eq('id', team.organization_id)
      .select()
      .single();
    if (error) throw error;

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
