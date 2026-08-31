import { logger } from '@/lib/logger';
import { NextRequest, NextResponse } from 'next/server';
import { upload_finalizeBodySchema } from '@/lib/schemas';
import { getSupabase } from '@/lib/supabase';
import { getUserFromToken } from '@/lib/auth';
import { writeFile } from 'fs/promises';
import path from 'path';

const PUBLIC_UPLOADS = 'C:/Users/lfeli/Desktop/StackPost/apps/web/public/uploads';

export async function POST(req: NextRequest) {
  const user = await getUserFromToken(req);
  if (!user) return NextResponse.json({ error: 'Nao autorizado' }, { status: 401 });

  const bodyRaw1 = await req.json();
  const parsed1 = upload_finalizeBodySchema.safeParse(bodyRaw1);
  if (!parsed1.success) return NextResponse.json(parsed1.error.issues, { status: 400 });
  const body = bodyRaw1;
  const { path: savedName, fileName, mimeType, size } = body;

  if (!savedName) {
    return NextResponse.json({ error: 'path obrigatorio' }, { status: 400 });
  }

  const filePath = path.join(PUBLIC_UPLOADS, savedName);
  const publicUrl = `/uploads/${savedName}`;

  try {
    const supabase = getSupabase();
    const { error } = await supabase
      .from('uploads')
      .insert({ team_id: user.teamId, file_name: fileName || savedName, mime_type: mimeType || 'application/octet-stream', size: size || 0, url: publicUrl })
      .select()
      .single();
    if (error) throw error;
  } catch (e) {
    logger.error('DB error on finalize:', e);
  }

  return NextResponse.json({ id: savedName, url: publicUrl });
}
