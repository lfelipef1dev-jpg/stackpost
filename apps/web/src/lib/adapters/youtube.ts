import { PlatformAdapter, PublishParams, PublishResult } from './base';
import { normalizeError } from '@/lib/errors';

export class YouTubeAdapter extends PlatformAdapter {
  name = 'youtube';
  platform = 'youtube';

  async publish(params: PublishParams): Promise<PublishResult> {
    const accessToken = params.account?.access_token;
    const content = params.content;

    if (!accessToken) return { success: false, error: normalizeError(new Error('No access token'), this.platform) };
    if (content.length > 5000) return { success: false, error: { code: 'VALIDATION', message: 'YouTube: texto maximo 5000 caracteres.' } };
    if (!params.imageUrl) return { success: false, error: { code: 'VALIDATION', message: 'YouTube: video obrigatorio.' } };

    try {
      // YouTube Data API v3 - community post (via channel)
      const channelId = params.account?.platform_account_id || params.account?.channel_id;
      if (!channelId) return { success: false, error: normalizeError(new Error('Channel ID obrigatorio'), this.platform) };

      const res = await fetch(`https://www.googleapis.com/youtube/v3/channels?part=contentDetails&id=${channelId}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      const data = await res.json();
      if (!res.ok) return { success: false, error: normalizeError(new Error(data.error?.message || 'YouTube API error'), this.platform) };

      // YouTube Community posts require the channel's Bearer token
      // For video uploads, use the videos endpoint
      const videoRes = await fetch('https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          snippet: { title: content.slice(0, 100), description: content },
          status: { privacyStatus: 'public' },
        }),
      });

      const videoData = await videoRes.json();
      if (!videoRes.ok) return { success: false, error: normalizeError(new Error(videoData.error?.message || 'YouTube upload error'), this.platform) };

      const videoId = videoData.id;
      return {
        success: true,
        externalId: videoId,
        externalUrl: `https://youtube.com/watch?v=${videoId}`,
      };
    } catch (error) {
      return { success: false, error: normalizeError(error, this.platform) };
    }
  }
}
