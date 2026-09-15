import { logger } from '@/lib/logger';
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
    if (!pageId) return { success: false, error: normalizeError(new Error('Page ID obrigatório'), this.platform) };
    if (content.length > 63206) return { success: false, error: { code: 'VALIDATION', message: 'Facebook: texto maximo 63206 caracteres.' } };
    if (firstComment && firstComment.length > 8000) return { success: false, error: { code: 'VALIDATION', message: 'Facebook: firstComment maximo 8000 caracteres.' } };
    if (params.uploadIds && params.uploadIds.length > 4) return { success: false, error: { code: 'VALIDATION', message: 'Facebook: maximo 4 imagens por post.' } };

    try {
      const postResult = await this.publishMedia(pageId, accessToken, content, mediaType, params.imageUrl || '', params.videoUrl || '', params.mediaUrls);

      if (postResult.success && firstComment && postResult.externalId) {
        await fetch(`https://graph.facebook.com/v26.0/${postResult.externalId}/comments`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: firstComment, access_token: accessToken }),
        }).catch((err) => logger.warn('Facebook first comment error:', err));
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
    videoUrl: string,
    mediaUrls?: string[]
  ): Promise<PublishResult> {
    // STORY: Page Stories API — primeiro sobe foto nao-publicada, depois /photo_stories
    if (mediaType === 'STORY' && imageUrl) {
      const photoRes = await fetch(`https://graph.facebook.com/v26.0/${pageId}/photos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ access_token: accessToken, published: false, url: imageUrl }),
      });
      const photo = await photoRes.json();
      if (!photoRes.ok || !photo.id) {
        return { success: false, error: normalizeError(new Error(photo.error?.message || 'Facebook story photo upload error'), this.platform) };
      }

      const res = await fetch(`https://graph.facebook.com/v26.0/${pageId}/photo_stories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ access_token: accessToken, photo_id: photo.id }),
      });
      const data = await res.json();
      if (!res.ok) return { success: false, error: normalizeError(new Error(data.error?.message || 'Facebook story API error'), this.platform) };

      return { success: true, externalId: data.post_id || data.id };
    }

    // REEL: Video Reels API — 3 fases: start -> rupload -> finish
    if (mediaType === 'REEL' && videoUrl) {
      const startRes = await fetch(`https://graph.facebook.com/v26.0/${pageId}/video_reels`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ access_token: accessToken, upload_phase: 'start' }),
      });
      const start = await startRes.json();
      if (!startRes.ok || !start.video_id) {
        return { success: false, error: normalizeError(new Error(start.error?.message || 'Facebook reel start error'), this.platform) };
      }

      const videoRes = await fetch(videoUrl);
      const videoBlob = await videoRes.blob();
      const uploadRes = await fetch(start.upload_url, {
        method: 'POST',
        headers: {
          Authorization: `OAuth ${accessToken}`,
          offset: '0',
          file_size: String(videoBlob.size),
          'Content-Type': 'application/octet-stream',
        },
        body: videoBlob,
      });
      if (!uploadRes.ok) {
        const upErr = await uploadRes.json().catch(() => ({}));
        return { success: false, error: normalizeError(new Error(upErr.error?.message || 'Facebook reel upload error'), this.platform) };
      }

      const finishRes = await fetch(`https://graph.facebook.com/v26.0/${pageId}/video_reels`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          access_token: accessToken,
          upload_phase: 'finish',
          video_id: start.video_id,
          video_state: 'PUBLISHED',
          description: content,
        }),
      });
      const finish = await finishRes.json();
      if (!finishRes.ok) return { success: false, error: normalizeError(new Error(finish.error?.message || 'Facebook reel finish error'), this.platform) };

      return { success: true, externalId: start.video_id };
    }

    // VIDEO normal: upload via /videos
    if (videoUrl) {
      // Usar file_url em vez de fetch+source para evitar loop no Cloudflare Worker
      const res = await fetch(`https://graph.facebook.com/v26.0/${pageId}/videos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          access_token: accessToken,
          description: content,
          file_url: videoUrl,
        }),
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
      // CAROUSEL: multiplas imagens (até 4)
      if (mediaUrls && mediaUrls.length > 1) {
        const mediaIds: string[] = [];
        for (const url of mediaUrls.slice(0, 4)) {
          const res = await fetch(`https://graph.facebook.com/v26.0/${pageId}/photos`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              access_token: accessToken,
              published: false,
              url: url,
            }),
          });
          const data = await res.json();
          if (!res.ok) return { success: false, error: normalizeError(new Error(data.error?.message || 'Facebook carousel photo error'), this.platform) };
          mediaIds.push(data.id);
        }

        // Postar no feed com attached_media
        const attachedMedia = mediaIds.map((id) => ({ media_fbid: id }));
        const feedRes = await fetch(`https://graph.facebook.com/v26.0/${pageId}/feed`, {
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

      // Usar url em vez de fetch+source para evitar loop no Cloudflare Worker
      const res = await fetch(`https://graph.facebook.com/v26.0/${pageId}/photos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          access_token: accessToken,
          message: content,
          url: imageUrl,
        }),
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
    const res = await fetch(`https://graph.facebook.com/v26.0/${pageId}/feed`, {
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
