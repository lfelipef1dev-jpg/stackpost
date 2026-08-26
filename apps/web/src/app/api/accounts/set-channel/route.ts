import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';

// Set channel for account
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const supabase = getSupabase();
  // TODO: Set channel for account
  return NextResponse.json({ ok: true, endpoint: 'accounts/set-channel', method: 'POST' });
}

