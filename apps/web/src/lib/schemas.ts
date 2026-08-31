import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(2),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

const allPlatforms = [
  'instagram', 'linkedin', 'x', 'tiktok', 'facebook', 'threads', 'youtube',
  'pinterest', 'reddit', 'mastodon', 'discord', 'slack', 'bluesky', 'google_business', 'snapchat'
] as const;

export const postSchema = z.object({
  content: z.string().max(10000),
  platforms: z.array(z.enum(allPlatforms)).min(1),
  uploadIds: z.array(z.string()).optional(),
  scheduledAt: z.string().datetime().optional().nullable(),
  derivatives: z.record(z.string()).optional(),
  postType: z.string().optional(),
  firstComment: z.string().optional(),
});

export const publishSchema = z.object({
  postId: z.string().uuid(),
});

export const accountConnectSchema = z.object({
  platform: z.enum(allPlatforms),
  username: z.string().min(1),
  accessToken: z.string().min(1),
  refreshToken: z.string().optional(),
  externalId: z.string().optional(),
});

export const accountActionSchema = z.object({
  socialAccountId: z.string().uuid(),
});

export const teamInviteSchema = z.object({
  email: z.string().email(),
  role: z.enum(['admin', 'member', 'viewer']),
});

export const apiKeyCreateSchema = z.object({
  name: z.string().min(1).max(100),
});

export const webhookCreateSchema = z.object({
  url: z.string().url(),
  events: z.array(z.string()).min(1),
});

export const commentCreateSchema = z.object({
  postId: z.string().uuid(),
  platform: z.enum(allPlatforms),
  text: z.string().min(1).max(10000),
});

export const uploadPresignSchema = z.object({
  fileName: z.string().min(1),
  contentType: z.string().min(1),
  size: z.number().int().positive().max(100 * 1024 * 1024),
});

export const uploadRegisterSchema = z.object({
  id: z.string().uuid(),
  fileName: z.string().min(1),
  contentType: z.string().min(1),
  size: z.number().int().positive(),
  url: z.string().url(),
});

export const postStatus = z.enum(['draft', 'scheduled', 'processing', 'posted', 'error']);

export const uuidSchema = z.string().uuid();

export const accounts_by_typeQuerySchema = z.object({
  platform: z.enum(allPlatforms).optional(),
});

export const accounts_connectBodySchema = z.object({
  platform: z.enum(allPlatforms),
  accessToken: z.string().min(1),
  refreshToken: z.string().optional(),
  externalId: z.string().optional(),
  username: z.string().min(1),
  platformAccountId: z.unknown().optional(),
  metadata: z.record(z.unknown()).optional(),
}).passthrough();

export const accounts_connection_checkBodySchema = z.object({
  socialAccountId: z.string().uuid(),
  platform: z.enum(allPlatforms),
}).passthrough();

export const accounts_copyBodySchema = z.object({
  accountId: z.string().uuid(),
  targetTeamId: z.unknown().optional(),
}).passthrough();

export const accounts_disconnectBodySchema = z.object({
  accountId: z.string().uuid(),
}).passthrough();

export const accounts_profile_refreshBodySchema = z.object({
  accountId: z.string().uuid(),
}).passthrough();

export const accounts_refresh_channelsBodySchema = z.object({
  accountId: z.string().uuid(),
}).passthrough();

export const accounts_refresh_tokenBodySchema = z.object({
  socialAccountId: z.string().uuid(),
}).passthrough();

export const accountsBodySchema = z.object({
  platform: z.enum(allPlatforms),
  username: z.string().min(1),
  accessToken: z.string().min(1),
  refreshToken: z.string().optional(),
}).passthrough();

export const accountsQuerySchema = z.object({
  id: z.string().uuid(),
});

export const accounts_set_channelBodySchema = z.object({
  accountId: z.string().uuid(),
  platformAccountId: z.unknown().optional(),
  platformMetadata: z.unknown().optional(),
}).passthrough();

export const accounts_unset_channelBodySchema = z.object({
  accountId: z.string().uuid(),
}).passthrough();

export const ai_batchBodySchema = z.object({
  topic: z.string().optional(),
  days: z.unknown().optional(),
  platform: z.enum(allPlatforms),
}).passthrough();

