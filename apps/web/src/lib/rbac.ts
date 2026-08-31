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
    .maybeSingle();

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

export type AdminPermission =
  | 'users.read' | 'users.write'
  | 'teams.read' | 'teams.write'
  | 'organizations.read' | 'organizations.write'
  | 'posts.read' | 'posts.write'
  | 'comments.read' | 'comments.write'
  | 'accounts.read' | 'accounts.write'
  | 'billing.read' | 'billing.write'
  | 'plans.read' | 'plans.write'
  | 'credits.read' | 'credits.write'
  | 'webhooks.read' | 'webhooks.write'
  | 'cron.read' | 'cron.write'
  | 'analytics.read' | 'analytics.write'
  | 'audit_logs.read' | 'audit_logs.write'
  | 'settings.read' | 'settings.write';

export interface AdminUser {
  id: string;
  email: string;
  name?: string;
  is_superuser: boolean;
  status: string;
  permissions: string[];
}

export async function getAdminFromToken(req: NextRequest): Promise<AdminUser | null> {
  const user = await getUserFromToken(req);
  if (!user) return null;

  const supabase = getSupabase();
  const { data: userRow } = await supabase
    .from('users')
    .select('id, email, name, is_superuser, status')
    .eq('id', user.id)
    .single();

  if (!userRow || userRow.status !== 'active') return null;

  if (userRow.is_superuser) {
    const allPerms: AdminPermission[] = [
      'users.read', 'users.write', 'teams.read', 'teams.write', 'organizations.read', 'organizations.write',
      'posts.read', 'posts.write', 'comments.read', 'comments.write', 'accounts.read', 'accounts.write',
      'billing.read', 'billing.write', 'plans.read', 'plans.write', 'credits.read', 'credits.write',
      'webhooks.read', 'webhooks.write', 'cron.read', 'cron.write', 'analytics.read', 'analytics.write',
      'audit_logs.read', 'audit_logs.write', 'settings.read', 'settings.write',
    ];
    return { ...userRow, permissions: allPerms };
  }

  const { data: roles } = await supabase
    .from('admin_user_roles')
    .select('admin_role:admin_roles(permissions)')
    .eq('user_id', user.id);

  const permissions = new Set<string>();
  for (const r of (roles || []) as { admin_role?: { permissions?: string[] } }[]) {
    if (r.admin_role && Array.isArray(r.admin_role.permissions)) {
      for (const p of r.admin_role.permissions) permissions.add(p);
    }
  }

  return { ...userRow, permissions: Array.from(permissions) };
}

export function hasAdminPermission(user: AdminUser | null, permission: AdminPermission): boolean {
  if (!user) return false;
  if (user.is_superuser) return true;
  return user.permissions.includes(permission);
}

export async function requireAdmin(req: NextRequest, permission?: AdminPermission) {
  const admin = await getAdminFromToken(req);
  if (!admin) {
    return {
      admin: null,
      error: NextResponse.json({ error: 'Nao autorizado' }, { status: 401 }),
    };
  }

  if (permission && !hasAdminPermission(admin, permission)) {
    return {
      admin: null,
      error: NextResponse.json({ error: 'Permissao de admin insuficiente', required: permission }, { status: 403 }),
    };
  }

  return { admin, error: null };
}
