import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import { requireRole, PERMISSIONS } from '@/lib/rbac';
import { adaptForAllPlatforms } from '@/lib/cross-post';

export async function POST(req: NextRequest) {
  const { user, error } = await requireRole(req, PERMISSIONS.EDIT);
  if (error) return error;

  const body = await req.json();
  const { content, platforms, hashtags } = body;

  if (!content || !platforms || !Array.isArray(platforms)) {
    return NextResponse.json({ error: 'content e platforms[] obrigatorios' }, { status: 400 });
  }

  const adaptations = adaptForAllPlatforms(content, platforms, hashtags || []);
  return NextResponse.json({ adaptations });
}
