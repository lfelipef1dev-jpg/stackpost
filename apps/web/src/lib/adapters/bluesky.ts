import { PlatformAdapter, PublishParams, PublishResult } from './base';
import { normalizeError } from '@/lib/errors';

export class BlueskyAdapter extends PlatformAdapter {
  name = 'bluesky';
  platform = 'bluesky';

  async publish(params: PublishParams): Promise<PublishResult> {
    const accessToken = params.account?.access_token;
    const did = params.account?.platform_account_id || params.account?.did;
    const handle = params.account?.username || params.account?.handle;
    const content = params.content;

    if (!accessToken) return { success: false, error: normalizeError(new Error('No access token'), this.platform) };
    if (!did) return { success: false, error: normalizeError(new Error('DID obrigatorio'), this.platform) };
    if (content.length > 300) return { success: false, error: { code: 'VALIDATION', message: 'Bluesky: texto maximo 300 caracteres.' } };

    try {
      const record: any = {
        $type: 'app.bsky.feed.post',
        text: content,
        createdAt: new Date().toISOString(),
        langs: ['pt'],
      };

      // Upload de midia via xrpc.atproto.repo.uploadBlob
      const embedMedia: any[] = [];
      const mediaUrl = params.imageUrl || params.videoUrl;
      if (mediaUrl) {
        const dlRes = await fetch(mediaUrl);
        if (dlRes.ok) {
          const blob = await dlRes.blob();
          const mimeType = dlRes.headers.get('content-type') || 'image/jpeg';
          const uploadRes = await fetch('https://bsky.social/xrpc/com.atproto.repo.uploadBlob', {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${accessToken}`,
              'Content-Type': mimeType,
            },
            body: blob,
          });
          const uploadData = await uploadRes.json();
          if (uploadData.blob) {
            embedMedia.push({ alt: content.slice(0, 100), image: uploadData.blob });
          }
        }
      }

      if (embedMedia.length > 0) {
        record.embed = {
          $type: 'app.bsky.embed.images',
          images: embedMedia,
        };
      }

      // AT Protocol - create record
      const res = await fetch('https://bsky.social/xrpc/com.atproto.repo.createRecord', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          repo: did,
          collection: 'app.bsky.feed.post',
          record,
        }),
      });

      const data = await res.json();
      if (!res.ok) return { success: false, error: normalizeError(new Error(data.error || data.message || 'Bluesky API error'), this.platform) };

      const uri = data.uri;
      const rkey = uri?.split('/').pop();
      return {
        success: true,
        externalId: rkey,
        externalUrl: `https://bsky.app/profile/${handle || did}/post/${rkey}`,
      };
    } catch (error) {
      return { success: false, error: normalizeError(error, this.platform) };
    }
  }
}
