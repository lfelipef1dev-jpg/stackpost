import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';

// Post analytics
export async function GET(req: NextRequest) {
  const supabase = getSupabase();
  // TODO: Post analytics
  return NextResponse.json({ ok: true, endpoint: 'analytics/post', method: 'GET' });
}

