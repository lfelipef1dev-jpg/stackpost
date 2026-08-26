import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';

// Connect social account
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const supabase = getSupabase();
  // TODO: Connect social account
  return NextResponse.json({ ok: true, endpoint: 'accounts/connect', method: 'POST' });
}

