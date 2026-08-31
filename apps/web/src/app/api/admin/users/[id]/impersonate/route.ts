import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import { requireAdmin } from '@/lib/rbac';
import { logAudit } from '@/lib/audit';
import { createToken } from '@/lib/token';
import { setTokenCookie } from '@/lib/cookies';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { admin, error } = await requireAdmin(req, 'users.read');
  if (error) return error;

  const { id } = await params;
  const supabase = getSupabase();

  const { data: user } = await supabase
    .from('users')
    .select('id, email, name, role')
    .eq('id', id)
    .single();

  if (!user) {
    return NextResponse.json({ error: 'Usuario nao encontrado' }, { status: 404 });
  }

  const token = await createToken({
    sub: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  });

  await logAudit({
    userId: admin.id,
    action: 'admin.user.impersonate',
    resource: 'users',
    resourceId: id,
    metadata: { target: user.email },
    ip: req.headers.get('x-forwarded-for') || undefined,
    userAgent: req.headers.get('user-agent') || undefined,
  });

  const res = NextResponse.json({ success: true, redirect: '/dashboard' });
  setTokenCookie(req, res, token);
  return res;
}