export const ai_best_timeBodySchema = z.object({
  platform: z.enum(allPlatforms),
}).passthrough();

export const ai_captionBodySchema = z.object({
  prompt: z.string().optional(),
  platform: z.enum(allPlatforms),
  tone: z.string().optional(),
}).passthrough();

export const ai_hashtagsBodySchema = z.object({
  content: z.string(),
  platform: z.enum(allPlatforms),
}).passthrough();

export const ai_ideasBodySchema = z.object({
  niche: z.unknown().optional(),
  count: z.number().int().positive().optional(),
}).passthrough();

export const ai_image_captionBodySchema = z.object({
  imageUrl: z.string().url().optional(),
  platform: z.enum(allPlatforms),
  count: z.number().int().positive().optional(),
}).passthrough();

export const ai_rewriteBodySchema = z.object({
  content: z.string(),
  platform: z.enum(allPlatforms),
  tone: z.string().optional(),
}).passthrough();

export const analytics_account_forceBodySchema = z.object({
  accountId: z.string().uuid(),
}).passthrough();

export const analytics_account_rawQuerySchema = z.object({
  accountId: z.string().uuid(),
});

export const analytics_accountQuerySchema = z.object({
  accountId: z.string().uuid(),
});

export const analytics_post_bulkBodySchema = z.object({
  postIds: z.unknown().optional(),
}).passthrough();

export const analytics_post_forceBodySchema = z.object({
  postId: z.string().uuid(),
}).passthrough();

export const analytics_post_rawQuerySchema = z.object({
  postId: z.string().uuid(),
});

export const analytics_postQuerySchema = z.object({
  postId: z.string().uuid(),
});

export const api_keysBodySchema = z.object({
  name: z.string().min(1),
}).passthrough();

export const api_keysQuerySchema = z.object({
  id: z.string().uuid(),
});

export const audit_logsBodySchema = z.object({
  action: z.string().optional(),
  resource: z.unknown().optional(),
  resourceId: z.unknown().optional(),
  metadata: z.record(z.unknown()).optional(),
}).passthrough();

export const audit_logsQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).optional(),
  action: z.string().optional(),
  cursor: z.string().optional(),
});

export const best_timeQuerySchema = z.object({
  platform: z.enum(allPlatforms).optional(),
});

export const comments_import_commentsQuerySchema = z.object({
  postId: z.string().uuid(),
  platform: z.enum(allPlatforms).optional(),
  limit: z.coerce.number().int().min(1).optional(),
});

export const comments_importBodySchema = z.object({
  postId: z.string().uuid(),
  platform: z.enum(allPlatforms),
  limit: z.coerce.number().int().min(1).optional(),
}).passthrough();

export const comments_publishBodySchema = z.object({
  commentId: z.string().uuid(),
}).passthrough();

export const commentsBodySchema = z.object({
  postId: z.string().uuid(),
  platform: z.enum(allPlatforms),
  text: z.string(),
  scheduledAt: z.string().datetime().optional().nullable(),
}).passthrough();

export const commentsQuerySchema = z.object({
  postId: z.string().uuid(),
  id: z.string().uuid(),
});

export const cross_postBodySchema = z.object({
  content: z.string(),
  platforms: z.array(z.enum(allPlatforms)),
  hashtags: z.array(z.string()).optional(),
}).passthrough();

export const imports_csvBodySchema = z.object({
  csv: z.unknown().optional(),
  teamId: z.string().uuid(),
}).passthrough();

export const imports_facebook_recommendationsBodySchema = z.object({
  socialAccountId: z.string().uuid(),
  limit: z.coerce.number().int().min(1).optional(),
}).passthrough();

export const imports_post_historyBodySchema = z.object({
  socialAccountId: z.string().uuid(),
  platform: z.enum(allPlatforms),
  limit: z.coerce.number().int().min(1).optional(),
}).passthrough();

export const importsBodySchema = z.object({
  socialAccountId: z.string().uuid(),
  platform: z.enum(allPlatforms),
  limit: z.coerce.number().int().min(1).optional(),
}).passthrough();

