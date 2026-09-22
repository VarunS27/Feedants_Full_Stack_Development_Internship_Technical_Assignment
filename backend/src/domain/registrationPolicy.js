/**
 * Pure guard rules evaluated BEFORE any write. Each returns either null (allowed)
 * or a { code, message } rejection, so services stay free of branching noise and
 * the same rules can be unit-tested without a database.
 */
const { evaluate } = require('./competitionLifecycle');

const assertCanRegister = (competition, existingRegistration, at = new Date()) => {
  if (competition.status !== 'published') {
    return { code: 'COMPETITION_NOT_AVAILABLE', message: 'This competition is not open yet.' };
  }
  if (existingRegistration && existingRegistration.status === 'registered') {
    return { code: 'ALREADY_REGISTERED', message: 'You are already registered for this competition.' };
  }

  const lifecycle = evaluate(competition, at);
  if (!lifecycle.registration.hasStarted) {
    return { code: 'REGISTRATION_NOT_OPEN', message: 'Registration has not opened yet.' };
  }
  if (lifecycle.registration.hasEnded) {
    return { code: 'REGISTRATION_CLOSED', message: 'Registration for this competition has closed.' };
  }
  if (lifecycle.capacity.isFull) {
    return { code: 'SPOTS_FULL', message: 'All spots for this competition are booked.' };
  }
  return null;
};

const assertCanSubmit = (competition, registration, at = new Date()) => {
  if (!registration || registration.status !== 'registered') {
    return { code: 'NOT_REGISTERED', message: 'Register for this competition before submitting.' };
  }
  if (registration.paymentStatus !== 'paid') {
    return {
      code: 'PAYMENT_INCOMPLETE',
      message: 'Only paid participants can submit an entry.',
    };
  }

  const lifecycle = evaluate(competition, at);
  if (!lifecycle.submission.hasStarted) {
    return { code: 'SUBMISSION_NOT_OPEN', message: 'The submission window has not opened yet.' };
  }
  if (lifecycle.submission.hasEnded) {
    return { code: 'SUBMISSION_CLOSED', message: 'The submission window has closed.' };
  }
  return null;
};

const assertCanCancel = (competition, registration, at = new Date()) => {
  if (!registration || registration.status !== 'registered') {
    return { code: 'NOT_REGISTERED', message: 'You are not registered for this competition.' };
  }
  const lifecycle = evaluate(competition, at);
  if (lifecycle.registration.hasEnded) {
    return {
      code: 'CANCELLATION_CLOSED',
      message: 'Registration can no longer be cancelled after the deadline.',
    };
  }
  return null;
};

module.exports = { assertCanRegister, assertCanSubmit, assertCanCancel };
