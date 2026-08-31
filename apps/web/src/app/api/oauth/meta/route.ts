import { oauth_metaQuerySchema } from '@/lib/schemas';
import { NextRequest, NextResponse } from 'next/server';
import { getInstagramAuthUrl } from '@/lib/adapters/instagram-api';
import { getUserFromToken } from '@/lib/auth';

export async function GET(req: NextRequest) {
  // Identificar usuario logado via token no cookie ou query param
  const authHeader = req.headers.get('authorization');
  const token = authHeader?.startsWith('Bearer ')
    ? authHeader.slice(7)
    : new URL(req.url).searchParams.get('token') || '';

  let stateToken = 'instagram';
  if (token) {
    const user = await getUserFromToken(req);
    if (user) {
      stateToken = `${user.teamId}:instagram`;
    }
  }

  return NextResponse.redirect(getInstagramAuthUrl(stateToken));
}