export const link_in_bioBodySchema = z.object({
  title: z.string().optional(),
  url: z.string().url(),
  id: z.string().uuid(),
  direction: z.unknown().optional(),
}).passthrough();

export const link_in_bioQuerySchema = z.object({
  id: z.string().uuid(),
});

export const misc_facebook_recommendations_replyBodySchema = z.object({
  socialAccountId: z.string().uuid(),
  recommendationId: z.unknown().optional(),
  message: z.string().optional(),
}).passthrough();

export const misc_facebook_token_debugQuerySchema = z.object({
  accountId: z.string().uuid(),
});

export const misc_instagram_audioQuerySchema = z.object({
  q: z.string().optional(),
});

export const misc_instagram_locationsQuerySchema = z.object({
  q: z.string().optional(),
});

export const misc_instagram_tagsQuerySchema = z.object({
  q: z.string().optional(),
});

export const misc_linkedin_mentionsQuerySchema = z.object({
  q: z.string().optional(),
});

export const misc_reddit_flairsQuerySchema = z.object({
  subreddit: z.string().optional(),
});

export const misc_reddit_post_requirementsQuerySchema = z.object({
  subreddit: z.string().optional(),
});

export const misc_youtube_playlistsBodySchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  privacy: z.unknown().optional(),
}).passthrough();

export const oauth_bluesky_callbackQuerySchema = z.object({
  code: z.string().optional(),
  state: z.string().optional(),
});

export const oauth_discord_callbackQuerySchema = z.object({
  code: z.string().optional(),
  state: z.string().optional(),
});

export const oauth_facebook_callbackQuerySchema = z.object({
  code: z.string().optional(),
  state: z.string().optional(),
});

export const oauth_facebookQuerySchema = z.object({
  token: z.string().optional(),
});

export const oauth_google_business_callbackQuerySchema = z.object({
  code: z.string().optional(),
  state: z.string().optional(),
});

export const oauth_linkedin_callbackQuerySchema = z.object({
  code: z.string().optional(),
  state: z.string().optional(),
});

export const oauth_linkedinQuerySchema = z.object({
  token: z.string().optional(),
});

export const oauth_mastodon_callbackQuerySchema = z.object({
  code: z.string().optional(),
  state: z.string().optional(),
});

export const oauth_mastodonQuerySchema = z.object({
  instance: z.string().optional(),
});

export const oauth_meta_callbackQuerySchema = z.object({
  code: z.string().optional(),
  state: z.string().optional(),
});

export const oauth_metaQuerySchema = z.object({
  token: z.string().optional(),
});

export const oauth_pinterest_callbackQuerySchema = z.object({
  code: z.string().optional(),
  state: z.string().optional(),
});

export const oauth_reddit_callbackQuerySchema = z.object({
  code: z.string().optional(),
  state: z.string().optional(),
});

export const oauth_slack_callbackQuerySchema = z.object({
  code: z.string().optional(),
  state: z.string().optional(),
});

export const oauth_snapchat_callbackQuerySchema = z.object({
  code: z.string().optional(),
  state: z.string().optional(),
});

export const oauth_threads_callbackQuerySchema = z.object({
  code: z.string().optional(),
  state: z.string().optional(),
});

export const oauth_tiktok_callbackQuerySchema = z.object({
  code: z.string().optional(),
  state: z.string().optional(),
});

export const oauth_x_callbackQuerySchema = z.object({
  code: z.string().optional(),
  state: z.string().optional(),
});

export const oauth_youtube_callbackQuerySchema = z.object({
  code: z.string().optional(),
  state: z.string().optional(),
});

export const onboardingBodySchema = z.object({
  orgName: z.unknown().optional(),
  teamName: z.unknown().optional(),
}).passthrough();

export const organizationBodySchema = z.object({
  name: z.string().min(1).optional(),
  plan: z.unknown().optional(),
  settings: z.unknown().optional(),
}).passthrough();

export const pagamentos_webhookQuerySchema = z.object({
  secret: z.string().optional(),
  'data.id': z.string().optional(),
  type: z.string().optional(),
});

export const posts_approveBodySchema = z.object({
  postId: z.string().uuid(),
  action: z.string().optional(),
}).passthrough();

