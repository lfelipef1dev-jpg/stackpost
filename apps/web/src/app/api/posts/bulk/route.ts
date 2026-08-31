import { logger } from '@/lib/logger';
import { NextRequest, NextResponse } from 'next/server';
import { posts_bulkBodySchema } from '@/lib/schemas';
import { getSupabase } from '@/lib/supabase';
import { getUserFromToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const user = await getUserFromToken(req);
  if (!user) return NextResponse.json({ error: 'Nao autorizado' }, { status: 401 });

  try {
    const contentType = req.headers.get('content-type') || '';
    let posts: any[] = [];

    if (contentType.includes('application/json')) {
      const bodyRaw1 = await req.json();
      const parsed1 = posts_bulkBodySchema.safeParse(bodyRaw1);
      if (!parsed1.success) return NextResponse.json(parsed1.error.issues, { status: 400 });
      const body = bodyRaw1;
      posts = Array.isArray(body) ? body : body.posts || [];
    } else if (contentType.includes('text/csv') || contentType.includes('application/csv')) {
      const text = await req.text();
      const lines = text.split('\n').filter((l) => l.trim());
      const headers = lines[0].split(',').map((h) => h.trim());

      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map((v) => v.trim());
        const post: any = {};
        headers.forEach((h, idx) => {
          post[h] = values[idx];
        });
        posts.push(post);
      }
    } else {
      const bodyRaw2 = await req.json();
      const parsed2 = posts_bulkBodySchema.safeParse(bodyRaw2);
      if (!parsed2.success) return NextResponse.json(parsed2.error.issues, { status: 400 });
      const body = bodyRaw2;
      posts = Array.isArray(body) ? body : [body];
    }

    const supabase = getSupabase();
    const created: any[] = [];

    for (const post of posts) {
      if (!post.content && !post.text) continue;

      const platforms = post.platforms ? (Array.isArray(post.platforms) ? post.platforms : post.platforms.split(';')) : ['instagram'];

      const { data: newPost, error: insertError } = await supabase
        .from('posts')
        .insert({
          team_id: user.teamId,
          content: post.content || post.text,
          platforms,
          scheduled_at: post.scheduledAt || post.scheduled_at || null,
          status: post.scheduledAt || post.scheduled_at ? 'scheduled' : 'draft',
        })
        .select()
        .single();
      if (insertError) throw insertError;

      for (const platform of platforms) {
        const { error: ppError } = await supabase
          .from('post_platforms')
          .insert({
            post_id: newPost.id,
            platform,
            status: 'pending',
          });
        if (ppError) throw ppError;
      }

      created.push(newPost);
    }

    return NextResponse.json({ created: created.length, posts: created }, { status: 201 });
  } catch (error) {
    logger.error((error as string));
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
