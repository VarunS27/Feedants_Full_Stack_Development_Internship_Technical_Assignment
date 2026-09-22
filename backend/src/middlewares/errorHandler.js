const ApiError = require('../utils/ApiError');
const env = require('../config/env');
const logger = require('../utils/logger');

const notFoundHandler = (req, _res, next) => {
  next(ApiError.notFound('ROUTE_NOT_FOUND', `Route ${req.method} ${req.originalUrl} not found.`));
};

const normalise = (error) => {
  if (error instanceof ApiError) return error;

  if (error.name === 'ValidationError') {
    const details = Object.values(error.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
    return ApiError.unprocessable('VALIDATION_ERROR', 'Invalid data.', details);
  }
  if (error.name === 'CastError') {
    return ApiError.badRequest('INVALID_IDENTIFIER', 'Malformed identifier.');
  }
  if (error.code === 11000) {
    return ApiError.conflict('DUPLICATE_RESOURCE', 'This resource already exists.');
  }
  if (error.code === 'LIMIT_FILE_SIZE') {
    return ApiError.badRequest('FILE_TOO_LARGE', 'The uploaded file is too large.');
  }
  return ApiError.internal();
};

// eslint-disable-next-line no-unused-vars -- Express identifies error middleware by arity
const errorHandler = (error, req, res, _next) => {
  const apiError = normalise(error);

  if (apiError.statusCode >= 500) {
    logger.error(`Unhandled error on ${req.method} ${req.originalUrl}`, error);
  }

  res.status(apiError.statusCode).json({
    success: false,
    error: {
      code: apiError.code,
      message: apiError.message,
      ...(apiError.details ? { details: apiError.details } : {}),
      ...(env.isProduction ? {} : { stack: error.stack }),
    },
  });
};

module.exports = { errorHandler, notFoundHandler };
