const rateLimit = require('express-rate-limit');
const ApiError = require('../utils/ApiError');

const handler = (_req, _res, next) => next(ApiError.tooMany());

const baseOptions = {
  standardHeaders: true,
  legacyHeaders: false,
  handler,
};

const readLimiter = rateLimit({ ...baseOptions, windowMs: 60_000, limit: 120 });

/** Registration is the contended endpoint: keep one user from stampeding the seat counter. */
const registrationLimiter = rateLimit({
  ...baseOptions,
  windowMs: 60_000,
  limit: 10,
  keyGenerator: (req) => String(req.user?._id ?? req.ip),
});

const authLimiter = rateLimit({ ...baseOptions, windowMs: 15 * 60_000, limit: 20 });

module.exports = { readLimiter, registrationLimiter, authLimiter };
