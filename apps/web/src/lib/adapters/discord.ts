import { PlatformAdapter, PublishParams, PublishResult } from './base';
import { normalizeError } from '@/lib/errors';

export class DiscordAdapter extends PlatformAdapter {
  name = 'discord';
  platform = 'discord';

  async publish(params: PublishParams): Promise<PublishResult> {
    const webhookUrl = params.account?.access_token || (params.account?.platform_metadata as any)?.webhook_url;
    const content = params.content;

    if (!webhookUrl) return { success: false, error: normalizeError(new Error('Webhook URL obrigatorio'), this.platform) };
    if (!webhookUrl.startsWith('https://discord.com/api/webhooks/') && !webhookUrl.startsWith('https://discordapp.com/api/webhooks/')) {
      return { success: false, error: normalizeError(new Error('URL de webhook Discord invalido'), this.platform) };
    }
    if (content.length > 2000) return { success: false, error: { code: 'VALIDATION', message: 'Discord: texto maximo 2000 caracteres.' } };

    try {
      const body: any = { content };
      if (params.imageUrl) {
        body.embeds = [{ image: { url: params.imageUrl } }];
      }

      const res = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

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
