import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';

// Comment usage stats
export async function GET(req: NextRequest) {
  const supabase = getSupabase();
  // TODO: Comment usage stats
  return NextResponse.json({ ok: true, endpoint: 'usage/comments', method: 'GET' });
}

