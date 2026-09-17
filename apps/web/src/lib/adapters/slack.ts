import { PlatformAdapter, PublishParams, PublishResult } from './base';
import { normalizeError } from '@/lib/errors';

export class SlackAdapter extends PlatformAdapter {
  name = 'slack';
  platform = 'slack';

  async publish(params: PublishParams): Promise<PublishResult> {
    const webhookUrl = params.account?.access_token;
    const content = params.content;

    if (!webhookUrl) return { success: false, error: normalizeError(new Error('Webhook URL obrigatório'), this.platform) };
    if (!webhookUrl.startsWith('https://hooks.slack.com/services/')) {
      return { success: false, error: normalizeError(new Error('URL de webhook Slack inválido'), this.platform) };
    }
    if (content.length > 30000) return { success: false, error: { code: 'VALIDATION', message: 'Slack: texto maximo 30000 caracteres.' } };

    try {
      // Com bot token + canal: sobe o arquivo de midia de verdade (video/imagem)
      const botToken = params.account?.platform_metadata?.bot_token;
      const channelId = params.account?.platform_metadata?.channel_id;
      const mediaUrl = params.videoUrl || params.imageUrl;
      if (botToken && channelId && mediaUrl) {
        const dl = await fetch(mediaUrl);
        if (dl.ok) {
          const file = await dl.arrayBuffer();
          const gu = await (await fetch(
            `https://slack.com/api/files.getUploadURLExternal?filename=${params.videoUrl ? 'video.mp4' : 'image.jpg'}&length=${file.byteLength}`,
            { headers: { Authorization: `Bearer ${botToken}`, 'Content-Type': 'application/json' } }
          )).json();
          if (gu.ok) {
            const up = await fetch(gu.upload_url, { method: 'POST', body: file });
            if (up.ok) {
              const comp = await (await fetch('https://slack.com/api/files.completeUploadExternal', {
                method: 'POST',
                headers: { Authorization: `Bearer ${botToken}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  files: [{ id: gu.file_id, title: content.slice(0, 80) }],
                  channel_id: channelId,
                  initial_comment: content,
                }),
              })).json();
              if (comp.ok) {
                const fid = comp.files?.[0]?.id || gu.file_id;
                return { success: true, externalId: fid, externalUrl: comp.files?.[0]?.permalink || webhookUrl };
              }
            }
          }
        }
      }

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
