import { PlatformAdapter, PublishParams, PublishResult } from './base';
import { publishToInstagram } from './instagram-api';
import { publishToLinkedIn } from './linkedin-api';
import { TwitterAdapter as TwitterRealAdapter } from './twitter';
import { FacebookAdapter as FacebookRealAdapter } from './facebook';
import { TikTokAdapter as TikTokRealAdapter } from './tiktok';
import { YouTubeAdapter as YouTubeRealAdapter } from './youtube';
import { ThreadsAdapter as ThreadsRealAdapter } from './threads';
import { PinterestAdapter as PinterestRealAdapter } from './pinterest';
import { RedditAdapter as RedditRealAdapter } from './reddit';
import { BlueskyAdapter as BlueskyRealAdapter } from './bluesky';
import { MastodonAdapter as MastodonRealAdapter } from './mastodon';
import { DiscordAdapter as DiscordRealAdapter } from './discord';
import { SlackAdapter as SlackRealAdapter } from './slack';
import { GoogleBusinessAdapter as GoogleBusinessRealAdapter } from './google-business';
import { SnapchatAdapter as SnapchatRealAdapter } from './snapchat';

export class InstagramAdapter extends PlatformAdapter {
  name = 'instagram';

  async publish(params: PublishParams): Promise<PublishResult> {
    if (params.content.length > 2200) {
      return { success: false, error: { code: 'VALIDATION', message: 'Instagram: texto maximo 2200 caracteres.' } };
    }
    if (params.firstComment && params.firstComment.length > 2200) {
      return { success: false, error: { code: 'VALIDATION', message: 'Instagram: firstComment maximo 2200 caracteres.' } };
    }
    const mediaUrl = params.videoUrl || params.imageUrl;
    if (!mediaUrl) {
      return { success: false, error: { code: 'VALIDATION', message: 'Instagram: midia obrigatoria.' } };
    }
    const mediaType = params.mediaType || (params.videoUrl ? 'VIDEO' : 'IMAGE');
    return publishToInstagram(params.account, params.content, mediaUrl, mediaType as any, params.firstComment);
  }
}

export class LinkedInAdapter extends PlatformAdapter {
  name = 'linkedin';

  async publish(params: PublishParams): Promise<PublishResult> {
    if (params.content.length > 3000) {
      return { success: false, error: { code: 'VALIDATION', message: 'LinkedIn: texto maximo 3000 caracteres.' } };
    }
    if (params.firstComment) {
      console.warn('LinkedIn: firstComment nao suportado pela API oficial. Ignorando.');
    }
    return publishToLinkedIn(params.account, params.content, params.imageUrl || '', params.videoUrl || '');
  }
}

export { FacebookAdapter } from './facebook';
export { TikTokAdapter } from './tiktok';
export { YouTubeAdapter } from './youtube';
export { TwitterAdapter as XAdapter } from './twitter';
export { ThreadsAdapter } from './threads';
export { PinterestAdapter } from './pinterest';
export { RedditAdapter } from './reddit';
export { BlueskyAdapter } from './bluesky';
export { MastodonAdapter } from './mastodon';
export { DiscordAdapter } from './discord';
export { SlackAdapter } from './slack';
export { GoogleBusinessAdapter } from './google-business';
export { SnapchatAdapter } from './snapchat';
