import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';

// List accounts by platform type
export async function GET(req: NextRequest) {
  const supabase = getSupabase();
  // TODO: List accounts by platform type
  return NextResponse.json({ ok: true, endpoint: 'accounts/by-type', method: 'GET' });
}

