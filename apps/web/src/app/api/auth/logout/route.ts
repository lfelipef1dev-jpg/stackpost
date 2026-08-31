import { NextRequest, NextResponse } from 'next/server';
import { deleteTokenCookie } from '@/lib/cookies';

export async function POST(req: NextRequest) {
  const res = NextResponse.json({ ok: true });
  deleteTokenCookie(req, res);
  return res;
}
