const authService = require('../services/authService');
const ApiError = require('../utils/ApiError');
const { asyncHandler } = require('../utils/http');

const extractToken = (req) => {
  const header = req.headers.authorization || '';
  return header.startsWith('Bearer ') ? header.slice(7).trim() : null;
};

/** Hard gate for write endpoints. */
const authenticate = asyncHandler(async (req, _res, next) => {
  const token = extractToken(req);
  if (!token) throw ApiError.unauthorized();
  req.user = await authService.verifyToken(token);
  next();
});

/**
 * Read endpoints work signed-out (a guest still sees the competition) but return the
 * viewer's registration state when a valid token is present.
 */
const optionalAuth = asyncHandler(async (req, _res, next) => {
  const token = extractToken(req);
  if (token) {
    try {
      req.user = await authService.verifyToken(token);
    } catch {
      req.user = null;
    }
  }
  next();
});

module.exports = { authenticate, optionalAuth };
