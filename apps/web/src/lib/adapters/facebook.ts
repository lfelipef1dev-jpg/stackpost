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
      const body: any = { message: content };

      if (params.imageUrl) {
        body.link = params.imageUrl;
      }

      const res = await fetch(`https://graph.facebook.com/v19.0/${pageId}/feed`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...body, access_token: accessToken }),
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
