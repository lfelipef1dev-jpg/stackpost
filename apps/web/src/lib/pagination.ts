// Cursor pagination helper
// Usage: const { data, nextCursor } = await paginate(supabase.from('posts'), req);

export interface PaginationParams {
  cursor?: string;
  limit?: number;
}

export interface PaginationResult<T> {
  data: T[];
  nextCursor: string | null;
  hasMore: boolean;
}

export function getPaginationParams(req: Request): PaginationParams {
  const url = new URL(req.url);
  const cursor = url.searchParams.get('cursor') || undefined;
  const limit = Math.min(parseInt(url.searchParams.get('limit') || '20', 10), 100);
  return { cursor, limit };
}

export function encodeCursor(value: string): string {
  return Buffer.from(value).toString('base64url');
}

export function decodeCursor(cursor: string): string {
  return Buffer.from(cursor, 'base64url').toString('utf-8');
}
