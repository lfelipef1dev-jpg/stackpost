/**
 * lib/mercadopago.ts
 * Integracao com Mercado Pago (Checkout Preferences + PIX + Webhook).
 * Compativel com Cloudflare Workers (fetch nativo).
 * Adaptado do NEXUS-IA para StackPost.
 */

const MP_API_BASE = "https://api.mercadopago.com";

function getAccessToken(): string {
  const token = process.env.MERCADOPAGO_ACCESS_TOKEN;
  if (!token) {
    throw new Error("MERCADOPAGO_ACCESS_TOKEN nao configurado no ambiente.");
  }
  return token;
}

export interface CriarPreferenciaPayload {
  team_id: string;
  plano: string;
  valor: number;
  email: string;
  external_reference?: string;
}

export interface CriarPreferenciaCreditosPayload {
  team_id: string;
  valor: number;
  email: string;
  external_reference?: string;
}

export interface CriarPreferenciaResult {
  id: string;
  init_point: string;
  qrcode: string;
  copia_cola: string;
  payment_id_pix?: string;
}

/**
 * Cria uma preferencia de pagamento no Mercado Pago e gera QR Code PIX.
 */
export async function criarPreferencia(
  payload: CriarPreferenciaPayload,
): Promise<CriarPreferenciaResult> {
  const accessToken = getAccessToken();
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://stackpost.expostacker.com.br";
  const webhookSecret = process.env.MERCADOPAGO_WEBHOOK_SECRET || "";
  const notificationUrl = webhookSecret
    ? `${siteUrl}/api/pagamentos/webhook`
    : undefined;

  const externalReference =
    payload.external_reference ||
    `stackpost_${payload.team_id}_${payload.plano}_${Date.now()}`;

  const planoLabel = payload.plano.charAt(0).toUpperCase() + payload.plano.slice(1);

  // 1) Cria a preferencia de checkout (link init_point)
  const prefBody: Record<string, unknown> = {
    items: [
      {
        id: payload.plano,
        title: `StackPost - Plano ${planoLabel}`,
        description: `Assinatura mensal do plano ${payload.plano} do StackPost`,
        quantity: 1,
        unit_price: payload.valor,
        currency_id: "BRL",
      },
    ],
    payer: {
      email: payload.email,
    },
    back_urls: {
      success: `${siteUrl}/billing?pagamento=sucesso`,
      pending: `${siteUrl}/billing?pagamento=pendente`,
      failure: `${siteUrl}/billing?pagamento=falha`,
    },
    auto_return: "approved",
    external_reference: externalReference,
    metadata: {
      team_id: payload.team_id,
      plano: payload.plano,
    },
    statement_descriptor: "STACKPOST",
    payment_methods: {
      installments: 1,
    },
  };

  if (notificationUrl) {
    prefBody.notification_url = notificationUrl;
  }

  const prefRes = await fetch(`${MP_API_BASE}/checkout/preferences`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(prefBody),
  });

  if (!prefRes.ok) {
    const txt = await prefRes.text();
    throw new Error(
      `Mercado Pago (preferences) ${prefRes.status}: ${txt.slice(0, 300)}`,
    );
  }

  const prefData = await prefRes.json() as {
    id: string;
    init_point?: string;
    sandbox_init_point?: string;
  };

  const preferenceId = prefData.id;
  const initPoint = prefData.init_point || prefData.sandbox_init_point || "";

  // 2) Cria o pagamento PIX (QR Code) usando a mesma referencia
  const pixBody = {
    transaction_amount: payload.valor,
    description: `StackPost - Plano ${planoLabel}`,
    payment_method_id: "pix",
    payer: {
      email: payload.email,
      first_name: "StackPost",
      last_name: "User",
    },
    external_reference: externalReference,
    metadata: {
      team_id: payload.team_id,
      plano: payload.plano,
      preference_id: preferenceId,
    },
    notification_url: notificationUrl,
  };

  const pixRes = await fetch(`${MP_API_BASE}/v1/payments`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
      "X-Idempotency-Key": externalReference,
    },
    body: JSON.stringify(pixBody),
  });

  let qrcode = "";
  let copia_cola = "";
  let payment_id_pix: string | undefined;

  if (pixRes.ok) {
    const pixData = await pixRes.json() as {
      id?: number;
      point_of_interaction?: {
        transaction_data?: {
          qr_code?: string;
          qr_code_base64?: string;
        };
      };
    };
    payment_id_pix = pixData.id ? String(pixData.id) : undefined;
    const txData = pixData.point_of_interaction?.transaction_data;
    qrcode = txData?.qr_code_base64 || "";
    copia_cola = txData?.qr_code || "";
  }

  return {
    id: preferenceId,
    init_point: initPoint,
    qrcode,
    copia_cola,
    payment_id_pix,
  };
}

/**
 * Cria uma preferencia de pagamento para creditos X (pay-as-you-go).
 */
