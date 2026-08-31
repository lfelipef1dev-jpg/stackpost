import { NextRequest, NextResponse } from 'next/server';
import { cross_postBodySchema } from '@/lib/schemas';
import { getSupabase } from '@/lib/supabase';
import { requireRole, PERMISSIONS } from '@/lib/rbac';
import { adaptForAllPlatforms } from '@/lib/cross-post';

export async function POST(req: NextRequest) {
  const { user, error } = await requireRole(req, PERMISSIONS.EDIT);
  if (error) return error;

  const bodyRaw1 = await req.json();
  const parsed1 = cross_postBodySchema.safeParse(bodyRaw1);
  if (!parsed1.success) return NextResponse.json(parsed1.error.issues, { status: 400 });
  const body = bodyRaw1;
  const { content, platforms, hashtags } = body;

  if (!content || !platforms || !Array.isArray(platforms)) {
    return NextResponse.json({ error: 'content e platforms[] obrigatorios' }, { status: 400 });
  }

  const adaptations = adaptForAllPlatforms(content, platforms, hashtags || []);
  return NextResponse.json({ adaptations });
}
