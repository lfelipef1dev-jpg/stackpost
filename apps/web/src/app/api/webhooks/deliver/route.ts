import { logger } from '@/lib/logger';
import { NextRequest, NextResponse } from 'next/server';
import { webhooks_deliverBodySchema, webhooks_deliverQuerySchema } from '@/lib/schemas';
import { getSupabase } from '@/lib/supabase';
import { getUserFromToken } from '@/lib/auth';
import { createHmac } from 'crypto';

async function deliverWebhook(url: string, secret: string, payload: any): Promise<{ success: boolean; status: number; error?: string }> {
  const body = JSON.stringify(payload);
  const signature = createHmac('sha256', secret).update(body).digest('hex');

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'stackpost',
        'x-signature': signature,
      },
      body,
      signal: controller.signal,
    });

    clearTimeout(timeout);

    return { success: res.ok, status: res.status };
  } catch (err: any) {
    return { success: false, status: 0, error: err.message };
  }
}

async function deliverWithRetries(url: string, secret: string, payload: any): Promise<{ success: boolean; attempts: number }> {
  // 1 initial + 3 retries = 4 total attempts, exponential backoff from 30s
  const delays = [0, 30000, 90000, 270000];

  for (let i = 0; i < delays.length; i++) {
    if (delays[i] > 0) await new Promise((r) => setTimeout(r, delays[i]));

    const result = await deliverWebhook(url, secret, payload);
    if (result.success) return { success: true, attempts: i + 1 };
  }

  return { success: false, attempts: 4 };
}

export async function POST(req: NextRequest) {
  const user = await getUserFromToken(req);
  if (!user) return NextResponse.json({ error: 'Nao autorizado' }, { status: 401 });

  const bodyRaw1 = await req.json();
  const parsed1 = webhooks_deliverBodySchema.safeParse(bodyRaw1);
  if (!parsed1.success) return NextResponse.json(parsed1.error.issues, { status: 400 });
  const body = bodyRaw1;
  const { eventType, data } = body;

  if (!eventType || !data) {
    return NextResponse.json({ error: 'eventType e data obrigatorios' }, { status: 400 });
  }

  try {
    const supabase = getSupabase();
    const { data: webhooksData, error: webhooksErr } = await supabase
      .from('webhooks')
      .select('*')
      .eq('team_id', user.teamId)
      .eq('status', 'active')
      .contains('events', [eventType]);

    if (webhooksErr) throw webhooksErr;

    const webhooks = webhooksData || [];
    const results: any[] = [];

    for (const webhook of webhooks) {
      const { data: eventRow, error: eventErr } = await supabase
        .from('webhook_events')
        .insert({
          webhook_id: webhook.id,
          event_type: eventType,
          payload: data,
          status: 'pending',
        })
        .select('id')
        .single();

      if (eventErr) throw eventErr;
      const eventId = eventRow.id;

      const delivery = await deliverWithRetries(webhook.url, webhook.secret, { type: eventType, data });

      const { error: updateErr } = await supabase
        .from('webhook_events')
        .update({
          status: delivery.success ? 'delivered' : 'failed',
          attempts: delivery.attempts,
          delivered_at: delivery.success ? new Date().toISOString() : null,
        })
        .eq('id', eventId);

      if (updateErr) throw updateErr;

      if (!delivery.success) {
        const { data: failRow, error: failErr } = await supabase
          .from('webhooks')
          .select('consecutive_failures, last_success_at')
          .eq('id', webhook.id)
          .single();

        if (failErr) throw failErr;

        const failures = (failRow?.consecutive_failures || 0) + 1;
        const { error: failUpdateErr } = await supabase
          .from('webhooks')
          .update({ consecutive_failures: failures })
          .eq('id', webhook.id);

        if (failUpdateErr) throw failUpdateErr;

        // Auto-disable apos 7 dias sem sucesso (conforme plano)
        const lastSuccess = failRow?.last_success_at ? new Date(failRow.last_success_at) : null;
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        if (!lastSuccess || lastSuccess < sevenDaysAgo) {
          const { error: disableErr } = await supabase
            .from('webhooks')
            .update({ status: 'disabled', disabled_reason: '7 dias sem sucesso' })
            .eq('id', webhook.id);

          if (disableErr) throw disableErr;
        }
      } else {
        const { error: resetErr } = await supabase
          .from('webhooks')
          .update({ consecutive_failures: 0, last_success_at: new Date().toISOString() })
          .eq('id', webhook.id);

        if (resetErr) throw resetErr;
      }

      results.push({ webhookId: webhook.id, eventId, success: delivery.success, attempts: delivery.attempts });
    }

    return NextResponse.json({ delivered: results.length, results });
  } catch (error) {
    logger.error((error as string));
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const user = await getUserFromToken(req);
  if (!user) return NextResponse.json({ error: 'Nao autorizado' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const queryRaw = Object.fromEntries(searchParams);
  const parsedQuery = webhooks_deliverQuerySchema.safeParse(queryRaw);
  if (!parsedQuery.success) return NextResponse.json({ error: parsedQuery.error.issues }, { status: 400 });
  const webhookId = searchParams.get('webhookId');

  try {
    const supabase = getSupabase();

    if (webhookId) {
      const { data: webhookRow, error: webhookErr } = await supabase
        .from('webhooks')
        .select('id')
        .eq('id', webhookId)
        .eq('team_id', user.teamId)
        .single();

      if (webhookErr || !webhookRow) {
        return NextResponse.json([]);
      }

      const { data, error: err } = await supabase
        .from('webhook_events')
        .select('*')
        .eq('webhook_id', webhookId)
        .order('created_at', { ascending: false })
        .limit(100);

      if (err) throw err;

      return NextResponse.json(data || []);
    }

    const { data: webhookIds, error: webhooksErr } = await supabase
      .from('webhooks')
      .select('id')
      .eq('team_id', user.teamId);

    if (webhooksErr) throw webhooksErr;

    const ids = (webhookIds || []).map((w: any) => w.id);

    if (ids.length === 0) {
      return NextResponse.json([]);
    }

    const { data, error: err } = await supabase
      .from('webhook_events')
      .select('*')
      .in('webhook_id', ids)
      .order('created_at', { ascending: false })
      .limit(100);

    if (err) throw err;

    return NextResponse.json(data || []);
  } catch (error) {
    logger.error((error as string));
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
