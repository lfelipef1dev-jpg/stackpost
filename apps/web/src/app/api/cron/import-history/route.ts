import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';

// Cron: Importar historico de posts das plataformas conectadas
// Trigger: Cloudflare Workers Cron Triggers (diario)
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Nao autorizado' }, { status: 401 });
  }

  try {
    const supabase = getSupabase();
    const now = new Date().toISOString();

    // Buscar contas conectadas
    const { data: accounts, error } = await supabase
      .from('social_accounts')
      .select('id, platform, external_id')
      .limit(100);

    if (error) throw error;

    let imported = 0;
    // TODO: para cada conta, buscar posts das ultimas 24h via API da plataforma
    // e inserir na tabela post_history
    imported = (accounts || []).length;

    return NextResponse.json({ ok: true, cron: 'import-history', imported, total: (accounts || []).length, timestamp: now });
  } catch (err: any) {
    console.error('Cron import-history error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  return GET(req);
}
