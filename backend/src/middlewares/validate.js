const ApiError = require('../utils/ApiError');

/**
 * Validates and REPLACES the request part with the parsed result, so handlers receive
 * coerced, stripped data and never touch raw input.
 */
const validate = (schemas) => (req, _res, next) => {
  try {
    for (const part of ['body', 'query', 'params']) {
      if (!schemas[part]) continue;
      const result = schemas[part].safeParse(req[part]);
      if (!result.success) {
        const details = result.error.issues.map((issue) => ({
          field: issue.path.join('.'),
          message: issue.message,
        }));
        throw ApiError.badRequest('VALIDATION_ERROR', 'Invalid request.', details);
      }
      if (part === 'query') {
        req.validatedQuery = result.data;
      } else {
        req[part] = result.data;
      }
    }
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = validate;
