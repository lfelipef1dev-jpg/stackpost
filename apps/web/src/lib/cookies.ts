import { NextRequest, NextResponse } from 'next/server';

const TOKEN_NAME = 'token';

function isSecureHost(req: NextRequest): boolean {
  const host = req.headers.get('host') || '';
  const isLocal = host.includes('localhost') || host.includes('127.0.0.1');
  return !isLocal;
}

function cookieOptions(req: NextRequest) {
  const secure = isSecureHost(req) ? 'Secure; ' : '';
  return `HttpOnly; ${secure}SameSite=Lax; Path=/`;
}

export function setTokenCookie(req: NextRequest, res: NextResponse, token: string) {
  res.headers.append('Set-Cookie', `${TOKEN_NAME}=${token}; ${cookieOptions(req)}; Max-Age=604800`);
  // Marcador legivel pelo cliente (nao-HttpOnly): indica sessao ativa para
  // componentes publicos evitarem fetch autenticado desnecessario (ex: /plans).
  const secure = isSecureHost(req) ? 'Secure; ' : '';
  res.headers.append('Set-Cookie', `logged_in=1; ${secure}SameSite=Lax; Path=/; Max-Age=604800`);
}

export function deleteTokenCookie(req: NextRequest, res: NextResponse) {
  res.headers.append('Set-Cookie', `${TOKEN_NAME}=; ${cookieOptions(req)}; Max-Age=0`);
  res.headers.append('Set-Cookie', `logged_in=; SameSite=Lax; Path=/; Max-Age=0`);
}

export function getTokenFromCookie(req: NextRequest): string | null {
  const cookieHeader = req.headers.get('cookie') || req.headers.get('Cookie');
  if (!cookieHeader) return null;
  const match = cookieHeader.match(/(?:^|;\s*)token=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}
