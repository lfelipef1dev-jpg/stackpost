export interface PlatformLimits {
  posts: number;
  comments: number;
}

export const DAILY_LIMITS: Record<string, Record<string, PlatformLimits>> = {
  FREE: {
    TWITTER: { posts: 5, comments: 0 },
    FACEBOOK: { posts: 10, comments: 3 },
    INSTAGRAM: { posts: 10, comments: 3 },
    LINKEDIN: { posts: 10, comments: 3 },
    YOUTUBE: { posts: 10, comments: 3 },
    TIKTOK: { posts: 5, comments: 3 },
    THREADS: { posts: 10, comments: 3 },
    PINTEREST: { posts: 10, comments: 0 },
    REDDIT: { posts: 10, comments: 3 },
    DISCORD: { posts: 10, comments: 3 },
    SLACK: { posts: 10, comments: 3 },
    MASTODON: { posts: 10, comments: 3 },
    BLUESKY: { posts: 10, comments: 3 },
    GOOGLE_BUSINESS: { posts: 10, comments: 0 },
    SNAPCHAT: { posts: 5, comments: 0 },
  },
  PRO: {
    TWITTER: { posts: 15, comments: 0 },
    FACEBOOK: { posts: 50, comments: 50 },
    INSTAGRAM: { posts: 50, comments: 50 },
    LINKEDIN: { posts: 18, comments: 18 },
    YOUTUBE: { posts: 10, comments: 10 },
    TIKTOK: { posts: 10, comments: 10 },
    THREADS: { posts: 200, comments: 200 },
    PINTEREST: { posts: 24, comments: 0 },
    REDDIT: { posts: 24, comments: 24 },
    DISCORD: { posts: 100, comments: 100 },
    SLACK: { posts: 100, comments: 100 },
    MASTODON: { posts: 50, comments: 50 },
    BLUESKY: { posts: 50, comments: 50 },
    GOOGLE_BUSINESS: { posts: 20, comments: 0 },
    SNAPCHAT: { posts: 20, comments: 0 },
  },
  BUSINESS: {
    TWITTER: { posts: 15, comments: 0 },
    FACEBOOK: { posts: 100, comments: 100 },
    INSTAGRAM: { posts: 100, comments: 100 },
    LINKEDIN: { posts: 24, comments: 24 },
    YOUTUBE: { posts: 15, comments: 15 },
    TIKTOK: { posts: 15, comments: 15 },
    THREADS: { posts: 250, comments: 250 },
    PINTEREST: { posts: 36, comments: 0 },
    REDDIT: { posts: 36, comments: 36 },
    DISCORD: { posts: 200, comments: 200 },
    SLACK: { posts: 200, comments: 200 },
    MASTODON: { posts: 100, comments: 100 },
    BLUESKY: { posts: 100, comments: 100 },
    GOOGLE_BUSINESS: { posts: 40, comments: 0 },
    SNAPCHAT: { posts: 40, comments: 0 },
  },
  ENTERPRISE: {
    TWITTER: { posts: 999999, comments: 0 },
    FACEBOOK: { posts: 999999, comments: 999999 },
    INSTAGRAM: { posts: 999999, comments: 999999 },
    LINKEDIN: { posts: 999999, comments: 999999 },
    YOUTUBE: { posts: 999999, comments: 999999 },
    TIKTOK: { posts: 999999, comments: 999999 },
    THREADS: { posts: 999999, comments: 999999 },
    PINTEREST: { posts: 999999, comments: 0 },
    REDDIT: { posts: 999999, comments: 999999 },
    DISCORD: { posts: 999999, comments: 999999 },
    SLACK: { posts: 999999, comments: 999999 },
    MASTODON: { posts: 999999, comments: 999999 },
    BLUESKY: { posts: 999999, comments: 999999 },
    GOOGLE_BUSINESS: { posts: 999999, comments: 0 },
    SNAPCHAT: { posts: 999999, comments: 0 },
  },
};

export const MONTHLY_LIMITS: Record<string, { posts: number; comments: number; uploads: number }> = {
  FREE: { posts: 20, comments: 50, uploads: 200 },
  PRO: { posts: 10000, comments: 5000, uploads: 100000 },
  BUSINESS: { posts: 100000, comments: 50000, uploads: 1000000 },
  ENTERPRISE: { posts: 999999, comments: 999999, uploads: 999999 },
};

export const IMPORT_LIMITS: Record<string, { postsPerAccount: number; commentsPerPost: number; reviewsPerAccount: number }> = {
  FREE: { postsPerAccount: 5, commentsPerPost: 25, reviewsPerAccount: 5 },
  PRO: { postsPerAccount: 100, commentsPerPost: 200, reviewsPerAccount: 200 },
  BUSINESS: { postsPerAccount: 500, commentsPerPost: 1000, reviewsPerAccount: 200 },
  ENTERPRISE: { postsPerAccount: 999999, commentsPerPost: 999999, reviewsPerAccount: 999999 },
};

export function getDailyLimit(tier: string, platform: string): PlatformLimits {
  return DAILY_LIMITS[tier]?.[platform] || { posts: 10, comments: 3 };
}

export function getMonthlyLimit(tier: string) {
  return MONTHLY_LIMITS[tier] || MONTHLY_LIMITS.FREE;
}

export function getImportLimit(tier: string) {
  return IMPORT_LIMITS[tier] || IMPORT_LIMITS.FREE;
}
