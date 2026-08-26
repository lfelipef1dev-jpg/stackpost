import { PlatformAdapter, PublishResult, PublishParams } from './base';
import { publishToInstagram } from './instagram-api';
import { publishToLinkedIn } from './linkedin-api';
import { TwitterAdapter as TwitterRealAdapter } from './twitter';

class GenericAdapter extends PlatformAdapter {
  constructor(
    public name: string,
    public textLimit: number,
    public message: string
  ) {
    super();
  }

  async publish(params: PublishParams): Promise<PublishResult> {
    if (params.content.length > this.textLimit) {
      return { success: false, error: { code: 'VALIDATION', message: `${this.name}: texto maximo ${this.textLimit} caracteres.` } };
    }
    return { success: true, externalId: `${this.name}-${Date.now()}`, externalUrl: `https://${this.name}.com/p/mock` };
  }
}

export class InstagramAdapter extends PlatformAdapter {
  name = 'instagram';

  async publish(params: PublishParams): Promise<PublishResult> {
    if (params.content.length > 2200) {
      return { success: false, error: { code: 'VALIDATION', message: 'Instagram: texto maximo 2200 caracteres.' } };
    }
    if (!params.imageUrl) {
      return { success: false, error: { code: 'VALIDATION', message: 'Instagram: imagem obrigatoria.' } };
    }
    return publishToInstagram(params.account, params.content, params.imageUrl);
  }
}

export class LinkedInAdapter extends PlatformAdapter {
  name = 'linkedin';

  async publish(params: PublishParams): Promise<PublishResult> {
    if (params.content.length > 3000) {
      return { success: false, error: { code: 'VALIDATION', message: 'LinkedIn: texto maximo 3000 caracteres.' } };
    }
    if (!params.imageUrl) {
      return { success: false, error: { code: 'VALIDATION', message: 'LinkedIn: imagem obrigatoria.' } };
    }
    return publishToLinkedIn(params.account, params.content, params.imageUrl);
  }
}

export class FacebookAdapter extends GenericAdapter { constructor() { super('facebook', 63206, 'Facebook'); } }
export class TikTokAdapter extends GenericAdapter { constructor() { super('tiktok', 2200, 'TikTok'); } }
export class YouTubeAdapter extends GenericAdapter { constructor() { super('youtube', 5000, 'YouTube'); } }
export class XAdapter extends TwitterRealAdapter {}
export class ThreadsAdapter extends GenericAdapter { constructor() { super('threads', 500, 'Threads'); } }
export class PinterestAdapter extends GenericAdapter { constructor() { super('pinterest', 500, 'Pinterest'); } }
export class RedditAdapter extends GenericAdapter { constructor() { super('reddit', 300, 'Reddit'); } }
export class BlueskyAdapter extends GenericAdapter { constructor() { super('bluesky', 300, 'Bluesky'); } }
export class MastodonAdapter extends GenericAdapter { constructor() { super('mastodon', 500, 'Mastodon'); } }
export class DiscordAdapter extends GenericAdapter { constructor() { super('discord', 2000, 'Discord'); } }
export class SlackAdapter extends GenericAdapter { constructor() { super('slack', 30000, 'Slack'); } }
export class GoogleBusinessAdapter extends GenericAdapter { constructor() { super('google_business', 1500, 'Google Business'); } }
export class SnapchatAdapter extends GenericAdapter { constructor() { super('snapchat', 1000, 'Snapchat'); } }
