'use client';

import Link from 'next/link';
import { Layers } from 'lucide-react';

const footerColumns = [
  {
    title: 'Recursos',
    links: [
      { label: 'Documentacao', href: '/docs' },
      { label: 'Features', href: '/features' },
      { label: 'Planos', href: '/plans' },
      { label: 'FAQ', href: '/plans#faq' },
      { label: 'Changelog', href: '/changelog' },
      { label: 'Status', href: '/status' },
    ],
  },
  {
    title: 'Desenvolvedores',
    links: [
      { label: 'API Reference', href: '/docs/api' },
      { label: 'SDK', href: '/docs/sdk' },
      { label: 'CLI', href: '/docs/cli' },
      { label: 'MCP Server', href: '/docs/mcp' },
      { label: 'Webhooks API', href: '/docs/webhooks' },
      { label: 'OAuth API', href: '/docs/oauth' },
      { label: 'GitHub', href: 'https://github.com' },
    ],
  },
  {
    title: 'Core APIs',
    links: [
      { label: 'Social Media API', href: '/social-media-api' },
      { label: 'Unified API', href: '/unified-api' },
      { label: 'Posting API', href: '/posting-api' },
      { label: 'Scheduling API', href: '/scheduling-api' },
      { label: 'Media Upload API', href: '/media-upload-api' },
      { label: 'Bulk Posting', href: '/bulk-posting' },
      { label: 'Post History API', href: '/post-history-api' },
      { label: 'Comments API', href: '/comments-api' },
      { label: 'Analytics API', href: '/analytics-api' },
      { label: 'First Comment', href: '/first-comment-api' },
    ],
  },
  {
    title: 'Empresa',
    links: [
      { label: 'Sobre', href: '/about' },
      { label: 'Blog', href: '/blog' },
      { label: 'Contato', href: '/contact' },
      { label: 'ExpoStacker', href: 'https://expostacker.com.br' },
    ],
  },
];

const rowSections = [
  {
    title: 'Plataformas',
    links: [
      { label: 'Instagram API', href: '/instagram-api' },
      { label: 'TikTok API', href: '/tiktok-api' },
      { label: 'Facebook API', href: '/facebook-api' },
      { label: 'LinkedIn API', href: '/linkedin-api' },
      { label: 'YouTube API', href: '/youtube-api' },
      { label: 'X API', href: '/x-api' },
      { label: 'Threads API', href: '/threads-api' },
      { label: 'Pinterest API', href: '/pinterest-api' },
      { label: 'Reddit API', href: '/reddit-api' },
      { label: 'Bluesky API', href: '/bluesky-api' },
      { label: 'Mastodon API', href: '/mastodon-api' },
      { label: 'Slack API', href: '/slack-api' },
      { label: 'Discord API', href: '/discord-api' },
      { label: 'Google Business API', href: '/google-business-api' },
      { label: 'Snapchat API', href: '/snapchat-api' },
    ],
  },
  {
    title: 'Especializadas',
    links: [
      { label: 'Instagram Auto Reply', href: '/instagram-auto-reply' },
      { label: 'Facebook Auto Reply', href: '/facebook-auto-reply' },
      { label: 'Instagram Music API', href: '/instagram-music-api' },
      { label: 'TikTok Music API', href: '/tiktok-music-api' },
      { label: 'TikTok Content API', href: '/tiktok-content-posting-api' },
      { label: 'Instagram Comments', href: '/instagram-comments-api' },
      { label: 'Facebook Comments', href: '/facebook-comments-api' },
      { label: 'YouTube Upload', href: '/youtube-upload-api' },
      { label: 'LinkedIn Company', href: '/linkedin-company-page-api' },
      { label: 'GBP Reviews', href: '/google-business-profile-reviews-api' },
      { label: 'GBP Posts', href: '/google-business-profile-posts-api' },
      { label: 'Meta Automation', href: '/meta-automation' },
      { label: 'Meta App Review', href: '/meta-app-review-rejected' },
      { label: 'Social DM API', href: '/social-dm-api' },
      { label: 'Instagram DM', href: '/instagram-dm-api' },
      { label: 'Messenger API', href: '/facebook-messenger-api' },
      { label: 'Comment to DM', href: '/comment-to-dm' },
      { label: 'Social Ads API', href: '/social-ads-api' },
      { label: 'Meta Ads API', href: '/meta-ads-api' },
      { label: 'Google Ads API', href: '/google-ads-api' },
      { label: 'API for SaaS', href: '/api-for-saas' },
      { label: 'API for AI Agents', href: '/api-for-ai-agents' },
      { label: 'MCP Server', href: '/social-media-mcp-server' },
      { label: 'CLI', href: '/social-media-cli' },
      { label: 'Claude Code', href: '/claude-code-social-media' },
      { label: 'Cursor', href: '/cursor-social-media' },
    ],
  },
];

