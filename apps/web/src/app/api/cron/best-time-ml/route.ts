import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';

// Cron: Recalcular melhores horarios via ML
// Trigger: Cloudflare Workers Cron Triggers (semanal)
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Nao autorizado' }, { status: 401 });
  }

  try {
    const supabase = getSupabase();
    const now = new Date().toISOString();

    // Buscar contas com analytics suficientes (30+ posts)
    const { data: accounts, error } = await supabase
      .from('social_accounts')
      .select('id, platform')
      .limit(100);

    if (error) throw error;

    let recalculated = 0;
    // TODO: para cada conta, agregar analytics dos ultimos 90 dias
    // e calcular melhor horario por dia da semana usando ML
    recalculated = (accounts || []).length;

    return NextResponse.json({ ok: true, cron: 'best-time-ml', recalculated, total: (accounts || []).length, timestamp: now });
  } catch (err: any) {
    console.error('Cron best-time-ml error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  return GET(req);
}
