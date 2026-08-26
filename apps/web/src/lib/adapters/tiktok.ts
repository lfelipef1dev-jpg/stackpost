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
    if (!params.imageUrl) return { success: false, error: { code: 'VALIDATION', message: 'TikTok: video ou imagem obrigatoria.' } };

    try {
      // TikTok Content API - init upload
      const initRes = await fetch('https://open.tiktokapis.com/v2/post/publish/video/init/', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          post_info: {
            title: content.slice(0, 150),
            privacy_level: 'PUBLIC_TO_EVERYONE',
          },
          source_info: {
            source: 'PULL_FROM_URL',
            video_url: params.imageUrl,
          },
        }),
      });

      const initData = await initRes.json();
      if (!initRes.ok) return { success: false, error: normalizeError(new Error(initData.error?.message || 'TikTok API error'), this.platform) };

      const publishId = initData.data?.publish_id;
      return {
        success: true,
        externalId: publishId,
        externalUrl: `https://tiktok.com/@${params.account?.username || 'user'}/video/${publishId}`,
      };
    } catch (error) {
      return { success: false, error: normalizeError(error, this.platform) };
    }
  }
}
