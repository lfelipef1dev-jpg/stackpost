import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';

// Import comments
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const supabase = getSupabase();
  // TODO: Import comments
  return NextResponse.json({ ok: true, endpoint: 'comments/import', method: 'POST' });
}

