import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import { requireAdmin } from '@/lib/rbac';

export async function GET(req: NextRequest) {
  const { error } = await requireAdmin(req, 'posts.read');
  if (error) return error;

  const supabase = getSupabase();
  const now = new Date().toISOString();
  const { data, error: dbError } = await supabase
    .from('posts')
    .select('*')
    .in('status', ['SCHEDULED', 'PROCESSING'])
    .or(`scheduled_at.gte.${now},published_at.is.null`)
    .order('scheduled_at', { ascending: true })
    .limit(500);

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 });
  }

  return NextResponse.json(data || []);
}
