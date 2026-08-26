import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';

// Retry failed comment
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const supabase = getSupabase();
  // TODO: Retry failed comment
  return NextResponse.json({ ok: true, endpoint: 'comments/[id]/retry', method: 'POST' });
}

