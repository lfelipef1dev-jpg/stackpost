import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import { getUserFromToken } from '@/lib/auth';

// GET /api/usage/imports — contagem de imports do mes atual
export async function GET(req: NextRequest) {
  const user = await getUserFromToken(req);
  if (!user) return NextResponse.json({ error: 'Nao autorizado' }, { status: 401 });

  const supabase = getSupabase();
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  try {
    const { count, error } = await supabase
      .from('imported_posts')
      .select('id', { count: 'exact', head: true })
      .eq('team_id', user.teamId)
      .gte('posted_at', startOfMonth);

    if (error) {
      // Tabela pode nao ter posted_at; fallback para created_at
      const { count: count2, error: error2 } = await supabase
        .from('imported_posts')
        .select('id', { count: 'exact', head: true })
        .eq('team_id', user.teamId);
      if (error2) throw error2;
      return NextResponse.json({ imports: count2 || 0, period: 'all_time' });
    }
    return NextResponse.json({ imports: count || 0, period: 'current_month', since: startOfMonth });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
