import { logger } from '@/lib/logger';
import { NextRequest, NextResponse } from 'next/server';
import { audit_logsBodySchema, audit_logsQuerySchema } from '@/lib/schemas';
import { getSupabase } from '@/lib/supabase';
import { getUserFromToken } from '@/lib/auth';

// GET /api/audit-logs — listar audit logs do team
export async function GET(req: NextRequest) {
  const user = await getUserFromToken(req);
  if (!user) return NextResponse.json({ error: 'Nao autorizado' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const queryRaw = Object.fromEntries(searchParams);
  const parsedQuery = audit_logsQuerySchema.safeParse(queryRaw);
  if (!parsedQuery.success) return NextResponse.json({ error: parsedQuery.error.issues }, { status: 400 });
  const limit = Math.min(parseInt(searchParams.get('limit') || '100'), 200);
  const action = searchParams.get('action');
  const cursor = searchParams.get('cursor');

  const supabase = getSupabase();

  try {
    let query = supabase
      .from('audit_logs')
      .select('*')
      .eq('team_id', user.teamId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (action) query = query.eq('action', action);
    if (cursor) query = query.lt('created_at', cursor);

    const { data, error } = await query;
    if (error) {
      // Tabela pode nao existir ainda; retornar vazio
      if (error.code === '42P01' || error.message.includes('does not exist')) {
        return NextResponse.json([]);
      }
      throw error;
    }

    return NextResponse.json(data || []);
  } catch (error: any) {
    logger.error('Audit logs error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/audit-logs — criar audit log (interno)
export async function POST(req: NextRequest) {
  const user = await getUserFromToken(req);
  if (!user) return NextResponse.json({ error: 'Nao autorizado' }, { status: 401 });

  const bodyRaw1 = await req.json().catch(() => ({}));
  const parsed1 = audit_logsBodySchema.safeParse(bodyRaw1);
  if (!parsed1.success) return NextResponse.json(parsed1.error.issues, { status: 400 });
  const { action, resource, resourceId, metadata } = bodyRaw1;
  if (!action) return NextResponse.json({ error: 'action obrigatorio' }, { status: 400 });

  const supabase = getSupabase();

  try {
    const { data, error } = await supabase
      .from('audit_logs')
      .insert({
        team_id: user.teamId,
        user_id: user.id,
        action,
        resource: resource || null,
        resource_id: resourceId || null,
        metadata: metadata || {},
      })
      .select()
      .single();

    if (error) {
      if (error.code === '42P01' || error.message.includes('does not exist')) {
        return NextResponse.json({ success: true, skipped: 'audit_logs table not created yet' });
      }
      throw error;
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
