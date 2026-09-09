type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const isProd = process.env.NODE_ENV === 'production';
const LOG_LEVEL = (process.env.LOG_LEVEL || (isProd ? 'warn' : 'info')).toLowerCase();

const LEVELS: Record<string, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
  silent: 4,
};

const currentLevel = LEVELS[LOG_LEVEL] ?? 1;

export interface LogContext {
  route?: string;
  requestId?: string;
  version?: string;
}

const SENSITIVE_KEYS = /(password|secret|token|access_token|refresh_token|id_token|client_secret|api_key|apikey|authorization|cookie|private_key|jwt)/i;

const TOKEN_PATTERNS = [
  /((?:token|access_token|refresh_token|code|client_secret|api_key|apikey|secret|password|id_token)[=:]\s*)[^\s&"'<>]+/gi,
  /(Authorization\s*[:=]\s*(?:Bearer|Basic|Token)\s+)[A-Za-z0-9_\-./+]{8,}/gi,
  /([A-Za-z0-9_\-]+\.){2}[A-Za-z0-9_\-]+/g,
  /\b[0-9a-f]{32,}\b/gi,
];

function redactString(str: string): string {
  let out = str;
  for (const pattern of TOKEN_PATTERNS) {
    out = out.replace(pattern, (match, prefix = '') => (prefix ? `${prefix}[REDACTED]` : '[REDACTED]'));
  }
  return out;
}

function redactArg(arg: unknown): unknown {
  if (arg === null || arg === undefined) return arg;
  if (typeof arg === 'string') return redactString(arg);
  if (typeof arg === 'number' || typeof arg === 'boolean') return arg;
  if (arg instanceof Error) return `[${arg.name}: ${redactString(arg.message)}]`;
  if (arg instanceof Date) return arg.toISOString();
  if (Array.isArray(arg)) {
    return arg.map(redactArg);
  }
  if (typeof arg === 'object') {
    try {
      const out: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(arg as Record<string, unknown>)) {
        if (SENSITIVE_KEYS.test(k)) {
          out[k] = '[REDACTED]';
        } else {
          out[k] = redactArg(v);
        }
      }
      return out;
    } catch {
      return '[Object]';
    }
  }
  return redactString(String(arg));
}

function redactArgs(args: unknown[]): unknown[] {
  return args.map(redactArg);
}

function buildPrefix(level: LogLevel, ctx?: LogContext): string {
  const parts: string[] = [new Date().toISOString(), `[${level.toUpperCase()}]`];
  if (ctx?.version) parts.push(`v:${ctx.version}`);
  if (ctx?.requestId) parts.push(`rid:${ctx.requestId}`);
  if (ctx?.route) parts.push(ctx.route);
  return parts.join(' ');
}

function log(level: LogLevel, ctx: LogContext | undefined, args: unknown[]) {
  if ((LEVELS[level] ?? 1) < currentLevel) return;
  const prefix = buildPrefix(level, ctx);
  const safeArgs = redactArgs(args);
  if (level === 'error') {
    console.error(prefix, ...safeArgs);
  } else if (level === 'warn') {
    console.warn(prefix, ...safeArgs);
  } else {
    console.log(prefix, ...safeArgs);
  }
}

// Logger com contexto explicito por requisicao.
// Use em API routes e middleware: const log = createLogger({ route, requestId });
export function createLogger(ctx: LogContext) {
  return {
    debug: (...args: unknown[]) => log('debug', ctx, args),
    info: (...args: unknown[]) => log('info', ctx, args),
    warn: (...args: unknown[]) => log('warn', ctx, args),
    error: (...args: unknown[]) => log('error', ctx, args),
  };
}

// Logger global sem contexto — usar apenas em modulos que nao tem request context
// (ex: cron handlers, inicializacao). Para requests, use createLogger(ctx).
export const logger = {
  debug: (...args: unknown[]) => log('debug', undefined, args),
  info: (...args: unknown[]) => log('info', undefined, args),
  warn: (...args: unknown[]) => log('warn', undefined, args),
  error: (...args: unknown[]) => log('error', undefined, args),
};
