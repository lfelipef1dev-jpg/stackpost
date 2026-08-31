import { logger } from '@/lib/logger';
import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';

// Cron: Health check das contas sociais conectadas
// Trigger: Cloudflare Workers Cron Triggers (a cada 30 minutos)
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
      .select('id, platform, status, expires_at')
      .limit(100);

    if (error) throw error;

    let healthy = 0;
    let expired = 0;
    let needsReconnect = 0;

    for (const account of accounts || []) {
      if (account.expires_at && new Date(account.expires_at) < new Date()) {
        expired++;
        // Marcar como needs_reconnect
        await supabase
          .from('social_accounts')
          .update({ status: 'needs_reconnect' })
          .eq('id', account.id);
      } else if (account.status === 'needs_reconnect') {
        needsReconnect++;
      } else {
        healthy++;
      }
    }

    return NextResponse.json({ ok: true, cron: 'health-check', healthy, expired, needsReconnect, total: (accounts || []).length, timestamp: now });
  } catch (err: any) {
    logger.error('Cron health-check error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  return GET(req);
}