const supportSection = {
  title: 'Supporting APIs',
  links: [
    { label: 'Todas Plataformas', href: '/platforms' },
    { label: 'API Error Reference', href: '/errors' },
    { label: 'Multi-Tenant API', href: '/multi-tenant-social-media-api' },
    { label: 'White Label API', href: '/white-label-social-media-api' },
  ],
};

const partners = [
  { label: 'SavedTime', href: '/partners/savedtime' },
  { label: 'That Marketing Buddy', href: '/partners/that-marketing-buddy' },
];

const comparisons = [
  { label: 'Todas comparacoes', href: '/comparisons' },
  { label: 'Ayrshare alternative', href: '/ayrshare-alternative' },
  { label: 'Zernio alternative', href: '/zernio-alternative' },
  { label: 'Upload-Post alternative', href: '/upload-post-alternative' },
  { label: 'Postiz alternative', href: '/postiz-alternative' },
  { label: 'Metricool alternative', href: '/metricool-alternative' },
  { label: 'Publer alternative', href: '/publer-alternative' },
  { label: 'SocialPilot alternative', href: '/socialpilot-alternative' },
  { label: 'Blotato alternative', href: '/blotato-alternative' },
  { label: 'Buffer alternative', href: '/buffer-alternative' },
];

const socials = [
  {
    label: 'Instagram', href: 'https://instagram.com', color: '#E1306C', glow: 'rgba(225,48,108,0.4)',
    svg: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" className="w-[20px] h-[20px]" aria-hidden="true"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37a4 4 0 1 1-7.37-2.37 4 4 0 0 1 7.37 2.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>,
  },
  {
    label: 'Facebook', href: 'https://facebook.com', color: '#1877F2', glow: 'rgba(24,119,242,0.4)',
    svg: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" className="w-[20px] h-[20px]" aria-hidden="true"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>,
  },
  {
    label: 'TikTok', href: 'https://tiktok.com', color: '#FFFC00', glow: 'rgba(255,252,0,0.3)',
    svg: <svg viewBox="0 0 16 16" fill="currentColor" className="w-[18px] h-[18px]" aria-hidden="true"><path d="M9 0h1.98c.144.715.54 1.617 1.235 2.512C12.895 3.389 13.797 4 15 4v2c-1.753 0-3.07-.814-4-1.829V11a5 5 0 1 1-5-5v2a3 3 0 1 0 3 3z"/></svg>,
  },
  {
    label: 'YouTube', href: 'https://youtube.com', color: '#FF0000', glow: 'rgba(255,0,0,0.4)',
    svg: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" className="w-[20px] h-[20px]" aria-hidden="true"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"/><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" fill="currentColor"/></svg>,
  },
  {
    label: 'LinkedIn', href: 'https://linkedin.com', color: '#0A66C2', glow: 'rgba(10,102,194,0.4)',
    svg: <svg viewBox="0 0 24 24" fill="currentColor" className="w-[20px] h-[20px]" aria-hidden="true"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>,
  },
  {
    label: 'X', href: 'https://x.com', color: '#E6E6E6', glow: 'rgba(230,230,230,0.3)',
    svg: <svg viewBox="0 0 24 24" fill="currentColor" className="w-[18px] h-[18px]" aria-hidden="true"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>,
  },
  {
    label: 'Threads', href: 'https://threads.net', color: '#E6E6E6', glow: 'rgba(230,230,230,0.3)',
    svg: <svg viewBox="0 0 24 24" fill="currentColor" className="w-[18px] h-[18px]" aria-hidden="true"><path d="M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.472 12.01v-.017c.03-3.579.879-6.43 2.525-8.482C5.845 1.205 8.6.024 12.18 0h.014c2.746.02 5.043.725 6.826 2.098 1.677 1.29 2.868 3.13 3.546 5.467l-2.12.563c-.603-2.145-1.551-3.702-2.817-4.625-1.428-1.036-3.29-1.566-5.535-1.582-2.86.022-5.039.913-6.481 2.647C4.027 6.548 3.329 9.024 3.302 12c.027 2.976.725 5.452 2.076 7.211 1.442 1.734 3.621 2.625 6.481 2.647 2.86-.022 5.039-.913 6.481-2.647.84-1.011 1.439-2.329 1.778-3.93l2.171.529c-.408 1.953-1.174 3.582-2.276 4.833-1.84 2.302-4.593 3.482-8.173 3.506h-.007z"/></svg>,
  },
  {
    label: 'Pinterest', href: 'https://pinterest.com', color: '#BD081C', glow: 'rgba(189,8,28,0.4)',
    svg: <svg viewBox="0 0 24 24" fill="currentColor" className="w-[18px] h-[18px]" aria-hidden="true"><path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.401.165-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.225 7.464-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535 6.607 0 11.985-5.365 11.985-11.987C23.97 5.367 18.592.001 12.017.001z"/></svg>,
  },
  {
    label: 'Reddit', href: 'https://reddit.com', color: '#FF4500', glow: 'rgba(255,69,0,0.4)',
    svg: <svg viewBox="0 0 24 24" fill="currentColor" className="w-[20px] h-[20px]" aria-hidden="true"><path d="M24 11.779c0-1.459-1.192-2.645-2.657-2.645-.715 0-1.363.286-1.84.746-1.81-1.214-4.259-1.985-6.971-2.072l1.483-4.649 3.948.852c.029 1.214 1.026 2.197 2.247 2.197 1.236 0 2.24-.999 2.24-2.231S20.791 1.746 19.555 1.746c-.852 0-1.598.479-1.985 1.179l-4.736-1.026c-.236-.06-.479.085-.557.315l-1.657 5.193c-2.751.06-5.235.831-7.072 2.072-.479-.46-1.125-.746-1.84-.746C1.192 9.134 0 10.32 0 11.779c0 1.072.642 1.992 1.555 2.4-.06.329-.099.66-.099.999 0 3.515 4.259 6.368 9.515 6.368s9.515-2.853 9.515-6.368c0-.339-.039-.67-.099-.999.913-.408 1.555-1.328 1.555-2.4zm-18.218 2.24c0-1.214 1.026-2.24 2.24-2.24 1.214 0 2.24 1.026 2.24 2.24 0 1.214-1.026 2.24-2.24 2.24-1.214 0-2.24-1.026-2.24-2.24zm10.486 4.272c-1.428 1.428-4.272 1.538-5.268 1.538-1.006 0-3.85-.116-5.268-1.538-.214-.214-.214-.557 0-.771.214-.214.557-.214.771 0 .897.897 2.819 1.214 4.497 1.214s3.6-.317 4.497-1.214c.214-.214.557-.214.771 0 .214.214.214.557 0 .771zm-.395-2.032c-1.214 0-2.24-1.026-2.24-2.24 0-1.214 1.026-2.24 2.24-2.24 1.214 0 2.24 1.026 2.24 2.24 0 1.214-1.026 2.24-2.24 2.24z"/></svg>,
  },
  {
    label: 'Bluesky', href: 'https://bsky.app', color: '#0085FF', glow: 'rgba(0,133,255,0.4)',
    svg: <svg viewBox="0 0 24 24" fill="currentColor" className="w-[20px] h-[20px]" aria-hidden="true"><path d="M12 10.8c-1.635-3.169-6.078-9.049-10.2-9.049C.078 1.751 0 2.778 0 4.5c0 3.515 1.974 8.718 3.6 11.4.831 1.379 2.247 3.149 4.05 3.149 2.247 0 3.515-1.974 4.35-3.149C12.831 14.218 13.2 12.831 12 10.8zM21.6 1.751c-4.122 0-8.565 5.88-10.2 9.049-1.2 2.031-.831 3.418 0 5.1.835 1.175 2.103 3.149 4.35 3.149 1.803 0 3.219-1.77 4.05-3.149 1.626-2.682 3.6-7.885 3.6-11.4 0-1.722-.078-2.749-1.8-2.749z"/></svg>,
  },
  {
    label: 'Mastodon', href: 'https://mastodon.social', color: '#6364FF', glow: 'rgba(99,100,255,0.4)',
    svg: <svg viewBox="0 0 24 24" fill="currentColor" className="w-[20px] h-[20px]" aria-hidden="true"><path d="M23.193 7.879c0-5.219-3.413-6.764-3.413-6.764C18.575.495 15.546.003 12.379 0h-.075c-3.167.003-6.196.495-7.401 1.115 0 0-3.413 1.545-3.413 6.764 0 1.198-.023 2.631.014 4.149.124 5.092.934 10.109 5.641 11.355 2.17.574 4.034.695 5.535.612 2.722-.151 4.25-.972 4.25-.972l-.09-1.975s-1.845.583-3.91.513c-2.045-.07-4.205-.219-4.535-2.716a5.09 5.09 0 0 1-.094-.731s2.01.49 4.555.608c1.555.071 3.011-.091 4.491-.265 2.84-.339 5.311-2.092 5.624-3.695.489-2.504.449-6.103.449-6.103z"/></svg>,
  },
  {
    label: 'Discord', href: 'https://discord.com', color: '#5865F2', glow: 'rgba(88,101,242,0.4)',
    svg: <svg viewBox="0 0 24 24" fill="currentColor" className="w-[20px] h-[20px]" aria-hidden="true"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/></svg>,
  },
  {
    label: 'Slack', href: 'https://slack.com', color: '#4A154B', glow: 'rgba(74,21,75,0.4)',
    svg: <svg viewBox="0 0 24 24" fill="currentColor" className="w-[20px] h-[20px]" aria-hidden="true"><path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313a2.528 2.528 0 0 1-2.521 2.521 2.528 2.528 0 0 1-2.521-2.521v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zM18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312zM15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zM15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.527 2.527 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.527 2.527 0 0 1-2.522 2.523h-6.313z"/></svg>,
  },
  {
    label: 'Google Business', href: 'https://google.com/business', color: '#4285F4', glow: 'rgba(66,133,244,0.4)',
    svg: <svg viewBox="0 0 24 24" fill="currentColor" className="w-[20px] h-[20px]" aria-hidden="true"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" opacity=".9"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" opacity=".7"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" opacity=".5"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" opacity=".3"/></svg>,
  },
  {
    label: 'Snapchat', href: 'https://snapchat.com', color: '#FFFC00', glow: 'rgba(255,252,0,0.3)',
    svg: <svg viewBox="0 0 24 24" fill="currentColor" className="w-[20px] h-[20px]" aria-hidden="true"><path d="M12.166.5C9.36.5 7.041 2.616 6.715 5.408c-.06.515-.06 1.143-.06 1.798 0 .566.003 1.146-.03 1.645-.026.275-.198.46-.408.526-.078.024-.158.036-.238.036-.166 0-.33-.052-.466-.137-.275-.171-.566-.275-.838-.275-.354 0-.665.166-.838.461-.275.469-.166 1.082.243 1.357.339.227 1.123.428 1.717.566.275.064.566.137.671.275.107.143.107.354.026.566-.026.064-.064.137-.107.207-.461.913-1.531 2.293-3.299 2.717-.275.064-.566.171-.566.461 0 .354.354.566.838.717.275.085.665.171 1.082.275.107.026.207.137.275.354.107.354.171.717.275 1.082.064.227.275.354.566.354.275 0 .566-.107.913-.171.566-.107 1.275-.243 2.193.064.566.197 1.082.566 1.531 1.082.566.665 1.275 1.357 2.466 1.357h.026c1.191 0 1.9-.692 2.466-1.357.449-.516.965-.885 1.531-1.082.913-.307 1.627-.171 2.193-.064.347.064.638.171.913.171h.026c.275 0 .526-.137.566-.354.107-.354.171-.717.275-1.082.064-.227.171-.328.275-.354.428-.107.838-.197 1.082-.275.526-.171.838-.354.838-.717 0-.275-.275-.397-.566-.461-1.768-.428-2.838-1.804-3.299-2.717-.039-.077-.078-.143-.107-.207-.078-.227-.078-.428.026-.566.107-.137.397-.227.671-.275.566-.137 1.357-.339 1.717-.566.428-.275.526-.885.243-1.357-.171-.297-.478-.461-.838-.461-.275 0-.566.107-.838.275-.137.085-.297.137-.466.137-.078 0-.158-.012-.238-.036-.207-.064-.386-.243-.408-.526-.039-.499-.03-1.079-.03-1.645 0-.665 0-1.283-.06-1.798C16.959 2.616 14.641.5 11.834.5h-.668z"/></svg>,
  },
  {
    label: 'GitHub', href: 'https://github.com', color: '#8AB4F8', glow: 'rgba(138,180,248,0.4)',
    svg: <svg viewBox="0 0 24 24" fill="currentColor" className="w-[20px] h-[20px]" aria-hidden="true"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>,
  },
  {
    label: 'WhatsApp', href: 'https://wa.me/5513999999999', color: '#25D366', glow: 'rgba(37,211,102,0.4)',
    svg: <svg viewBox="0 0 24 24" fill="currentColor" className="w-[20px] h-[20px]" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/></svg>,
  },
  {
    label: 'E-mail', href: 'mailto:contato@expostacker.com.br', color: '#8AB4F8', glow: 'rgba(138,180,248,0.4)',
    svg: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" className="w-[20px] h-[20px]" aria-hidden="true"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 5L2 7"/></svg>,
  },
];

