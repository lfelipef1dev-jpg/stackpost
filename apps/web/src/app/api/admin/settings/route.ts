import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import { requireAdmin } from '@/lib/rbac';
import { logAudit } from '@/lib/audit';

export async function GET(req: NextRequest) {
  const { error } = await requireAdmin(req, 'settings.read');
  if (error) return error;

  const supabase = getSupabase();
  const { data, error: dbError } = await supabase.from('admin_settings').select('*').order('key', { ascending: true });
  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 });
  }
  return NextResponse.json(data || []);
}

export async function POST(req: NextRequest) {
  const { admin, error } = await requireAdmin(req, 'settings.write');
  if (error) return error;

  const body = await req.json();
  const supabase = getSupabase();
  const { data, error: dbError } = await supabase.from('admin_settings').upsert(body, { onConflict: 'key' }).select().single();
  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 });
  }

  await logAudit({
    userId: admin.id,
    action: 'admin.setting.update',
    resource: 'admin_settings',
    resourceId: data.key,
    metadata: body,
    ip: req.headers.get('x-forwarded-for') || undefined,
    userAgent: req.headers.get('user-agent') || undefined,
  });

  return NextResponse.json(data);
}
