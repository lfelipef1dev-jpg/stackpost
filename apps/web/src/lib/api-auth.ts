import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import { createHmac } from 'crypto';

export async function authenticateApiKey(req: NextRequest): Promise<{ teamId: string; orgId: string } | null> {
  const apiKey = req.headers.get('x-api-key');
  if (!apiKey || !apiKey.startsWith('pk_')) return null;

  const keyHash = createHmac('sha256', process.env.JWT_SECRET || 'fallback').update(apiKey).digest('hex');

  try {
    const supabase = getSupabase();

    const { data: apiKeyRow, error: apiKeyError } = await supabase
      .from('api_keys')
      .select('team_id')
      .eq('key_hash', keyHash)
      .is('revoked_at', null)
      .single();

    if (apiKeyError || !apiKeyRow) return null;

    const { data: teamRow, error: teamError } = await supabase
      .from('teams')
      .select('organization_id')
      .eq('id', apiKeyRow.team_id)
      .single();

    if (teamError || !teamRow) return null;

    await supabase
      .from('api_keys')
      .update({ last_used_at: new Date().toISOString() })
      .eq('key_hash', keyHash);

    return { teamId: apiKeyRow.team_id, orgId: teamRow.organization_id };
  } catch {
    return null;
  }
}

export async function requireAuth(req: NextRequest): Promise<{ teamId: string; orgId: string; source: 'jwt' | 'apikey' } | NextResponse> {
  const apiKeyResult = await authenticateApiKey(req);
  if (apiKeyResult) {
    return { ...apiKeyResult, source: 'apikey' };
  }

  const { getUserFromToken } = await import('@/lib/auth');
  const user = await getUserFromToken(req);
  if (user) {
    return { teamId: user.teamId, orgId: (user as any).orgId || '', source: 'jwt' };
  }

  return NextResponse.json({ error: 'Unauthorized. Use x-api-key or Bearer token.' }, { status: 401 });
}
