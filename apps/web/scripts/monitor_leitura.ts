import { getSupabase } from '../src/lib/supabase';

const TEAM_ID = '001fcd02-3084-4a4a-a540-771942c01136';

async function main() {
  const supabase = getSupabase();
  console.log('[monitor] Iniciando monitor SOMENTE LEITURA (cron faz a publicacao)');
  console.log('[monitor] Checando a cada 30s. Relatorio a cada verificacao.');

  let ultimoPublicado = 0;

  while (true) {
    const now = new Date();
    const spNow = new Date(now.getTime() - 3 * 60 * 60 * 1000);
    const spStr = `${spNow.getUTCHours().toString().padStart(2,'0')}:${spNow.getUTCMinutes().toString().padStart(2,'0')}:${spNow.getUTCSeconds().toString().padStart(2,'0')}`;

    const { count: agendados } = await supabase
      .from('posts')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'scheduled')
      .eq('team_id', TEAM_ID);

    const { count: publicados } = await supabase
      .from('posts')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'posted')
      .eq('team_id', TEAM_ID);

    const { count: erros } = await supabase
      .from('posts')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'error')
      .eq('team_id', TEAM_ID);

    // Verifica se tem post atrasado (scheduled_at <= agora) ainda em scheduled
    const nowIso = now.toISOString();
    const { count: atrasados } = await supabase
      .from('posts')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'scheduled')
      .lte('scheduled_at', nowIso)
      .eq('team_id', TEAM_ID);

    // Pega o proximo agendado
    const { data: proximo } = await supabase
      .from('posts')
      .select('scheduled_at, content')
      .eq('status', 'scheduled')
      .order('scheduled_at', { ascending: true })
      .limit(1)
      .single();

    let proxStr = 'nenhum';
    if (proximo) {
      const spProx = new Date(new Date(proximo.scheduled_at).getTime() - 3 * 60 * 60 * 1000);
      proxStr = `${spProx.getUTCHours().toString().padStart(2,'0')}:${spProx.getUTCMinutes().toString().padStart(2,'0')} SP`;
    }

    const mudou = (publicados || 0) !== ultimoPublicado;
    if (mudou) {
      console.log(`[${spStr} SP] NOVO POST! Publicados: ${publicados} | Agendados: ${agendados} | Atrasados: ${atrasados} | Erros: ${erros} | Proximo: ${proxStr}`);
      ultimoPublicado = publicados || 0;
    } else {
      console.log(`[${spStr} SP] Status: Publicados: ${publicados} | Agendados: ${agendados} | Atrasados: ${atrasados} | Erros: ${erros} | Proximo: ${proxStr}`);
    }

    await new Promise(r => setTimeout(r, 30000));
  }
}

main().catch(console.error);
