import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';

// Refresh profile data
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const supabase = getSupabase();
  // TODO: Refresh profile data
  return NextResponse.json({ ok: true, endpoint: 'accounts/profile-refresh', method: 'POST' });
}