const payments = [
  { label: 'Visa', svg: <svg viewBox="0 0 40 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><rect width="40" height="24" rx="3" fill="#1A1F71"/><path d="M17 8.5h-2L13 15h2l2-6.5zm8.2 6.5l1.4-3.8-.4-1c-.2-.4-.6-.8-1-.9l-1.4-.2h-2.2l-.2.9h2.2s.4.02.5.2c.1.2 0 .6-.1.8l-1.4 4.2h2.1l2-4.9.9 4.9h2zm-6.2-4.2c0-1.2-.7-1.9-1.7-1.9-.6 0-1 .2-1.3.4l.2-1.8h-1.9c-.4 0-.7.3-.8.7l-1.7 5.7h2l.3-1.3h1.9c.3 0 .5-.2.6-.5l.1-.2.7 2h1.8l-.4-4.2zm-2 .8l.6-2.5.3 2.5h-.9z" fill="#fff"/></svg> },
  { label: 'Mastercard', svg: <svg viewBox="0 0 40 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><rect width="40" height="24" rx="3" fill="#fff" stroke="#E5E5E5" stroke-width="1"/><circle cx="15" cy="12" r="7" fill="#EB001B"/><circle cx="25" cy="12" r="7" fill="#F79E1B"/><path d="M20 8.3a7 7 0 0 1 0 7.4 7 7 0 0 1 0-7.4z" fill="#FF5F00"/></svg> },
  { label: 'Elo', svg: <svg viewBox="0 0 40 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><rect width="40" height="24" rx="3" fill="#FFCB05"/><path d="M14 7h-2.5L9 17h2.2l.8-3h2.2c1.4 0 2.4-.6 2.9-1.8.4-.9.4-1.9 0-2.8-.5-1.1-1.5-1.7-2.9-1.7H14V7zm.2 5.2h-.8l.4-1.6c.1-.3.3-.5.6-.5h.2c.3 0 .5.2.5.5 0 .5-.4.9-.9 1.6zm7.2-5.2h-2.2l-2.2 6.2 2.2.1 1-2.6 1 2.6h2.2l-2-6.3zm2.2 0v6.2h2V7h-2zm9.2 4.2c0 1.2-.9 2-2.2 2-.8 0-1.4-.3-1.8-.8l1.3-.9c.2.2.4.3.6.3.4 0 .6-.3.6-.8 0-.4-.2-.7-.6-.7-.2 0-.4.1-.6.3l-1.2-.9c.4-.6 1.1-1 1.9-1 1.2 0 2 .8 2 2z" fill="#000"/></svg> },
  { label: 'PIX', svg: <svg viewBox="0 0 40 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><rect width="40" height="24" rx="3" fill="#32BCAD"/><path d="M20 6l-3 3h2v3h2V9h2L20 6zm-6 6l-3 3 3 3v-2H9v-2h5v-2zm12 0v2h5v2h-5v2l3-3-3-3zm-8 2h-2v3l3-3h-1v-3h-2v3z" fill="#fff"/></svg> },
  { label: 'Mercado Pago', svg: <svg viewBox="0 0 100 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><rect width="100" height="24" rx="4" fill="#009EE3"/><text x="50" y="16" text-anchor="middle" fill="#fff" font-family="Arial,sans-serif" font-size="11" font-weight="700">Mercado Pago</text></svg> },
];

export default function Footer() {
  return (
    <footer className="bg-brand-surface/20 border-t-2 border-brand-accent shadow-[0_-0_20px_rgba(138,180,248,0.15)]" role="contentinfo">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-10">
        {/* Top: brand + 4 columns */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6 mb-8">
          <div className="col-span-2 md:col-span-4 lg:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-brand-accent flex items-center justify-center">
                <Layers className="w-4 h-4 text-brand-bg" />
              </div>
              <span className="font-display font-bold text-lg text-brand-text">StackPost</span>
            </div>
            <p className="text-sm text-brand-text-secondary mb-3">
              A API unificada de redes sociais para SaaS, agencias e AI agents.
            </p>
            <div className="inline-flex items-center gap-2 rounded-full border border-brand-accent/30 bg-brand-accent/8 px-3 py-1.5">
              <span className="relative flex h-2 w-2" aria-hidden="true">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-accent opacity-75 motion-reduce:animate-none" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-brand-accent" />
              </span>
              <span className="text-xs font-mono text-brand-accent">Sistema ativo</span>
            </div>
          </div>

          {footerColumns.map((col) => (
            <div key={col.title}>
              <h3 className="text-xs font-semibold mb-3 text-brand-text uppercase tracking-wider">{col.title}</h3>
              <ul className="space-y-1.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className="text-xs text-brand-text-secondary hover:text-brand-accent transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* API Directory: Plataformas, Especializadas, Comparacao, Supporting + Partners as badge rows */}
        <div className="space-y-4 mt-8">
          {[
            { ...rowSections[0], desc: '15 redes sociais conectadas' },
            { ...rowSections[1], desc: 'APIs especializadas por canal' },
            { title: 'Comparacao', links: comparisons, desc: 'Compare com as alternativas' },
            { title: 'Supporting APIs', links: [...supportSection.links, ...partners], desc: 'Recursos de infraestrutura' },
          ].map((section) => (
            <div
              key={section.title}
              className="group rounded-xl border border-brand-border bg-brand-elevated/30 p-4 sm:p-5 transition hover:border-brand-accent/40 hover:bg-brand-elevated/50"
            >
              <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                <div className="sm:w-36 shrink-0">
                  <h3 className="text-xs font-bold text-brand-text uppercase tracking-wider">{section.title}</h3>
                  <p className="text-[10px] text-brand-text-secondary/70 mt-0.5 hidden sm:block">{section.desc}</p>
                </div>
                <div className="flex flex-wrap gap-2 flex-1">
                  {section.links.map((link) => (
                    <Link
                      key={link.label}
                      href={link.href}
                      className="inline-flex items-center px-2.5 py-1.5 rounded-full text-[11px] leading-tight border border-brand-border bg-brand-surface/60 text-brand-text-secondary hover:bg-brand-accent hover:text-brand-bg hover:border-brand-accent transition-all"
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Social icons */}
        <div className="flex flex-wrap gap-2.5 justify-center py-6 border-t border-brand-border" aria-label="Redes sociais">
          {socials.map((social) => (
            <a
              key={social.label}
              href={social.href}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center w-9 h-9 rounded-lg border transition-all hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent focus-visible:ring-offset-2 focus-visible:ring-offset-brand-surface"
              style={{ borderColor: `${social.color}99`, boxShadow: `0 0 12px ${social.glow}`, color: social.color }}
              title={social.label}
              aria-label={social.label}
              onMouseOver={(e) => { e.currentTarget.style.background = social.color; e.currentTarget.style.borderColor = social.color; e.currentTarget.style.color = '#fff'; }}
              onMouseOut={(e) => { e.currentTarget.style.background = ''; e.currentTarget.style.borderColor = `${social.color}99`; e.currentTarget.style.color = social.color; }}
            >
              {social.svg}
            </a>
          ))}
        </div>

        {/* E-mail direto */}
        <div className="text-center mb-4">
          <a href="mailto:contato@expostacker.com.br" className="text-sm text-brand-text-secondary hover:text-brand-accent font-mono transition-colors">
            contato@expostacker.com.br
          </a>
        </div>

        {/* Payment methods */}
        <section className="flex flex-col items-center gap-3 py-4 border-t border-brand-border" aria-labelledby="footer-payments-title">
          <h3 id="footer-payments-title" className="text-xs font-semibold text-brand-text-secondary uppercase tracking-wider">Formas de pagamento</h3>
          <ul className="flex flex-wrap gap-2 justify-center" role="list" aria-label="Bandeiras e meios aceitos">
            {payments.map((p) => (
              <li key={p.label} className="rounded overflow-hidden" role="listitem" aria-label={p.label}>{p.svg}</li>
            ))}
          </ul>
          <p className="text-xs text-brand-text-secondary flex items-center gap-1.5">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="w-3.5 h-3.5" aria-hidden="true"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            Pagamentos processados com seguranca pelo Mercado Pago
          </p>
        </section>

        {/* Bottom: copyright + legal */}
        <div className="pt-6 border-t border-brand-border flex flex-col sm:flex-row items-center justify-center gap-3 text-center">
          <p className="text-xs text-brand-text-secondary">© 2026 StackPost · Feito por ExpoStacker · Pagamento em R$ (BRL)</p>
          <span className="hidden sm:inline text-brand-border">·</span>
          <Link href="/terms" className="text-xs text-brand-text-secondary hover:text-brand-accent transition-colors">Termos</Link>
          <span className="hidden sm:inline text-brand-border">·</span>
          <Link href="/privacy" className="text-xs text-brand-text-secondary hover:text-brand-accent transition-colors">Privacidade</Link>
          <span className="hidden sm:inline text-brand-border">·</span>
          <button className="text-xs text-brand-text-secondary hover:text-brand-accent transition-colors">Gerenciar cookies</button>
          <span className="hidden sm:inline text-brand-border">·</span>
          <Link href="/status" className="text-xs text-brand-text-secondary hover:text-brand-accent transition-colors">Status</Link>
        </div>
      </div>
    </footer>
  );
}
