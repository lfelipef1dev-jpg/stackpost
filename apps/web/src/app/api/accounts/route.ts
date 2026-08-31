import { logger } from '@/lib/logger';
import { NextRequest, NextResponse } from 'next/server';
import { accountsBodySchema, uuidSchema, accountsQuerySchema } from '@/lib/schemas';
import { getSupabase } from '@/lib/supabase';
import { requireRole, PERMISSIONS } from '@/lib/rbac';

export async function GET(req: NextRequest) {
  const { user, error } = await requireRole(req, PERMISSIONS.VIEW);
  if (error) return error;

  try {
    const supabase = getSupabase();
    const { data, error: dbError } = await supabase
      .from('social_accounts')
      .select('*')
      .eq('team_id', user.teamId)
      .order('created_at', { ascending: false });
    if (dbError) throw dbError;
    return NextResponse.json(data);
  } catch (error) {
    logger.error((error as string));
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const { user, error } = await requireRole(req, PERMISSIONS.MANAGE);
  if (error) return error;

  const bodyRaw1 = await req.json();
  const parsed1 = accountsBodySchema.safeParse(bodyRaw1);
  if (!parsed1.success) return NextResponse.json(parsed1.error.issues, { status: 400 });
  const body = bodyRaw1;
  try {
    const supabase = getSupabase();
    const { data, error: dbError } = await supabase
      .from('social_accounts')
      .insert({
        team_id: user.teamId,
        platform: body.platform,
        username: body.username,
        access_token: body.accessToken,
        refresh_token: body.refreshToken || null,
        status: 'active',
      })
      .select()
      .single();
    if (dbError) throw dbError;
    return NextResponse.json(data);
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
  const parsedQuery = accountsQuerySchema.safeParse(queryRaw);
  if (!parsedQuery.success) return NextResponse.json({ error: parsedQuery.error.issues }, { status: 400 });
  const idRaw = searchParams.get('id');
  const idParsed1 = uuidSchema.safeParse(idRaw);
  if (!idParsed1.success) return NextResponse.json({ error: 'id inválido ou ausente' }, { status: 400 });
  const id = idParsed1.data;
  if (!id) return NextResponse.json({ error: 'ID obrigatorio' }, { status: 400 });

  try {
    const supabase = getSupabase();
    const { error: dbError } = await supabase
      .from('social_accounts')
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
