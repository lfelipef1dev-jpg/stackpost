// StackPost SDK - TypeScript
// Uma integracao, 15 plataformas, 114 endpoints

const DEFAULT_BASE_URL = 'https://stackpost.expostacker.com.br';

export interface StackPostConfig {
  apiKey: string;
  baseUrl?: string;
}

export interface PostParams {
  platforms: string[];
  text: string;
  uploadIds?: string[];
  scheduledAt?: string;
  firstComment?: string;
}

export interface Post {
  id: string;
  status: string;
  platforms: string[];
  content: string;
  publishedAt?: string;
  externalData?: any;
}

export class StackPost {
  private apiKey: string;
  private baseUrl: string;

  constructor(config: StackPostConfig) {
    this.apiKey = config.apiKey;
    this.baseUrl = config.baseUrl || DEFAULT_BASE_URL;
  }

  private async request<T>(method: string, path: string, body?: any): Promise<T> {
    const res = await fetch(`${this.baseUrl}${path}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: res.statusText }));
      throw new Error(err.error || `HTTP ${res.status}`);
    }

    return res.json();
  }

  // Posts
  async createPost(params: PostParams): Promise<Post> {
    return this.request('POST', '/api/posts', params);
  }

  async listPosts(cursor?: string, limit = 20): Promise<{ data: Post[]; nextCursor: string | null }> {
    const q = cursor ? `?cursor=${cursor}&limit=${limit}` : `?limit=${limit}`;
    return this.request('GET', `/api/posts${q}`);
  }

  async getPost(id: string): Promise<Post> {
    return this.request('GET', `/api/posts/${id}`);
  }

  async publishPost(postId: string): Promise<any> {
    return this.request('POST', '/api/posts/publish', { postId });
  }

  async bulkPost(posts: PostParams[]): Promise<any> {
    return this.request('POST', '/api/posts/bulk', { posts });
  }

  async approvePost(postId: string): Promise<any> {
    return this.request('POST', '/api/posts/approve', { postId });
  }

  // Social Accounts
  async listAccounts(): Promise<any[]> {
    return this.request('GET', '/api/accounts');
  }

  async connectionCheck(accountId: string): Promise<any> {
    return this.request('GET', `/api/accounts/connection-check?accountId=${accountId}`);
  }

  // Uploads
  async uploadFromUrl(url: string, fileName?: string): Promise<any> {
    return this.request('POST', '/api/upload/from-url', { url, fileName });
  }

  async initUpload(fileName: string, mimeType: string, size: number): Promise<any> {
    return this.request('POST', '/api/upload/init', { fileName, mimeType, size });
  }

  async finalizeUpload(uploadId: string, etag?: string): Promise<any> {
    return this.request('POST', '/api/upload/finalize', { uploadId, etag });
  }

  // Analytics
  async getAnalytics(postId?: string, platform?: string): Promise<any> {
    const q = postId ? `?postId=${postId}` : platform ? `?platform=${platform}` : '';
    return this.request('GET', `/api/analytics${q}`);
  }

  // Comments
  async listComments(postId: string): Promise<any[]> {
    return this.request('GET', `/api/comments?postId=${postId}`);
  }

  async postComment(postId: string, text: string, platform: string): Promise<any> {
    return this.request('POST', '/api/comments', { postId, text, platform });
  }

  // Webhooks
  async listWebhooks(): Promise<any[]> {
    return this.request('GET', '/api/webhooks');
  }

  async createWebhook(url: string, events: string[]): Promise<any> {
    return this.request('POST', '/api/webhooks', { url, events });
  }

  async replayWebhook(eventId: string): Promise<any> {
    return this.request('POST', '/api/webhooks/replay', { eventId });
  }

  // AI
  async generateCaption(platform: string, topic: string): Promise<any> {
    return this.request('POST', '/api/ai/caption', { platform, topic });
  }

  async suggestHashtags(platform: string, content: string): Promise<any> {
    return this.request('POST', '/api/ai/hashtags', { platform, content });
  }

  // Best time
  async getBestTime(platform: string): Promise<any> {
    return this.request('GET', `/api/best-time?platform=${platform}`);
  }

  // Usage
  async getDailyLimits(): Promise<any> {
    return this.request('GET', '/api/usage/daily-limits');
  }

  async getMonthlyUsage(): Promise<any> {
    return this.request('GET', '/api/usage/monthly');
  }

  // API Keys
  async listApiKeys(): Promise<any[]> {
    return this.request('GET', '/api/api-keys');
  }

  async createApiKey(name: string): Promise<any> {
    return this.request('POST', '/api/api-keys', { name });
  }

  // Team
  async getTeam(): Promise<any> {
    return this.request('GET', '/api/team');
  }

  // Link in bio
  async listLinkInBioPages(): Promise<any[]> {
    return this.request('GET', '/api/link-in-bio');
  }

  async createLinkInBioPage(slug: string, title: string, links: any[]): Promise<any> {
    return this.request('POST', '/api/link-in-bio', { slug, title, links });
  }
}

export default StackPost;
