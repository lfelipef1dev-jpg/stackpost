import { getSupabase } from '../src/lib/supabase';
import { publishPost } from '../src/lib/publisher';
import * as fs from 'fs';

const TEAM_ID = '001fcd02-3084-4a4a-a540-771942c01136';
const SITE = 'https://stackpost.expostacker.com.br';

// Mapear cada post para midia
const videoMap: Record<string, string> = {
  'post_video01_nexus.py': `${SITE}/videos/video01_nexus_gera_pdf.mp4`,
  'post_video02_nexus.py': `${SITE}/videos/video02_nexus_4_modelos.mp4`,
  'post_video03_nexus.py': `${SITE}/videos/video03_nexus_gera_word.mp4`,
  'post_video04_nexus.py': `${SITE}/videos/video04_nexus_gera_excel.mp4`,
  'post_video03_pdf.py': `${SITE}/videos/video01_nexus_gera_pdf.mp4`,
  'post_video13_word.py': `${SITE}/videos/video03_nexus_gera_word.mp4`,
};

const imageMap: Record<string, string> = {
  'posts_nexus.txt#POST1': `${SITE}/banner/nexus-ia-banner.jpg`,
  'posts_nexus.txt#POST2': `${SITE}/banner/nexus-ia-banner.jpg`,
  'posts_nexus.txt#POST3': `${SITE}/banner/nexus-ia-banner.jpg`,
  'posts_nexus.txt#POST4': `${SITE}/banner/nexus-ia-banner.jpg`,
  'posts_frotamais.txt#POST1': `${SITE}/banner/gerenciador-frotas-banner.jpg`,
  'posts_frotamais.txt#POST2': `${SITE}/banner/gerenciador-frotas-banner.jpg`,
  'posts_frotamais.txt#POST3': `${SITE}/banner/gerenciador-frotas-banner.jpg`,
  'posts_frotamais.txt#POST4': `${SITE}/banner/gerenciador-frotas-banner.jpg`,
  'posts_seeds.txt#POST1': `${SITE}/banner/seeds-experience-banner.jpg`,
  'posts_seeds.txt#POST2': `${SITE}/banner/seeds-experience-banner.jpg`,
  'posts_seeds.txt#POST3': `${SITE}/banner/seeds-experience-banner.jpg`,
  'posts_seeds.txt#POST4': `${SITE}/banner/seeds-experience-banner.jpg`,
  'post_case_marken_fassi.py': `${SITE}/banner/marken-fassi-banner.jpg`,
  'post_case_gordaomod.py': `${SITE}/banner/gordaomod-banner.jpg`,
  'post_faturamais.py': `${SITE}/banner/sistema-faturamento-saas-banner.jpg`,
  'post_marken_fassi.py': `${SITE}/banner/marken-fassi-banner.jpg`,
  'post_medellin.py': `${SITE}/banner/medellin-ecommerce-banner.jpg`,
  'post_sanatto.py': `${SITE}/banner/sanatto-facilities-banner.jpg`,
  'post_seeds.py': `${SITE}/banner/seeds-experience-banner.jpg`,
  'post_solmais.py': `${SITE}/banner/solmais-banner.jpg`,
  'post_tigrebet.py': `${SITE}/banner/tigrebet-banner.jpg`,
  'post_vendamais.py': `${SITE}/banner/vendamais-banner.jpg`,
  'post_vivamais.py': `${SITE}/banner/vivamais-banner.jpg`,
  'post_gordaomod.py': `${SITE}/banner/gordaomod-banner.jpg`,
};

