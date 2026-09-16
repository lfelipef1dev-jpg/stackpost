import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { saveAccount } from '@/lib/oauth';
import { logger } from '@/lib/logger';

const schema = z.object({
  handle: z.string().min(3).max(253),
  appPassword: z.string().min(4).max(100),
});

export async function POST(req: NextRequest) {
  const parsed = schema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: 'Handle e app password obrigatórios' }, { status: 400 });
  }

  const handle = parsed.data.handle.replace(/^@/, '').trim();
  const { appPassword } = parsed.data;

  try {
    const res = await fetch('https://bsky.social/xrpc/com.atproto.server.createSession', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: handle, password: appPassword }),
    });
    const data = await res.json();
    if (!res.ok) {
      return NextResponse.json({ error: data.message || 'Credenciais inválidas' }, { status: 401 });
    }

    await saveAccount(req, 'bluesky', {
      accessToken: data.accessJwt,
      refreshToken: data.refreshJwt,
      expiresIn: 7200,
    }, {
      username: data.handle || handle,
      externalId: data.did,
      platformAccountId: data.did,
    });

    return NextResponse.json({ ok: true, handle: data.handle });
  } catch (err: any) {
    logger.error('Bluesky credentials error:', err);
    return NextResponse.json({ error: err.message || 'Erro ao conectar Bluesky' }, { status: 500 });
  }
}
