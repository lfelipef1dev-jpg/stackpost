import { PlatformAdapter, PublishParams, PublishResult } from './base';
import { normalizeError } from '@/lib/errors';

export class SnapchatAdapter extends PlatformAdapter {
  name = 'snapchat';
  platform = 'snapchat';

  async publish(params: PublishParams): Promise<PublishResult> {
    const accessToken = params.account?.access_token;
    const adAccountId = params.account?.platform_account_id || params.account?.ad_account_id;
    const content = params.content;

    if (!accessToken) return { success: false, error: normalizeError(new Error('No access token'), this.platform) };
    if (!adAccountId) return { success: false, error: normalizeError(new Error('Ad Account ID obrigatorio'), this.platform) };
    if (content.length > 1000) return { success: false, error: { code: 'VALIDATION', message: 'Snapchat: texto maximo 1000 caracteres.' } };

    const isVideo = params.videoUrl;
    const isImage = params.imageUrl;
    if (!isVideo && !isImage) {
      return { success: false, error: { code: 'VALIDATION', message: 'Snapchat: video ou imagem obrigatoria.' } };
    }

    try {
      // Snapchat Marketing API - upload media
      const mediaRes = await fetch(`https://ads.snapchat.com/v1/adaccounts/${adAccountId}/media`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: isVideo ? 'VIDEO' : 'IMAGE',
          url: isVideo || isImage,
          name: content.slice(0, 100),
        }),
      });

      const mediaData = await mediaRes.json();
      if (!mediaRes.ok) return { success: false, error: normalizeError(new Error(mediaData.request_status?.error?.message || 'Snapchat API error'), this.platform) };

      // Snapchat responde com media como objeto (nao array)
      const mediaId = mediaData.media?.id || mediaData.media?.[0]?.id;
      if (!mediaId) {
        return { success: false, error: normalizeError(new Error('Snapchat: upload sem mediaId'), this.platform) };
      }
      return {
        success: true,
        externalId: mediaId,
        externalUrl: `https://snapchat.com/spotlight/${mediaId}`,
      };
    } catch (error) {
      return { success: false, error: normalizeError(error, this.platform) };
    }
  }
}
