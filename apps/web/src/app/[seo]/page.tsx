import { SEOPage } from '@/components/SEOPage';
import { generateSeoMetadata } from '@/components/generateSeoPage';
import { platformPages, apiPages, comparisonPages, specializedPages, auxPages } from '@/lib/seo-pages-data';

const all = { ...platformPages, ...apiPages, ...comparisonPages, ...specializedPages, ...auxPages };

const SEO_SLUGS = ['analytics-api', 'api-for-ai-agents', 'api-for-saas', 'ayrshare-alternative', 'blotato-alternative', 'bluesky-api', 'buffer-alternative', 'bulk-posting', 'claude-code-social-media', 'comment-to-dm', 'comments-api', 'cursor-social-media', 'errors', 'facebook-auto-reply', 'facebook-comments-api', 'facebook-messenger-api', 'first-comment-api', 'google-ads-api', 'google-business-api', 'google-business-profile-posts-api', 'google-business-profile-reviews-api', 'instagram-auto-reply', 'instagram-comments-api', 'instagram-dm-api', 'instagram-music-api', 'linkedin-company-page-api', 'mastodon-api', 'media-upload-api', 'meta-ads-api', 'meta-app-review-rejected', 'meta-automation', 'metricool-alternative', 'multi-tenant-social-media-api', 'pinterest-api', 'platforms', 'post-history-api', 'posting-api', 'postiz-alternative', 'publer-alternative', 'reddit-api', 'scheduling-api', 'slack-api', 'snapchat-api', 'social-ads-api', 'social-dm-api', 'social-media-api', 'social-media-cli', 'social-media-mcp-server', 'socialpilot-alternative', 'threads-api', 'tiktok-api', 'tiktok-content-posting-api', 'tiktok-music-api', 'unified-api', 'upload-post-alternative', 'white-label-social-media-api', 'x-api', 'youtube-api', 'youtube-upload-api', 'zernio-alternative'] as const;

export function generateStaticParams() {
  return SEO_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return generateSeoMetadata(slug);
}

export default async function SeoDynamicPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = all[slug];
  if (!data) return null;
  return <SEOPage data={data} />;
}