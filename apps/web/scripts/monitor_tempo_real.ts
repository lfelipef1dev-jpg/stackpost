import { getSupabase } from '../src/lib/supabase';
import { publishPost } from '../src/lib/publisher';

const TEAM_ID = '001fcd02-3084-4a4a-a540-771942c01136';

async function main() {
  const supabase = getSupabase();
  console.log('[monitor] Iniciando monitor em tempo real...');
  console.log('[monitor] Verificando a cada 30 segundos.');

  let publicados = 0;
  let erros = 0;

  while (true) {
    const now = new Date();
    const nowIso = now.toISOString();
    const spNow = new Date(now.getTime() - 3 * 60 * 60 * 1000);
    const spStr = `${spNow.getUTCHours().toString().padStart(2,'0')}:${spNow.getUTCMinutes().toString().padStart(2,'0')}:${spNow.getUTCSeconds().toString().padStart(2,'0')}`;

    // Total agendado
    const { count: totalAgendado } = await supabase
      .from('posts')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'scheduled')
      .eq('team_id', TEAM_ID);

    // Total publicado
    const { count: totalPublicado } = await supabase
      .from('posts')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'posted')
      .eq('team_id', TEAM_ID);

    // Posts atrasados (scheduled_at <= agora)
    const { data: duePosts } = await supabase
      .from('posts')
      .select('id, content')
      .eq('status', 'scheduled')
      .lte('scheduled_at', nowIso)
      .order('scheduled_at', { ascending: true })
      .limit(5);

    if (duePosts && duePosts.length > 0) {
      for (const p of duePosts) {
        const inicio = p.content.substring(0, 50).replace(/\n/g, ' ');
        console.log(`[${spStr} SP] Publicando: ${inicio}...`);
        try {
          const result = await publishPost(p.id);
          if (result.status === 'posted') {
            publicados++;
            const url = result.results?.[0]?.externalUrl || '';
            console.log(`[${spStr} SP] OK: ${url}`);
          } else {
            erros++;
            console.log(`[${spStr} SP] Falha: ${JSON.stringify(result)}`);
          }
        } catch (e: any) {
          erros++;
          console.error(`[${spStr} SP] Erro: ${e.message}`);
        }
      }
    } else {
      // So loga status a cada verificacao
      console.log(`[${spStr} SP] Aguardando... Agendados: ${totalAgendado || 0} | Publicados: ${totalPublicado || 0} | Total: ${publicados} novos, ${erros} erros`);
    }

    // Espera 30 segundos
    await new Promise(r => setTimeout(r, 30000));
  }
}

main().catch(console.error);
