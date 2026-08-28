import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import { getUserFromToken } from '@/lib/auth';

// POST /api/misc/facebook/recommendations/reply — responder recommendation/review
export async function POST(req: NextRequest) {
  const user = await getUserFromToken(req);
  if (!user) return NextResponse.json({ error: 'Nao autorizado' }, { status: 401 });

  const { socialAccountId, recommendationId, message } = await req.json().catch(() => ({}));
  if (!socialAccountId || !recommendationId || !message) {
    return NextResponse.json({ error: 'socialAccountId, recommendationId e message obrigatorios' }, { status: 400 });
  }

  const supabase = getSupabase();

  try {
    const { data: account } = await supabase
      .from('social_accounts')
      .select('*')
      .eq('id', socialAccountId)
      .eq('team_id', user.teamId)
      .eq('platform', 'facebook')
      .maybeSingle();
    if (!account) return NextResponse.json({ error: 'Conta Facebook nao encontrada' }, { status: 404 });

    // Responder via comment na open_graph_story
    const res = await fetch(`https://graph.facebook.com/v26.0/${recommendationId}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, access_token: account.access_token }),
    });
    const data = await res.json();
    if (!res.ok) return NextResponse.json({ error: data.error?.message || 'Erro ao responder' }, { status: 400 });

    return NextResponse.json({ success: true, commentId: data.id });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
