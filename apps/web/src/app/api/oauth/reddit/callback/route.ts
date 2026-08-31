import { logger } from '@/lib/logger';
import { oauth_reddit_callbackQuerySchema } from '@/lib/schemas';
﻿import { NextRequest, NextResponse } from 'next/server';
import { exchangeCodeForToken, saveAccount, OAUTH_CONFIGS } from '@/lib/oauth';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const queryRaw = Object.fromEntries(searchParams);
  const parsedQuery = oauth_reddit_callbackQuerySchema.safeParse(queryRaw);
  if (!parsedQuery.success) return NextResponse.json({ error: parsedQuery.error.issues }, { status: 400 });
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const storedState = req.cookies.get('oauth_state_reddit')?.value;

  if (!code) return NextResponse.json({ error: 'Codigo nao informado' }, { status: 400 });
  if (state !== storedState) return NextResponse.json({ error: 'State invalido' }, { status: 400 });

  const config = OAUTH_CONFIGS['reddit'];
  try {
    const tokenData = await exchangeCodeForToken(config, code);
    await saveAccount(req, 'reddit', tokenData, {
      username: 'reddit_user',
      externalId: tokenData.raw?.user?.open_id || tokenData.raw?.user_id,
    });
    return NextResponse.redirect(new URL('/dashboard?connected=reddit', req.url));
  } catch (err: any) {
    logger.error('reddit OAuth error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}