import { NextRequest, NextResponse } from 'next/server';
import { getUserFromToken } from '@/lib/auth';
import { getSupabase } from '@/lib/supabase';

export type Role = 'owner' | 'admin' | 'editor' | 'viewer';

const ROLE_HIERARCHY: Record<Role, number> = {
  viewer: 1,
  editor: 2,
  admin: 3,
  owner: 4,
};

export function hasPermission(userRole: string, requiredRole: Role): boolean {
  const userLevel = ROLE_HIERARCHY[userRole as Role] || 0;
  const requiredLevel = ROLE_HIERARCHY[requiredRole];
  return userLevel >= requiredLevel;
}

export async function requireRole(req: NextRequest, requiredRole: Role) {
  const user = await getUserFromToken(req);
  if (!user) {
    return {
      user: null,
      error: NextResponse.json({ error: 'Nao autorizado' }, { status: 401 }),
    };
  }

  const supabase = getSupabase();

  const { data: teamMemberRow } = await supabase
    .from('team_members')
    .select('role')
    .eq('team_id', user.teamId)
    .eq('user_id', user.id)
    .single();

  const userRole = teamMemberRow?.role || user.role || 'viewer';

  if (!hasPermission(userRole, requiredRole)) {
    return {
      user: null,
      error: NextResponse.json(
        { error: 'Permissao insuficiente', required: requiredRole, current: userRole },
        { status: 403 }
      ),
    };
  }

  return { user, error: null };
}

export const PERMISSIONS = {
  VIEW: 'viewer' as Role,
  EDIT: 'editor' as Role,
  MANAGE: 'admin' as Role,
  OWNER: 'owner' as Role,
};
