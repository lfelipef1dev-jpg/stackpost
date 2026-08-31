import { SignJWT } from 'jose';
import { requireEnv } from './env';

const JWT_SECRET = new TextEncoder().encode(requireEnv('JWT_SECRET'));

export async function createToken(payload: { sub: string; email: string; name?: string; role?: string }) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('7d')
    .sign(JWT_SECRET);
}
