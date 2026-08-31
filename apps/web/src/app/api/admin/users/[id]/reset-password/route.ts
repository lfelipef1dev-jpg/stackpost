import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import { requireAdmin } from '@/lib/rbac';
import { logAudit } from '@/lib/audit';
import { hashSync } from 'bcryptjs';

function generateTempPassword(length = 12) {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%';
  return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { admin, error } = await requireAdmin(req, 'users.write');
  if (error) return error;

  const { id } = await params;
  const supabase = getSupabase();

  const { data: user } = await supabase.from('users').select('id, name, email').eq('id', id).single();
  if (!user) {
    return NextResponse.json({ error: 'Usuario nao encontrado' }, { status: 404 });
  }

  const temp = generateTempPassword();
  const passwordHash = hashSync(temp, 10);

  const { error: dbError } = await supabase.from('users').update({ password_hash: passwordHash }).eq('id', id);
  if (dbError) {
    return NextResponse.json({ error: 'Erro ao redefinir senha' }, { status: 500 });
  }

  await logAudit({
    userId: admin.id,
    action: 'admin.user.reset_password',
    resource: 'users',
    resourceId: id,
    metadata: { target: user.email },
    ip: req.headers.get('x-forwarded-for') || undefined,
    userAgent: req.headers.get('user-agent') || undefined,
  });

  return NextResponse.json({
    message: 'Senha redefinida',
    email: user.email,
    temp_password: temp,
  });
}
