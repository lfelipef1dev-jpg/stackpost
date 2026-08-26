import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';

// Get post by reference key
export async function GET(req: NextRequest) {
  const supabase = getSupabase();
  // TODO: Get post by reference key
  return NextResponse.json({ ok: true, endpoint: 'posts/reference-key/[referenceKey]', method: 'GET' });
}

