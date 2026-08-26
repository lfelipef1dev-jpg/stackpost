import { NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import { criarPreferencia } from '@/lib/mercadopago';
import { getUserFromToken } from '@/lib/auth';

const PLANOS: Record<string, { valor: number; id_plano: number }> = {
  pro: { valor: 500, id_plano: 2 },
  business: { valor: 2000, id_plano: 3 },
  enterprise: { valor: 5000, id_plano: 4 },
};

const ORDEM_PLANOS: Record<string, number> = {
  free: 0,
  pro: 1,
  business: 2,
  enterprise: 3,
};

export async function POST(request: Request) {
  const user = await getUserFromToken(request as any);
  if (!user) {
    return NextResponse.json({ error: 'Nao autorizado.' }, { status: 401 });
  }

  let body: { plano?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: 'Corpo da requisicao invalido.' },
      { status: 400 },
    );
  }

  const plano = (body.plano || '').toLowerCase().trim();
  if (!plano) {
    return NextResponse.json(
      { error: 'Plano nao informado.' },
      { status: 400 },
    );
  }

  if (plano === 'free') {
    return NextResponse.json(
      { error: 'O plano Free nao precisa de pagamento.' },
      { status: 400 },
    );
  }

  const planoInfo = PLANOS[plano];
  if (!planoInfo) {
    return NextResponse.json(
      { error: 'Plano invalido. Escolha entre pro, business ou enterprise.' },
      { status: 400 },
    );
  }

  const supabase = getSupabase();

  const { data: team, error: errTeam } = await supabase
    .from('teams')
    .select('id, organization_id')
    .eq('id', user.teamId)
    .single();

  if (errTeam || !team) {
    return NextResponse.json(
      { error: 'Time nao encontrado.' },
      { status: 404 },
    );
  }

  const { data: org, error: errOrg } = await supabase
    .from('organizations')
    .select('id, plan')
    .eq('id', team.organization_id)
    .single();

  if (errOrg || !org) {
    return NextResponse.json(
      { error: 'Organizacao nao encontrada.' },
      { status: 404 },
    );
  }

  const planoAtual = (org.plan || 'free').toLowerCase();
  if ((ORDEM_PLANOS[planoAtual] ?? 0) >= (ORDEM_PLANOS[plano] ?? 0)) {
    return NextResponse.json(
      { error: 'Voce ja possui este plano ou um superior.' },
      { status: 400 },
    );
  }

  const { data: userData, error: errUser } = await supabase
    .from('users')
    .select('email, name')
    .eq('id', user.id)
    .single();

  const email = userData?.email || `${user.id}@stackpost.local`;

  const orderId = `stackpost_${Date.now()}_${Math.random().toString(16).slice(2, 10)}`;

  const { error: errOrder } = await supabase.from('stackpost_orders').insert({
    order_id: orderId,
    team_id: user.teamId,
    plano_escolhido: plano,
    total: planoInfo.valor,
    status: 'pending',
    criado_em: new Date().toISOString(),
  });

  if (errOrder) {
    return NextResponse.json(
      { error: 'Nao conseguimos iniciar o pedido.' },
      { status: 500 },
    );
  }

  try {
    const pref = await criarPreferencia({
      team_id: user.teamId,
      plano,
      valor: planoInfo.valor,
      email,
      external_reference: orderId,
    });

    await supabase
      .from('stackpost_orders')
      .update({
        mp_preference_id: pref.id,
        atualizado_em: new Date().toISOString(),
      })
      .eq('order_id', orderId);

    return NextResponse.json({
      order_id: orderId,
      init_point: pref.init_point,
      qrcode: pref.qrcode,
      copia_cola: pref.copia_cola,
      total: planoInfo.valor,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error('[pagamentos/checkout] Erro:', msg);
    return NextResponse.json(
      { error: 'Nao conseguimos comunicar com o gateway de pagamento.' },
      { status: 502 },
    );
  }
}
