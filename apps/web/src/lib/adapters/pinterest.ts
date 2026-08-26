import { PlatformAdapter, PublishParams, PublishResult } from './base';
import { normalizeError } from '@/lib/errors';

export class PinterestAdapter extends PlatformAdapter {
  name = 'pinterest';
  platform = 'pinterest';

  async publish(params: PublishParams): Promise<PublishResult> {
    const accessToken = params.account?.access_token;
    const boardId = params.account?.platform_account_id || params.account?.board_id;
    const content = params.content;

    if (!accessToken) return { success: false, error: normalizeError(new Error('No access token'), this.platform) };
    if (!boardId) return { success: false, error: normalizeError(new Error('Board ID obrigatorio'), this.platform) };
    if (content.length > 500) return { success: false, error: { code: 'VALIDATION', message: 'Pinterest: descricao maxima 500 caracteres.' } };
    if (!params.imageUrl) return { success: false, error: { code: 'VALIDATION', message: 'Pinterest: imagem obrigatoria.' } };

    try {
      const res = await fetch(`https://api.pinterest.com/v5/pins`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          board_id: boardId,
          title: content.slice(0, 100),
          description: content,
          link: params.imageUrl,
          media_source: {
            source_type: 'image_url',
            url: params.imageUrl,
          },
        }),
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
