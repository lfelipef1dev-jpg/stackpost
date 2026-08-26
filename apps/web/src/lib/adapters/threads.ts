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
      // Threads API - create container
      const createRes = await fetch(`https://graph.threads.net/v1.0/${userId}/threads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          media_type: 'TEXT',
          text: content,
          access_token: accessToken,
        }),
      });

      const createData = await createRes.json();
      if (!createRes.ok) return { success: false, error: normalizeError(new Error(createData.error?.message || 'Threads API error'), this.platform) };

      const containerId = createData.id;

      // Publish container
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
