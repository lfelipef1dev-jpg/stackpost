import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import { requireAdmin } from '@/lib/rbac';

export async function GET(req: NextRequest) {
  const { error } = await requireAdmin(req, 'audit_logs.read');
  if (error) return error;

  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('user_id');
  const action = searchParams.get('action');
  const resource = searchParams.get('resource');
  const from = searchParams.get('from');
  const to = searchParams.get('to');
  const ip = searchParams.get('ip');

  const supabase = getSupabase();
  let query = supabase
    .from('audit_logs')
    .select('id, user_id, action, resource, resource_id, metadata, ip_address, user_agent, created_at')
    .order('created_at', { ascending: false })
    .limit(500);

  if (userId) query = query.eq('user_id', userId);
  if (action) query = query.ilike('action', `%${action}%`);
  if (resource) query = query.ilike('resource', `%${resource}%`);
  if (from) query = query.gte('created_at', from);
  if (to) query = query.lte('created_at', to);
  if (ip) query = query.ilike('ip_address', `%${ip}%`);

  const { data, error: dbError } = await query;
  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 });
  }

  const userIds = [...new Set((data || []).map((l: any) => l.user_id).filter(Boolean))];
  const { data: users } = userIds.length
    ? await supabase.from('users').select('id, name, email').in('id', userIds)
    : { data: [] };
  const userMap = new Map((users || []).map((u: any) => [u.id, u]));

  const enriched = (data || []).map((l: any) => ({
    ...l,
    user: userMap.get(l.user_id) || null,
  }));

  return NextResponse.json(enriched);
}
