import { jwtVerify } from 'jose';
import { NextRequest } from 'next/server';
import { getSupabase } from './supabase';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'dev-secret');

export async function getUserFromToken(req: NextRequest) {
  const auth = req.headers.get('authorization');
  if (!auth || !auth.startsWith('Bearer ')) return null;

  const token = auth.slice(7);
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
