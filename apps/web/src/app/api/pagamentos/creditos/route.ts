import { logger } from '@/lib/logger';
import { NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import { criarPreferenciaCreditos } from '@/lib/mercadopago';
import { getUserFromToken } from '@/lib/auth';

const VALORES_PRE_APROVADOS = [50, 100, 200, 500];

export async function POST(request: Request) {
  const user = await getUserFromToken(request as any);
  if (!user) {
    return NextResponse.json({ error: 'Nao autorizado.' }, { status: 401 });
  }

  let body: { valor?: number };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: 'Corpo da requisicao invalido.' },
      { status: 400 },
    );
  }

  const valor = Number(body.valor);
  if (!valor || valor <= 0) {
    return NextResponse.json(
      { error: 'Valor invalido. Escolha um valor positivo.' },
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

  const { data: userData } = await supabase
    .from('users')
    .select('email, name')
    .eq('id', user.id)
    .single();

  const email = userData?.email || `${user.id}@stackpost.local`;
  const orderId = `stackpost_creditos_${user.teamId}_${Date.now()}_${Math.random().toString(16).slice(2, 10)}`;

  const { error: errOrder } = await supabase.from('stackpost_orders').insert({
    order_id: orderId,
    team_id: user.teamId,
    plano_escolhido: 'creditos-x',
    total: valor,
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
    const pref = await criarPreferenciaCreditos({
      team_id: user.teamId,
      valor,
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
      total: valor,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    logger.error('[pagamentos/creditos] Erro:', msg);
    return NextResponse.json(
      { error: 'Nao conseguimos comunicar com o gateway de pagamento.' },
      { status: 502 },
    );
  }
}
