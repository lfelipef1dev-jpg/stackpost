import { PlatformAdapter, PublishParams, PublishResult } from './base';
import { normalizeError } from '@/lib/errors';

export class PinterestAdapter extends PlatformAdapter {
  name = 'pinterest';
  platform = 'pinterest';

  async publish(params: PublishParams): Promise<PublishResult> {
    const accessToken = params.account?.access_token;
    const boardId = params.account?.platform_account_id || params.account?.board_id;
    const content = params.content;
    const link = params.account?.platform_metadata?.link || '';

    if (!accessToken) return { success: false, error: normalizeError(new Error('No access token'), this.platform) };
    if (!boardId) return { success: false, error: normalizeError(new Error('Board ID obrigatorio'), this.platform) };
    if (content.length > 500) return { success: false, error: { code: 'VALIDATION', message: 'Pinterest: descricao maxima 500 caracteres.' } };

    const isVideo = params.videoUrl;
    const isImage = params.imageUrl;
    if (!isVideo && !isImage) {
      return { success: false, error: { code: 'VALIDATION', message: 'Pinterest: video ou imagem obrigatoria.' } };
    }

    try {
      const body: any = {
        board_id: boardId,
        title: content.slice(0, 100),
        description: content,
      };

      // link deve ser o site de destino (nao a URL da midia)
      if (link) body.link = link;

      if (isVideo) {
        body.media_source = {
          source_type: 'video_url',
          url: isVideo,
        };
      } else {
        body.media_source = {
          source_type: 'image_url',
          url: isImage,
        };
      }

      const res = await fetch(`https://api.pinterest.com/v5/pins`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) return { success: false, error: normalizeError(new Error(data.message || data.error?.message || 'Pinterest API error'), this.platform) };

      return {
        success: true,
        externalId: data.id,
        externalUrl: `https://pinterest.com/pin/${data.id}`,
      };
    } catch (error) {
      return { success: false, error: normalizeError(error, this.platform) };
    }
  }
}
