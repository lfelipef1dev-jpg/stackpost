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

// Contexto global legado — usado apenas pelo middleware.
// API routes e handlers devem usar createLogger(ctx) para isolamento real.
const GLOBAL = globalThis as any;
const CONTEXT_KEY = '__stackpost_log_context__';

export function setLogContext(ctx: LogContext) {
  GLOBAL[CONTEXT_KEY] = ctx;
}

export function getLogContext(): LogContext | undefined {
  return GLOBAL[CONTEXT_KEY] as LogContext | undefined;
}

export function clearLogContext() {
  GLOBAL[CONTEXT_KEY] = undefined;
}

const SENSITIVE_KEYS = /(password|secret|token|access_token|refresh_token|id_token|client_secret|api_key|apikey|authorization|cookie|private_key|jwt)/i;

const TOKEN_PATTERNS = [
  // URL query parameters and form values
  /((?:token|access_token|refresh_token|code|client_secret|api_key|apikey|secret|password|id_token)[=:]\s*)[^\s&"'<>]+/gi,
  // Authorization header
  /(Authorization\s*[:=]\s*(?:Bearer|Basic|Token)\s+)[A-Za-z0-9_\-./+]{8,}/gi,
  // JWT
  /([A-Za-z0-9_\-]+\.){2}[A-Za-z0-9_\-]+/g,
  // Long hex strings (likely API keys/secrets)
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
  const c = ctx || getLogContext();
  const parts: string[] = [new Date().toISOString(), `[${level.toUpperCase()}]`];
  if (c?.version) parts.push(`v:${c.version}`);
  if (c?.requestId) parts.push(`rid:${c.requestId}`);
  if (c?.route) parts.push(c.route);
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

// Logger global legado — usa contexto do globalThis (middleware)
export const logger = {
  debug: (...args: unknown[]) => log('debug', undefined, args),
  info: (...args: unknown[]) => log('info', undefined, args),
  warn: (...args: unknown[]) => log('warn', undefined, args),
  error: (...args: unknown[]) => log('error', undefined, args),
  setLogContext,
  getLogContext,
  clearLogContext,
};

// Cria um logger com contexto isolado por requisição.
// Use em API routes: const log = createLogger({ route: 'POST /api/posts', requestId });
export function createLogger(ctx: LogContext) {
  return {
    debug: (...args: unknown[]) => log('debug', ctx, args),
    info: (...args: unknown[]) => log('info', ctx, args),
    warn: (...args: unknown[]) => log('warn', ctx, args),
    error: (...args: unknown[]) => log('error', ctx, args),
  };
}
