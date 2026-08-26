import { NextRequest, NextResponse } from 'next/server';
import { buildAuthUrl, OAUTH_CONFIGS } from '@/lib/oauth';

export async function GET(req: NextRequest) {
  const config = OAUTH_CONFIGS['reddit'];
  if (!config) return NextResponse.json({ error: 'Plataforma nao suportada' }, { status: 400 });
  const state = Buffer.from(Math.random().toString(36).slice(2)).toString('base64');
  try {
    const url = buildAuthUrl(config, state);
    const res = NextResponse.redirect(url);
    res.cookies.set('oauth_state_reddit', state, { httpOnly: true, maxAge: 600, path: '/' });
    return res;
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}