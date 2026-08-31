import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import { requireAdmin } from '@/lib/rbac';

export async function GET(req: NextRequest) {
  const { error } = await requireAdmin(req, 'comments.read');
  if (error) return error;

  const supabase = getSupabase();
  const { data, error: dbError } = await supabase
    .from('comments')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(500);

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 });
  }

  return NextResponse.json(data || []);
}
