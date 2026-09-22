const env = require('../config/env');

const LEVELS = { error: 0, warn: 1, info: 2, debug: 3 };
const threshold = LEVELS[process.env.LOG_LEVEL] ?? (env.isProduction ? LEVELS.info : LEVELS.debug);

const emit = (level, message, meta) => {
  if (LEVELS[level] > threshold) return;
  const entry = { level, time: new Date().toISOString(), message };
  if (meta instanceof Error) {
    entry.error = { name: meta.name, message: meta.message, stack: meta.stack };
  } else if (meta !== undefined) {
    entry.meta = meta;
  }
  const line = env.isProduction ? JSON.stringify(entry) : `[${level}] ${message}`;
  (level === 'error' ? console.error : console.log)(line, env.isProduction ? '' : meta ?? '');
};

module.exports = {
  error: (m, meta) => emit('error', m, meta),
  warn: (m, meta) => emit('warn', m, meta),
  info: (m, meta) => emit('info', m, meta),
  debug: (m, meta) => emit('debug', m, meta),
};
