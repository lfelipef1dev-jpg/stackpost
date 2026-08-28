import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import { getUserFromToken } from '@/lib/auth';

// GET /api/audit-logs — listar audit logs do team
export async function GET(req: NextRequest) {
  const user = await getUserFromToken(req);
  if (!user) return NextResponse.json({ error: 'Nao autorizado' }, { status: 401 });

  const { searchParams } = new URL(req.url);
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
    console.error('Audit logs error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/audit-logs — criar audit log (interno)
export async function POST(req: NextRequest) {
  const user = await getUserFromToken(req);
  if (!user) return NextResponse.json({ error: 'Nao autorizado' }, { status: 401 });

  const { action, resource, resourceId, metadata } = await req.json().catch(() => ({}));
  if (!action) return NextResponse.json({ error: 'action obrigatorio' }, { status: 400 });

  const supabase = getSupabase();

  try {
    const { data, error } = await supabase
      .from('audit_logs')
      .insert({
        team_id: user.teamId,
        user_id: user.userId || user.id,
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
