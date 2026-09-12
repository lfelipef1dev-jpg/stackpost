import { logger } from '@/lib/logger';
import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import { requireCronAuth } from '@/lib/cron-auth';

// Cron: Resetar contadores de uso mensal (dia 1 de cada mes)
// Trigger: Cloudflare Workers Cron Triggers (diário, verifica dia 1)
export async function GET(req: NextRequest) {
  const denied = requireCronAuth(req);
  if (denied) return denied;

  try {
    const supabase = getSupabase();
    const now = new Date();
    const today = now.toISOString();

    // So roda no dia 1 do mes
    if (now.getDate() !== 1) {
      return NextResponse.json({ ok: true, cron: 'monthly-usage-reset', skipped: true, reason: 'not_first_day', timestamp: today });
    }

    // Resetar contadores mensais de todas as equipes
    const { data: teams, error } = await supabase.from('teams').select('id').limit(500);
    if (error) throw error;

    let reset = 0;
    for (const team of teams || []) {
      const { error: resetErr } = await supabase
        .from('usage_monthly')
        .update({ posts_count: 0, uploads_count: 0, api_calls: 0, reset_at: today })
        .eq('team_id', team.id);
      if (!resetErr) reset++;
    }

    return NextResponse.json({ ok: true, cron: 'monthly-usage-reset', reset, total: (teams || []).length, timestamp: today });
  } catch (err: any) {
    logger.error('Cron monthly-usage-reset error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  return GET(req);
}
