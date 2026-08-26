interface PlatformAdaptation {
  platform: string;
  content: string;
  hashtags: string[];
  truncated: boolean;
  originalLength: number;
  adaptedLength: number;
}

const PLATFORM_LIMITS: Record<string, number> = {
  twitter: 280,
  threads: 500,
  mastodon: 500,
  bluesky: 300,
  reddit: 300,
  pinterest: 500,
  instagram: 2200,
  facebook: 63206,
  linkedin: 3000,
  youtube: 5000,
  tiktok: 2200,
  discord: 2000,
  slack: 30000,
  google_business: 1500,
  snapchat: 1000,
};

const PLATFORM_HASHTAG_STYLE: Record<string, { maxTags: number; placement: 'end' | 'inline' | 'none' }> = {
  instagram: { maxTags: 30, placement: 'end' },
  twitter: { maxTags: 3, placement: 'inline' },
  linkedin: { maxTags: 5, placement: 'inline' },
  facebook: { maxTags: 0, placement: 'none' },
  tiktok: { maxTags: 10, placement: 'end' },
  threads: { maxTags: 5, placement: 'inline' },
  pinterest: { maxTags: 5, placement: 'end' },
  reddit: { maxTags: 0, placement: 'none' },
  youtube: { maxTags: 15, placement: 'end' },
  mastodon: { maxTags: 5, placement: 'inline' },
  bluesky: { maxTags: 5, placement: 'inline' },
  discord: { maxTags: 0, placement: 'none' },
  slack: { maxTags: 0, placement: 'none' },
  google_business: { maxTags: 3, placement: 'end' },
  snapchat: { maxTags: 0, placement: 'none' },
};

export function adaptContent(content: string, platform: string, hashtags: string[] = []): PlatformAdaptation {
  const limit = PLATFORM_LIMITS[platform] || 2200;
  const style = PLATFORM_HASHTAG_STYLE[platform] || { maxTags: 5, placement: 'end' as const };

  let adaptedContent = content;
  let adaptedHashtags: string[] = [];

  if (style.placement !== 'none' && hashtags.length > 0) {
    adaptedHashtags = hashtags.slice(0, style.maxTags);
  }

  if (style.placement === 'end' && adaptedHashtags.length > 0) {
    const tagStr = adaptedHashtags.join(' ');
    const spaceForTags = tagStr.length + 1;
    if (adaptedContent.length + spaceForTags > limit) {
      adaptedContent = adaptedContent.slice(0, limit - spaceForTags - 3) + '...';
    }
    adaptedContent = adaptedContent + '\n\n' + tagStr;
  } else if (style.placement === 'inline' && adaptedHashtags.length > 0) {
    const tagStr = adaptedHashtags.join(' ');
    if (adaptedContent.length + tagStr.length + 1 > limit) {
      adaptedContent = adaptedContent.slice(0, limit - tagStr.length - 4) + '... ' + tagStr;
    } else {
      adaptedContent = adaptedContent + ' ' + tagStr;
    }
  } else {
    if (adaptedContent.length > limit) {
      adaptedContent = adaptedContent.slice(0, limit - 3) + '...';
    }
  }

  return {
    platform,
    content: adaptedContent,
    hashtags: adaptedHashtags,
    truncated: content.length > limit,
    originalLength: content.length,
    adaptedLength: adaptedContent.length,
  };
}

export function adaptForAllPlatforms(content: string, platforms: string[], hashtags: string[] = []): PlatformAdaptation[] {
  return platforms.map((p) => adaptContent(content, p, hashtags));
}
