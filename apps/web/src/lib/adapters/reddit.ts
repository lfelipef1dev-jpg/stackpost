import { PlatformAdapter, PublishParams, PublishResult } from './base';
import { normalizeError } from '@/lib/errors';

export class RedditAdapter extends PlatformAdapter {
  name = 'reddit';
  platform = 'reddit';

  async publish(params: PublishParams): Promise<PublishResult> {
    const accessToken = params.account?.access_token;
    const subreddit = params.account?.platform_account_id || params.account?.subreddit;
    const content = params.content;

    if (!accessToken) return { success: false, error: normalizeError(new Error('No access token'), this.platform) };
    if (!subreddit) return { success: false, error: normalizeError(new Error('Subreddit obrigatorio'), this.platform) };
    if (content.length > 300) return { success: false, error: { code: 'VALIDATION', message: 'Reddit: titulo maximo 300 caracteres.' } };

    try {
      const body: any = {
        kind: params.imageUrl ? 'link' : 'self',
        sr_name: subreddit,
        title: content.slice(0, 300),
        text: content,
      };
      if (params.imageUrl) body.url = params.imageUrl;

      const res = await fetch('https://oauth.reddit.com/api/submit', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'StackPost/1.0',
        },
        body: new URLSearchParams(body).toString(),
      });

      const data = await res.json();
      if (!res.ok || data.json?.errors?.length) {
        const msg = data.json?.errors?.[0]?.[0] || data.message || 'Reddit API error';
        return { success: false, error: normalizeError(new Error(msg), this.platform) };
      }

      const postId = data.json?.data?.id;
      return {
        success: true,
        externalId: postId,
        externalUrl: `https://reddit.com/comments/${postId}`,
      };
    } catch (error) {
      return { success: false, error: normalizeError(error, this.platform) };
    }
  }
}
