import { PlatformAdapter, PublishParams, PublishResult } from './base';
import { normalizeError } from '@/lib/errors';

export class ThreadsAdapter extends PlatformAdapter {
  name = 'threads';
  platform = 'threads';

  async publish(params: PublishParams): Promise<PublishResult> {
    const accessToken = params.account?.access_token;
    const userId = params.account?.platform_account_id;
    const content = params.content;

    if (!accessToken) return { success: false, error: normalizeError(new Error('No access token'), this.platform) };
    if (!userId) return { success: false, error: normalizeError(new Error('User ID obrigatorio'), this.platform) };
    if (content.length > 500) return { success: false, error: { code: 'VALIDATION', message: 'Threads: texto maximo 500 caracteres.' } };

    try {
      // Determinar media_type baseado no que foi passado
      const isVideo = params.videoUrl;
      const isImage = params.imageUrl;
      const isCarousel = params.mediaUrls && params.mediaUrls.length > 1;

      let mediaType = 'TEXT';
      let mediaBody: Record<string, any> = { text: content, access_token: accessToken };

      if (isCarousel && params.mediaUrls && params.mediaUrls.length > 1) {
        // Threads carousel: criar cada child, depois container pai
        const childrenIds: string[] = [];
        for (const url of params.mediaUrls.slice(0, 10)) {
          const isVid = url.match(/\.(mp4|mov|webm)$/i);
          const childBody: Record<string, any> = {
            access_token: accessToken,
            is_carousel_item: true,
          };
          if (isVid) {
            childBody.media_type = 'VIDEO';
            childBody.video_url = url;
          } else {
            childBody.media_type = 'IMAGE';
            childBody.image_url = url;
          }
          const childRes = await fetch(`https://graph.threads.net/v1.0/${userId}/threads`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(childBody),
          });
          const childData = await childRes.json();
          if (!childRes.ok) return { success: false, error: normalizeError(new Error(childData.error?.message || 'Threads child error'), this.platform) };
          childrenIds.push(childData.id);
        }

        mediaType = 'CAROUSEL';
        mediaBody = {
          media_type: 'CAROUSEL',
          children: childrenIds.join(','),
          caption: content,
          access_token: accessToken,
        };
      } else if (isVideo) {
        mediaType = 'VIDEO';
        mediaBody = { media_type: 'VIDEO', video_url: params.videoUrl, caption: content, access_token: accessToken };
      } else if (isImage) {
        mediaType = 'IMAGE';
        mediaBody = { media_type: 'IMAGE', image_url: params.imageUrl, caption: content, access_token: accessToken };
      }

      // Criar container
      const createRes = await fetch(`https://graph.threads.net/v1.0/${userId}/threads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mediaBody),
      });

      const createData = await createRes.json();
      if (!createRes.ok) return { success: false, error: normalizeError(new Error(createData.error?.message || 'Threads API error'), this.platform) };

      const containerId = createData.id;
      if (!containerId) return { success: false, error: normalizeError(new Error('Threads: container sem id'), this.platform) };

      // Publicar container
      const publishRes = await fetch(`https://graph.threads.net/v1.0/${userId}/threads_publish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          creation_id: containerId,
          access_token: accessToken,
        }),
      });

      const publishData = await publishRes.json();
      if (!publishRes.ok) return { success: false, error: normalizeError(new Error(publishData.error?.message || 'Threads publish error'), this.platform) };

      const postId = publishData.id;
      if (!postId) return { success: false, error: normalizeError(new Error('Threads: publish sem id'), this.platform) };

      return {
        success: true,
        externalId: postId,
        externalUrl: `https://threads.net/@${params.account?.username || userId}/post/${postId}`,
      };
    } catch (error) {
      return { success: false, error: normalizeError(error, this.platform) };
    }
  }
}
