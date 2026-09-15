import { oauth_linkedinQuerySchema } from '@/lib/schemas';
import { NextRequest, NextResponse } from 'next/server';
import { getLinkedInAuthUrl } from '@/lib/adapters/linkedin-api';
import { getUserFromToken } from '@/lib/auth';

export async function GET(req: NextRequest) {
  // getUserFromToken le o cookie HttpOnly — resolve o team de qualquer usuario logado
  const user = await getUserFromToken(req);
  const stateToken = user ? `${user.teamId}:linkedin` : 'linkedin';

  const organization = new URL(req.url).searchParams.get('type') === 'organization';
  return NextResponse.redirect(getLinkedInAuthUrl(stateToken, organization));
}
