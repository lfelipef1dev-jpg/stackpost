import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import { publishPost } from '@/lib/publisher';

// Cron: Publicar posts agendados cuja scheduled_at chegou
// Trigger: Cloudflare Workers Cron Triggers (a cada 1 minuto)
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Nao autorizado' }, { status: 401 });
  }

  try {
    const supabase = getSupabase();
    const now = new Date().toISOString();

    // Buscar posts agendados cuja data chegou
    const { data: posts, error } = await supabase
      .from('posts')
      .select('id')
      .eq('status', 'scheduled')
      .lte('scheduled_at', now)
      .limit(50);

    if (error) throw error;

    let published = 0;
    let failed = 0;

    for (const post of posts || []) {
      try {
        const result = await publishPost(post.id);
        if (result.status === 'posted') published++;
        else failed++;
      } catch (err) {
        console.error(`Failed to publish ${post.id}:`, err);
        failed++;
      }
    }

    return NextResponse.json({ ok: true, cron: 'publish-scheduled', published, failed, total: (posts || []).length, timestamp: now });
  } catch (err: any) {
    console.error('Cron publish-scheduled error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  return GET(req);
}
