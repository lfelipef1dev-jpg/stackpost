import { PlatformAdapter, PublishParams, PublishResult } from './base';
import { normalizeError } from '@/lib/errors';

export class GoogleBusinessAdapter extends PlatformAdapter {
  name = 'google_business';
  platform = 'google_business';

  async publish(params: PublishParams): Promise<PublishResult> {
    const accessToken = params.account?.access_token;
    const locationId = params.account?.platform_account_id || params.account?.location_id;
    const content = params.content;

    if (!accessToken) return { success: false, error: normalizeError(new Error('No access token'), this.platform) };
    if (!locationId) return { success: false, error: normalizeError(new Error('Location ID obrigatorio'), this.platform) };
    if (content.length > 1500) return { success: false, error: { code: 'VALIDATION', message: 'Google Business: texto maximo 1500 caracteres.' } };

    try {
      // Google Business Profile API - localPosts
      const body: any = {
        languageCode: 'pt-BR',
        summary: content,
        topicType: 'STANDARD',
      };
      if (params.imageUrl) {
        body.media = [{ mediaFormat: 'PHOTO', googleUrl: params.imageUrl }];
      }

      const res = await fetch(`https://mybusinessbusinessinformation.googleapis.com/v1/${locationId}/localPosts`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) return { success: false, error: normalizeError(new Error(data.error?.message || 'Google Business API error'), this.platform) };

      const postId = data.name;
      return {
        success: true,
        externalId: postId,
        externalUrl: `https://business.google.com/posts/l/${locationId}`,
      };
    } catch (error) {
      return { success: false, error: normalizeError(error, this.platform) };
    }
  }
}
