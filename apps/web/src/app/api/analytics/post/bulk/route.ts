import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';

// Bulk post analytics
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const supabase = getSupabase();
  // TODO: Bulk post analytics
  return NextResponse.json({ ok: true, endpoint: 'analytics/post/bulk', method: 'POST' });
}

