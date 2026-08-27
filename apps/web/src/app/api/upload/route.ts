import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import { getUserFromToken } from '@/lib/auth';
import { v4 as uuid } from 'uuid';

const BUCKET = 'uploads';
const MAX_SIZE = 100 * 1024 * 1024; // 100 MB

async function processAndSave(file: File, teamId: string): Promise<{ id: string; url: string; derivatives: Record<string, string> }> {
  const bytes = await file.arrayBuffer();
  const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  const id = uuid();
  const savedName = `${id}.${ext}`;

  if (file.size > MAX_SIZE) {
    throw new Error('Arquivo excede 100 MB');
  }

  const supabase = getSupabase();

  // Upload original pro Supabase Storage
  const { error: upErr } = await supabase
    .storage
    .from(BUCKET)
    .upload(savedName, bytes, { contentType: file.type, upsert: false });
  if (upErr) throw upErr;

  const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(savedName);
  const publicUrl = pub.publicUrl;

  const derivatives: Record<string, string> = {};

  // Para imagens, gerar derivadas via edge function ou pular (publicar original)
  // No Cloudflare Worker nao temos PIL/ffmpeg, entao publicamos a original.
  // As derivadas serao geradas por um servico separado (supabase function ou worker dedicado).
  if (['jpg', 'jpeg', 'png', 'webp'].includes(ext)) {
    // Por enquanto, usar a propria original como derivada (proporcao sera ajustada pelo Instagram)
    derivatives.instagram_1x1 = publicUrl;
    derivatives.instagram_4x5 = publicUrl;
    derivatives.linkedin_1x1 = publicUrl;
    derivatives['linkedin_1.9x1'] = publicUrl;
  }

  // Registrar no banco
  try {
    const { error } = await supabase
      .from('uploads')
      .insert({ team_id: teamId, file_name: file.name, mime_type: file.type, size: file.size, url: publicUrl });
    if (error) throw error;
  } catch {}

  return { id: savedName, url: publicUrl, derivatives };
}

export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromToken(req);
    if (!user) return NextResponse.json({ error: 'Nao autorizado' }, { status: 401 });

    const contentType = req.headers.get('content-type') || '';

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const file = formData.get('file') as File;
      if (!file) return NextResponse.json({ error: 'Arquivo nao enviado' }, { status: 400 });
      const result = await processAndSave(file, user.teamId);
      return NextResponse.json(result);
    }

    return NextResponse.json({ error: 'Content-type nao suportado' }, { status: 400 });
  } catch (err: any) {
    console.error('Upload error:', err);
    return NextResponse.json({ error: err.message || 'Erro no upload' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const user = await getUserFromToken(req);
  if (!user) return NextResponse.json({ error: 'Nao autorizado' }, { status: 401 });

  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('uploads')
      .select('id, file_name, mime_type, size, url, created_at')
      .eq('team_id', user.teamId)
      .order('created_at', { ascending: false })
      .limit(100);
    if (error) throw error;
    return NextResponse.json(data);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
