import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';

// Force refresh post analytics
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const supabase = getSupabase();
  // TODO: Force refresh post analytics
  return NextResponse.json({ ok: true, endpoint: 'analytics/post/force', method: 'POST' });
}

