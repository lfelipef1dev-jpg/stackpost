import { getSupabase } from '../src/lib/supabase';

const TEAM_ID = '001fcd02-3084-4a4a-a540-771942c01136';
const SITE = 'https://stackpost.expostacker.com.br';

// Mapeamento: cada post recebe uma imagem DIFERENTE
// Key = primeiro trecho do content (primeiros 30 chars normalizados)
const imageMap: Record<string, string> = {
  // Nexus videos sem video -> prints diferentes
  'Cola a URL do seu site. Nexus analisa': `${SITE}/prints/nexus-vid-04-analise-completo.jpg`,
  'Uma IA te prende a um modelo. Nexus te da 7': `${SITE}/prints/nexus-vid-02-comparativo.jpg`,
  'IA que esquece o que voce disse 5 mensagens': `${SITE}/prints/nexus-vid-01-dashboard.jpg`,
  'Texto e facil. Imagem e outra historia': `${SITE}/prints/nexus-vid-05-codigo-completo.jpg`,
  'IA sem organizacao e gaveta de papelada': `${SITE}/prints/nexus-vid-02-planos.jpg`,
  '1 minuto. E tudo que voce precisa pra migrar': `${SITE}/prints/nexus-vid-01-completo.jpg`,
  'IA gringa pede cartao internacional. Nexus': `${SITE}/prints/01_nexus_apresentacao.png`,
  // posts_nexus.txt - 4 posts
  '83 endpoints de IA em uma so API': `${SITE}/cases/nexus-ia-hero.jpg`,
  'Um provedor de IA nao e estrategia. E depend': `${SITE}/prints/nexus-vid-05-codigo-resposta.jpg`,
  'Integrar IA nao e chamar a API da OpenAI': `${SITE}/prints/nexus-vid-03-pdf-completo.jpg`,
  'A Plataforma Nexus IA em 3 camadas': `${SITE}/banner/nexus-ia-banner.jpg`,
  // posts_frotamais.txt - 4 posts (alternar banner e hero)
  'Uma transportadora com 8 veiculos. Tudo em pla': `${SITE}/cases/frotamais-hero.jpg`,
  'Planilha nao gerencia frota. Planilha conta pre': `${SITE}/banner/gerenciador-frotas-banner.jpg`,
  'Gestao de frotas em planilha e gestao de frotas': `${SITE}/cases/gerenciador-frotas-hero.jpg`,
  'O Sistema Frotamais em 3 passos': `${SITE}/banner/gerenciador-frotas-banner.jpg`,
  // posts_seeds.txt - 4 posts (alternar banner e hero)
  'Uma comunidade de mulheres empreendedoras sem p': `${SITE}/cases/seeds-experience-hero.jpg`,
  'WhatsApp nao e comunidade. WhatsApp e grupo de m': `${SITE}/banner/seeds-experience-banner.jpg`,
  'Comunidade em WhatsApp nao e comunidade. E lista': `${SITE}/cases/seeds-experience.jpg`,
  'A Plataforma SEEDS em 4 modulos': `${SITE}/banner/seeds-experience-banner.jpg`,
  // Cases individuais - banner + hero alternados
  'CASE: como a Marken Fassi transformou treinamen': `${SITE}/cases/marken-fassi-hero.jpg`,
  'Vendedor de enxoval nao precisa de mais um curs': `${SITE}/banner/marken-fassi-banner.jpg`,
  '182 produtos. 10 categorias. Loja digital de re': `${SITE}/cases/gordaomod-hero.jpg`,
  '182 produtos. 10 categorias. Uma loja digital q': `${SITE}/cases/gordaomod-card.jpg`,
  'Pequeno e-commerce perde hora toda semana concil': `${SITE}/cases/sistema-faturamento-saas-hero.jpg`,
  '344 produtos. 54 paginas. Pagamento real. Entre': `${SITE}/cases/medellin-ecommerce-hero.jpg`,
  'Site institucional nao e panfleto online. E prod': `${SITE}/cases/sanatto-facilities-hero.jpg`,
  'Comunidade exclusiva de mulheres empreendedoras.': `${SITE}/cases/seeds-experience.jpg`,
  'Vendedor de energia solar perde cliente todo dia': `${SITE}/cases/solmais-hero.jpg`,
  '11 jogos. 50+ rotas de API. PIX na hora. Uma pla': `${SITE}/cases/tigrebet-hero.jpg`,
  '70% dos carrinhos de e-commerce sao abandonados.': `${SITE}/cases/vendamais-hero.jpg`,
  '23h de domingo. Paciente com dor de dente abre o': `${SITE}/cases/vivamais-hero.jpg`,
};

function findImage(content: string): string | null {
  const normalized = content.replace(/\n/g, ' ').trim();
  for (const key of Object.keys(imageMap)) {
    if (normalized.startsWith(key)) {
      return imageMap[key];
    }
  }
  return null;
}

async function main() {
  const supabase = getSupabase();

  // Pegar todos posts agendados
  const { data: posts, error } = await supabase
    .from('posts')
    .select('id, content, upload_ids')
    .eq('status', 'scheduled')
    .eq('team_id', TEAM_ID)
    .order('scheduled_at', { ascending: true });

  if (error || !posts) {
    console.error('Erro:', error);
    process.exit(1);
  }

  console.log(`Posts agendados: ${posts.length}`);

  let atualizados = 0;
  let semMudanca = 0;
  let semMapa = 0;

  for (const post of posts) {
    const newUrl = findImage(post.content);
    if (!newUrl) {
      console.log(`SEM MAPA: ${post.content.substring(0, 60)}...`);
      semMapa++;
      continue;
    }

    if (!post.upload_ids || post.upload_ids.length === 0) {
      console.log(`SEM UPLOAD: ${post.content.substring(0, 60)}...`);
      continue;
    }

    const uploadId = post.upload_ids[0];

    // Verificar URL atual
    const { data: upload } = await supabase
      .from('uploads')
      .select('url, mime_type')
      .eq('id', uploadId)
      .single();

    if (!upload) continue;

    // Se ja e video, pular
    if (upload.mime_type === 'video/mp4') {
      semMudanca++;
      continue;
    }

    // Se a URL ja e a nova, pular
    if (upload.url === newUrl) {
      semMudanca++;
      continue;
    }

    // Atualizar
    const isPng = newUrl.endsWith('.png');
    const { error: updErr } = await supabase
      .from('uploads')
      .update({
        url: newUrl,
        mime_type: isPng ? 'image/png' : 'image/jpeg',
        file_name: isPng ? 'image.png' : 'image.jpg',
      })
      .eq('id', uploadId);

    if (updErr) {
      console.error(`Erro ao atualizar upload ${uploadId}:`, updErr.message);
    } else {
      atualizados++;
      console.log(`OK: ${post.content.substring(0, 50)}... -> ${newUrl.split('/').pop()}`);
    }
  }

  console.log(`\n=== RESUMO ===`);
  console.log(`Atualizados: ${atualizados}`);
  console.log(`Sem mudanca (video ou ja correto): ${semMudanca}`);
  console.log(`Sem mapa: ${semMapa}`);
}

main();
