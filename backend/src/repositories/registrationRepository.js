const Registration = require('../models/Registration');

const DUPLICATE_KEY = 11000;

const findActive = (competitionId, userId) =>
  Registration.findOne({ competition: competitionId, user: userId, status: 'registered' }).lean({
    virtuals: true,
  });

const findByIdempotencyKey = (competitionId, idempotencyKey) =>
  Registration.findOne({ competition: competitionId, idempotencyKey }).lean({ virtuals: true });

/**
 * Creates the registration row. The unique partial index on (competition, user) is the
 * authoritative duplicate guard, so a race between two identical requests surfaces here
 * as a duplicate-key error rather than as two rows.
 *
 * Two different unique indexes can fire, and they mean different things, so the cause is
 * read off the violated key pattern instead of being guessed from the error code alone.
 */
const create = async (payload) => {
  try {
    const doc = await Registration.create(payload);
    return { registration: doc.toObject({ virtuals: true }), duplicate: false };
  } catch (error) {
    if (error.code !== DUPLICATE_KEY) throw error;

    const violated = error.keyPattern || {};
    if (violated.idempotencyKey) {
      const replay = await findByIdempotencyKey(payload.competition, payload.idempotencyKey);
      return { registration: replay, duplicate: true, cause: 'IDEMPOTENT_REPLAY' };
    }

    const existing = await findActive(payload.competition, payload.user);
    return { registration: existing, duplicate: true, cause: 'ALREADY_REGISTERED' };
  }
};

/**
 * Upserts the submission for an active, paid registration. The filter re-asserts the
 * registration state so a cancelled or unpaid entry cannot slip a submission through.
 */
const saveSubmission = (competitionId, userId, submission) =>
  Registration.findOneAndUpdate(
    {
      competition: competitionId,
      user: userId,
      status: 'registered',
      'payment.status': 'paid',
    },
    [
      {
        $set: {
          submission: {
            ...submission,
            submittedAt: new Date(),
            version: { $add: [{ $ifNull: ['$submission.version', 0] }, 1] },
          },
        },
      },
    ],
    { new: true }
  ).lean({ virtuals: true });

const cancel = (registrationId) =>
  Registration.findOneAndUpdate(
    { _id: registrationId, status: 'registered' },
    { $set: { status: 'cancelled', cancelledAt: new Date() } },
    { new: true }
  ).lean({ virtuals: true });

module.exports = {
  findActive,
  findByIdempotencyKey,
  create,
  saveSubmission,
  cancel,
};
