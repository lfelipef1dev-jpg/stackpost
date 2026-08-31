import { logger } from '@/lib/logger';
import { NextRequest, NextResponse } from 'next/server';
import { upload_multipartBodySchema, upload_multipartQuerySchema } from '@/lib/schemas';
import { getSupabase } from '@/lib/supabase';
import { getUserFromToken } from '@/lib/auth';
import { v4 as uuid } from 'uuid';
import { mkdir, appendFile, stat } from 'fs/promises';
import path from 'path';

const PUBLIC_UPLOADS = 'C:/Users/lfeli/Desktop/StackPost/apps/web/public/uploads';
const PART_SIZE = 64 * 1024 * 1024; // 64 MiB
const MAX_PARTS = 10000;

export async function POST(req: NextRequest) {
  const user = await getUserFromToken(req);
  if (!user) return NextResponse.json({ error: 'Nao autorizado' }, { status: 401 });

  const url = new URL(req.url);
  const action = url.searchParams.get('action') || 'init';

  if (action === 'init') {
    const bodyRaw1 = await req.json();
    const parsed1 = upload_multipartBodySchema.safeParse(bodyRaw1);
    if (!parsed1.success) return NextResponse.json(parsed1.error.issues, { status: 400 });
    const body = bodyRaw1;
    const { fileName, mimeType, fileSize } = body;

    if (!fileName) return NextResponse.json({ error: 'fileName obrigatorio' }, { status: 400 });
    if (fileSize && fileSize > MAX_PARTS * PART_SIZE) {
      return NextResponse.json({ error: 'Arquivo muito grande' }, { status: 400 });
    }

    const uploadId = uuid();
    const id = uuid();
    const ext = fileName.split('.').pop()?.toLowerCase() || 'bin';
    const savedName = `${id}.${ext}`;
    const numParts = Math.ceil((fileSize || 0) / PART_SIZE);

    await mkdir(PUBLIC_UPLOADS, { recursive: true });

    const parts = Array.from({ length: numParts }, (_, i) => ({
      partNumber: i + 1,
      url: `/api/upload/multipart?partNumber=${i + 1}&uploadId=${uploadId}&path=${savedName}`,
    }));

    return NextResponse.json({
      uploadId,
      path: savedName,
      partSize: PART_SIZE,
      parts,
    });
  }

  if (action === 'complete') {
    const bodyRaw2 = await req.json();
    const parsed2 = upload_multipartBodySchema.safeParse(bodyRaw2);
    if (!parsed2.success) return NextResponse.json(parsed2.error.issues, { status: 400 });
    const body = bodyRaw2;
    const { path: savedName, uploadId, parts, fileName, mimeType, size } = body;

    if (!savedName || !uploadId) {
      return NextResponse.json({ error: 'path e uploadId obrigatorios' }, { status: 400 });
    }

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
      logger.error('DB error on multipart complete:', e);
    }

    return NextResponse.json({ id: savedName, url: publicUrl, parts: parts?.length || 0 });
  }

  if (action === 'abort') {
    const bodyRaw3 = await req.json();
    const parsed3 = upload_multipartBodySchema.safeParse(bodyRaw3);
    if (!parsed3.success) return NextResponse.json(parsed3.error.issues, { status: 400 });
    const body = bodyRaw3;
    const { path: savedName } = body;
    // Cleanup partial parts would go here
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: 'Acao invalida' }, { status: 400 });
}

export async function PUT(req: NextRequest) {
  const user = await getUserFromToken(req);
  if (!user) return NextResponse.json({ error: 'Nao autorizado' }, { status: 401 });

  const url = new URL(req.url);
  const partNumber = parseInt(url.searchParams.get('partNumber') || '0');
  const savedName = url.searchParams.get('path');

  if (!partNumber || !savedName) {
    return NextResponse.json({ error: 'partNumber e path obrigatorios' }, { status: 400 });
  }

  const partPath = path.join(PUBLIC_UPLOADS, `${savedName}.part.${partNumber}`);
  const buffer = Buffer.from(await req.arrayBuffer());
  await appendFile(partPath, buffer);

  const etag = `"${Date.now().toString(16)}${buffer.length.toString(16)}"`;

  return NextResponse.json({ partNumber, etag }, { headers: { ETag: etag } });
}
