const LOG_LEVEL = (process.env.LOG_LEVEL || 'info').toLowerCase();

const LEVELS: Record<string, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const currentLevel = LEVELS[LOG_LEVEL] ?? 1;

function log(level: string, ...args: unknown[]) {
  if ((LEVELS[level] ?? 1) >= currentLevel) {
    const prefix = `[${level.toUpperCase()}]`;
    console.log(prefix, ...args);
  }
}

export const logger = {
  debug: (...args: unknown[]) => log('debug', ...args),
  info: (...args: unknown[]) => log('info', ...args),
  warn: (...args: unknown[]) => log('warn', ...args),
  error: (...args: unknown[]) => {
    if (currentLevel <= 3) {
      console.error('[ERROR]', ...args);
    }
  },
};
