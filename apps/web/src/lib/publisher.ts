import { getSupabase } from '@/lib/supabase';
import { recordBillingEvent } from '@/lib/billing-metering';
import { getDailyLimit } from '@/lib/limits';
import {
  InstagramAdapter,
  FacebookAdapter,
  TikTokAdapter,
  YouTubeAdapter,
  LinkedInAdapter,
  XAdapter,
  ThreadsAdapter,
  PinterestAdapter,
  RedditAdapter,
  BlueskyAdapter,
  MastodonAdapter,
  DiscordAdapter,
  SlackAdapter,
  GoogleBusinessAdapter,
  SnapchatAdapter,
} from './adapters';

const adapters: Record<string, any> = {
  instagram: new InstagramAdapter(),
  facebook: new FacebookAdapter(),
  tiktok: new TikTokAdapter(),
  youtube: new YouTubeAdapter(),
  linkedin: new LinkedInAdapter(),
  x: new XAdapter(),
  threads: new ThreadsAdapter(),
  pinterest: new PinterestAdapter(),
  reddit: new RedditAdapter(),
  bluesky: new BlueskyAdapter(),
  mastodon: new MastodonAdapter(),
  discord: new DiscordAdapter(),
  slack: new SlackAdapter(),
  google_business: new GoogleBusinessAdapter(),
  snapchat: new SnapchatAdapter(),
};

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333';

// Ritmo minimo entre publicacoes por rede (minutos)
// Modo "colocar trabalho em dia": 15min em todas — se Meta flagar, o defer segura e retenta
export const PLATFORM_PACE_MINUTES: Record<string, number> = {
  discord: 15,
  slack: 15,
  bluesky: 15,
  instagram: 15,
  facebook: 15,
  linkedin: 15,
  threads: 15,
  x: 15,
  mastodon: 15,
  pinterest: 15,
  reddit: 15,
  tiktok: 15,
  youtube: 15,
  snapchat: 15,
  google_business: 15,
};
const DEFAULT_PACE_MIN = 15;

function buildImageUrl(uploadId: string, platform: string, derivatives: Record<string, string> = {}): string {
  if (platform === 'instagram') {
    if (derivatives.instagram_4x5) {
      const d = derivatives.instagram_4x5;
      return d.startsWith('http') ? d : `${BASE_URL}${d}`;
    }
    return uploadId.startsWith('http') ? uploadId : `${BASE_URL}/uploads/${uploadId}`;
  }
  if (platform === 'linkedin') {
    if (derivatives.linkedin_1x1) {
      const d = derivatives.linkedin_1x1;
      return d.startsWith('http') ? d : `${BASE_URL}${d}`;
    }
    return uploadId.startsWith('http') ? uploadId : `${BASE_URL}/uploads/${uploadId}`;
  }
  return uploadId.startsWith('http') ? uploadId : `${BASE_URL}/uploads/${uploadId}`;
}

