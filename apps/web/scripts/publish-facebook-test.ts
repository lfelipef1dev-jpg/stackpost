import { getSupabase } from '../src/lib/supabase';
import { publishPost } from '../src/lib/publisher';

async function main() {
  const supabase = getSupabase();

  const uploadId = 'cbce5d5a-6fc8-475f-a37d-57db69be3971';

  // Criar post com imagem
  const { data: post, error: postErr } = await supabase
    .from('posts')
    .insert({
      team_id: '001fcd02-3084-4a4a-a540-771942c01136',
      content: 'A Nexus IA reune 19 modelos em um so painel. Claude, GPT, Gemini, Llama, Mistral e mais. Teste gratis: nexusia.expostacker.com.br #NexusIA #IA #ExpoStacker #TecnologiaBrasil',
      status: 'pending',
      platforms: ['facebook'],
      upload_ids: [uploadId],
    })
    .select()
    .single();

  if (postErr || !post) {
    console.error('Erro ao criar post:', postErr);
    process.exit(1);
  }

  console.log('Post criado:', post.id);

  const { error: ppErr } = await supabase.from('post_platforms').insert({
    post_id: post.id,
    platform: 'facebook',
    status: 'pending',
  });

  if (ppErr) {
    console.error('Erro ao criar post_platform:', ppErr);
    process.exit(1);
  }

  const result = await publishPost(post.id);
  console.log('Resultado:', JSON.stringify(result, null, 2));
}

main();