export async function criarPreferenciaCreditos(
  payload: CriarPreferenciaCreditosPayload,
): Promise<CriarPreferenciaResult> {
  const accessToken = getAccessToken();
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://stackpost.expostacker.com.br";
  const webhookSecret = process.env.MERCADOPAGO_WEBHOOK_SECRET || "";
  const notificationUrl = webhookSecret
    ? `${siteUrl}/api/pagamentos/webhook`
    : undefined;

  const externalReference =
    payload.external_reference ||
    `stackpost_creditos_${payload.team_id}_${Date.now()}`;

  // 1) Cria a preferencia de checkout (link init_point)
  const prefBody: Record<string, unknown> = {
    items: [
      {
        id: "creditos-x",
        title: "StackPost - Creditos X",
        description: `Creditos para publicacao na API do X/Twitter - R$ ${payload.valor.toFixed(2)}`,
        quantity: 1,
        unit_price: payload.valor,
        currency_id: "BRL",
      },
    ],
    payer: {
      email: payload.email,
    },
    back_urls: {
      success: `${siteUrl}/billing?pagamento=sucesso`,
      pending: `${siteUrl}/billing?pagamento=pendente`,
      failure: `${siteUrl}/billing?pagamento=falha`,
    },
    auto_return: "approved",
    external_reference: externalReference,
    metadata: {
      team_id: payload.team_id,
      tipo: "creditos-x",
      valor: payload.valor,
    },
    statement_descriptor: "STACKPOST",
    payment_methods: {
      installments: 1,
    },
  };

  if (notificationUrl) {
    prefBody.notification_url = notificationUrl;
  }

  const prefRes = await fetch(`${MP_API_BASE}/checkout/preferences`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(prefBody),
  });

  if (!prefRes.ok) {
    const txt = await prefRes.text();
    throw new Error(
      `Mercado Pago (preferences) ${prefRes.status}: ${txt.slice(0, 300)}`,
    );
  }

  const prefData = await prefRes.json() as {
    id: string;
    init_point?: string;
    sandbox_init_point?: string;
  };

  const preferenceId = prefData.id;
  const initPoint = prefData.init_point || prefData.sandbox_init_point || "";

  // 2) Cria o pagamento PIX (QR Code) usando a mesma referencia
  const pixBody = {
    transaction_amount: payload.valor,
    description: "StackPost - Creditos X",
    payment_method_id: "pix",
    payer: {
      email: payload.email,
      first_name: "StackPost",
      last_name: "User",
    },
    external_reference: externalReference,
    metadata: {
      team_id: payload.team_id,
      tipo: "creditos-x",
      valor: payload.valor,
      preference_id: preferenceId,
    },
    notification_url: notificationUrl,
  };

  const pixRes = await fetch(`${MP_API_BASE}/v1/payments`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
      "X-Idempotency-Key": externalReference,
    },
    body: JSON.stringify(pixBody),
  });

  let qrcode = "";
  let copia_cola = "";
  let payment_id_pix: string | undefined;

  if (pixRes.ok) {
    const pixData = await pixRes.json() as {
      id?: number;
      point_of_interaction?: {
        transaction_data?: {
          qr_code?: string;
          qr_code_base64?: string;
        };
      };
    };
    payment_id_pix = pixData.id ? String(pixData.id) : undefined;
    const txData = pixData.point_of_interaction?.transaction_data;
    qrcode = txData?.qr_code_base64 || "";
    copia_cola = txData?.qr_code || "";
  }

  return {
    id: preferenceId,
    init_point: initPoint,
    qrcode,
    copia_cola,
    payment_id_pix,
  };
}

// ---------------------------------------------------------------------------
// Preapproval (assinaturas recorrentes) + Reembolsos
// ---------------------------------------------------------------------------

export interface CriarPreapprovalPayload {
  planId: string; // slug do plano (ex: growth)
  amount: number; // valor em reais
  frequency: number; // 1, 12 etc
  frequencyType: 'days' | 'months';
  payerEmail: string;
  externalReference: string; // prefixado stackpost_
  backUrl?: string;
}

export interface CriarPreapprovalResult {
  id: string;
  init_point: string;
  status: string;
  raw: unknown;
}

/**
 * Cria uma assinatura recorrente (preapproval) no Mercado Pago.
 */
export async function criarPreapproval(
  payload: CriarPreapprovalPayload,
): Promise<CriarPreapprovalResult> {
  const accessToken = getAccessToken();
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL || 'https://stackpost.expostacker.com.br';
  const backUrl = payload.backUrl || `${siteUrl}/billing?assinatura=ativa`;

  const externalReference = payload.externalReference.startsWith('stackpost_')
    ? payload.externalReference
    : `stackpost_${payload.externalReference}`;

  const body = {
    reason: `StackPost - Assinatura ${payload.planId}`,
    auto_recurring: {
      frequency: payload.frequency,
      frequency_type: payload.frequencyType,
      transaction_amount: payload.amount,
      currency_id: 'BRL',
    },
    back_url: backUrl,
    payer_email: payload.payerEmail,
    external_reference: externalReference,
    status: 'authorized',
  };

  const res = await fetch(`${MP_API_BASE}/preapproval`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
      'X-Idempotency-Key': externalReference,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(
      `Mercado Pago (preapproval) ${res.status}: ${txt.slice(0, 300)}`,
    );
  }

  const data = (await res.json()) as {
    id: string;
    init_point?: string;
    sandbox_init_point?: string;
    status?: string;
  };

  return {
    id: data.id,
    init_point: data.init_point || data.sandbox_init_point || '',
    status: data.status || 'authorized',
    raw: data,
  };
}

