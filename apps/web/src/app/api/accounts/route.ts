import { NextRequest, NextResponse } from 'next/server';
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
    console.error(error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const { user, error } = await requireRole(req, PERMISSIONS.MANAGE);
  if (error) return error;

  const body = await req.json();
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
    console.error(error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const { user, error } = await requireRole(req, PERMISSIONS.MANAGE);
  if (error) return error;

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
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
    console.error(error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
