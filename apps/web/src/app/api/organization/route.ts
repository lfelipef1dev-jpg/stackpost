import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';

// Organization info and settings
export async function GET(req: NextRequest) {
  const supabase = getSupabase();
  // TODO: Organization info and settings
  return NextResponse.json({ ok: true, endpoint: 'organization', method: 'GET' });
}

export async function PATCH(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const supabase = getSupabase();
  // TODO: Organization info and settings
  return NextResponse.json({ ok: true, endpoint: 'organization', method: 'PATCH' });
}

