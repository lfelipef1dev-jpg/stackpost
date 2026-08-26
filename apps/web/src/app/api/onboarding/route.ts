import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import { getUserFromToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const user = await getUserFromToken(req);
  if (!user) return NextResponse.json({ error: 'Nao autorizado' }, { status: 401 });

  const body = await req.json();
  const { orgName, teamName } = body;

  if (!orgName) return NextResponse.json({ error: 'orgName obrigatorio' }, { status: 400 });

  const supabase = getSupabase();

  try {
    const { data: orgData, error: orgError } = await supabase
      .from('organizations')
      .insert({ name: orgName, owner_id: user.id })
      .select('id')
      .single();
    if (orgError) throw orgError;
    const orgId = orgData.id;

    const { data: teamData, error: teamError } = await supabase
      .from('teams')
      .insert({ organization_id: orgId, name: teamName || 'Default' })
      .select('id')
      .single();
    if (teamError) throw teamError;
    const teamId = teamData.id;

    const { error: updateError } = await supabase
      .from('users')
      .update({ organization_id: orgId, team_id: teamId })
      .eq('id', user.id);
    if (updateError) throw updateError;

    return NextResponse.json({ orgId, teamId, success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
