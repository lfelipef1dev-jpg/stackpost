import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';

// Get/delete comment
export async function GET(req: NextRequest) {
  const supabase = getSupabase();
  // TODO: Get/delete comment
  return NextResponse.json({ ok: true, endpoint: 'comments/[id]', method: 'GET' });
}

export async function DELETE(req: NextRequest) {
  const supabase = getSupabase();
  // TODO: Get/delete comment
  return NextResponse.json({ ok: true, endpoint: 'comments/[id]', method: 'DELETE' });
}

