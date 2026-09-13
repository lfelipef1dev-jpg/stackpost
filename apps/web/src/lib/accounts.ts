// Regra unica para o que conta como "conta social publicadora".
// Credenciais tecnicas (ex.: token de usuário Meta usado só para OAuth/refresh)
// NAO sao contas publicadoras e nao devem inflar contagens em Dashboard,
// Contas, Composer, Analytics, Billing ou onboarding.
export const NON_PUBLISHABLE_PLATFORMS = new Set(['meta_user']);

export function isPublishableAccount(account: any): boolean {
  if (!account) return false;
  return !NON_PUBLISHABLE_PLATFORMS.has(account.platform);
}

export function countPublishableAccounts(accounts: any[] | null | undefined): number {
  return (accounts || []).filter(isPublishableAccount).length;
}

export function publishableAccounts(accounts: any[] | null | undefined): any[] {
  return (accounts || []).filter(isPublishableAccount);
}

// Status efetivo de exibicao — REGRA UNICA para Dashboard, /accounts e qualquer
// outra superficie. O cron marca 'expired' quando o CHECK do token falha, o que
// pode acontecer com expires_at ainda no futuro. Nesse caso a conta precisa de
// reconexao (atencao), mas nao esta "Expirada" — expirada de verdade e so quando
// a validade nominal ja passou.
export function effectiveStatus(acc: { status?: string | null; expires_at?: string | null }): string {
  if (!acc) return 'pending';
  if (acc.status === 'expired') {
    const exp = acc.expires_at ? new Date(acc.expires_at).getTime() : 0;
    if (exp > Date.now()) return 'reconnect_required';
  }
  return acc.status || 'pending';
}

export function isActiveAccount(acc: { status?: string | null; expires_at?: string | null }): boolean {
  return effectiveStatus(acc) === 'active';
}

export function needsAttentionAccount(acc: { status?: string | null; expires_at?: string | null }): boolean {
  return ['expired', 'reconnect_required', 'needs_reconnect'].includes(effectiveStatus(acc));
}
