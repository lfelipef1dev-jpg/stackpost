import { getSupabase } from '../src/lib/supabase';
import { publishPost } from '../src/lib/publisher';

const TEAM_ID = '001fcd02-3084-4a4a-a540-771942c01136';

async function main() {
  const supabase = getSupabase();
  const now = new Date().toISOString();

  const { data: posts, error } = await supabase
    .from('posts')
    .select('id')
    .eq('status', 'scheduled')
    .lte('scheduled_at', now)
    .order('scheduled_at', { ascending: true })
    .limit(50);

  if (error || !posts) {
    console.error('Erro:', error);
    process.exit(1);
  }

  console.log(`Posts a publicar: ${posts.length}`);
  for (const p of posts) {
    try {
      const result = await publishPost(p.id);
      console.log(`Post ${p.id}: ${JSON.stringify(result)}`);
    } catch (e: any) {
      console.error(`Post ${p.id} erro:`, e.message);
    }
  }
}

main();
