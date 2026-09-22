require('dotenv').config();

const required = (key, fallback) => {
  const value = process.env[key] ?? fallback;
  if (value === undefined) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
};

const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT || 5000),
  mongoUri: required('MONGO_URI', 'mongodb://127.0.0.1:27017/feedants'),
  jwt: {
    secret: required('JWT_SECRET', 'feedants-dev-secret-change-me'),
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
  cors: {
    origins: (process.env.CORS_ORIGINS || '*').split(',').map((o) => o.trim()),
  },
  cache: {
    driver: process.env.CACHE_DRIVER || 'memory',
    competitionTtlMs: Number(process.env.COMPETITION_CACHE_TTL_MS || 15000),
  },
  payments: {
    // Swap to a real Razorpay adapter by setting PAYMENT_PROVIDER=razorpay
    provider: process.env.PAYMENT_PROVIDER || 'mock',
    keyId: process.env.RAZORPAY_KEY_ID || '',
    keySecret: process.env.RAZORPAY_KEY_SECRET || '',
  },
  defaultLanguage: process.env.DEFAULT_LANGUAGE || 'en',
  supportedLanguages: (process.env.SUPPORTED_LANGUAGES || 'en,hi')
    .split(',')
    .map((l) => l.trim()),
};

env.isProduction = env.nodeEnv === 'production';

if (env.isProduction && env.jwt.secret === 'feedants-dev-secret-change-me') {
  throw new Error('JWT_SECRET must be set to a strong value in production');
}

module.exports = env;
