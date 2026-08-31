import { logger } from '@/lib/logger';
import { NextRequest, NextResponse } from 'next/server';
import { upload_presignBodySchema } from '@/lib/schemas';
import { getSupabase } from '@/lib/supabase';
import { getUserFromToken } from '@/lib/auth';
import { v4 as uuid } from 'uuid';

const BUCKET = 'uploads';

export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromToken(req);
    if (!user) return NextResponse.json({ error: 'Nao autorizado' }, { status: 401 });

    const bodyRaw1 = await req.json();
    const parsed1 = upload_presignBodySchema.safeParse(bodyRaw1);
    if (!parsed1.success) return NextResponse.json(parsed1.error.issues, { status: 400 });
    const { fileName, contentType, size } = bodyRaw1;
    if (!fileName) return NextResponse.json({ error: 'fileName obrigatorio' }, { status: 400 });

    const MAX_SIZE = 100 * 1024 * 1024;
    if (size && size > MAX_SIZE) {
      return NextResponse.json({ error: 'Arquivo excede 100 MB' }, { status: 400 });
    }

    const ext = fileName.split('.').pop()?.toLowerCase() || 'jpg';
    const uploadId = uuid();
    const savedName = `${uploadId}.${ext}`;

    const supabase = getSupabase();

    // Gerar signed upload URL - cliente vai fazer PUT direto no Supabase
    const { data, error } = await supabase.storage
      .from(BUCKET)
      .createSignedUploadUrl(savedName);

    if (error) {
      logger.error('Presign error:', error);
      return NextResponse.json({ error: 'Erro ao gerar URL' }, { status: 500 });
    }

    const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(savedName);
    const publicUrl = pub.publicUrl;

    // Derivadas - usar a propria original (Instagram ajusta proporcao)
    const derivatives: Record<string, string> = {};
    if (['jpg', 'jpeg', 'png', 'webp'].includes(ext)) {
      derivatives.instagram_1x1 = publicUrl;
      derivatives.instagram_4x5 = publicUrl;
      derivatives.linkedin_1x1 = publicUrl;
      derivatives['linkedin_1.9x1'] = publicUrl;
    }

    // Registrar no banco
    const { error: dbErr } = await supabase
      .from('uploads')
      .insert({ id: uploadId, team_id: user.teamId, file_name: fileName, mime_type: contentType || '', size: size || 0, url: publicUrl });
    if (dbErr) {
      logger.error('Upload db insert error:', dbErr);
    }

    return NextResponse.json({
      id: uploadId,
      signedUrl: data.signedUrl,
      path: data.path,
      publicUrl,
      derivatives,
      token: data.token,
    });
  } catch (err: any) {
    logger.error('Presign error:', err);
    return NextResponse.json({ error: err.message || 'Erro interno' }, { status: 500 });
  }
}
