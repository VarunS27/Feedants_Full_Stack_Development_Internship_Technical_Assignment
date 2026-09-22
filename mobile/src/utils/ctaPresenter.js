import { formatShortDate } from './format';

/**
 * Translates the server's CTA decision into presentation only. The app never decides
 * *whether* an action is allowed — it decides how to render the decision it was given,
 * so the button can't drift out of sync with what the API will actually accept.
 */
export const presentCta = (competition, t, language) => {
  const { cta, registration } = competition.viewer;
  const { action, enabled } = cta;

  const labels = t.cta;
  const label =
    typeof labels[action] === 'function' ? labels[action](competition.entryFee) : labels[action];

  const hint = (() => {
    switch (action) {
      case 'UPLOAD_SUBMISSION':
        return t.ctaHint.registered;
      case 'REPLACE_SUBMISSION':
        return t.ctaHint.submitted;
      case 'SUBMISSION_NOT_STARTED':
        return t.ctaHint.submissionOpensOn(
          formatShortDate(competition.dates.submissionStarts, language)
        );
      case 'AWAITING_RESULTS':
        return t.ctaHint.resultsOn(formatShortDate(competition.dates.resultDate, language));
      case 'SPOTS_FULL':
        return t.ctaHint.spotsFull;
      case 'REGISTRATION_CLOSED':
        return t.ctaHint.deadlinePassed;
      case 'VIEW_RESULTS':
        return registration ? t.ctaHint.registered : null;
      default:
        return null;
    }
  })();

  return {
    action,
    enabled,
    label: label ?? action,
    hint,
    /** Which handler the screen should run when pressed. */
    intent: (() => {
      if (!enabled) return 'none';
      if (action === 'REGISTER' || action === 'PAYMENT_PENDING') return 'register';
      if (action === 'UPLOAD_SUBMISSION' || action === 'REPLACE_SUBMISSION') return 'submit';
      if (action === 'VIEW_RESULTS') return 'results';
      return 'none';
    })(),
  };
};
