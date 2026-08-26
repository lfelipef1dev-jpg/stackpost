import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import { getUserFromToken } from '@/lib/auth';
import { writeFile, mkdir } from 'fs/promises';
import { v4 as uuid } from 'uuid';
import path from 'path';

const PUBLIC_UPLOADS = 'C:/Users/lfeli/Desktop/StackPost/apps/web/public/uploads';

export async function POST(req: NextRequest) {
  const user = await getUserFromToken(req);
  if (!user) return NextResponse.json({ error: 'Nao autorizado' }, { status: 401 });

  const body = await req.json();
  const { url, fileName, mimeType } = body;

  if (!url || !url.startsWith('http')) {
    return NextResponse.json({ error: 'URL invalida' }, { status: 400 });
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 60000);

    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);

    if (!res.ok) {
      return NextResponse.json({ error: `Falha ao baixar: ${res.status}` }, { status: 400 });
    }

    const contentLength = parseInt(res.headers.get('content-length') || '0');
    if (contentLength > 1073741824) {
      return NextResponse.json({ error: 'Arquivo excede 1GB' }, { status: 400 });
    }

    const buffer = Buffer.from(await res.arrayBuffer());
    const id = uuid();
    const ext = url.split('.').pop()?.split('?')[0]?.toLowerCase() || 'jpg';
    const savedName = `${id}.${ext}`;

    await mkdir(PUBLIC_UPLOADS, { recursive: true });
    await writeFile(path.join(PUBLIC_UPLOADS, savedName), buffer);

    const publicUrl = `/uploads/${savedName}`;

    try {
      const supabase = getSupabase();
      const { error } = await supabase
        .from('uploads')
        .insert({ team_id: user.teamId, file_name: fileName || url.split('/').pop() || 'file', mime_type: mimeType || 'application/octet-stream', size: buffer.length, url: publicUrl });
      if (error) throw error;
    } catch {}

    return NextResponse.json({ id: savedName, url: publicUrl, size: buffer.length });
  } catch (err: any) {
    if (err.name === 'AbortError') {
      return NextResponse.json({ error: 'Timeout ao baixar (60s)' }, { status: 408 });
    }
    console.error(err);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
