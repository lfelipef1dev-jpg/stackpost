import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import { requireRole, PERMISSIONS } from '@/lib/rbac';

export async function GET(req: NextRequest) {
  const { user, error } = await requireRole(req, PERMISSIONS.VIEW);
  if (error) return error;

  const supabase = getSupabase();

  try {
    const { data: members, error: membersError } = await supabase
      .from('team_members')
      .select('*')
      .eq('team_id', user.teamId)
      .order('created_at', { ascending: true });
    if (membersError) throw membersError;

    if (!members || members.length === 0) {
      return NextResponse.json([]);
    }

    const userIds = members.map((m: any) => m.user_id);
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, email')
      .in('id', userIds);
    if (usersError) throw usersError;

    const userMap = new Map((users || []).map((u: any) => [u.id, u.email]));
    const rows = members.map((m: any) => ({ ...m, email: userMap.get(m.user_id) }));

    return NextResponse.json(rows);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const { user, error } = await requireRole(req, PERMISSIONS.MANAGE);
  if (error) return error;

  const body = await req.json();
  const { email, role } = body;

  if (!email || !role) return NextResponse.json({ error: 'email e role obrigatorios' }, { status: 400 });

  const supabase = getSupabase();

  try {
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .maybeSingle();
    if (userError) throw userError;

    if (!userData) {
      return NextResponse.json({ error: 'Usuario nao encontrado. Peça para se cadastrar primeiro.' }, { status: 404 });
    }

    const userId = userData.id;
    const { data, error: upsertError } = await supabase
      .from('team_members')
      .upsert({ team_id: user.teamId, user_id: userId, role }, { onConflict: 'team_id,user_id' })
      .select()
      .single();
    if (upsertError) throw upsertError;

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const { user, error } = await requireRole(req, PERMISSIONS.MANAGE);
  if (error) return error;

  const body = await req.json();
  const { id, role } = body;

  if (!id || !role) return NextResponse.json({ error: 'id e role obrigatorios' }, { status: 400 });

  const supabase = getSupabase();

  try {
    const { error: updateError } = await supabase
      .from('team_members')
      .update({ role })
      .eq('id', id)
      .eq('team_id', user.teamId);
    if (updateError) throw updateError;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const { user, error } = await requireRole(req, PERMISSIONS.OWNER);
  if (error) return error;

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'ID obrigatorio' }, { status: 400 });

  const supabase = getSupabase();

  try {
    const { error: deleteError } = await supabase
      .from('team_members')
      .delete()
      .eq('id', id)
      .eq('team_id', user.teamId)
      .neq('role', 'owner');
    if (deleteError) throw deleteError;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
