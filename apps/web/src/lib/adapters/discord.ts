import { PlatformAdapter, PublishParams, PublishResult } from './base';
import { normalizeError } from '@/lib/errors';

export class DiscordAdapter extends PlatformAdapter {
  name = 'discord';
  platform = 'discord';

  async publish(params: PublishParams): Promise<PublishResult> {
    const metaUrl = (params.account?.platform_metadata as any)?.webhook_url;
    const webhookUrl = (typeof metaUrl === 'string' && metaUrl.includes('/api/webhooks/')) ? metaUrl : params.account?.access_token;
    const content = params.content;

    if (!webhookUrl) return { success: false, error: normalizeError(new Error('Webhook URL obrigatório'), this.platform) };
    if (!webhookUrl.startsWith('https://discord.com/api/webhooks/') && !webhookUrl.startsWith('https://discordapp.com/api/webhooks/')) {
      return { success: false, error: normalizeError(new Error('URL de webhook Discord inválido'), this.platform) };
    }
    if (content.length > 2000) return { success: false, error: { code: 'VALIDATION', message: 'Discord: texto maximo 2000 caracteres.' } };

    try {
      let res: Response;
      if (params.videoUrl) {
        // Video nao renderiza via embed de URL — enviar como anexo multipart
        // (webhook aceita files[], limite 25MB).
        const videoRes = await fetch(params.videoUrl);
        if (!videoRes.ok) return { success: false, error: { code: 'MEDIA', message: 'Discord: falha ao baixar video para upload.' } };
        const videoBlob = await videoRes.blob();
        const form = new FormData();
        form.append('payload_json', JSON.stringify({ content }));
        form.append('files[0]', videoBlob, 'video.mp4');
        res = await fetch(webhookUrl, { method: 'POST', body: form });
      } else {
        const body: any = { content };
        if (params.imageUrl) {
          body.embeds = [{ image: { url: params.imageUrl } }];
        }
        res = await fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
      }

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        return { success: false, error: normalizeError(new Error(data.message || 'Discord API error'), this.platform) };
      }

      return {
        success: true,
        externalId: `discord-${Date.now()}`,
        externalUrl: webhookUrl,
      };
    } catch (error) {
      return { success: false, error: normalizeError(error, this.platform) };
    }
  }
}
