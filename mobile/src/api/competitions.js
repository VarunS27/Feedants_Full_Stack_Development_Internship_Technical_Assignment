import { apiClient } from './client';

const langParams = (lang) => (lang ? { lang } : undefined);

export const fetchCompetitionDetails = (idOrSlug, lang) =>
  apiClient.get(`/competitions/${idOrSlug}`, { params: langParams(lang) });

export const createRegistrationOrder = (idOrSlug) =>
  apiClient.post(`/competitions/${idOrSlug}/registration-order`);

/**
 * Writes carry the active language too: every mutation echoes back the full competition,
 * and without it the response would come back in the default locale and flip the screen.
 *
 * The idempotency key makes a retry after a lost response a no-op instead of a second
 * booking — important on mobile networks where a request can succeed while the response
 * never arrives.
 */
export const registerForCompetition = (idOrSlug, { idempotencyKey, payment, lang } = {}) =>
  apiClient.post(
    `/competitions/${idOrSlug}/register`,
    { idempotencyKey, payment },
    { params: langParams(lang) }
  );

export const submitEntry = (idOrSlug, submission, lang) =>
  apiClient.post(`/competitions/${idOrSlug}/submission`, submission, {
    params: langParams(lang),
  });

