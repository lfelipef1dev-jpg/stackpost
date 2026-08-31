import { logger } from '@/lib/logger';
﻿import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';

// Cron: Limpar uploads temporarios antigos (mais de 7 dias)
// Trigger: Cloudflare Workers Cron Triggers (diario)
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Nao autorizado' }, { status: 401 });
  }

  try {
    const supabase = getSupabase();
    const now = new Date().toISOString();
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

    // Buscar uploads antigos nao associados a posts
    const { data: uploads, error } = await supabase
      .from('uploads')
      .select('id, url, storage_path, team_id')
      .lt('created_at', sevenDaysAgo)
      .is('post_id', null)
      .limit(100);

    if (error) throw error;

    let cleaned = 0;
    let storageDeleted = 0;
    let storageFailed = 0;

    for (const upload of uploads || []) {
      // Deletar do Supabase Storage se tiver bucket/path
      const bucketName = process.env.UPLOADS_BUCKET || 'uploads';
      const path = upload.storage_path || upload.url?.split(`/storage/v1/object/${bucketName}/`)[1];

      if (path) {
        const { error: storageErr } = await supabase.storage
          .from(bucketName)
          .remove([path]);
        if (storageErr) {
          logger.warn(`Storage delete failed for ${upload.id}:`, storageErr.message);
          storageFailed++;
        } else {
          storageDeleted++;
        }
      }

      // Deletar do banco
      const { error: delErr } = await supabase.from('uploads').delete().eq('id', upload.id);
      if (!delErr) cleaned++;
    }

    return NextResponse.json({
      ok: true,
      cron: 'cleanup-uploads',
      cleaned,
      storageDeleted,
      storageFailed,
      total: (uploads || []).length,
      timestamp: now,
    });
  } catch (err: any) {
    logger.error('Cron cleanup-uploads error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  return GET(req);
}
