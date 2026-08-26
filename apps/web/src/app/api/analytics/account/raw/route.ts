import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';

// Raw account analytics
export async function GET(req: NextRequest) {
  const supabase = getSupabase();
  // TODO: Raw account analytics
  return NextResponse.json({ ok: true, endpoint: 'analytics/account/raw', method: 'GET' });
}

