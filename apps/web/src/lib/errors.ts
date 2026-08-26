export function formatError(error: any): string {
  if (typeof error === 'string') return error;
  if (error?.userFacingMessage) return error.userFacingMessage;
  if (error?.message) return error.message;
  if (error?.error?.issues?.[0]?.message) return error.error.issues[0].message;
  if (Array.isArray(error?.issues) && error.issues[0]?.message) return error.issues[0].message;
  return 'Erro desconhecido';
}

export interface NormalizedError {
  code: string;
  message: string;
  userFacingMessage: string;
  isTransient: boolean;
  platform?: string;
  retryable: boolean;
  retryAfter?: number;
}

const TRANSIENT_CODES = [
  'RATE_LIMITED',
  'TEMPORARILY_UNAVAILABLE',
  'TIMEOUT',
  'NETWORK_ERROR',
  'SERVER_ERROR',
  'TOKEN_EXPIRED',
];

const TRANSIENT_PATTERNS = [
  /temporarily/i,
  /timeout/i,
  /rate limit/i,
  /too many/i,
  /server error/i,
  /service unavailable/i,
  /internal error/i,
  /try again/i,
];

export function normalizeError(error: any, platform?: string): NormalizedError {
  const rawMessage = error?.message || String(error);
  const code = error?.code || error?.error?.code || inferCode(rawMessage);
  const isTransient = TRANSIENT_CODES.includes(code) || TRANSIENT_PATTERNS.some((p) => p.test(rawMessage));

  return {
    code,
    message: rawMessage,
    userFacingMessage: toUserFacing(code, rawMessage),
    isTransient,
    platform,
    retryable: isTransient,
    retryAfter: isTransient ? 60 : undefined,
  };
}

function inferCode(msg: string): string {
  if (/rate limit/i.test(msg) || /too many/i.test(msg)) return 'RATE_LIMITED';
  if (/token/i.test(msg) && /expired/i.test(msg)) return 'TOKEN_EXPIRED';
  if (/unauthor/i.test(msg)) return 'UNAUTHORIZED';
  if (/forbidden/i.test(msg) || /permission/i.test(msg)) return 'FORBIDDEN';
  if (/not found/i.test(msg)) return 'NOT_FOUND';
  if (/invalid/i.test(msg) && /media/i.test(msg)) return 'INVALID_MEDIA';
  if (/timeout/i.test(msg)) return 'TIMEOUT';
  if (/network/i.test(msg)) return 'NETWORK_ERROR';
  return 'UNKNOWN';
}

function toUserFacing(code: string, raw: string): string {
  const map: Record<string, string> = {
    RATE_LIMITED: 'Limite de taxa da plataforma atingido. Tentaremos novamente.',
    TOKEN_EXPIRED: 'Token de acesso expirado. Reconecte a conta social.',
    UNAUTHORIZED: 'Credenciais invalidas para esta plataforma.',
    FORBIDDEN: 'Permissao negada pela plataforma.',
    NOT_FOUND: 'Recurso nao encontrado.',
    INVALID_MEDIA: 'Arquivo de midia rejeitado pela plataforma.',
    TIMEOUT: 'Tempo limite excedido. Tentaremos novamente.',
    NETWORK_ERROR: 'Erro de rede. Tentaremos novamente.',
    SERVER_ERROR: 'Erro no servidor da plataforma. Tentaremos novamente.',
  };
  return map[code] || raw;
}
