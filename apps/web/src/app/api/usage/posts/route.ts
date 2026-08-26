import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';

// Post usage stats
export async function GET(req: NextRequest) {
  const supabase = getSupabase();
  // TODO: Post usage stats
  return NextResponse.json({ ok: true, endpoint: 'usage/posts', method: 'GET' });
}

