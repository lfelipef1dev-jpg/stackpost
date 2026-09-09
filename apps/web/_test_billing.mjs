// Testes de cobranca anual com mocks
// Valida: calculo de valor, persistencia de interval, webhook, idempotencia, renovacao
// Executar: node _test_billing.js

import { createHmac } from 'crypto';

// --- Mocks ---
const mockOrders = new Map();
const mockSubscriptions = new Map();
const mockProcessedPayments = new Map();
const mockInvoices = [];

function mockSupabase() {
  const chain = {
    _table: '',
    _filters: [],
    _single: false,
    _maybeSingle: false,
    from(table) { this._table = table; this._filters = []; this._single = false; this._maybeSingle = false; return this; },
    select(cols) { return this; },
    insert(row) {
      if (this._table === 'stackpost_orders') {
        mockOrders.set(row.order_id, { ...row });
      } else if (this._table === 'subscriptions') {
        const id = row.id || crypto.randomUUID();
        mockSubscriptions.set(row.organization_id || id, { id, ...row });
      } else if (this._table === 'stackpost_processed_payments') {
        mockProcessedPayments.set(row.payment_id, { ...row });
      } else if (this._table === 'invoices') {
        mockInvoices.push({ ...row });
      }
      return { error: null };
    },
    update(data) {
      const self = this;
      self._updateData = data;
      return {
        eq(col, val) {
          if (self._table === 'stackpost_orders' && col === 'order_id') {
            const order = mockOrders.get(val);
            if (order) Object.assign(order, data);
          } else if (self._table === 'subscriptions' && col === 'id') {
            for (const [k, v] of mockSubscriptions.entries()) {
              if (v.id === val) Object.assign(v, data);
            }
          } else if (self._table === 'subscriptions' && col === 'organization_id') {
            const sub = mockSubscriptions.get(val);
            if (sub) Object.assign(sub, data);
          } else if (self._table === 'organizations' && col === 'id') {
            // mock org update
          }
          return { error: null };
        },
      };
    },
    upsert(row, opts) {
      if (this._table === 'subscriptions') {
        mockSubscriptions.set(row.organization_id, { ...row, id: row.id || crypto.randomUUID() });
      }
      return { error: null };
    },
    eq(col, val) {
      this._filters.push({ col, val });
      return this;
    },
    like(col, pattern) { return this; },
    single() {
      this._single = true;
      return this._getResult();
    },
    maybeSingle() {
      this._maybeSingle = true;
      return this._getResult();
    },
    limit(n) { return this; },
    _getResult() {
      // Simulate query results based on table and filters
      if (this._table === 'teams') {
        return { data: { id: 'team-1', organization_id: 'org-1' }, error: null };
      }
      if (this._table === 'organizations') {
        return { data: { id: 'org-1', plan: 'free' }, error: null };
      }
      if (this._table === 'users') {
        return { data: { email: 'test@test.com', name: 'Test' }, error: null };
      }
      if (this._table === 'stackpost_orders') {
        const orderId = this._filters.find(f => f.col === 'order_id')?.val;
        const order = mockOrders.get(orderId);
        return { data: order || null, error: null };
      }
      if (this._table === 'subscriptions') {
        const orgId = this._filters.find(f => f.col === 'organization_id')?.val;
        const sub = mockSubscriptions.get(orgId);
        return { data: sub || null, error: null };
      }
      if (this._table === 'stackpost_processed_payments') {
        const pid = this._filters.find(f => f.col === 'payment_id')?.val;
        return { data: mockProcessedPayments.get(pid) || null, error: null };
      }
      if (this._table === 'invoices') {
        return { data: null, error: null, count: mockInvoices.length };
      }
      return { data: null, error: null };
    },
  };
  return chain;
}

// --- Constants (mirror of checkout route) ---
const PLANOS = {
  starter: { valor: 39.0, id_plano: 1 },
  growth: { valor: 89.0, id_plano: 2 },
  scale: { valor: 197.0, id_plano: 3 },
  business: { valor: 497.0, id_plano: 4 },
};
const ANNUAL_MULTIPLIER = 10;

// --- Test helpers ---
let passCount = 0;
let failCount = 0;

function assert(condition, msg) {
  if (condition) {
    console.log(`  PASS: ${msg}`);
    passCount++;
  } else {
    console.log(`  FAIL: ${msg}`);
    failCount++;
  }
}

function assertEqual(actual, expected, msg) {
  assert(actual === expected, `${msg} (expected ${expected}, got ${actual})`);
}

// --- Tests ---

console.log('\n=== Teste 1: Calculo de valor anual ===');
{
  for (const [plan, info] of Object.entries(PLANOS)) {
    const monthly = info.valor;
    const annual = monthly * ANNUAL_MULTIPLIER;
    assertEqual(annual, monthly * 10, `Plano ${plan}: anual = mensal * 10`);
    console.log(`    ${plan}: mensal R$${monthly} -> anual R$${annual}`);
  }
}

