import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';

// Unset channel
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const supabase = getSupabase();
  // TODO: Unset channel
  return NextResponse.json({ ok: true, endpoint: 'accounts/unset-channel', method: 'POST' });
}

