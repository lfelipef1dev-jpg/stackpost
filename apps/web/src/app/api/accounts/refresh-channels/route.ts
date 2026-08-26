import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';

// Refresh channels
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const supabase = getSupabase();
  // TODO: Refresh channels
  return NextResponse.json({ ok: true, endpoint: 'accounts/refresh-channels', method: 'POST' });
}

