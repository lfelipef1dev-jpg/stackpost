export interface Platform {
  id: string;
  name: string;
  color: string;
  aspect: string;
  formats: string;
  maxFile: string;
  textLimit: number;
  description: string;
}

export const PLATFORMS: Platform[] = [
  { id: 'instagram', name: 'Instagram', color: '#E1306C', aspect: '4:5, 1:1, 9:16', formats: 'JPG, PNG, MP4', maxFile: '8 MB / 1 GB', textLimit: 2200, description: 'Feed, Reels, Stories' },
  { id: 'facebook', name: 'Facebook', color: '#1877F2', aspect: '1.91:1, 1:1, 4:5', formats: 'JPG, PNG, MP4', maxFile: '8 MB / 1 GB', textLimit: 63206, description: 'Posts, Reels, Stories' },
  { id: 'tiktok', name: 'TikTok', color: '#000000', aspect: '9:16', formats: 'MP4, WebM', maxFile: '1 GB', textLimit: 2200, description: 'Vídeos e Photo Mode' },
  { id: 'youtube', name: 'YouTube', color: '#FF0000', aspect: '16:9, 9:16', formats: 'MP4', maxFile: '128 GB', textLimit: 5000, description: 'Vídeos e Shorts' },
  { id: 'linkedin', name: 'LinkedIn', color: '#0A66C2', aspect: '1.91:1, 1:1', formats: 'JPG, PNG, GIF, PDF', maxFile: '8 MB', textLimit: 3000, description: 'Posts e artigos' },
  { id: 'x', name: 'X', color: '#000000', aspect: '16:9, 1:1, 4:5', formats: 'JPG, PNG, GIF, MP4', maxFile: '5 MB / 512 MB', textLimit: 280, description: 'Tweets e mídia' },
  { id: 'threads', name: 'Threads', color: '#000000', aspect: 'IG rules', formats: 'JPG, PNG, MP4', maxFile: '8 MB', textLimit: 500, description: 'Texto, mídia e enquetes' },
  { id: 'pinterest', name: 'Pinterest', color: '#BD081C', aspect: '2:3, 1:1', formats: 'JPG, PNG', maxFile: '20 MB', textLimit: 500, description: 'Pins com imagem ou vídeo' },
  { id: 'reddit', name: 'Reddit', color: '#FF4500', aspect: 'variável', formats: 'JPG, PNG, GIF, MP4', maxFile: '20 MB', textLimit: 300, description: 'Posts em subreddits' },
  { id: 'bluesky', name: 'Bluesky', color: '#0085FF', aspect: '1:1, 16:9', formats: 'JPG, PNG, GIF, MP4, WEBM', maxFile: '1 MB / 50 MB', textLimit: 300, description: 'Posts AT Protocol' },
  { id: 'mastodon', name: 'Mastodon', color: '#6364FF', aspect: 'variável', formats: 'JPG, PNG, GIF, WEBP, MP4', maxFile: '8 MB / 40 MB', textLimit: 500, description: 'Status em instância' },
  { id: 'discord', name: 'Discord', color: '#5865F2', aspect: 'variável', formats: 'qualquer', maxFile: '25 MB', textLimit: 2000, description: 'Mensagens por webhook' },
  { id: 'slack', name: 'Slack', color: '#4A154B', aspect: 'variável', formats: 'qualquer', maxFile: '8 MB', textLimit: 30000, description: 'Mensagens por webhook' },
  { id: 'google_business', name: 'Google Business', color: '#4285F4', aspect: '1:1, 4:3', formats: 'JPG, PNG', maxFile: '5 MB', textLimit: 1500, description: 'Posts no perfil local' },
  { id: 'snapchat', name: 'Snapchat', color: '#FFFC00', aspect: '9:16', formats: 'MP4', maxFile: '1 GB', textLimit: 1000, description: 'Stories e Spotlight' },
];