export async function publishPost(postId: string) {
  const supabase = getSupabase();
  const { data: post, error: postError } = await supabase
    .from('posts')
    .select('*')
    .eq('id', postId)
    .single();
  if (postError || !post) return { error: 'Post não encontrado' };

  const { error: statusError } = await supabase
    .from('posts')
    .update({ status: 'processing' })
    .eq('id', postId);
  if (statusError) throw statusError;

  const { data: accounts, error: accountsError } = await supabase
    .from('social_accounts')
    .select('*')
    .eq('team_id', post.team_id)
    .in('platform', post.platforms)
    .eq('status', 'active');
  if (accountsError) throw accountsError;

  const accountsList = accounts || [];
  const derivatives = post.derivatives || {};

  // Buscar organization_id do time para metering
  const { data: teamData } = await supabase
    .from('teams')
    .select('organization_id')
    .eq('id', post.team_id)
    .single();
  const orgId = teamData?.organization_id || '';

  // Anti-ban: limite diario de posts por plataforma conforme o plano.
  // Sem isso, um usuario podia agendar centenas de posts e tomar restricao/ban nas redes.
  const { data: orgData } = await supabase
    .from('organizations')
    .select('plan')
    .eq('id', orgId)
    .single();
  const tier = (orgData?.plan || 'free').toUpperCase();

  const dayStart = new Date();
  dayStart.setUTCHours(0, 0, 0, 0);
  const { data: todayRows } = await supabase
    .from('post_platforms')
    .select('platform, posts!inner(team_id, published_at)')
    .eq('posts.team_id', post.team_id)
    .eq('status', 'posted')
    .gte('posts.published_at', dayStart.toISOString());
  const todayCount: Record<string, number> = {};
  const lastPostedAt: Record<string, number> = {};
  for (const r of todayRows || []) {
    todayCount[r.platform] = (todayCount[r.platform] || 0) + 1;
    const ts = new Date((r.posts as any)?.published_at || 0).getTime();
    if (!lastPostedAt[r.platform] || ts > lastPostedAt[r.platform]) lastPostedAt[r.platform] = ts;
  }

  let uploadData: Record<string, { url: string; mime_type: string }> = {};
  if (post.upload_ids?.length) {
    const { data: uploads } = await supabase
      .from('uploads')
      .select('id, url, mime_type')
      .in('id', post.upload_ids);
    if (uploads) {
      for (const u of uploads) {
        uploadData[u.id] = { url: u.url, mime_type: u.mime_type || '' };
      }
    }
  }

  // Idempotencia: plataformas ja publicadas nao republicam (permite retry seguro)
  const { data: ppRows } = await supabase
    .from('post_platforms')
    .select('platform, status')
    .eq('post_id', postId)
    .eq('status', 'posted');
  const alreadyPosted = new Set((ppRows || []).map((r: any) => r.platform));
  const pendingPlatforms = post.platforms.filter((pl: string) => !alreadyPosted.has(pl));

  const settled = await Promise.allSettled(
    pendingPlatforms.map(async (platform: string) => {
      const adapter = adapters[platform];
      const account = accountsList.find((a) => a.platform === platform);

      if (!adapter) return { platform, success: false, error: 'Plataforma não suportada' };
      if (!account) return { platform, success: false, error: 'Conta não conectada' };

      // Ritmo por rede: se a ultima publicacao foi recente demais, adia (fica pendente)
      const paceMin = PLATFORM_PACE_MINUTES[platform] || DEFAULT_PACE_MIN;
      const lastTs = lastPostedAt[platform] || 0;
      if (lastTs && Date.now() - lastTs < paceMin * 60 * 1000) {
        return { platform, deferred: true };
      }

      const dailyLimit = getDailyLimit(tier, platform.toUpperCase()).posts;
      const usedToday = todayCount[platform] || 0;
      if (usedToday >= dailyLimit) {
        // Limite diario = adia pra amanha (fica pendente) em vez de falhar
        return { platform, deferred: true, reason: `daily_limit:${dailyLimit}` };
      }

      let imageUrl: string | undefined;
      let videoUrl: string | undefined;
      let mediaUrls: string[] | undefined;
      let pdfUrl: string | undefined;
      if (post.upload_ids?.length) {
        const allUrls: string[] = [];
        for (const uid of post.upload_ids) {
          const data = uploadData[uid];
          if (data?.url) {
            allUrls.push(data.url);
          } else if (uid.startsWith('http')) {
            allUrls.push(uid);
          } else {
            allUrls.push(`${BASE_URL}/uploads/${uid}`);
          }
        }

        const firstUploadId = post.upload_ids[0];
        const firstData = uploadData[firstUploadId];
        const isVideo = firstData?.mime_type?.startsWith('video/') || firstUploadId.endsWith('.mp4');
        const isPdf = firstData?.mime_type === 'application/pdf' || firstUploadId.endsWith('.pdf');

        if (platform === 'instagram' && derivatives.instagram_4x5 && !isVideo) {
          imageUrl = derivatives.instagram_4x5.startsWith('http') ? derivatives.instagram_4x5 : `${BASE_URL}${derivatives.instagram_4x5}`;
        } else if (platform === 'linkedin' && derivatives.linkedin_1x1 && !isVideo && !isPdf) {
          imageUrl = derivatives.linkedin_1x1.startsWith('http') ? derivatives.linkedin_1x1 : `${BASE_URL}${derivatives.linkedin_1x1}`;
        } else if (firstData?.url) {
          if (isVideo) {
            videoUrl = firstData.url;
          } else if (isPdf) {
            pdfUrl = firstData.url;
          } else {
            imageUrl = firstData.url;
          }
        } else {
          imageUrl = firstUploadId.startsWith('http') ? firstUploadId : `${BASE_URL}/uploads/${firstUploadId}`;
        }

        if (allUrls.length > 1 && !isVideo && !isPdf) {
          mediaUrls = allUrls;
        }
      }

      const result = await adapter.publish({
        content: post.content,
        uploadIds: post.upload_ids,
        firstComment: post.first_comment,
        account,
        imageUrl,
        videoUrl,
        mediaUrls,
        pdfUrl,
        mediaType: mediaUrls && mediaUrls.length > 1 ? 'CAROUSEL' : (post.media_type || undefined),
      });

      // Midia ainda processando na rede (ex: container IG) = adia pro proximo tick, nao e erro
      const errStr = typeof result.error === 'object' ? (result.error?.code + ' ' + result.error?.message) : String(result.error || '');
      if (!result.success && /STILL_PROCESSING/i.test(errStr)) {
        return { platform, deferred: true, reason: 'media_processing' };
      }

      const { error: ppError } = await supabase
        .from('post_platforms')
        .update({
          status: result.success ? 'posted' : 'error',
          external_id: result.externalId || null,
          external_url: result.externalUrl || null,
          errors: result.error ? result.error : null,
        })
        .eq('post_id', postId)
        .eq('platform', platform);
      if (ppError) throw ppError;

      // Metering: registra evento de billing após publicação bem-sucedida
      if (result.success) {
        const hasLink = /\bhttps?:\/\//i.test(post.content || '');
        const idempotencyKey = `post_${postId}_${platform}`;

        try {
          await recordBillingEvent({
            teamId: post.team_id,
            orgId,
            eventType: 'post',
            platform,
            units: 1,
            unitCostCents: 15, // R$ 0,15 por post
            idempotencyKey,
            metadata: { post_id: postId, external_id: result.externalId },
          });

          // Post no X com link: evento adicional 'x_post_link' (R$ 0,20)
          if (platform === 'x' && hasLink) {
            await recordBillingEvent({
              teamId: post.team_id,
              orgId,
              eventType: 'x_post_link',
              platform: 'x',
              units: 1,
              unitCostCents: 20,
              idempotencyKey: `${idempotencyKey}_link`,
              metadata: { post_id: postId },
            });
          }
        } catch {
          // Metering não deve bloquear a publicação
        }
      }

      return { platform, ...result };
    })
  );

  const results = [
    ...settled.map((s, i) =>
      s.status === 'fulfilled'
        ? s.value
        : { platform: pendingPlatforms[i], success: false, error: s.reason?.message || 'Erro interno' }
    ),
    ...post.platforms
      .filter((pl: string) => alreadyPosted.has(pl))
      .map((pl: string) => ({ platform: pl, success: true })),
  ];

  // Erros de publicação viram reports no painel admin (exportável p/ diagnóstico)
  // deferred = adiado por ritmo da rede — NAO e erro, fica pendente pro proximo tick
  const failures = results.filter((r: any) => !r.success && !r.deferred);
  for (const f of failures) {
    const errMsg = typeof f.error === 'object' ? (f.error?.message || JSON.stringify(f.error)) : String(f.error || 'Erro desconhecido');
    try {
      await supabase.from('reports').insert({
        team_id: post.team_id,
        category: 'publish_error',
        message: `[${f.platform}] ${errMsg}`,
        page_url: `post:${postId}`,
        status: 'open',
      });
    } catch {}
  }

  const hasError = failures.length > 0;
  const hasDeferred = results.some((r: any) => r.deferred);
  const anyPosted = results.some((r: any) => r.success);
  // se sobrou plataforma adiada, o post volta pra fila (cron repete no proximo tick)
  const finalStatus = hasDeferred ? 'scheduled' : hasError ? 'error' : 'posted';

  // published_at so atualiza quando algo publicou de verdade — senao quebra o pacing por rede
  const postUpdate: any = { status: finalStatus, external_data: results, errors: failures };
  if (anyPosted) postUpdate.published_at = new Date().toISOString();

  const { error: finalError } = await supabase
    .from('posts')
    .update(postUpdate)
    .eq('id', postId);
  if (finalError) throw finalError;

  return { status: finalStatus, results };
}
