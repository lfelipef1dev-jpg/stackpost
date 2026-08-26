import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';

// Disconnect social account
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const supabase = getSupabase();
  // TODO: Disconnect social account
  return NextResponse.json({ ok: true, endpoint: 'accounts/disconnect', method: 'POST' });
}

