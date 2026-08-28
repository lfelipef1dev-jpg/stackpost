import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import { getUserFromToken } from '@/lib/auth';

// GET /api/accounts/by-type — listar contas agrupadas por plataforma
export async function GET(req: NextRequest) {
  const user = await getUserFromToken(req);
  if (!user) return NextResponse.json({ error: 'Nao autorizado' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const platform = searchParams.get('platform');

  const supabase = getSupabase();

  try {
    let query = supabase
      .from('social_accounts')
      .select('*')
      .eq('team_id', user.teamId);

    if (platform) query = query.eq('platform', platform);

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;

    // Agrupar por plataforma
    const byPlatform: Record<string, any[]> = {};
    for (const acc of data || []) {
      if (!byPlatform[acc.platform]) byPlatform[acc.platform] = [];
      byPlatform[acc.platform].push(acc);
    }

    return NextResponse.json({ byPlatform, total: (data || []).length });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