async function main() {
  const supabase = getSupabase();

  // Ler posts extraidos
  const postsRaw = fs.readFileSync(__dirname + '/posts_extraidos.json', 'utf-8');
  const posts: Array<{ arquivo: string; texto: string; imagem: string }> = JSON.parse(postsRaw);

  console.log(`Total de posts: ${posts.length}`);

  // Filtrar posts que tem midia (video ou imagem) - priorizar
  const postsComMidia: Array<{ arquivo: string; texto: string; videoUrl?: string; imageUrl?: string }> = [];

  for (const p of posts) {
    const videoUrl = videoMap[p.arquivo];
    const imageUrl = imageMap[p.arquivo];
    if (videoUrl) {
      postsComMidia.push({ arquivo: p.arquivo, texto: p.texto, videoUrl });
    } else if (imageUrl) {
      postsComMidia.push({ arquivo: p.arquivo, texto: p.texto, imageUrl });
    } else {
      // Posts de video sem video disponivel - usar banner nexus como fallback
      postsComMidia.push({ arquivo: p.arquivo, texto: p.texto, imageUrl: `${SITE}/banner/nexus-ia-banner.jpg` });
    }
  }

  console.log(`Posts com midia mapeada: ${postsComMidia.length}`);

  // POST 1: publicar AGORA (video PDF)
  const primeiro = postsComMidia[0];
  console.log(`\n=== PUBLICANDO POST 1 AGORA: ${primeiro.arquivo} ===`);

  const { data: upload1 } = await supabase
    .from('uploads')
    .insert({
      team_id: TEAM_ID,
      file_name: primeiro.videoUrl ? 'video.mp4' : 'image.jpg',
      mime_type: primeiro.videoUrl ? 'video/mp4' : 'image/jpeg',
      size: 0,
      url: primeiro.videoUrl || primeiro.imageUrl || '',
    })
    .select()
    .single();

  if (!upload1) {
    console.error('Erro ao criar upload 1');
    process.exit(1);
  }

  const { data: post1 } = await supabase
    .from('posts')
    .insert({
      team_id: TEAM_ID,
      content: primeiro.texto,
      status: 'pending',
      platforms: ['facebook'],
      upload_ids: [upload1.id],
    })
    .select()
    .single();

  if (!post1) {
    console.error('Erro ao criar post 1');
    process.exit(1);
  }

  await supabase.from('post_platforms').insert({
    post_id: post1.id,
    platform: 'facebook',
    status: 'pending',
  });

  const result1 = await publishPost(post1.id);
  console.log('Resultado POST 1:', JSON.stringify(result1, null, 2));

  // POSTS 2-N: agendar de 5 em 5 minutos
  const agora = Date.now();
  let agendados = 0;

  for (let i = 1; i < postsComMidia.length; i++) {
    const p = postsComMidia[i];
    const scheduledAt = new Date(agora + i * 5 * 60 * 1000).toISOString(); // 5 min cada

    const { data: upload } = await supabase
      .from('uploads')
      .insert({
        team_id: TEAM_ID,
        file_name: p.videoUrl ? 'video.mp4' : 'image.jpg',
        mime_type: p.videoUrl ? 'video/mp4' : 'image/jpeg',
        size: 0,
        url: p.videoUrl || p.imageUrl || '',
      })
      .select()
      .single();

    if (!upload) {
      console.warn(`Erro ao criar upload para post ${i + 1} (${p.arquivo})`);
      continue;
    }

    const { data: post } = await supabase
      .from('posts')
      .insert({
        team_id: TEAM_ID,
        content: p.texto,
        status: 'scheduled',
        platforms: ['facebook'],
        upload_ids: [upload.id],
        scheduled_at: scheduledAt,
      })
      .select()
      .single();

    if (!post) {
      console.warn(`Erro ao criar post ${i + 1} (${p.arquivo})`);
      continue;
    }

    await supabase.from('post_platforms').insert({
      post_id: post.id,
      platform: 'facebook',
      status: 'pending',
    });

    agendados++;
    console.log(`Post ${i + 1} agendado: ${p.arquivo} -> ${scheduledAt}`);
  }

  console.log(`\n=== RESUMO ===`);
  console.log(`Post 1 publicado: ${result1.status}`);
  console.log(`Posts agendados: ${agendados}`);
  console.log(`Total: ${1 + agendados} posts`);
  console.log(`\nOs posts agendados serao publicados automaticamente pelo cron a cada minuto.`);
  console.log(`Intervalo: 5 minutos entre cada post.`);
}

main().catch(console.error);
