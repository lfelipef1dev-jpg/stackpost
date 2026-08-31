import { getSupabase } from '../src/lib/supabase';
import { publishPost } from '../src/lib/publisher';

const TEAM_ID = '001fcd02-3084-4a4a-a540-771942c01136';

async function main() {
  const supabase = getSupabase();

  // Reagendar todos os posts a partir do proximo horario redondo
  const now = new Date();
  const spNow = new Date(now.getTime() - 3 * 60 * 60 * 1000);
  const currentMin = spNow.getUTCMinutes();
  const nextMin = Math.ceil(currentMin / 5) * 5;
  let inicioSP = new Date(Date.UTC(spNow.getUTCFullYear(), spNow.getUTCMonth(), spNow.getUTCDate(), spNow.getUTCHours(), nextMin, 0));
  if (inicioSP.getTime() <= spNow.getTime()) {
    inicioSP = new Date(inicioSP.getTime() + 5 * 60 * 1000);
  }

  const { data: posts } = await supabase
    .from('posts')
    .select('id')
    .eq('status', 'scheduled')
    .eq('team_id', TEAM_ID)
    .order('scheduled_at', { ascending: true });

  if (!posts || posts.length === 0) {
    console.log('Nenhum post agendado');
    return;
  }

  console.log(`Reagendando ${posts.length} posts a partir de ${inicioSP.toISOString()} (SP)`);

  for (let i = 0; i < posts.length; i++) {
    const scheduledSP = new Date(inicioSP.getTime() + i * 5 * 60 * 1000);
    const scheduledUTC = new Date(scheduledSP.getTime() + 3 * 60 * 60 * 1000);
    await supabase
      .from('posts')
      .update({ scheduled_at: scheduledUTC.toISOString() })
      .eq('id', posts[i].id);
    const spStr = `${scheduledSP.getUTCHours().toString().padStart(2,'0')}:${scheduledSP.getUTCMinutes().toString().padStart(2,'0')}`;
    console.log(`Post ${i + 1}: ${spStr} SP`);
  }

  console.log('\nIniciando publicacao automatica...');

  while (true) {
    const now2 = new Date().toISOString();
    const { data: duePosts } = await supabase
      .from('posts')
      .select('id')
      .eq('status', 'scheduled')
      .lte('scheduled_at', now2)
      .order('scheduled_at', { ascending: true })
      .limit(1);

    if (duePosts && duePosts.length > 0) {
      const post = duePosts[0];
      console.log(`[${new Date().toISOString()}] Publicando ${post.id}...`);
      try {
        const result = await publishPost(post.id);
        console.log(`[${new Date().toISOString()}] Resultado: ${JSON.stringify(result)}`);
      } catch (e: any) {
        console.error(`[${new Date().toISOString()}] Erro:`, e.message);
      }
    }

    await new Promise(r => setTimeout(r, 10000)); // verifica a cada 10s
  }
}

main().catch(console.error);
