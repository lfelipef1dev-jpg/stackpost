import { logger } from '@/lib/logger';
import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import { requireRole, PERMISSIONS } from '@/lib/rbac';
import { v4 as uuid } from 'uuid';
import { mkdir, writeFile, appendFile, stat } from 'fs/promises';
import path from 'path';

const PUBLIC_UPLOADS = 'C:/Users/lfeli/Desktop/StackPost/apps/web/public/uploads';
const TUS_VERSION = '1.0.0';
const TUS_MAX_SIZE = 5 * 1024 * 1024 * 1024; // 5 GB

export async function POST(req: NextRequest) {
  const { user, error } = await requireRole(req, PERMISSIONS.EDIT);
  if (error) return error;

  const tusResumable = req.headers.get('tus-resumable');
  if (!tusResumable) {
    return NextResponse.json(
      { error: 'Tus-Resumable header obrigatorio' },
      { status: 400, headers: { 'Tus-Version': TUS_VERSION, 'Tus-Resumable': TUS_VERSION } }
    );
  }

  const uploadLength = parseInt(req.headers.get('upload-length') || '0');
  const uploadMetadata = req.headers.get('upload-metadata');

  if (!uploadLength || uploadLength > TUS_MAX_SIZE) {
    return NextResponse.json(
      { error: 'Upload-Length invalido ou muito grande' },
      { status: 413, headers: { 'Tus-Version': TUS_VERSION, 'Tus-Max-Size': String(TUS_MAX_SIZE) } }
    );
  }

  const uploadId = uuid();
  const fileName = uploadMetadata
    ? Buffer.from(uploadMetadata.split(',')[0].split(' ').pop() || '', 'base64').toString()
    : `${uploadId}.bin`;

  const ext = fileName.split('.').pop()?.toLowerCase() || 'bin';
  const savedName = `${uploadId}.${ext}`;
  const filePath = path.join(PUBLIC_UPLOADS, savedName);

  await mkdir(PUBLIC_UPLOADS, { recursive: true });
  await writeFile(filePath, '');

  try {
    const supabase = getSupabase();
    const { error } = await supabase
      .from('tus_uploads')
      .insert({ id: uploadId, team_id: user!.teamId, file_name: fileName, file_path: savedName, upload_length: uploadLength, uploaded_offset: 0, status: 'uploading' });
    if (error) throw error;
  } catch (e) {
    // table might not exist, continue
  }

  return new NextResponse(null, {
    status: 201,
    headers: {
      'Location': `/api/upload/tus/${uploadId}`,
      'Tus-Resumable': TUS_VERSION,
      'Tus-Version': TUS_VERSION,
      'Tus-Max-Size': String(TUS_MAX_SIZE),
    },
  });
}

export async function PATCH(req: NextRequest) {
  const { user, error } = await requireRole(req, PERMISSIONS.EDIT);
  if (error) return error;

  const url = new URL(req.url);
  const pathParts = url.pathname.split('/');
  const uploadId = pathParts[pathParts.length - 1];

  if (!uploadId) {
    return NextResponse.json({ error: 'Upload ID obrigatorio' }, { status: 400 });
  }

  const uploadOffset = parseInt(req.headers.get('upload-offset') || '0');
  const contentType = req.headers.get('content-type') || '';

  if (!contentType.includes('application/offset+octet-stream')) {
    return NextResponse.json({ error: 'Content-Type deve ser application/offset+octet-stream' }, { status: 400 });
  }

  try {
    let uploadInfo: any = null;
    try {
      const supabase = getSupabase();
      const { data, error } = await supabase
        .from('tus_uploads')
        .select('*')
        .eq('id', uploadId)
        .eq('team_id', user!.teamId)
        .single();
      if (!error) uploadInfo = data;
    } catch {}

    if (!uploadInfo && !uploadInfo) {
      // fallback: check if file exists
    }

    const savedName = uploadInfo?.file_path || `${uploadId}.bin`;
    const filePath = path.join(PUBLIC_UPLOADS, savedName);

    const bodyBuffer = Buffer.from(await req.arrayBuffer());
    await appendFile(filePath, bodyBuffer);

    const newOffset = uploadOffset + bodyBuffer.length;
    const uploadLength = uploadInfo?.upload_length || 0;

    try {
      const supabase = getSupabase();
      const { error } = await supabase
        .from('tus_uploads')
        .update({ uploaded_offset: newOffset, status: newOffset >= uploadLength ? 'completed' : 'uploading' })
        .eq('id', uploadId);
      if (error) throw error;
    } catch {}

    if (newOffset >= uploadLength && uploadLength > 0) {
      const publicUrl = `/uploads/${savedName}`;
      try {
        const supabase = getSupabase();
        const { error } = await supabase
          .from('uploads')
          .insert({ team_id: user!.teamId, file_name: uploadInfo?.file_name || savedName, mime_type: 'application/octet-stream', size: newOffset, url: publicUrl })
          .select()
          .single();
        if (error) throw error;
      } catch {}
    }

    return new NextResponse(null, {
      status: 204,
      headers: {
        'Upload-Offset': String(newOffset),
        'Tus-Resumable': TUS_VERSION,
      },
    });
  } catch (err: any) {
    logger.error((err as string));
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

export async function HEAD(req: NextRequest) {
  const { user, error } = await requireRole(req, PERMISSIONS.VIEW);
  if (error) return error;

  const url = new URL(req.url);
  const pathParts = url.pathname.split('/');
  const uploadId = pathParts[pathParts.length - 1];

  if (!uploadId) {
    return NextResponse.json({ error: 'Upload ID obrigatorio' }, { status: 400 });
  }

  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('tus_uploads')
      .select('*')
      .eq('id', uploadId)
      .eq('team_id', user!.teamId)
      .single();
    const upload = (!error && data) ? data : null;

    if (!upload) {
      return new NextResponse(null, { status: 404, headers: { 'Tus-Resumable': TUS_VERSION } });
    }

    return new NextResponse(null, {
      status: 200,
      headers: {
        'Upload-Offset': String(upload.uploaded_offset || 0),
        'Upload-Length': String(upload.upload_length || 0),
        'Tus-Resumable': TUS_VERSION,
      },
    });
  } catch {
    return new NextResponse(null, { status: 404, headers: { 'Tus-Resumable': TUS_VERSION } });
  }
}
