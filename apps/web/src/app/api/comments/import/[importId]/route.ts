import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';

// Get import status
export async function GET(req: NextRequest) {
  const supabase = getSupabase();
  // TODO: Get import status
  return NextResponse.json({ ok: true, endpoint: 'comments/import/[importId]', method: 'GET' });
}

