import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';

// Retry failed post
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const supabase = getSupabase();
  // TODO: Retry failed post
  return NextResponse.json({ ok: true, endpoint: 'posts/[id]/retry', method: 'POST' });
}

