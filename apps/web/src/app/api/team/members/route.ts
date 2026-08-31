import { logger } from '@/lib/logger';
import { NextRequest, NextResponse } from 'next/server';
import { uuidSchema, team_membersQuerySchema } from '@/lib/schemas';
import { getSupabase } from '@/lib/supabase';
import { requireRole, PERMISSIONS } from '@/lib/rbac';

export async function GET(req: NextRequest) {
  const { user, error } = await requireRole(req, PERMISSIONS.VIEW);
  if (error) return error;

  try {
    const supabase = getSupabase();
    const { data, error: dbError } = await supabase
      .from('team_members')
      .select(`
        id,
        user_id,
        role,
        created_at,
        users!inner(id, name, email)
      `)
      .eq('team_id', user.teamId)
      .order('created_at', { ascending: true });

    if (dbError) throw dbError;

    const members = (data || []).map((m: any) => ({
      id: m.id,
      userId: m.user_id,
      role: m.role,
      name: m.users?.name,
      email: m.users?.email,
      created_at: m.created_at,
    }));

    return NextResponse.json(members);
  } catch (error) {
    logger.error((error as string));
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const { user, error } = await requireRole(req, PERMISSIONS.MANAGE);
  if (error) return error;

  const { searchParams } = new URL(req.url);
  const queryRaw = Object.fromEntries(searchParams);
  const parsedQuery = team_membersQuerySchema.safeParse(queryRaw);
  if (!parsedQuery.success) return NextResponse.json({ error: parsedQuery.error.issues }, { status: 400 });
  const idRaw = searchParams.get('id');
  const idParsed1 = uuidSchema.safeParse(idRaw);
  if (!idParsed1.success) return NextResponse.json({ error: 'id inválido ou ausente' }, { status: 400 });
  const id = idParsed1.data;
  if (!id) return NextResponse.json({ error: 'ID obrigatorio' }, { status: 400 });

  try {
    const supabase = getSupabase();
    // Nao permitir remover o owner
    const { data: member } = await supabase
      .from('team_members')
      .select('role')
      .eq('id', id)
      .eq('team_id', user.teamId)
      .single();
    if (member?.role === 'owner') {
      return NextResponse.json({ error: 'Nao e possivel remover o owner' }, { status: 400 });
    }

    const { error: dbError } = await supabase
      .from('team_members')
      .delete()
      .eq('id', id)
      .eq('team_id', user.teamId);
    if (dbError) throw dbError;
    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error((error as string));
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
