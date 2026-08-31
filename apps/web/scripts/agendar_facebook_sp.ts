import { getSupabase } from '../src/lib/supabase';
import * as fs from 'fs';

const TEAM_ID = '001fcd02-3084-4a4a-a540-771942c01136';
const SITE = 'https://stackpost.expostacker.com.br';

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

  const postsRaw = fs.readFileSync(__dirname + '/posts_extraidos.json', 'utf-8');
  const posts: Array<{ arquivo: string; texto: string; imagem: string }> = JSON.parse(postsRaw);

  // Pular o primeiro (ja foi publicado)
  const postsParaAgendar = posts.slice(1);

  // Sao Paulo = UTC-3. Comecar as 09:00 Sao Paulo = 12:00 UTC
  // Data atual em UTC
  const agora = new Date();
  // Calcular 09:00 Sao Paulo de hoje (ou amanha se ja passou)
  const spNow = new Date(agora.getTime() - 3 * 60 * 60 * 1000); // converter UTC -> SP
  const spHour = spNow.getUTCHours();
  const spMin = spNow.getUTCMinutes();

  // Se ja passou das 09:00 SP, comecar amanha 09:00. Senao, hoje 09:00.
  let inicioSP: Date;
  if (spHour < 9 || (spHour === 9 && spMin < 5)) {
    // Ainda nao chegou 09:00 SP hoje
    inicioSP = new Date(Date.UTC(spNow.getUTCFullYear(), spNow.getUTCMonth(), spNow.getUTCDate(), 9, 0, 0));
  } else {
    // Ja passou de 09:00 SP hoje, comecar agora + 5 min
    inicioSP = new Date(spNow.getTime() + 5 * 60 * 1000);
  }

  // Converter SP -> UTC (somar 3 horas)
  const inicioUTC = new Date(inicioSP.getTime() + 3 * 60 * 60 * 1000);

  console.log(`Hora atual SP: ${spNow.toISOString()}`);
  console.log(`Inicio agendamento SP: ${inicioSP.toISOString()}`);
  console.log(`Inicio agendamento UTC: ${inicioUTC.toISOString()}`);
  console.log(`Posts a agendar: ${postsParaAgendar.length}`);
  console.log('');

  let agendados = 0;

  for (let i = 0; i < postsParaAgendar.length; i++) {
    const p = postsParaAgendar[i];
    const videoUrl = videoMap[p.arquivo];
    const imageUrl = imageMap[p.arquivo];
    const mediaUrl = videoUrl || imageUrl || `${SITE}/banner/nexus-ia-banner.jpg`;
    const isVideo = !!videoUrl;

    // 5 minutos entre cada post
    const scheduledAt = new Date(inicioUTC.getTime() + i * 5 * 60 * 1000).toISOString();

    const { data: upload } = await supabase
      .from('uploads')
      .insert({
        team_id: TEAM_ID,
        file_name: isVideo ? 'video.mp4' : 'image.jpg',
        mime_type: isVideo ? 'video/mp4' : 'image/jpeg',
        size: 0,
        url: mediaUrl,
      })
      .select()
      .single();

    if (!upload) {
      console.warn(`Erro ao criar upload para post ${i + 2} (${p.arquivo})`);
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
      console.warn(`Erro ao criar post ${i + 2} (${p.arquivo})`);
      continue;
    }

    await supabase.from('post_platforms').insert({
      post_id: post.id,
      platform: 'facebook',
      status: 'pending',
    });

    // Mostrar horario SP
    const spTime = new Date(new Date(scheduledAt).getTime() - 3 * 60 * 60 * 1000);
    const spStr = `${spTime.getUTCHours().toString().padStart(2,'0')}:${spTime.getUTCMinutes().toString().padStart(2,'0')}`;

    agendados++;
    console.log(`Post ${i + 2} agendado: ${p.arquivo} -> ${spStr} SP (${scheduledAt})`);
  }

  console.log(`\n=== RESUMO ===`);
  console.log(`Posts agendados: ${agendados}`);
  console.log(`Intervalo: 5 minutos entre cada post`);
  console.log(`Horario: Sao Paulo (UTC-3)`);
}

main().catch(console.error);
