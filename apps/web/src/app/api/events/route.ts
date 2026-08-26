import { NextRequest } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import { getUserFromToken } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const user = await getUserFromToken(req);
  if (!user) return new Response('Unauthorized', { status: 401 });

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();

      const send = (data: any) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      };

      send({ type: 'connected', timestamp: new Date().toISOString() });

      const interval = setInterval(async () => {
        try {
          const supabase = getSupabase();
          const { data: posts, error: postsErr } = await supabase
            .from('posts')
            .select('id')
            .eq('team_id', user.teamId);

          if (postsErr || !posts || posts.length === 0) return;

          const postIds = posts.map((p: any) => p.id);

          const { data, error: err } = await supabase
            .from('post_platforms')
            .select('id, status, platform, post_id, created_at')
            .in('post_id', postIds)
            .in('status', ['processing', 'pending'])
            .order('created_at', { ascending: false })
            .limit(10);

          if (err) return;

          for (const row of data || []) {
            send({ type: 'post_status', postId: row.post_id, platform: row.platform, status: row.status });
          }
        } catch (e) {
          // ignore
        }
      }, 5000);

      req.signal.addEventListener('abort', () => {
        clearInterval(interval);
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}
