import { PlatformAdapter, PublishParams, PublishResult } from './base';
import { normalizeError } from '@/lib/errors';

export class YouTubeAdapter extends PlatformAdapter {
  name = 'youtube';
  platform = 'youtube';

  async publish(params: PublishParams): Promise<PublishResult> {
    const accessToken = params.account?.access_token;
    const content = params.content;

    if (!accessToken) return { success: false, error: normalizeError(new Error('No access token'), this.platform) };
    if (content.length > 5000) return { success: false, error: { code: 'VALIDATION', message: 'YouTube: texto maximo 5000 caracteres.' } };

    // YouTube exige video. Se videoUrl vazio, nao da pra publicar.
    const videoUrl = params.videoUrl;
    if (!videoUrl) {
      return { success: false, error: { code: 'VALIDATION', message: 'YouTube: video obrigatorio (videoUrl).' } };
    }

    try {
      // Passo 1: Iniciar resumable upload - POST apenas metadata, obter Location header
      const initRes = await fetch(
        'https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
            'X-Upload-Content-Type': 'video/*',
          },
          body: JSON.stringify({
            snippet: { title: content.slice(0, 100) || 'StackPost Video', description: content },
            status: { privacyStatus: 'public', selfDeclaredMadeForKids: false },
          }),
        }
      );

      if (!initRes.ok) {
        const errData = await initRes.json().catch(() => ({}));
        return { success: false, error: normalizeError(new Error(errData.error?.message || `YouTube init HTTP ${initRes.status}`), this.platform) };
      }

      // Location header contem a URL de upload resumable
      const uploadUrl = initRes.headers.get('Location') || initRes.headers.get('location');
      if (!uploadUrl) {
        return { success: false, error: normalizeError(new Error('YouTube: nao recebeu Location header do resumable upload'), this.platform) };
      }

      // Passo 2: Fazer download do video
      const videoRes = await fetch(videoUrl);
      if (!videoRes.ok) {
        return { success: false, error: normalizeError(new Error(`YouTube: falha ao baixar video (${videoRes.status})`), this.platform) };
      }
      const videoBlob = await videoRes.blob();
      const videoContentType = videoRes.headers.get('content-type') || 'video/mp4';

      // Passo 3: PUT do binario na URL resumable
      const uploadRes = await fetch(uploadUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': videoContentType,
          'Content-Length': videoBlob.size.toString(),
        },
        body: videoBlob,
      });

      if (!uploadRes.ok) {
        const errText = await uploadRes.text();
        return { success: false, error: normalizeError(new Error(`YouTube upload HTTP ${uploadRes.status}: ${errText}`), this.platform) };
      }

      const videoData = await uploadRes.json().catch(() => ({}));
      const videoId = videoData.id;
      if (!videoId) {
        return { success: false, error: normalizeError(new Error('YouTube: upload concluido mas sem videoId na resposta'), this.platform) };
      }

      return {
        success: true,
        externalId: videoId,
        externalUrl: `https://youtube.com/watch?v=${videoId}`,
      };
    } catch (error) {
      return { success: false, error: normalizeError(error, this.platform) };
    }
  }
}
