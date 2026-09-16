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
    if (!did) return { success: false, error: normalizeError(new Error('DID obrigatório'), this.platform) };
    if (content.length > 300) return { success: false, error: { code: 'VALIDATION', message: 'Bluesky: texto maximo 300 caracteres.' } };

    try {
      const record: any = {
        $type: 'app.bsky.feed.post',
        text: content,
        createdAt: new Date().toISOString(),
        langs: ['pt'],
      };

      // Upload de mídia — imagem via uploadBlob; video via video.bsky.app (servico de transcodificacao)
      if (params.videoUrl) {
        const dlRes = await fetch(params.videoUrl);
        if (dlRes.ok) {
          const videoBuf = await dlRes.arrayBuffer();

          // 1. service token com permissao de uploadBlob
          const authRes = await fetch('https://bsky.social/xrpc/com.atproto.server.getServiceAuth', {
            method: 'POST',
            headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ aud: 'did:web:bsky.social', lxm: 'com.atproto.repo.uploadBlob', exp: Math.floor(Date.now() / 1000) + 1800 }),
          });
          const authData = await authRes.json();
          if (!authData.token) return { success: false, error: normalizeError(new Error('Bluesky: falha no service token'), this.platform) };

          // 2. upload direto pro servico de video
          const upUrl = new URL('https://video.bsky.app/xrpc/app.bsky.video.uploadVideo');
          upUrl.searchParams.set('did', did);
          upUrl.searchParams.set('name', 'video.mp4');
          const upRes = await fetch(upUrl.toString(), {
            method: 'POST',
            headers: { Authorization: `Bearer ${authData.token}`, 'Content-Type': 'video/mp4' },
            body: videoBuf,
          });
          const job = await upRes.json();
          if (!upRes.ok) return { success: false, error: normalizeError(new Error(`Bluesky video: ${job.message || job.error}`), this.platform) };

          // 3. aguarda processamento (budget curto p/ nao estourar o worker)
          let vBlob = job.blob;
          for (let i = 0; i < 12 && !vBlob; i++) {
            await new Promise((r) => setTimeout(r, 2500));
            const st = await (await fetch(`https://video.bsky.app/xrpc/app.bsky.video.getJobStatus?jobId=${job.jobId}`, {
              headers: { Authorization: `Bearer ${accessToken}` },
            })).json();
            if (st.jobStatus?.state === 'JOB_STATE_FAILED') {
              return { success: false, error: normalizeError(new Error(`Bluesky video: ${st.jobStatus.error || 'processamento falhou'}`), this.platform) };
            }
            vBlob = st.jobStatus?.blob;
          }
          if (!vBlob) return { success: false, error: normalizeError(new Error('Bluesky video: timeout no processamento'), this.platform) };

          record.embed = { $type: 'app.bsky.embed.video', video: vBlob, alt: content.slice(0, 100), aspectRatio: { width: 9, height: 16 } };
        }
      } else if (params.imageUrl) {
        const dlRes = await fetch(params.imageUrl);
        if (dlRes.ok) {
          const blob = await dlRes.blob();
          const uploadRes = await fetch('https://bsky.social/xrpc/com.atproto.repo.uploadBlob', {
            method: 'POST',
            headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': dlRes.headers.get('content-type') || 'image/jpeg' },
            body: blob,
          });
          const uploadData = await uploadRes.json();
          if (uploadData.blob) {
            record.embed = { $type: 'app.bsky.embed.images', images: [{ alt: content.slice(0, 100), image: uploadData.blob }] };
          }
        }
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
