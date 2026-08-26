import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';

// List imported comments
export async function GET(req: NextRequest) {
  const supabase = getSupabase();
  // TODO: List imported comments
  return NextResponse.json({ ok: true, endpoint: 'comments/import/comments', method: 'GET' });
}

