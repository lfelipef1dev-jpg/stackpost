export interface PublishResult {
  success: boolean;
  externalId?: string;
  externalUrl?: string;
  error?: { code: string; message: string };
}

export interface PublishParams {
  content: string;
  uploadIds?: string[];
  account: {
    access_token: string;
    [key: string]: any;
  };
  imageUrl?: string;
  videoUrl?: string;
  mediaType?: 'IMAGE' | 'VIDEO' | 'CAROUSEL';
}

export abstract class PlatformAdapter {
  abstract name: string;

  async publish(params: PublishParams): Promise<PublishResult> {
    return { success: true, externalId: `mock-${this.name}-${Date.now()}`, externalUrl: `https://${this.name}.com/p/mock` };
  }

  async refreshToken(refreshToken: string): Promise<{ accessToken: string; refreshToken?: string } | null> {
    return null;
  }
}
