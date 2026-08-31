import { getSupabase } from '../src/lib/supabase';
import { publishPost } from '../src/lib/publisher';

async function main() {
  const supabase = getSupabase();
  // Pegar o post c6e04a5c que falhou no Facebook
  const { data: post } = await supabase
    .from('posts')
    .select('id, content, platforms, upload_ids')
    .eq('id', 'c6e04a5c-e764-4232-997a-bfbe894e4535')
    .single();

  if (!post) {
    console.log('Post nao encontrado');
    return;
  }

  console.log('Post:', post.id);
  console.log('Platforms:', post.platforms);
  console.log('Upload IDs:', post.upload_ids);

  // Verificar upload
  if (post.upload_ids && post.upload_ids.length > 0) {
    const { data: upload } = await supabase
      .from('uploads')
      .select('*')
      .eq('id', post.upload_ids[0])
      .single();
    console.log('Upload:', JSON.stringify(upload, null, 2));
  }

  // Resetar e publicar
  await supabase.from('posts').update({ status: 'scheduled' }).eq('id', post.id);
  await supabase.from('post_platforms').update({ status: 'pending', error_message: null }).eq('post_id', post.id);

  console.log('Publicando localmente...');
  try {
    const result = await publishPost(post.id);
    console.log('Resultado:', JSON.stringify(result, null, 2));
  } catch (e: any) {
    console.error('Erro:', e.message);
  }
}

main();
