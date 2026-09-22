import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as competitionsApi from '../api/competitions';
import { useLanguage } from '../providers/LanguageProvider';
import { useAuth } from '../providers/AuthProvider';

/** Language and identity are part of the key: both change what the server returns. */
export const competitionKey = (idOrSlug, lang, userId) => ['competition', idOrSlug, lang, userId];

export const useCompetition = (idOrSlug) => {
  const { language } = useLanguage();
  const { user, isRestoring } = useAuth();

  return useQuery({
    queryKey: competitionKey(idOrSlug, language, user?._id ?? 'guest'),
    queryFn: () => competitionsApi.fetchCompetitionDetails(idOrSlug, language),
    enabled: Boolean(idOrSlug) && !isRestoring,
  });
};

/**
 * Registration, submission and cancellation all return the full refreshed competition,
 * so each mutation seeds the cache directly — the screen updates in one round trip with
 * server-authoritative state rather than an optimistic guess that could disagree.
 */
const useCompetitionMutation = (idOrSlug, mutationFn) => {
  const queryClient = useQueryClient();
  const { language } = useLanguage();
  const { user } = useAuth();

  return useMutation({
    mutationFn,
    onSuccess: (competition) => {
      queryClient.setQueryData(competitionKey(idOrSlug, language, user?._id ?? 'guest'), competition);
    },
    onError: () => {
      // The failure reason may itself be stale local state (spots just filled up).
      queryClient.invalidateQueries({ queryKey: ['competition', idOrSlug] });
    },
  });
};

/** Each mutation forwards the active language so the echoed competition stays localised. */
export const useRegister = (idOrSlug) => {
  const { language } = useLanguage();
  return useCompetitionMutation(idOrSlug, (variables) =>
    competitionsApi.registerForCompetition(idOrSlug, { ...variables, lang: language })
  );
};

export const useSubmitEntry = (idOrSlug) => {
  const { language } = useLanguage();
  return useCompetitionMutation(idOrSlug, (submission) =>
    competitionsApi.submitEntry(idOrSlug, submission, language)
  );
};

