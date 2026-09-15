import { logger } from '@/lib/logger';
import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import { getUserFromToken } from '@/lib/auth';
import { v4 as uuid } from 'uuid';

const BUCKET = 'uploads';
const MAX_SIZE = 100 * 1024 * 1024;

// Upload simples via servidor (evita CORS do PUT direto no Supabase Storage)
export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromToken(req);
    if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

    const form = await req.formData();
    const file = form.get('file') as File | null;
    if (!file) return NextResponse.json({ error: 'file obrigatório' }, { status: 400 });
    if (file.size > MAX_SIZE) return NextResponse.json({ error: 'Arquivo excede 100 MB' }, { status: 400 });

    const ext = file.name.split('.').pop()?.toLowerCase() || 'bin';
    const uploadId = uuid();
    const savedName = `${uploadId}.${ext}`;

    const supabase = getSupabase();
    const buffer = Buffer.from(await file.arrayBuffer());

    const { error: upErr } = await supabase.storage
      .from(BUCKET)
      .upload(savedName, buffer, { contentType: file.type || 'application/octet-stream', upsert: false });
    if (upErr) {
      logger.error('Simple upload storage error:', upErr);
      return NextResponse.json({ error: 'Erro ao enviar arquivo para o storage' }, { status: 500 });
    }

    const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(savedName);
    const publicUrl = pub.publicUrl;

    const derivatives: Record<string, string> = {};
    if (['jpg', 'jpeg', 'png', 'webp'].includes(ext)) {
      derivatives.instagram_1x1 = publicUrl;
      derivatives.instagram_4x5 = publicUrl;
      derivatives.linkedin_1x1 = publicUrl;
      derivatives['linkedin_1.9x1'] = publicUrl;
    }

    const { error: dbErr } = await supabase
      .from('uploads')
      .insert({ id: uploadId, team_id: user.teamId, file_name: file.name, mime_type: file.type || '', size: file.size, url: publicUrl });
    if (dbErr) logger.error('Upload db insert error:', dbErr);

    return NextResponse.json({ id: uploadId, url: publicUrl, fileName: file.name, contentType: file.type, size: file.size, derivatives });
  } catch (err: any) {
    logger.error('Simple upload error:', err);
    return NextResponse.json({ error: err.message || 'Erro interno' }, { status: 500 });
  }
}
