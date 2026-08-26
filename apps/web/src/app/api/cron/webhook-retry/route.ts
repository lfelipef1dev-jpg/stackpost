import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';

// Cron: Reenviar webhooks com falha (a cada 5 minutos)
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Nao autorizado' }, { status: 401 });
  }

  try {
    const supabase = getSupabase();
    const now = new Date().toISOString();

    const { data: events, error } = await supabase
      .from('webhook_events')
      .select('id, webhook_id, event_type, payload, attempts')
      .eq('status', 'failed')
      .lt('attempts', 4)
      .limit(50);

    if (error) throw error;

    let retried = 0;
    let failed = 0;

    for (const event of events || []) {
      try {
        const { data: webhook } = await supabase
          .from('webhooks')
          .select('url, secret, status')
          .eq('id', event.webhook_id)
          .single();

        if (!webhook || (webhook as any).status === 'disabled') { failed++; continue; }

        // HMAC-SHA256 signature
        const crypto = await import('crypto');
        const payload = JSON.stringify({ type: event.event_type, data: event.payload });
        const signature = crypto.createHmac('sha256', webhook.secret).update(payload).digest('hex');

        const res = await fetch(webhook.url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-StackPost-Signature': `sha256=${signature}`,
          },
          body: payload,
        });

        const newAttempts = (event.attempts || 0) + 1;
        if (res.ok) {
          await supabase.from('webhook_events').update({
            status: 'delivered',
            attempts: newAttempts,
            delivered_at: now,
          }).eq('id', event.id);
          retried++;
        } else {
          await supabase.from('webhook_events').update({
            attempts: newAttempts,
            last_attempt_at: now,
            status: newAttempts >= 4 ? 'failed' : 'failed',
          }).eq('id', event.id);
          failed++;
        }
      } catch (err) {
        console.error(`Failed to retry webhook event ${event.id}:`, err);
        failed++;
      }
    }

    return NextResponse.json({ ok: true, cron: 'webhook-retry', retried, failed, total: (events || []).length, timestamp: now });
  } catch (err: any) {
    console.error('Cron webhook-retry error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) { return GET(req); }
