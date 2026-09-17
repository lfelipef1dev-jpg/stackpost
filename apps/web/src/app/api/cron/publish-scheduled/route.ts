import { logger } from '@/lib/logger';
import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import { publishPost } from '@/lib/publisher';
import { requireCronAuth } from '@/lib/cron-auth';

// Cron: Publicar posts agendados cuja scheduled_at chegou
// Trigger: Cloudflare Workers Cron Triggers (a cada 1 minuto)
export async function GET(req: NextRequest) {
  const denied = requireCronAuth(req);
  if (denied) return denied;

  try {
    const supabase = getSupabase();
    const now = new Date().toISOString();

    // Buscar posts agendados cuja data chegou
    // Resgata posts travados em 'processing' ha mais de 10min (worker morreu no meio)
    // posts nao tem updated_at — usa published_at/created_at como referencia
    const stale = new Date(Date.now() - 10 * 60 * 1000).toISOString();
    await supabase
      .from('posts')
      .update({ status: 'scheduled' })
      .eq('status', 'processing')
      .or(`published_at.lt.${stale},published_at.is.null`)
      .lt('created_at', stale);

    // postId via fila: publica esse post especifico (ja verificado como devido
    // quando foi enfileirado pelo cron). Sem postId: modo legado — pega o mais
    // antigo devido (usado por chamadas manuais/diagnostico).
    const postId = req.nextUrl.searchParams.get('postId');
    const { data: posts, error } = postId
      ? await supabase.from('posts').select('id').eq('id', postId).in('status', ['scheduled', 'processing'])
      : await supabase
          .from('posts')
          .select('id')
          .eq('status', 'scheduled')
          .lte('scheduled_at', now)
          .order('scheduled_at', { ascending: true })
          .limit(1);

    if (error) throw error;

    let published = 0;
    let failed = 0;
    let deferred = 0;
    const errors: any[] = [];

    // Processa em blocos de 5 posts concorrentes — cada post ja publica suas
    // redes em paralelo; antes era 1 post por vez e o tick morria no meio
    // 1 post por chamada — um post com video nas 5 redes gasta ~40 subrequests
    // e o Worker so permite 50 por invocacao. O worker chama esta rota em loop
    // via HTTP publico (cada chamada = invocacao nova com budget proprio).
    const list = posts || [];
    for (let i = 0; i < list.length; i += 1) {
      const chunk = list.slice(i, i + 1);
      const settled = await Promise.allSettled(chunk.map((post) => publishPost(post.id)));
      for (let j = 0; j < settled.length; j++) {
        const s = settled[j];
        if (s.status === 'fulfilled') {
          const result = s.value as any;
          if (result.status === 'posted') {
            published++;
          } else if (result.status === 'scheduled') {
            deferred++;
          } else {
            failed++;
            errors.push({ id: chunk[j].id, result });
          }
        } else {
          logger.error(`Failed to publish ${chunk[j].id}:`, s.reason);
          failed++;
          errors.push({ id: chunk[j].id, error: String(s.reason?.message || s.reason) });
        }
      }
    }

    return NextResponse.json({ ok: true, cron: 'publish-scheduled', published, failed, deferred, total: (posts || []).length, errors, timestamp: now });
  } catch (err: any) {
    logger.error('Cron publish-scheduled error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  return GET(req);
}
