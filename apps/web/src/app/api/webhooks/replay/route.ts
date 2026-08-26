import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import { getUserFromToken } from '@/lib/auth';
import { createHmac } from 'crypto';

export async function POST(req: NextRequest) {
  const user = await getUserFromToken(req);
  if (!user) return NextResponse.json({ error: 'Nao autorizado' }, { status: 401 });

  const body = await req.json();
  const { eventId } = body;

  if (!eventId) return NextResponse.json({ error: 'eventId obrigatorio' }, { status: 400 });

  try {
    const supabase = getSupabase();
    const { data: eventData, error: eventErr } = await supabase
      .from('webhook_events')
      .select('*, webhooks(url, secret, team_id)')
      .eq('id', eventId)
      .single();

    if (eventErr || !eventData) {
      return NextResponse.json({ error: 'Evento nao encontrado' }, { status: 404 });
    }

    const event: any = eventData;
    if (event.webhooks.team_id !== user.teamId) {
      return NextResponse.json({ error: 'Evento nao encontrado' }, { status: 404 });
    }

    const payload = { type: event.event_type, data: event.payload };
    const bodyStr = JSON.stringify(payload);
    const signature = createHmac('sha256', event.webhooks.secret).update(bodyStr).digest('hex');

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    try {
      const res = await fetch(event.webhooks.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'stackpost',
          'x-signature': signature,
        },
        body: bodyStr,
        signal: controller.signal,
      });
      clearTimeout(timeout);

      const success = res.ok;
      const { error: updateErr } = await supabase
        .from('webhook_events')
        .update({
          status: success ? 'delivered' : 'failed',
          attempts: (event.attempts || 0) + 1,
          delivered_at: new Date().toISOString(),
        })
        .eq('id', eventId);

      if (updateErr) throw updateErr;

      return NextResponse.json({ success, status: res.status });
    } catch (err: any) {
      clearTimeout(timeout);
      const { error: updateErr } = await supabase
        .from('webhook_events')
        .update({
          status: 'failed',
          attempts: (event.attempts || 0) + 1,
        })
        .eq('id', eventId);

      if (updateErr) throw updateErr;

      return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
