import { PlatformAdapter, PublishParams, PublishResult } from './base';
import { normalizeError, NormalizedError } from '@/lib/errors';

type FullPublishResult = PublishResult & { platform?: string; error?: NormalizedError };

export class TwitterAdapter extends PlatformAdapter {
  name = 'twitter';
  platform = 'twitter';

  async publish(params: PublishParams): Promise<FullPublishResult> {
    const accessToken = params.account?.access_token;
    const content = params.content;
    const mediaUrls = params.uploadIds;

    if (!accessToken) {
      return {
        success: false,
        platform: this.platform,
        error: normalizeError(new Error('No access token'), this.platform),
      };
    }

    try {
      const body: any = {
        text: content.slice(0, 280),
      };

      if (mediaUrls && mediaUrls.length > 0) {
        const mediaIds: string[] = [];
        for (const url of mediaUrls.slice(0, 4)) {
          // X v1.1 media/upload exige binario real. Fazer download da URL primeiro.
          const isHttpUrl = url.startsWith('http');
          let mediaBuffer: Buffer;
          let mimeType = 'image/jpeg';
          if (isHttpUrl) {
            const dlRes = await fetch(url);
            if (!dlRes.ok) {
              console.warn(`Twitter: falha ao baixar midia ${url}`);
              continue;
            }
            mimeType = dlRes.headers.get('content-type') || (url.match(/\.(mp4|mov)$/i) ? 'video/mp4' : 'image/jpeg');
            const arrayBuf = await dlRes.arrayBuffer();
            mediaBuffer = Buffer.from(arrayBuf);
          } else {
            // Se nao for URL, nao temos binario - pular
            console.warn(`Twitter: uploadId sem URL http nao suportado (${url})`);
            continue;
          }

          const fd = new FormData();
          const blob = new Blob([new Uint8Array(mediaBuffer)], { type: mimeType });
          fd.append('media', blob);

          const mediaRes = await fetch('https://upload.twitter.com/1.1/media/upload.json', {
            method: 'POST',
            headers: { Authorization: `Bearer ${accessToken}` },
            body: fd,
          });
          const mediaData = await mediaRes.json();
          if (mediaData.media_id_string) {
            mediaIds.push(mediaData.media_id_string);
          } else {
            console.warn(`Twitter: upload falhou`, mediaData);
          }
        }
        if (mediaIds.length > 0) body.media = { media_ids: mediaIds };
      }

      const res = await fetch('https://api.twitter.com/2/tweets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        return {
          success: false,
          platform: this.platform,
          error: normalizeError(new Error(data.detail || data.title || 'Twitter API error'), this.platform),
        };
      }

      return {
        success: true,
        platform: this.platform,
        externalId: data.data?.id,
        externalUrl: `https://x.com/i/web/status/${data.data?.id}`,
      };
    } catch (error) {
      return {
        success: false,
        platform: this.platform,
        error: normalizeError(error, this.platform),
      };
    }
  }

  async validateMedia(file: { mimeType: string; size: number }): Promise<{ valid: boolean; error?: string }> {
    const allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4'];
    if (!allowed.includes(file.mimeType)) {
      return { valid: false, error: 'X aceita apenas JPEG, PNG, GIF, WebP ou MP4' };
    }
    if (file.size > 5 * 1024 * 1024) {
      return { valid: false, error: 'X aceita arquivos ate 5MB' };
    }
    return { valid: true };
  }

  async getAnalytics(externalId: string, accessToken: string): Promise<any> {
    try {
      const res = await fetch(`https://api.twitter.com/2/tweets/${externalId}?tweet.fields=public_metrics`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const data = await res.json();
      const metrics = data.data?.public_metrics || {};
      return {
        impressions: metrics.impression_count || 0,
        likes: metrics.like_count || 0,
        comments: metrics.reply_count || 0,
        shares: metrics.retweet_count || 0,
      };
    } catch {
      return { impressions: 0, likes: 0, comments: 0, shares: 0 };
    }
  }
}
