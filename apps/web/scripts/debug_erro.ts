import { getSupabase } from '../src/lib/supabase';
import { publishPost } from '../src/lib/publisher';

async function main() {
  const supabase = getSupabase();
  // Resetar o post que falhou pra scheduled
  const { data: posts } = await supabase
    .from('posts')
    .select('id, content')
    .eq('status', 'error')
    .order('scheduled_at', { ascending: false })
    .limit(1);

  if (!posts || posts.length === 0) {
    console.log('Nenhum post com erro');
    return;
  }

  const post = posts[0];
  console.log('Resetando post:', post.id);
  await supabase.from('posts').update({ status: 'scheduled' }).eq('id', post.id);
  await supabase.from('post_platforms').update({ status: 'pending', error_message: null }).eq('post_id', post.id);

  console.log('Publicando...');
  try {
    const result = await publishPost(post.id);
    console.log('Resultado:', JSON.stringify(result, null, 2));
  } catch (e: any) {
    console.error('Erro:', e.message);
    console.error('Stack:', e.stack);
  }
}

main();
