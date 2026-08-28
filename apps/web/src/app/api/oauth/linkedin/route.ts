import { NextRequest, NextResponse } from 'next/server';
import { getLinkedInAuthUrl } from '@/lib/adapters/linkedin-api';
import { getUserFromToken } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  const token = authHeader?.startsWith('Bearer ')
    ? authHeader.slice(7)
    : new URL(req.url).searchParams.get('token') || '';

  let stateToken = 'linkedin';
  if (token) {
    const user = await getUserFromToken(req);
    if (user) {
      stateToken = `${user.teamId}:linkedin`;
    }
  }

  return NextResponse.redirect(getLinkedInAuthUrl(stateToken));
}
