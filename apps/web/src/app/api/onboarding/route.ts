import { logger } from '@/lib/logger';
import { NextRequest, NextResponse } from 'next/server';
import { onboardingBodySchema } from '@/lib/schemas';
import { getSupabase } from '@/lib/supabase';
import { getUserFromToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const user = await getUserFromToken(req);
  if (!user) return NextResponse.json({ error: 'Nao autorizado' }, { status: 401 });

  const bodyRaw1 = await req.json();
  const parsed1 = onboardingBodySchema.safeParse(bodyRaw1);
  if (!parsed1.success) return NextResponse.json(parsed1.error.issues, { status: 400 });
  const body = bodyRaw1;
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
    logger.error((error as string));
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
