const competitionRepository = require('../repositories/competitionRepository');
const registrationRepository = require('../repositories/registrationRepository');
const competitionService = require('./competitionService');
const paymentGateway = require('./payments/paymentGateway');
const policy = require('../domain/registrationPolicy');
const { presentCompetitionDetails } = require('../presenters/competitionPresenter');
const ApiError = require('../utils/ApiError');
const logger = require('../utils/logger');

const toApiError = (rejection, status) => new ApiError(status, rejection.code, rejection.message);

/** Maps a policy rejection to the right HTTP status without leaking branching into callers. */
const REJECTION_STATUS = {
  ALREADY_REGISTERED: 409,
  SPOTS_FULL: 409,
  REGISTRATION_CLOSED: 422,
  REGISTRATION_NOT_OPEN: 422,
  COMPETITION_NOT_AVAILABLE: 422,
  NOT_REGISTERED: 403,
  PAYMENT_INCOMPLETE: 402,
  SUBMISSION_NOT_OPEN: 422,
  SUBMISSION_CLOSED: 422,
  CANCELLATION_CLOSED: 422,
};

const reject = (rejection) => {
  throw toApiError(rejection, REJECTION_STATUS[rejection.code] || 422);
};

/**
 * Starts a paid registration by creating a gateway order. Kept separate from the
 * booking call so the client can complete payment before a spot is consumed.
 */
const createRegistrationOrder = async (idOrSlug, user) => {
  const competition = await competitionService.resolveCompetition(idOrSlug);
  const existing = await registrationRepository.findActive(competition._id, user._id);

  const rejection = policy.assertCanRegister(competition, existing);
  if (rejection) reject(rejection);

  if (competition.entryFee === 0) {
    return { orderRequired: false, amount: 0, currency: competition.currency };
  }

  const order = await paymentGateway.createOrder({
    amount: competition.entryFee,
    currency: competition.currency,
    receipt: `reg_${competition._id}_${user._id}`,
  });

  return {
    orderRequired: true,
    provider: paymentGateway.name,
    amount: competition.entryFee,
    currency: competition.currency,
    ...order,
  };
};

/**
 * Registers the user for a competition.
 *
 * Concurrency design — the two failure modes are handled by the database, not by
 * application-level checks that would race under load:
 *   1. Overselling the last spot is prevented by a conditional atomic $inc, so only
 *      one of N simultaneous requests can take the final seat.
 *   2. Double registration by one user is prevented by a unique partial index; the
 *      loser of that race gets a duplicate-key error rather than a second row.
 * If the row insert fails after the seat was taken, the seat is released again, so the
 * counter cannot drift. Policy checks up front exist only to return precise errors —
 * correctness never depends on them.
 */
const register = async (idOrSlug, user, { idempotencyKey, payment = {}, lang } = {}) => {
  const competition = await competitionService.resolveCompetition(idOrSlug);
  const competitionId = competition._id;

  if (idempotencyKey) {
    const replay = await registrationRepository.findByIdempotencyKey(competitionId, idempotencyKey);
    if (replay) {
      return buildResult(competitionId, user, { alreadyProcessed: true, lang });
    }
  }

  const existing = await registrationRepository.findActive(competitionId, user._id);
  const rejection = policy.assertCanRegister(competition, existing);
  if (rejection) reject(rejection);

  const requiresPayment = competition.entryFee > 0;
  if (requiresPayment) {
    await paymentGateway.verifyPayment({
      orderId: payment.orderId,
      referenceId: payment.referenceId,
      signature: payment.signature,
    });
  }

  // Step 1 — take the seat atomically. A null result means the database rejected it.
  const reserved = await competitionRepository.reserveSpot(competitionId);
  if (!reserved) {
    const fresh = await competitionRepository.findPublishedById(competitionId);
    reject(
      policy.assertCanRegister(fresh, null) || {
        code: 'SPOTS_FULL',
        message: 'All spots for this competition are booked.',
      }
    );
  }

  // Step 2 — persist the registration; compensate the seat if this fails.
  let created;
  try {
    created = await registrationRepository.create({
      competition: competitionId,
      user: user._id,
      status: 'registered',
      idempotencyKey: idempotencyKey || null,
      payment: {
        // Reached only after the gateway verified the payment, or for a free entry.
        status: 'paid',
        amount: competition.entryFee,
        currency: competition.currency,
        provider: paymentGateway.name,
        orderId: payment.orderId || null,
        referenceId: payment.referenceId || null,
        paidAt: new Date(),
      },
    });
  } catch (error) {
    await competitionRepository.releaseSpot(competitionId);
    throw error;
  }

  if (created.duplicate) {
    // Another concurrent request for the same user won; give the seat back.
    await competitionRepository.releaseSpot(competitionId);
    logger.warn('Duplicate registration race resolved', {
      competitionId: String(competitionId),
      userId: String(user._id),
    });
  }

  return buildResult(competitionId, user, { alreadyProcessed: created.duplicate, lang });
};

const submitEntry = async (idOrSlug, user, submission, { lang } = {}) => {
  const competition = await competitionService.resolveCompetition(idOrSlug);
  const registration = await registrationRepository.findActive(competition._id, user._id);

  const rejection = policy.assertCanSubmit(competition, {
    ...registration,
    paymentStatus: registration?.payment?.status,
  });
  if (rejection) reject(rejection);

  const saved = await registrationRepository.saveSubmission(competition._id, user._id, submission);
  if (!saved) {
    throw ApiError.conflict('SUBMISSION_FAILED', 'Registration state changed, please retry.');
  }

  return buildResult(competition._id, user, { lang });
};

const cancelRegistration = async (idOrSlug, user, { lang } = {}) => {
  const competition = await competitionService.resolveCompetition(idOrSlug);
  const registration = await registrationRepository.findActive(competition._id, user._id);

  const rejection = policy.assertCanCancel(competition, registration);
  if (rejection) reject(rejection);

  const cancelled = await registrationRepository.cancel(registration._id);
  if (!cancelled) {
    throw ApiError.conflict('CANCELLATION_FAILED', 'Registration state changed, please retry.');
  }

  // Only free the seat once the row actually moved to cancelled.
  await competitionRepository.releaseSpot(competition._id);

  return buildResult(competition._id, user, { lang });
};

/** Always answer a write with the same shape the screen reads, so the UI refreshes in one hop. */
async function buildResult(competitionId, user, { lang, ...extra } = {}) {
  const competition = await competitionRepository.findPublishedById(competitionId);
  const registration = await registrationRepository.findActive(competitionId, user._id);
  return {
    ...extra,
    competition: presentCompetitionDetails(competition, {
      // Writes echo the caller's language, exactly like reads, so a mutation response
      // can never flip the screen back to the default locale.
      lang: lang || user.preferredLanguage,
      viewerUser: user,
      registration,
    }),
  };
}

module.exports = { createRegistrationOrder, register, submitEntry, cancelRegistration };
