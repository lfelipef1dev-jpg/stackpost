import { getSupabase } from '@/lib/supabase';
import { execSync } from 'child_process';
import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
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
const UPLOAD_DIR = 'C:/Users/lfeli/Desktop/StackPost/videos';

function buildImageUrl(uploadId: string, platform: string, derivatives: Record<string, string> = {}): string {
  // Derivativas ja vem com URL completa do Supabase Storage
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
  if (postError || !post) return { error: 'Post nao encontrado' };

  const { error: statusError } = await supabase
    .from('posts')
    .update({ status: 'processing' })
    .eq('id', postId);
  if (statusError) throw statusError;

  const { data: accounts, error: accountsError } = await supabase
    .from('social_accounts')
    .select('*')
    .in('platform', post.platforms);
  if (accountsError) throw accountsError;

  const accountsList = accounts || [];
  const derivatives = post.derivatives || {};

  // Buscar URLs dos uploads no banco
  let uploadUrls: Record<string, string> = {};
  if (post.upload_ids?.length) {
    const { data: uploads } = await supabase
      .from('uploads')
      .select('id, url')
      .in('id', post.upload_ids);
    if (uploads) {
      for (const u of uploads) {
        uploadUrls[u.id] = u.url;
      }
    }
  }

  const settled = await Promise.allSettled(
    post.platforms.map(async (platform: string) => {
      const adapter = adapters[platform];
      const account = accountsList.find((a) => a.platform === platform);

      if (!adapter) return { platform, success: false, error: 'Plataforma nao suportada' };
      if (!account) return { platform, success: false, error: 'Conta nao conectada' };

      let imageUrl: string | undefined;
      if (post.upload_ids?.length) {
        const uploadId = post.upload_ids[0];
        // Se tem derivada especifica da plataforma, usar
        if (platform === 'instagram' && derivatives.instagram_4x5) {
          imageUrl = derivatives.instagram_4x5.startsWith('http') ? derivatives.instagram_4x5 : `${BASE_URL}${derivatives.instagram_4x5}`;
        } else if (platform === 'linkedin' && derivatives.linkedin_1x1) {
          imageUrl = derivatives.linkedin_1x1.startsWith('http') ? derivatives.linkedin_1x1 : `${BASE_URL}${derivatives.linkedin_1x1}`;
        } else if (uploadUrls[uploadId]) {
          // Buscar URL do banco
          imageUrl = uploadUrls[uploadId];
        } else {
          imageUrl = uploadId.startsWith('http') ? uploadId : `${BASE_URL}/uploads/${uploadId}`;
        }
      }

      const result = await adapter.publish({
        content: post.content,
        uploadIds: post.upload_ids,
        account,
        imageUrl,
      });

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

      return { platform, ...result };
    })
  );

  // allSettled garante que falha em uma plataforma nao afeta as outras
  const results = settled.map((s, i) =>
    s.status === 'fulfilled'
      ? s.value
      : { platform: post.platforms[i], success: false, error: s.reason?.message || 'Erro interno' }
  );

  const hasError = results.some((r: any) => !r.success);
  const finalStatus = hasError ? 'error' : 'posted';

  const { error: finalError } = await supabase
    .from('posts')
    .update({
      status: finalStatus,
      published_at: new Date().toISOString(),
      external_data: results,
      errors: results.filter((r: any) => !r.success),
    })
    .eq('id', postId);
  if (finalError) throw finalError;

  return { status: finalStatus, results };
}
