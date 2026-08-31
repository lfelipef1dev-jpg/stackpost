import { getSupabase } from '../src/lib/supabase';

async function main() {
  const supabase = getSupabase();
  const { data: posts } = await supabase
    .from('posts')
    .select('id')
    .eq('status', 'error')
    .order('scheduled_at', { ascending: true });

  if (!posts || posts.length === 0) {
    console.log('Nenhum post com erro');
    return;
  }

  console.log(`Resetando ${posts.length} posts de error -> scheduled`);
  for (const p of posts) {
    await supabase.from('posts').update({ status: 'scheduled' }).eq('id', p.id);
    await supabase.from('post_platforms').update({ status: 'pending', error_message: null }).eq('post_id', p.id);
    console.log(`Resetado: ${p.id}`);
  }
}

main();
