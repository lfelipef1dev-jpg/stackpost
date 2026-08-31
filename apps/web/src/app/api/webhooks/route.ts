import { logger } from '@/lib/logger';
import { NextRequest, NextResponse } from 'next/server';
import { webhooksBodySchema, uuidSchema, webhooksQuerySchema } from '@/lib/schemas';
import { getSupabase } from '@/lib/supabase';
import { requireRole, PERMISSIONS } from '@/lib/rbac';
import { createHmac, randomBytes } from 'crypto';

export async function GET(req: NextRequest) {
  const { user, error } = await requireRole(req, PERMISSIONS.VIEW);
  if (error) return error;

  try {
    const supabase = getSupabase();
    const { data, error: err } = await supabase
      .from('webhooks')
      .select('id, url, events, status, created_at')
      .eq('team_id', user.teamId)
      .order('created_at', { ascending: false });

    if (err) throw err;

    const webhooks = await Promise.all(
      (data || []).map(async (w: any) => {
        const { count: total_events } = await supabase
          .from('webhook_events')
          .select('*', { count: 'exact', head: true })
          .eq('webhook_id', w.id);

        const { count: delivered } = await supabase
          .from('webhook_events')
          .select('*', { count: 'exact', head: true })
          .eq('webhook_id', w.id)
          .eq('status', 'delivered');

        const { count: failed } = await supabase
          .from('webhook_events')
          .select('*', { count: 'exact', head: true })
          .eq('webhook_id', w.id)
          .eq('status', 'failed');

        return {
          ...w,
          total_events: total_events || 0,
          delivered: delivered || 0,
          failed: failed || 0,
        };
      })
    );

    return NextResponse.json(webhooks);
  } catch (error) {
    logger.error((error as string));
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const { user, error } = await requireRole(req, PERMISSIONS.MANAGE);
  if (error) return error;

  const bodyRaw1 = await req.json();
  const parsed1 = webhooksBodySchema.safeParse(bodyRaw1);
  if (!parsed1.success) return NextResponse.json(parsed1.error.issues, { status: 400 });
  const body = bodyRaw1;
  const { url, events } = body;

  if (!url || !url.startsWith('http')) {
    return NextResponse.json({ error: 'URL invalida' }, { status: 400 });
  }

  const secret = randomBytes(32).toString('hex');
  const eventsArray = events || ['post.published'];

  try {
    const supabase = getSupabase();
    const { data, error: err } = await supabase
      .from('webhooks')
      .insert({
        team_id: user.teamId,
        url,
        secret,
        events: eventsArray,
        status: 'active',
      })
      .select('id, url, events, status, created_at')
      .single();

    if (err) throw err;

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    logger.error((error as string));
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const { user, error } = await requireRole(req, PERMISSIONS.MANAGE);
  if (error) return error;

  const { searchParams } = new URL(req.url);
  const queryRaw = Object.fromEntries(searchParams);
  const parsedQuery = webhooksQuerySchema.safeParse(queryRaw);
  if (!parsedQuery.success) return NextResponse.json({ error: parsedQuery.error.issues }, { status: 400 });
  const idRaw = searchParams.get('id');
  const idParsed1 = uuidSchema.safeParse(idRaw);
  if (!idParsed1.success) return NextResponse.json({ error: 'id inválido ou ausente' }, { status: 400 });
  const id = idParsed1.data;
  if (!id) return NextResponse.json({ error: 'ID obrigatorio' }, { status: 400 });

  try {
    const supabase = getSupabase();
    const { error: err } = await supabase
      .from('webhooks')
      .delete()
      .eq('id', id)
      .eq('team_id', user.teamId);

    if (err) throw err;

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error((error as string));
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
