/**
 * Pure lifecycle rules for a competition. No database, no Express, no Mongoose —
 * this module is the single source of truth for "what state is this competition in"
 * and is reused by the read path, the registration path and the submission path.
 *
 * Registration and submission are modelled as two INDEPENDENT windows because they
 * legitimately overlap in the product (submissions open 6 Aug while registration is
 * still open until 10 Aug), so a single linear enum would be wrong.
 */

const STAGE = Object.freeze({
  REGISTRATION_OPEN: 'REGISTRATION_OPEN',
  REGISTRATION_CLOSED: 'REGISTRATION_CLOSED',
  JUDGING: 'JUDGING',
  RESULTS_DECLARED: 'RESULTS_DECLARED',
});

const CTA = Object.freeze({
  REGISTER: 'REGISTER',
  SPOTS_FULL: 'SPOTS_FULL',
  REGISTRATION_CLOSED: 'REGISTRATION_CLOSED',
  SUBMISSION_NOT_STARTED: 'SUBMISSION_NOT_STARTED',
  UPLOAD_SUBMISSION: 'UPLOAD_SUBMISSION',
  REPLACE_SUBMISSION: 'REPLACE_SUBMISSION',
  SUBMISSION_CLOSED: 'SUBMISSION_CLOSED',
  AWAITING_RESULTS: 'AWAITING_RESULTS',
  VIEW_RESULTS: 'VIEW_RESULTS',
  PAYMENT_PENDING: 'PAYMENT_PENDING',
});

const ms = (date) => new Date(date).getTime();

const buildWindow = (now, startsAt, endsAt) => {
  const start = startsAt ? ms(startsAt) : null;
  const end = ms(endsAt);
  const hasStarted = start === null || now >= start;
  const hasEnded = now > end;
  return {
    startsAt: startsAt ? new Date(startsAt).toISOString() : null,
    endsAt: new Date(endsAt).toISOString(),
    hasStarted,
    hasEnded,
    isOpen: hasStarted && !hasEnded,
    msUntilStart: start !== null && now < start ? start - now : 0,
    msUntilEnd: now < end ? end - now : 0,
  };
};

const resolveStage = (now, dates) => {
  if (now < ms(dates.registerBefore)) return STAGE.REGISTRATION_OPEN;
  if (now <= ms(dates.submissionEnds)) return STAGE.REGISTRATION_CLOSED;
  if (now < ms(dates.resultDate)) return STAGE.JUDGING;
  return STAGE.RESULTS_DECLARED;
};

/**
 * @param {object} competition  plain competition object (dates, capacity, status)
 * @param {Date}   [at]         evaluation instant, injectable for tests
 */
const evaluate = (competition, at = new Date()) => {
  const now = at.getTime();
  const { dates, capacity } = competition;

  const registration = buildWindow(now, dates.registrationOpensAt, dates.registerBefore);
  const submission = buildWindow(now, dates.submissionStarts, dates.submissionEnds);

  const totalSpots = capacity.totalSpots;
  const bookedSpots = Math.min(capacity.bookedSpots, totalSpots);
  const spotsLeft = Math.max(totalSpots - bookedSpots, 0);
  const isFull = spotsLeft === 0;

  const stage = resolveStage(now, dates);
  const isPublished = competition.status === 'published';

  return {
    evaluatedAt: at.toISOString(),
    stage,
    registration: {
      ...registration,
      // Capacity is part of "can someone still register", not just the clock.
      isAcceptingRegistrations: isPublished && registration.isOpen && !isFull,
    },
    submission,
    results: {
      declaredAt: new Date(dates.resultDate).toISOString(),
      isDeclared: now >= ms(dates.resultDate),
      msUntilDeclared: now < ms(dates.resultDate) ? ms(dates.resultDate) - now : 0,
    },
    capacity: {
      totalSpots,
      bookedSpots,
      spotsLeft,
      isFull,
      filledPercent: totalSpots === 0 ? 0 : Math.round((bookedSpots / totalSpots) * 100),
    },
  };
};

/**
 * Resolves the single primary action the viewer can take right now.
 * The client renders this verbatim instead of re-deriving business rules.
 *
 * @param {object} lifecycle   output of evaluate()
 * @param {object|null} viewer { isAuthenticated, registration }
 */
const resolveCta = (lifecycle, viewer = {}) => {
  const { isAuthenticated = false, registration = null } = viewer;
  const disabled = (action, reason) => ({ action, enabled: false, reason });

  if (registration && registration.status === 'registered') {
    if (registration.paymentStatus === 'pending') {
      return { action: CTA.PAYMENT_PENDING, enabled: true, reason: 'PAYMENT_INCOMPLETE' };
    }
    if (lifecycle.results.isDeclared) {
      return { action: CTA.VIEW_RESULTS, enabled: true, reason: null };
    }
    if (!lifecycle.submission.hasStarted) {
      return disabled(CTA.SUBMISSION_NOT_STARTED, 'SUBMISSION_WINDOW_NOT_OPEN');
    }
    if (lifecycle.submission.isOpen) {
      return {
        action: registration.hasSubmitted ? CTA.REPLACE_SUBMISSION : CTA.UPLOAD_SUBMISSION,
        enabled: true,
        reason: null,
      };
    }
    return disabled(CTA.AWAITING_RESULTS, 'SUBMISSION_WINDOW_CLOSED');
  }

  if (!lifecycle.registration.hasStarted) {
    return disabled(CTA.REGISTRATION_CLOSED, 'REGISTRATION_NOT_OPEN_YET');
  }
  if (lifecycle.registration.hasEnded) {
    return disabled(CTA.REGISTRATION_CLOSED, 'REGISTRATION_DEADLINE_PASSED');
  }
  if (lifecycle.capacity.isFull) {
    return disabled(CTA.SPOTS_FULL, 'NO_SPOTS_LEFT');
  }
  return { action: CTA.REGISTER, enabled: true, reason: null, requiresAuth: !isAuthenticated };
};

module.exports = { STAGE, CTA, evaluate, resolveCta };
