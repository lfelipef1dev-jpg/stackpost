import { PlatformAdapter, PublishParams, PublishResult } from './base';
import { normalizeError } from '@/lib/errors';

export class TikTokAdapter extends PlatformAdapter {
  name = 'tiktok';
  platform = 'tiktok';

  async publish(params: PublishParams): Promise<PublishResult> {
    const accessToken = params.account?.access_token;
    const content = params.content;

    if (!accessToken) return { success: false, error: normalizeError(new Error('No access token'), this.platform) };
    if (content.length > 2200) return { success: false, error: { code: 'VALIDATION', message: 'TikTok: texto maximo 2200 caracteres.' } };

    // TikTok suporta VIDEO (Photo Mode também, mas usa endpoint diferente)
    const videoUrl = params.videoUrl;
    const imageUrl = params.imageUrl;

    if (!videoUrl && !imageUrl) {
      return { success: false, error: { code: 'VALIDATION', message: 'TikTok: video ou imagem obrigatória.' } };
    }

    try {
      // Se tem video, usar video/init com FILE_UPLOAD (dominio nao precisa ser verificado)
      if (videoUrl) {
        const videoRes = await fetch(videoUrl);
        if (!videoRes.ok) return { success: false, error: normalizeError(new Error('Falha ao baixar vídeo'), this.platform) };
        const videoBytes = new Uint8Array(await videoRes.arrayBuffer());
        const videoSize = videoBytes.length;

        const initRes = await fetch('https://open.tiktokapis.com/v2/post/publish/video/init/', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            post_info: {
              title: content.slice(0, 150),
              privacy_level: 'SELF_ONLY',
            },
            source_info: {
              source: 'FILE_UPLOAD',
              video_size: videoSize,
              chunk_size: videoSize,
              total_chunk_count: 1,
            },
          }),
        });

        const initData = await initRes.json();
        if (!initRes.ok) return { success: false, error: normalizeError(new Error(initData.error?.message || 'TikTok API error'), this.platform) };

        const publishId = initData.data?.publish_id;
        const uploadUrl = initData.data?.upload_url;
        if (!publishId || !uploadUrl) return { success: false, error: normalizeError(new Error('TikTok: init sem publish_id/upload_url'), this.platform) };

        const putRes = await fetch(uploadUrl, {
          method: 'PUT',
          headers: {
            'Content-Type': 'video/mp4',
            'Content-Length': String(videoSize),
            'Content-Range': `bytes 0-${videoSize - 1}/${videoSize}`,
          },
          body: videoBytes,
        });
        if (!putRes.ok) return { success: false, error: normalizeError(new Error(`TikTok upload falhou: ${putRes.status}`), this.platform) };

        return {
          success: true,
          externalId: publishId,
          externalUrl: `https://tiktok.com/@${params.account?.username || 'user'}/video/${publishId}`,
        };
      }

      // Se tem apenas imagem, usar Photo Mode (endpoint v2/post/publish/content/info/)
      if (imageUrl) {
        const initRes = await fetch('https://open.tiktokapis.com/v2/post/publish/content/info/', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            post_info: {
              title: content.slice(0, 150),
              privacy_level: 'PUBLIC_TO_EVERYONE',
              disable_comment: false,
              disable_duet: false,
              disable_stitch: false,
            },
            source_info: {
              source: 'PULL_FROM_URL',
              photo_images: [imageUrl],
              photo_cover_index: 0,
            },
            post_mode: 'PHOTO_CONTENT',
          }),
        });

        const initData = await initRes.json();
        if (!initRes.ok) return { success: false, error: normalizeError(new Error(initData.error?.message || 'TikTok Photo API error'), this.platform) };

        const publishId = initData.data?.publish_id;
        return {
          success: true,
          externalId: publishId,
          externalUrl: `https://tiktok.com/@${params.account?.username || 'user'}/photo/${publishId}`,
        };
      }

      return { success: false, error: { code: 'VALIDATION', message: 'TikTok: mídia obrigatória.' } };
    } catch (error) {
      return { success: false, error: normalizeError(error, this.platform) };
    }
  }
}
