import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';

// Import usage stats
export async function GET(req: NextRequest) {
  const supabase = getSupabase();
  // TODO: Import usage stats
  return NextResponse.json({ ok: true, endpoint: 'usage/imports', method: 'GET' });
}

