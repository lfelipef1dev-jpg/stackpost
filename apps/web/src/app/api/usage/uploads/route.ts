import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';

// Upload usage stats
export async function GET(req: NextRequest) {
  const supabase = getSupabase();
  // TODO: Upload usage stats
  return NextResponse.json({ ok: true, endpoint: 'usage/uploads', method: 'GET' });
}

