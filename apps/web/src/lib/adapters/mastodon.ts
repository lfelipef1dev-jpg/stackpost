import { PlatformAdapter, PublishParams, PublishResult } from './base';
import { normalizeError } from '@/lib/errors';

export class MastodonAdapter extends PlatformAdapter {
  name = 'mastodon';
  platform = 'mastodon';

  async publish(params: PublishParams): Promise<PublishResult> {
    const accessToken = params.account?.access_token;
    const instance = params.account?.instance || params.account?.platform_metadata?.instance;
    const content = params.content;

    if (!accessToken) return { success: false, error: normalizeError(new Error('No access token'), this.platform) };
    if (!instance) return { success: false, error: normalizeError(new Error('Instance obrigatoria'), this.platform) };
    if (content.length > 500) return { success: false, error: { code: 'VALIDATION', message: 'Mastodon: texto maximo 500 caracteres.' } };

    try {
      const baseUrl = instance.startsWith('http') ? instance : `https://${instance}`;
      const body: any = { status: content, visibility: 'public' };
      if (params.imageUrl) body['media_ids[]'] = params.imageUrl;

      const res = await fetch(`${baseUrl}/api/v1/statuses`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: content, visibility: 'public' }),
      });

      const data = await res.json();
      if (!res.ok) return { success: false, error: normalizeError(new Error(data.error || 'Mastodon API error'), this.platform) };

      const username = params.account?.username || data.account?.acct;
      return {
        success: true,
        externalId: data.id,
        externalUrl: data.url || `${baseUrl}/@${username}/${data.id}`,
      };
    } catch (error) {
      return { success: false, error: normalizeError(error, this.platform) };
    }
  }
}
