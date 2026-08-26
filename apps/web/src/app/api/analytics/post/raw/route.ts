import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';

// Raw post analytics
export async function GET(req: NextRequest) {
  const supabase = getSupabase();
  // TODO: Raw post analytics
  return NextResponse.json({ ok: true, endpoint: 'analytics/post/raw', method: 'GET' });
}

