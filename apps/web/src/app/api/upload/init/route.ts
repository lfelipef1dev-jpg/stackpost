import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import { getUserFromToken } from '@/lib/auth';
import { v4 as uuid } from 'uuid';
import { mkdir } from 'fs/promises';
import path from 'path';

const PUBLIC_UPLOADS = 'C:/Users/lfeli/Desktop/StackPost/apps/web/public/uploads';
const MAX_DIRECT = 5 * 1024 * 1024 * 1024; // 5 GiB

export async function POST(req: NextRequest) {
  const user = await getUserFromToken(req);
  if (!user) return NextResponse.json({ error: 'Nao autorizado' }, { status: 401 });

  const body = await req.json();
  const { fileName, mimeType, fileSize, teamId } = body;

  if (!fileName || !mimeType) {
    return NextResponse.json({ error: 'fileName e mimeType obrigatorios' }, { status: 400 });
  }

  if (fileSize && fileSize > MAX_DIRECT) {
    return NextResponse.json({ error: 'Arquivo excede 5 GiB. Use multipart.' }, { status: 400 });
  }

  const id = uuid();
  const ext = fileName.split('.').pop()?.toLowerCase() || 'bin';
  const savedName = `${id}.${ext}`;
  const filePath = path.join(PUBLIC_UPLOADS, savedName);

  await mkdir(PUBLIC_UPLOADS, { recursive: true });

  const publicUrl = `/uploads/${savedName}`;

  return NextResponse.json({
    url: publicUrl,
    path: savedName,
    uploadPath: filePath,
    expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
  });
}
