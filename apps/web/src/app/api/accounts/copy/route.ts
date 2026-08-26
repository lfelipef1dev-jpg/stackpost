import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';

// Copy account to another team
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const supabase = getSupabase();
  // TODO: Copy account to another team
  return NextResponse.json({ ok: true, endpoint: 'accounts/copy', method: 'POST' });
}

