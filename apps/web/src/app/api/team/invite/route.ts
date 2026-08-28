import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import { requireRole, PERMISSIONS } from '@/lib/rbac';

const VALID_ROLES = ['admin', 'editor', 'viewer'];

export async function POST(req: NextRequest) {
  const { user, error } = await requireRole(req, PERMISSIONS.MANAGE);
  if (error) return error;

  try {
    const body = await req.json();
    const email = (body.email || '').trim().toLowerCase();
    const role = (body.role || 'editor').toLowerCase();

    if (!email) return NextResponse.json({ error: 'Email obrigatorio' }, { status: 400 });
    if (!VALID_ROLES.includes(role)) {
      return NextResponse.json({ error: 'Role invalido. Use: admin, editor ou viewer' }, { status: 400 });
    }

    const supabase = getSupabase();

    // 1. Buscar usuario pelo email
    const { data: targetUser, error: userErr } = await supabase
      .from('users')
      .select('id, name, email')
      .eq('email', email)
      .maybeSingle();

    if (userErr) throw userErr;
    if (!targetUser) {
      return NextResponse.json({ error: 'Usuario nao encontrado. Peça para ele se cadastrar primeiro.' }, { status: 404 });
    }

    // 2. Verificar se ja e membro
    const { data: existing } = await supabase
      .from('team_members')
      .select('id')
      .eq('team_id', user.teamId)
      .eq('user_id', targetUser.id)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ error: 'Usuario ja e membro do time' }, { status: 400 });
    }

    // 3. Adicionar como membro
    const { error: insertErr } = await supabase.from('team_members').insert({
      team_id: user.teamId,
      user_id: targetUser.id,
      role,
    });

    if (insertErr) throw insertErr;

    return NextResponse.json({
      success: true,
      message: `${targetUser.name || targetUser.email} adicionado como ${role}`,
    });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message || 'Erro interno' }, { status: 500 });
  }
}