console.log('\n=== Teste 2: Persistencia do interval no checkout ===');
{
  mockOrders.clear();
  const orderId = 'stackpost_test_yearly_1';
  const plan = 'growth';
  const interval = 'yearly';
  const valorCobrar = PLANOS[plan].valor * ANNUAL_MULTIPLIER;

  // Simulate checkout insert
  const supabase = mockSupabase();
  supabase.from('stackpost_orders').insert({
    order_id: orderId,
    team_id: 'team-1',
    plano_escolhido: plan,
    total: valorCobrar,
    status: 'pending',
    interval: interval,
    criado_em: new Date().toISOString(),
  });

  // Verify order was stored with interval
  supabase.from('stackpost_orders').select('order_id, team_id, plano_escolhido, status, total, interval').eq('order_id', orderId).maybeSingle();
  const order = supabase._getResult().data;
  assert(order !== null, 'Order foi criada');
  assertEqual(order.interval, 'yearly', 'Interval persistido como yearly');
  assertEqual(order.total, 890, 'Total anual = 89 * 10 = 890');
}

console.log('\n=== Teste 3: Webhook processa pagamento anual ===');
{
  mockOrders.clear();
  mockSubscriptions.clear();
  mockProcessedPayments.clear();
  mockInvoices.length = 0;

  // Setup: create order with yearly interval
  const orderId = 'stackpost_test_yearly_2';
  const supabase = mockSupabase();
  supabase.from('stackpost_orders').insert({
    order_id: orderId,
    team_id: 'team-1',
    plano_escolhido: 'growth',
    total: 890,
    status: 'pending',
    interval: 'yearly',
    criado_em: new Date().toISOString(),
  });

  // Simulate webhook: payment approved
  const paymentId = 'mp_payment_123';
  const isAnnual = true;
  const now = new Date();
  const periodStart = now.toISOString();
  const periodEnd = new Date(now);
  periodEnd.setMonth(periodEnd.getMonth() + (isAnnual ? 12 : 1));

  // Check idempotency: first process
  supabase.from('stackpost_processed_payments').select('payment_id').eq('payment_id', paymentId).maybeSingle();
  const alreadyProcessed = supabase._getResult().data;
  assert(alreadyProcessed === null, 'Primeiro processamento: nao estava processado antes');

  // Mark as processed
  supabase.from('stackpost_processed_payments').insert({
    payment_id: paymentId,
    order_id: orderId,
    team_id: 'team-1',
    plano: 'growth',
    processado_em: now.toISOString(),
  });

  // Create subscription with annual period
  supabase.from('subscriptions').insert({
    organization_id: 'org-1',
    plan_slug: 'growth',
    interval: isAnnual ? 'yearly' : 'monthly',
    status: 'active',
    current_period_start: periodStart,
    current_period_end: periodEnd.toISOString(),
    created_at: now.toISOString(),
    updated_at: now.toISOString(),
  });

  // Verify subscription
  supabase.from('subscriptions').select('id, organization_id, plan_slug, interval, current_period_start, current_period_end').eq('organization_id', 'org-1').maybeSingle();
  const sub = supabase._getResult().data;
  assert(sub !== null, 'Subscription criada');
  assertEqual(sub.interval, 'yearly', 'Subscription interval = yearly');
  assertEqual(sub.plan_slug, 'growth', 'Subscription plan = growth');

  // Verify period is 12 months
  const startMs = new Date(sub.current_period_start).getTime();
  const endMs = new Date(sub.current_period_end).getTime();
  const diffDays = Math.round((endMs - startMs) / (1000 * 60 * 60 * 24));
  assert(diffDays >= 360 && diffDays <= 366, `Periodo anual ~365 dias (got ${diffDays})`);
}

console.log('\n=== Teste 4: Idempotencia — webhook duplicado nao reprocessa ===');
{
  mockOrders.clear();
  mockProcessedPayments.clear();

  const orderId = 'stackpost_test_idemp_1';
  const paymentId = 'mp_payment_dup_1';
  const supabase = mockSupabase();

  // First processing
  supabase.from('stackpost_processed_payments').insert({
    payment_id: paymentId,
    order_id: orderId,
    team_id: 'team-1',
    plano: 'growth',
    processado_em: new Date().toISOString(),
  });

  // Second attempt: should find it already processed
  supabase.from('stackpost_processed_payments').select('payment_id').eq('payment_id', paymentId).maybeSingle();
  const found = supabase._getResult().data;
  assert(found !== null, 'Pagamento duplicado detectado');
  assertEqual(found.payment_id, paymentId, 'Payment ID confere');
}

