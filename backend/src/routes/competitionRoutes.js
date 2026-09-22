const express = require('express');
const competitionController = require('../controllers/competitionController');
const registrationController = require('../controllers/registrationController');
const validate = require('../middlewares/validate');
const { authenticate, optionalAuth } = require('../middlewares/auth');
const { readLimiter, registrationLimiter } = require('../middlewares/rateLimiters');
const {
  idParam,
  listQuery,
  languageQuery,
  registerSchema,
  submissionSchema,
} = require('../validators/schemas');

const router = express.Router();

router.get('/', readLimiter, optionalAuth, validate({ query: listQuery }), competitionController.list);

router.get(
  '/:id',
  readLimiter,
  optionalAuth,
  validate({ params: idParam, query: languageQuery }),
  competitionController.details
);

router.post(
  '/:id/registration-order',
  authenticate,
  registrationLimiter,
  validate({ params: idParam }),
  registrationController.createOrder
);

router.post(
  '/:id/register',
  authenticate,
  registrationLimiter,
  validate({ params: idParam, body: registerSchema, query: languageQuery }),
  registrationController.register
);

router.post(
  '/:id/submission',
  authenticate,
  validate({ params: idParam, body: submissionSchema, query: languageQuery }),
  registrationController.submit
);

router.delete(
  '/:id/register',
  authenticate,
  validate({ params: idParam, query: languageQuery }),
  registrationController.cancel
);

module.exports = router;
