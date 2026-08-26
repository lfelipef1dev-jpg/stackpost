import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';

// Force refresh account analytics
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const supabase = getSupabase();
  // TODO: Force refresh account analytics
  return NextResponse.json({ ok: true, endpoint: 'analytics/account/force', method: 'POST' });
}

