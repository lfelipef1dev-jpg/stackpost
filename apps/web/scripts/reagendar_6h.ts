import { getSupabase } from '../src/lib/supabase';

const TEAM_ID = '001fcd02-3084-4a4a-a540-771942c01136';

async function main() {
  const supabase = getSupabase();

  // Buscar posts agendados, pular o primeiro que ja foi publicado (nao esta em scheduled)
  const { data: posts, error } = await supabase
    .from('posts')
    .select('id, content')
    .eq('status', 'scheduled')
    .eq('team_id', TEAM_ID)
    .order('scheduled_at', { ascending: true });

  if (error || !posts) {
    console.error('Erro:', error);
    process.exit(1);
  }

  console.log(`Reagendando ${posts.length} posts`);

  // Inicio: 06:00 Sao Paulo = 09:00 UTC
  const inicioSP = new Date(Date.UTC(2026, 7, 28, 6, 0, 0)); // mes 7 = agosto

  for (let i = 0; i < posts.length; i++) {
    const scheduledUTC = new Date(inicioSP.getTime() + i * 5 * 60 * 1000 + 3 * 60 * 60 * 1000); // SP +3h = UTC
    const { error: updErr } = await supabase
      .from('posts')
      .update({ scheduled_at: scheduledUTC.toISOString() })
      .eq('id', posts[i].id);

    if (updErr) {
      console.warn(`Erro no post ${posts[i].id}:`, updErr.message);
    } else {
      const spTime = new Date(scheduledUTC.getTime() - 3 * 60 * 60 * 1000);
      const spStr = `${spTime.getUTCHours().toString().padStart(2,'0')}:${spTime.getUTCMinutes().toString().padStart(2,'0')}`;
      console.log(`Post ${i + 1}: ${spStr} SP`);
    }
  }

  console.log('Reagendamento concluido');
}

main();
