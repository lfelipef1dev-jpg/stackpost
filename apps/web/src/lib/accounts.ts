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
