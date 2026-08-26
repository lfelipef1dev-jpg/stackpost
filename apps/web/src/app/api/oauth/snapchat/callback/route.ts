import { NextRequest, NextResponse } from 'next/server';
import { exchangeCodeForToken, saveAccount, OAUTH_CONFIGS } from '@/lib/oauth';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const storedState = req.cookies.get('oauth_state_snapchat')?.value;

  if (!code) return NextResponse.json({ error: 'Codigo nao informado' }, { status: 400 });
  if (state !== storedState) return NextResponse.json({ error: 'State invalido' }, { status: 400 });

  const config = OAUTH_CONFIGS['snapchat'];
  try {
    const tokenData = await exchangeCodeForToken(config, code);
    await saveAccount(req, 'snapchat', tokenData, {
      username: 'snapchat_user',
      externalId: tokenData.raw?.user?.open_id || tokenData.raw?.user_id,
    });
    return NextResponse.redirect(new URL('/dashboard?connected=snapchat', req.url));
  } catch (err: any) {
    console.error('snapchat OAuth error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}