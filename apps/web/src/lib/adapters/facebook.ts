import { PlatformAdapter, PublishParams, PublishResult } from './base';
import { normalizeError } from '@/lib/errors';

export class FacebookAdapter extends PlatformAdapter {
  name = 'facebook';
  platform = 'facebook';

  async publish(params: PublishParams): Promise<PublishResult> {
    const accessToken = params.account?.access_token;
    const pageId = params.account?.platform_account_id || params.account?.page_id;
    const content = params.content;
    const firstComment = params.firstComment;
    const mediaType = params.mediaType || 'POST';

    if (!accessToken) return { success: false, error: normalizeError(new Error('No access token'), this.platform) };
    if (!pageId) return { success: false, error: normalizeError(new Error('Page ID obrigatorio'), this.platform) };
    if (content.length > 63206) return { success: false, error: { code: 'VALIDATION', message: 'Facebook: texto maximo 63206 caracteres.' } };
    if (firstComment && firstComment.length > 8000) return { success: false, error: { code: 'VALIDATION', message: 'Facebook: firstComment maximo 8000 caracteres.' } };
    if (params.uploadIds && params.uploadIds.length > 4) return { success: false, error: { code: 'VALIDATION', message: 'Facebook: maximo 4 imagens por post.' } };

    try {
      const postResult = await this.publishMedia(pageId, accessToken, content, mediaType, params.imageUrl || '', params.videoUrl || '');

      if (postResult.success && firstComment && postResult.externalId) {
        await fetch(`https://graph.facebook.com/v19.0/${postResult.externalId}/comments`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: firstComment, access_token: accessToken }),
        }).catch((err) => console.warn('Facebook first comment error:', err));
      }

      return postResult;
    } catch (error) {
      return { success: false, error: normalizeError(error, this.platform) };
    }
  }

  private async publishMedia(
    pageId: string,
    accessToken: string,
    content: string,
    mediaType: string,
    imageUrl: string,
    videoUrl: string
  ): Promise<PublishResult> {
    // STORY: upload de imagem para /stories
    if (mediaType === 'STORY' && imageUrl) {
      const imgRes = await fetch(imageUrl);
      const imgBlob = await imgRes.blob();
      const formData = new FormData();
      formData.append('access_token', accessToken);
      if (content) formData.append('caption', content);
      formData.append('source', imgBlob, 'image.jpg');

      const res = await fetch(`https://graph.facebook.com/v19.0/${pageId}/stories`, {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) return { success: false, error: normalizeError(new Error(data.error?.message || 'Facebook story API error'), this.platform) };

      return { success: true, externalId: data.id };
    }

    // REEL: upload de video para /reels
    if (mediaType === 'REEL' && videoUrl) {
      const videoRes = await fetch(videoUrl);
      const videoBlob = await videoRes.blob();
      const formData = new FormData();
      formData.append('access_token', accessToken);
      formData.append('caption', content);
      formData.append('video', videoBlob, 'video.mp4');

      const res = await fetch(`https://graph.facebook.com/v19.0/${pageId}/reels`, {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) return { success: false, error: normalizeError(new Error(data.error?.message || 'Facebook reels API error'), this.platform) };

      return { success: true, externalId: data.id };
    }

    // VIDEO normal: upload via /videos
    if (videoUrl) {
      const videoRes = await fetch(videoUrl);
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

    // IMAGE normal: upload via /photos
    if (imageUrl) {
      // CAROUSEL: multiplas imagens (ate 4)
      if (params.mediaUrls && params.mediaUrls.length > 1) {
        const mediaIds: string[] = [];
        for (const url of params.mediaUrls.slice(0, 4)) {
          const imgRes = await fetch(url);
          const imgBlob = await imgRes.blob();
          const formData = new FormData();
          formData.append('access_token', accessToken);
          formData.append('published', 'false');
          formData.append('source', imgBlob, 'image.jpg');
          const res = await fetch(`https://graph.facebook.com/v19.0/${pageId}/photos`, {
            method: 'POST',
            body: formData,
          });
          const data = await res.json();
          if (!res.ok) return { success: false, error: normalizeError(new Error(data.error?.message || 'Facebook carousel photo error'), this.platform) };
          mediaIds.push(data.id);
        }

        // Postar no feed com attached_media
        const attachedMedia = mediaIds.map((id) => ({ media_fbid: id }));
        const feedRes = await fetch(`https://graph.facebook.com/v19.0/${pageId}/feed`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: content,
            attached_media: attachedMedia,
            access_token: accessToken,
          }),
        });
        const feedData = await feedRes.json();
        if (!feedRes.ok) return { success: false, error: normalizeError(new Error(feedData.error?.message || 'Facebook carousel feed error'), this.platform) };
        return {
          success: true,
          externalId: feedData.id,
          externalUrl: `https://facebook.com/${feedData.id.replace('_', '/posts/')}`,
        };
      }

      const imgRes = await fetch(imageUrl);
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

    // TEXT ONLY: /feed
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
  }
}
