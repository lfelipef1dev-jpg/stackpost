import { logger } from '@/lib/logger';
﻿import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';

// Cron: Desativar webhooks inativos ha 7 dias sem sucesso
// Trigger: Cloudflare Workers Cron Triggers (a cada 1 hora)
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Nao autorizado' }, { status: 401 });
  }

  try {
    const supabase = getSupabase();
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();

    // Buscar webhooks ativos com last_success_at antigo ou null
    const { data: webhooks, error } = await supabase
      .from('webhooks')
      .select('id, last_success_at, consecutive_failures')
      .eq('status', 'active')
      .or(`last_success_at.is.null,last_success_at.lt.${sevenDaysAgo}`)
      .limit(100);

    if (error) throw error;

    let disabled = 0;
    for (const webhook of webhooks || []) {
      const { error: disableErr } = await supabase
        .from('webhooks')
        .update({ status: 'disabled', disabled_reason: '7 dias sem sucesso' })
        .eq('id', webhook.id);
      if (disableErr) {
        logger.error(`Failed to disable webhook ${webhook.id}:`, disableErr);
      } else {
        disabled++;
      }
    }

    return NextResponse.json({ ok: true, cron: 'auto-disable-webhooks', disabled, total: (webhooks || []).length, timestamp: now.toISOString() });
  } catch (err: any) {
    logger.error('Cron auto-disable-webhooks error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  return GET(req);
}
