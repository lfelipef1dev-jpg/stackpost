import { PlatformAdapter, PublishParams, PublishResult } from './base';
import { normalizeError } from '@/lib/errors';

export class SlackAdapter extends PlatformAdapter {
  name = 'slack';
  platform = 'slack';

  async publish(params: PublishParams): Promise<PublishResult> {
    const webhookUrl = params.account?.access_token;
    const content = params.content;

    if (!webhookUrl) return { success: false, error: normalizeError(new Error('Webhook URL obrigatorio'), this.platform) };
    if (!webhookUrl.startsWith('https://hooks.slack.com/services/')) {
      return { success: false, error: normalizeError(new Error('URL de webhook Slack invalido'), this.platform) };
    }
    if (content.length > 30000) return { success: false, error: { code: 'VALIDATION', message: 'Slack: texto maximo 30000 caracteres.' } };

    try {
      const body: any = { text: content };
      if (params.imageUrl) {
        body.blocks = [{ type: 'image', image_url: params.imageUrl, alt_text: 'Posted image' }];
      }

      const res = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const text = await res.text();
        return { success: false, error: normalizeError(new Error(text || 'Slack API error'), this.platform) };
      }

      return {
        success: true,
        externalId: `slack-${Date.now()}`,
        externalUrl: webhookUrl,
      };
    } catch (error) {
      return { success: false, error: normalizeError(error, this.platform) };
    }
  }
}
