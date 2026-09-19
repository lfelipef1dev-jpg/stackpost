import { logger } from '@/lib/logger';
import { oauth_threads_callbackQuerySchema } from '@/lib/schemas';
import { NextRequest, NextResponse } from 'next/server';
import { exchangeCodeForToken, saveAccount, OAUTH_CONFIGS } from '@/lib/oauth';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const queryRaw = Object.fromEntries(searchParams);
  const parsedQuery = oauth_threads_callbackQuerySchema.safeParse(queryRaw);
  if (!parsedQuery.success) return NextResponse.json({ error: parsedQuery.error.issues }, { status: 400 });
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const storedState = req.cookies.get('oauth_state_threads')?.value;

  if (!code) return NextResponse.json({ error: 'Código não informado' }, { status: 400 });
  if (state !== storedState) return NextResponse.json({ error: 'State inválido' }, { status: 400 });

  const config = OAUTH_CONFIGS['threads'];
  try {
    const tokenData = await exchangeCodeForToken(config, code);

    // Trocar token de curta duração (1h) por long-lived (60 dias)
    let accessToken = tokenData.accessToken;
    let expiresIn = tokenData.expiresIn;
    const userId = tokenData.raw?.user_id;
    const ll = await fetch(
      `https://graph.threads.net/access_token?grant_type=th_exchange_token&client_secret=${encodeURIComponent(
        process.env.THREADS_APP_SECRET!
      )}&access_token=${encodeURIComponent(accessToken)}`
    ).then((r) => r.json()).catch(() => null);
    if (ll?.access_token) {
      accessToken = ll.access_token;
      expiresIn = ll.expires_in;
    }

    // Username real
    let username = 'threads_user';
    const me = await fetch(
      `https://graph.threads.net/v1.0/me?fields=id,username&access_token=${encodeURIComponent(accessToken)}`
    ).then((r) => r.json()).catch(() => null);
    if (me?.username) username = me.username;

    await saveAccount(req, 'threads', { ...tokenData, accessToken, expiresIn }, {
      username,
      externalId: me?.id || userId,
      platformAccountId: me?.id || userId,
    });
    return NextResponse.redirect(new URL('/dashboard?connected=threads', req.url));
  } catch (err: any) {
    logger.error('threads OAuth error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
