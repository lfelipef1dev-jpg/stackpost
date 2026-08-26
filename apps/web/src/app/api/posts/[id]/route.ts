import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';

// Get/update/delete single post
export async function GET(req: NextRequest) {
  const supabase = getSupabase();
  // TODO: Get/update/delete single post
  return NextResponse.json({ ok: true, endpoint: 'posts/[id]', method: 'GET' });
}

export async function DELETE(req: NextRequest) {
  const supabase = getSupabase();
  // TODO: Get/update/delete single post
  return NextResponse.json({ ok: true, endpoint: 'posts/[id]', method: 'DELETE' });
}

export async function PATCH(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const supabase = getSupabase();
  // TODO: Get/update/delete single post
  return NextResponse.json({ ok: true, endpoint: 'posts/[id]', method: 'PATCH' });
}