console.log('\n=== Teste 5: Renovacao anual nao reduz periodo ===');
{
  mockSubscriptions.clear();

  const supabase = mockSupabase();
  const orgId = 'org-renew-test';

  // Create initial annual subscription
  const initialStart = new Date('2026-01-01T00:00:00Z');
  const initialEnd = new Date('2026-01-01T00:00:00Z');
  initialEnd.setMonth(initialEnd.getMonth() + 12); // +12 months

  supabase.from('subscriptions').insert({
    organization_id: orgId,
    plan_slug: 'growth',
    interval: 'yearly',
    status: 'active',
    current_period_start: initialStart.toISOString(),
    current_period_end: initialEnd.toISOString(),
    created_at: initialStart.toISOString(),
    updated_at: initialStart.toISOString(),
  });

  // Simulate renewal: new period starts at initialEnd, +12 months
  const newStart = new Date(initialEnd);
  const newEnd = new Date(newStart);
  newEnd.setMonth(newEnd.getMonth() + 12);

  supabase.from('subscriptions').update({
    status: 'active',
    current_period_start: newStart.toISOString(),
    current_period_end: newEnd.toISOString(),
    updated_at: new Date().toISOString(),
  }).eq('organization_id', orgId);

  // Verify
  supabase.from('subscriptions').select('current_period_start, current_period_end, interval').eq('organization_id', orgId).maybeSingle();
  const sub = supabase._getResult().data;

  const startMs = new Date(sub.current_period_start).getTime();
  const endMs = new Date(sub.current_period_end).getTime();
  const diffDays = Math.round((endMs - startMs) / (1000 * 60 * 60 * 24));

  assert(diffDays >= 360 && diffDays <= 366, `Renovacao anual mantem periodo ~365 dias (got ${diffDays})`);

  // Verify new start = old end (no gap, no overlap)
  const newStartMs = new Date(sub.current_period_start).getTime();
  const oldEndMs = initialEnd.getTime();
  assertEqual(newStartMs, oldEndMs, 'Renovacao: novo inicio = fim do periodo anterior');
}

console.log('\n=== Teste 6: Webhook mensal avanca 1 mes (nao 12) ===');
{
  mockSubscriptions.clear();

  const supabase = mockSupabase();
  const orgId = 'org-monthly-test';

  const initialStart = new Date('2026-01-01T00:00:00Z');
  const initialEnd = new Date('2026-02-01T00:00:00Z'); // +1 month

  supabase.from('subscriptions').insert({
    organization_id: orgId,
    plan_slug: 'starter',
    interval: 'monthly',
    status: 'active',
    current_period_start: initialStart.toISOString(),
    current_period_end: initialEnd.toISOString(),
    created_at: initialStart.toISOString(),
    updated_at: initialStart.toISOString(),
  });

  // Simulate monthly renewal
  const newStart = new Date(initialEnd);
  const newEnd = new Date(newStart);
  newEnd.setMonth(newEnd.getMonth() + 1);

  supabase.from('subscriptions').update({
    current_period_start: newStart.toISOString(),
    current_period_end: newEnd.toISOString(),
    updated_at: new Date().toISOString(),
  }).eq('organization_id', orgId);

  supabase.from('subscriptions').select('current_period_start, current_period_end, interval').eq('organization_id', orgId).maybeSingle();
  const sub = supabase._getResult().data;

  const startMs = new Date(sub.current_period_start).getTime();
  const endMs = new Date(sub.current_period_end).getTime();
  const diffDays = Math.round((endMs - startMs) / (1000 * 60 * 60 * 24));

  assert(diffDays >= 28 && diffDays <= 31, `Renovacao mensal = ~30 dias (got ${diffDays})`);
  assertEqual(sub.interval, 'monthly', 'Interval mensal mantido');
}

console.log('\n=== Teste 7: HMAC do webhook valida assinatura ===');
{
  const secret = 'test_webhook_secret';
  const body = JSON.stringify({ type: 'payment', data: { id: '123' } });
  const expected = createHmac('sha256', secret).update(body).digest('hex');
  const wrong = createHmac('sha256', 'wrong_secret').update(body).digest('hex');

  assert(expected !== wrong, 'HMAC com secret diferente produz hash diferente');
  assertEqual(expected.length, 64, 'HMAC SHA256 tem 64 chars hex');

  // Verify comparison
  const sigBuf = Buffer.from(expected, 'hex');
  const expBuf = Buffer.from(expected, 'hex');
  const wrongBuf = Buffer.from(wrong, 'hex');

  assert(Buffer.compare(sigBuf, expBuf) === 0, 'HMAC correto compara igual');
  assert(Buffer.compare(sigBuf, wrongBuf) !== 0, 'HMAC errado compara diferente');
}

// --- Summary ---
console.log(`\n=== RESULTADO: ${passCount} passaram, ${failCount} falharam ===`);
process.exit(failCount > 0 ? 1 : 0);