export const posts_approveQuerySchema = z.object({
  status: z.string().optional(),
});

export const posts_bulkBodySchema = z.object({
  posts: z.unknown().optional(),
}).passthrough();

export const postsBodySchema = z.object({
  id: z.string().uuid().optional(),
  content: z.string().optional(),
  platforms: z.array(z.enum(allPlatforms)).optional(),
  uploadIds: z.array(z.string()).optional(),
  scheduledAt: z.string().datetime().optional().nullable(),
  status: z.string().optional(),
  firstComment: z.string().optional(),
  derivatives: z.record(z.string()).optional(),
}).passthrough();

export const postsQuerySchema = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).optional(),
  id: z.string().uuid().optional(),
});

export const posts_variantsBodySchema = z.object({
  postId: z.string().uuid(),
  label: z.unknown().optional(),
  content: z.string(),
  weight: z.unknown().optional(),
  id: z.string().uuid(),
  status: z.string().optional(),
  metrics: z.unknown().optional(),
}).passthrough();

export const posts_variantsQuerySchema = z.object({
  postId: z.string().uuid(),
});

export const posts_idBodySchema = z.object({
  content: z.string().optional(),
  platforms: z.array(z.enum(allPlatforms)).optional(),
  uploadIds: z.array(z.string()).optional(),
  scheduledAt: z.string().datetime().optional().nullable(),
  firstComment: z.string().optional(),
  derivatives: z.record(z.string()).optional(),
  status: z.string().optional(),
}).passthrough();

export const team_inviteBodySchema = z.object({
  email: z.string().email(),
  role: z.enum(['admin', 'member', 'viewer']),
}).passthrough();

export const team_membersQuerySchema = z.object({
  id: z.string().uuid(),
});

export const teamBodySchema = z.object({
  email: z.string().email(),
  role: z.enum(['admin', 'member', 'viewer']),
  id: z.string().uuid(),
}).passthrough();

export const teamQuerySchema = z.object({
  id: z.string().uuid(),
});

export const upload_finalizeBodySchema = z.object({
  path: z.string().optional(),
  fileName: z.string().min(1),
  mimeType: z.string().optional(),
  size: z.number().int().positive(),
}).passthrough();

export const upload_from_urlBodySchema = z.object({
  url: z.string().url(),
  fileName: z.string().min(1),
  mimeType: z.string().optional(),
}).passthrough();

export const upload_initBodySchema = z.object({
  fileName: z.string().min(1),
  mimeType: z.string().optional(),
  fileSize: z.unknown().optional(),
  teamId: z.string().uuid(),
}).passthrough();

export const upload_multipartBodySchema = z.object({
  fileName: z.string().min(1),
  mimeType: z.string().optional(),
  fileSize: z.unknown().optional(),
  path: z.string().optional(),
  uploadId: z.string().uuid(),
  parts: z.unknown().optional(),
  size: z.number().int().positive(),
}).passthrough();

export const upload_multipartQuerySchema = z.object({
  action: z.string().optional(),
  partNumber: z.string().optional(),
  path: z.string().optional(),
});

export const upload_presignBodySchema = z.object({
  fileName: z.string().min(1),
  contentType: z.string().min(1),
  size: z.number().int().positive(),
}).passthrough();

export const upload_registerBodySchema = z.object({
  id: z.string().uuid(),
  fileName: z.string().min(1),
  contentType: z.string().min(1),
  size: z.number().int().positive(),
  url: z.string().url(),
}).passthrough();

export const usage_daily_limitsQuerySchema = z.object({
  socialAccountId: z.string().uuid(),
  date: z.string().optional(),
});

export const webhooks_deliverBodySchema = z.object({
  eventType: z.unknown().optional(),
  data: z.record(z.unknown()).optional(),
}).passthrough();

export const webhooks_deliverQuerySchema = z.object({
  webhookId: z.string().uuid(),
});

export const webhooks_replayBodySchema = z.object({
  eventId: z.unknown().optional(),
}).passthrough();

export const webhooksBodySchema = z.object({
  url: z.string().url(),
  events: z.array(z.string()).min(1),
}).passthrough();

export const webhooksQuerySchema = z.object({
  id: z.string().uuid(),
});


