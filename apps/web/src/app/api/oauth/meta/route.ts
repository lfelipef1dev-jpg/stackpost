import { oauth_metaQuerySchema } from '@/lib/schemas';
import { NextRequest, NextResponse } from 'next/server';
import { getInstagramAuthUrl } from '@/lib/adapters/instagram-api';
import { getUserFromToken } from '@/lib/auth';

export async function GET(req: NextRequest) {
  // getUserFromToken le o cookie HttpOnly — resolve o team de qualquer usuario logado
  const user = await getUserFromToken(req);
  const stateToken = user ? `${user.teamId}:instagram` : 'instagram';

  return NextResponse.redirect(getInstagramAuthUrl(stateToken));
}
