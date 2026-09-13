// Testes da regra unica de contas — rodar com:
//   node --test tests/accounts.test.ts
// (Node >= 22 faz strip de tipos; o modulo importado e TS puro sem deps)
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  publishableAccounts,
  effectiveStatus,
  isActiveAccount,
  needsAttentionAccount,
} from '../src/lib/accounts.ts';

const future = new Date(Date.now() + 44 * 86400_000).toISOString();
const past = new Date(Date.now() - 86400_000).toISOString();

test('publishableAccounts exclui credenciais tecnicas (meta_user)', () => {
  const rows = [
    { id: '1', platform: 'instagram', status: 'active' },
    { id: '2', platform: 'meta_user', status: 'active' },
    { id: '3', platform: 'linkedin', status: 'expired' },
  ];
  const pub = publishableAccounts(rows);
  assert.equal(pub.length, 2);
  assert.ok(pub.every((a) => a.platform !== 'meta_user'));
});

test('invariante: total do card === itens da lista (mesma colecao)', () => {
  // O Dashboard deve derivar card, subcontador e lista do MESMO array
  // publishableAccounts — nunca de allAccounts nem de fetch parcial.
  const rows = [
    { id: '1', platform: 'discord', status: 'needs_reconnect' },
    { id: '2', platform: 'facebook', status: 'active' },
    { id: '3', platform: 'meta_user', status: 'active' },
    { id: '4', platform: 'linkedin', status: 'expired', expires_at: future },
    { id: '5', platform: 'instagram', status: 'expired', expires_at: future },
  ];
  const visible = publishableAccounts(rows);
  assert.equal(visible.length, 4);
  assert.equal(visible.filter(isActiveAccount).length, 1);
  assert.equal(visible.filter(needsAttentionAccount).length, 3);
});

test('expired com expires_at futuro vira reconnect_required, nao expired', () => {
  const acc = { status: 'expired', expires_at: future };
  assert.equal(effectiveStatus(acc), 'reconnect_required');
  assert.ok(needsAttentionAccount(acc));
  assert.ok(!isActiveAccount(acc));
});

test('expired com expires_at passado permanece expired', () => {
  const acc = { status: 'expired', expires_at: past };
  assert.equal(effectiveStatus(acc), 'expired');
  assert.ok(needsAttentionAccount(acc));
});

test('expired sem expires_at permanece expired', () => {
  assert.equal(effectiveStatus({ status: 'expired', expires_at: null }), 'expired');
});

test('status preservado quando nao e expired', () => {
  assert.equal(effectiveStatus({ status: 'active', expires_at: past }), 'active');
  assert.equal(effectiveStatus({ status: 'pending' }), 'pending');
  assert.equal(effectiveStatus({ status: null }), 'pending');
});
