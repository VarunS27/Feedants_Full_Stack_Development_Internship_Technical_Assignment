const registrationService = require('../services/registrationService');
const { asyncHandler, sendSuccess } = require('../utils/http');

/** Language resolution order: explicit query → saved user preference → server default. */
const resolveLanguage = (req) => req.validatedQuery?.lang || req.user?.preferredLanguage;

const createOrder = asyncHandler(async (req, res) => {
  const order = await registrationService.createRegistrationOrder(req.params.id, req.user);
  sendSuccess(res, order, { status: 201 });
});

const register = asyncHandler(async (req, res) => {
  const result = await registrationService.register(req.params.id, req.user, {
    idempotencyKey: req.body.idempotencyKey || req.headers['idempotency-key'],
    payment: req.body.payment,
    lang: resolveLanguage(req),
  });
  sendSuccess(res, result.competition, { status: result.alreadyProcessed ? 200 : 201 });
});

const submit = asyncHandler(async (req, res) => {
  const result = await registrationService.submitEntry(req.params.id, req.user, req.body, {
    lang: resolveLanguage(req),
  });
  sendSuccess(res, result.competition);
});

const cancel = asyncHandler(async (req, res) => {
  const result = await registrationService.cancelRegistration(req.params.id, req.user, {
    lang: resolveLanguage(req),
  });
  sendSuccess(res, result.competition);
});

module.exports = { createOrder, register, submit, cancel };
