import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import { getUserFromToken } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const user = await getUserFromToken(req);
  if (!user) return NextResponse.json({ error: 'Nao autorizado' }, { status: 401 });

  const supabase = getSupabase();

  try {
    const { data: team, error: teamError } = await supabase
      .from('teams')
      .select('id, organization_id')
      .eq('id', user.teamId)
      .single();
    if (teamError) throw teamError;

    const { data: org, error: orgError } = await supabase
      .from('organizations')
      .select('id, name, plan')
      .eq('id', team.organization_id)
      .single();
    if (orgError) throw orgError;

    return NextResponse.json({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      team,
      organization: org,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
