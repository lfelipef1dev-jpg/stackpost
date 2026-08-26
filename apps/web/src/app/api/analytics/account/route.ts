import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';

// Account analytics
export async function GET(req: NextRequest) {
  const supabase = getSupabase();
  // TODO: Account analytics
  return NextResponse.json({ ok: true, endpoint: 'analytics/account', method: 'GET' });
}

