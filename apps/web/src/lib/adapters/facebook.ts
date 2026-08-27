import { PlatformAdapter, PublishParams, PublishResult } from './base';
import { normalizeError } from '@/lib/errors';

export class FacebookAdapter extends PlatformAdapter {
  name = 'facebook';
  platform = 'facebook';

  async publish(params: PublishParams): Promise<PublishResult> {
    const accessToken = params.account?.access_token;
    const pageId = params.account?.platform_account_id || params.account?.page_id;
    const content = params.content;

    if (!accessToken) return { success: false, error: normalizeError(new Error('No access token'), this.platform) };
    if (!pageId) return { success: false, error: normalizeError(new Error('Page ID obrigatorio'), this.platform) };
    if (content.length > 63206) return { success: false, error: { code: 'VALIDATION', message: 'Facebook: texto maximo 63206 caracteres.' } };

    try {
      // VIDEO: upload via video endpoint
      if (params.videoUrl) {
        // Baixar video
        const videoRes = await fetch(params.videoUrl);
        const videoBlob = await videoRes.blob();

        const formData = new FormData();
        formData.append('access_token', accessToken);
        formData.append('description', content);
        formData.append('source', videoBlob, 'video.mp4');

        const res = await fetch(`https://graph.facebook.com/v19.0/${pageId}/videos`, {
          method: 'POST',
          body: formData,
        });

        const data = await res.json();
        if (!res.ok) return { success: false, error: normalizeError(new Error(data.error?.message || 'Facebook video API error'), this.platform) };

        const videoId = data.id;
        return {
          success: true,
          externalId: videoId,
          externalUrl: `https://facebook.com/${pageId}/videos/${videoId}`,
        };
      }

      // IMAGE: upload via photos endpoint (foto real, nao link)
      if (params.imageUrl) {
        // Baixar imagem
        const imgRes = await fetch(params.imageUrl);
        const imgBlob = await imgRes.blob();

        const formData = new FormData();
        formData.append('access_token', accessToken);
        formData.append('message', content);
        formData.append('source', imgBlob, 'image.jpg');

        const res = await fetch(`https://graph.facebook.com/v19.0/${pageId}/photos`, {
          method: 'POST',
          body: formData,
        });

        const data = await res.json();
        if (!res.ok) return { success: false, error: normalizeError(new Error(data.error?.message || 'Facebook photo API error'), this.platform) };

        const photoId = data.id;
        const postId = data.post_id || `${pageId}_${photoId}`;
        return {
          success: true,
          externalId: postId,
          externalUrl: `https://facebook.com/${postId.replace('_', '/photos/')}`,
        };
      }

      // TEXT ONLY: feed post
      const res = await fetch(`https://graph.facebook.com/v19.0/${pageId}/feed`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: content, access_token: accessToken }),
      });

      const data = await res.json();
      if (!res.ok) return { success: false, error: normalizeError(new Error(data.error?.message || 'Facebook API error'), this.platform) };

      const postId = data.id;
      return {
        success: true,
        externalId: postId,
        externalUrl: `https://facebook.com/${postId.replace('_', '/posts/')}`,
      };
    } catch (error) {
      return { success: false, error: normalizeError(error, this.platform) };
    }
  }
}
