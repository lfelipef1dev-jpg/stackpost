import { jwtVerify } from 'jose';
import { NextRequest } from 'next/server';
import { getSupabase } from './supabase';
import { requireEnv } from './env';
import { getTokenFromCookie } from './cookies';

const JWT_SECRET = (() => {
  const secret = requireEnv('JWT_SECRET');
  return new TextEncoder().encode(secret);
})();

function getToken(req: NextRequest): string | null {
  const auth = req.headers.get('authorization');
  if (auth && auth.startsWith('Bearer ')) return auth.slice(7);
  return getTokenFromCookie(req);
}

export async function getUserFromToken(req: NextRequest) {
  const token = getToken(req);
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    const userId = payload.sub as string;
    if (!userId) return null;

    const supabase = getSupabase();
    const { data: user, error } = await supabase
      .from('users')
      .select('id, team_id, email, name, role')
      .eq('id', userId)
      .single();

    if (error || !user) return null;

    return { id: user.id, teamId: user.team_id, email: user.email, name: user.name, role: user.role };
  } catch {
    return null;
  }
}