export interface ConsultarPreapprovalResult {
  id: string;
  status: string;
  external_reference?: string;
  raw: unknown;
}

/**
 * Consulta o status de um preapproval no Mercado Pago.
 */
export async function consultarPreapproval(
  preapprovalId: string,
): Promise<ConsultarPreapprovalResult> {
  const accessToken = getAccessToken();

  const res = await fetch(`${MP_API_BASE}/preapproval/${preapprovalId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(
      `Mercado Pago (get preapproval) ${res.status}: ${txt.slice(0, 300)}`,
    );
  }

  const data = (await res.json()) as {
    id: string;
    status?: string;
    external_reference?: string;
  };

  return {
    id: data.id,
    status: data.status || 'unknown',
    external_reference: data.external_reference,
    raw: data,
  };
}

/**
 * Cancela um preapproval no Mercado Pago.
 */
export async function cancelarPreapproval(
  preapprovalId: string,
): Promise<{ id: string; status: string }> {
  const accessToken = getAccessToken();

  const res = await fetch(`${MP_API_BASE}/preapproval/${preapprovalId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ status: 'cancelled' }),
  });

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(
      `Mercado Pago (cancel preapproval) ${res.status}: ${txt.slice(0, 300)}`,
    );
  }

  const data = (await res.json()) as { id: string; status?: string };
  return { id: data.id, status: data.status || 'cancelled' };
}

export interface CriarReembolsoResult {
  id: string;
  status: string;
  amount: number;
  raw: unknown;
}

/**
 * Cria um reembolso (total ou parcial) para um pagamento no Mercado Pago.
 * Se amount for omitido, reembolso total.
 */
export async function criarReembolso(
  paymentId: string,
  amount?: number,
): Promise<CriarReembolsoResult> {
  const accessToken = getAccessToken();
  const idempotencyKey = `stackpost_refund_${paymentId}_${Date.now()}`;

  const body: Record<string, unknown> = {};
  if (amount != null) body.amount = amount;

  const res = await fetch(`${MP_API_BASE}/v1/payments/${paymentId}/refunds`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
      'X-Idempotency-Key': idempotencyKey,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(
      `Mercado Pago (refund) ${res.status}: ${txt.slice(0, 300)}`,
    );
  }

  const data = (await res.json()) as {
    id?: string;
    status?: string;
    amount?: number;
  };

  return {
    id: data.id ? String(data.id) : paymentId,
    status: data.status || 'approved',
    amount: data.amount ?? 0,
    raw: data,
  };
}

export interface ProcessarWebhookResult {
  status: string;
  plano?: string;
  team_id?: string;
  external_reference?: string;
  payment_id?: string;
  raw?: unknown;
}

/**
 * Processa um webhook do Mercado Pago.
 */
export async function processarWebhook(
  payload: any,
): Promise<ProcessarWebhookResult> {
  const accessToken = getAccessToken();

  let paymentId: string | undefined;
  let topic: string | undefined;

  if (payload?.type === "payment" && payload?.data?.id != null) {
    paymentId = String(payload.data.id);
    topic = "payment";
  } else if (payload?.type === "merchant_order") {
    return { status: "ignored", raw: payload };
  } else if (payload?.resource && typeof payload.resource === "string") {
    const match = payload.resource.match(/(\d+)$/);
    if (match) paymentId = match[1];
    topic = payload.type;
  } else if (payload?.data?.id != null) {
    paymentId = String(payload.data.id);
  } else if (payload?.id != null) {
    paymentId = String(payload.id);
  } else if (payload?.payment_id != null) {
    paymentId = String(payload.payment_id);
  }

  if (!paymentId) {
    return { status: "no_payment_id", raw: payload };
  }

  const res = await fetch(
    `${MP_API_BASE}/v1/payments/${paymentId}?access_token=${encodeURIComponent(accessToken)}`,
    {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    },
  );

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(
      `Mercado Pago (get payment) ${res.status}: ${txt.slice(0, 300)}`,
    );
  }

  const payment = (await res.json()) as {
    id?: number;
    status?: string;
    status_detail?: string;
    external_reference?: string;
    metadata?: {
      team_id?: string;
      plano?: string;
    };
    additional_info?: Record<string, unknown>;
  };

  const status = (payment.status || "unknown").toLowerCase();
  const externalReference = payment.external_reference || "";
  const meta = payment.metadata || {};

  return {
    status,
    plano: meta.plano,
    team_id: meta.team_id,
    external_reference: externalReference,
    payment_id: payment.id != null ? String(payment.id) : paymentId,
    raw: payment,
  };
}
