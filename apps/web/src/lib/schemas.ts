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
  platforms: z.array(z.enum(allPlatforms)),
  uploadIds: z.array(z.string()).optional(),
  scheduledAt: z.string().datetime().optional().nullable(),
  derivatives: z.record(z.string()).optional(),
});

export const accountSchema = z.object({
  platform: z.enum(allPlatforms),
  username: z.string(),
  accessToken: z.string(),
  refreshToken: z.string().optional(),
});

export const postStatus = z.enum(['draft', 'scheduled', 'processing', 'posted', 'error']);
