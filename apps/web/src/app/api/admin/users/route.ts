import { NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import { requireAdmin } from '@/lib/rbac';

export async function GET(request: Request) {
  const { admin, error } = await requireAdmin(request as any, 'users.read');
  if (error) return error;

  const supabase = getSupabase();
  const { data, error: dbError } = await supabase
    .from('users')
    .select('id, name, email, status, is_superuser, created_at, last_login_at')
    .order('created_at', { ascending: false })
    .limit(500);

  if (dbError) {
    return NextResponse.json({ error: 'Erro ao listar usuários' }, { status: 500 });
  }

  return NextResponse.json(data || []);
}
