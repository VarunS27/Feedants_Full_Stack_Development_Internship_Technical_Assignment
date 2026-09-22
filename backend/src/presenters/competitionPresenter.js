const env = require('../config/env');
const { evaluate, resolveCta } = require('../domain/competitionLifecycle');

/** Falls back to English when a translation is missing, so the UI never renders blank. */
const text = (field, lang) => {
  if (!field) return null;
  return field[lang] || field[env.defaultLanguage] || null;
};

const textList = (list = [], lang) => list.map((item) => text(item, lang)).filter(Boolean);

const presentRegistration = (registration) => {
  if (!registration) return null;
  return {
    id: String(registration._id),
    status: registration.status,
    paymentStatus: registration.payment?.status ?? 'pending',
    registeredAt: registration.registeredAt,
    hasSubmitted: Boolean(registration.submission?.fileUrl),
    submission: registration.submission
      ? {
          fileUrl: registration.submission.fileUrl,
          fileName: registration.submission.fileName,
          caption: registration.submission.caption,
          submittedAt: registration.submission.submittedAt,
          version: registration.submission.version,
        }
      : null,
  };
};

const buildReferralLink = (competition, viewerUser) => {
  if (!competition.referral?.isEnabled) return null;
  const base = competition.referral.baseUrl || 'https://feedants.com/r';
  const code = viewerUser?.referralCode || 'feedants';
  return `${base}/${code}`;
};

/**
 * Projects a competition document into exactly what the details screen renders:
 * localized copy, server-computed lifecycle, and the viewer's own state plus the
 * single action they may take. The client performs no business logic of its own.
 */
const presentCompetitionDetails = (competition, { lang, viewerUser, registration, at } = {}) => {
  const language = env.supportedLanguages.includes(lang) ? lang : env.defaultLanguage;
  const lifecycle = evaluate(competition, at);
  const viewerRegistration = presentRegistration(registration);

  const cta = resolveCta(lifecycle, {
    isAuthenticated: Boolean(viewerUser),
    registration: viewerRegistration,
  });

  return {
    id: String(competition._id),
    slug: competition.slug,
    language,
    title: text(competition.title, language),
    category: competition.category,
    tags: textList(competition.tags, language),
    isMultiWin: competition.isMultiWin,
    certificateProvided: competition.certificateProvided,

    prizePool: competition.prizePool,
    entryFee: competition.entryFee,
    currency: competition.currency,

    judge: {
      name: text(competition.judge.name, language),
      title: text(competition.judge.title, language),
      experienceYears: competition.judge.experienceYears,
      photoUrl: competition.judge.photoUrl,
      introVideoUrl: competition.judge.introVideoUrl,
    },

    dates: {
      registrationOpensAt: competition.dates.registrationOpensAt,
      registerBefore: competition.dates.registerBefore,
      submissionStarts: competition.dates.submissionStarts,
      submissionEnds: competition.dates.submissionEnds,
      resultDate: competition.dates.resultDate,
    },

    lifecycle,

    content: {
      about: text(competition.content.about, language),
      judgingParameters: textList(competition.content.judgingParameters, language),
      rulesAndEligibility: textList(competition.content.rulesAndEligibility, language),
    },

    rewards: competition.rewards
      .slice()
      .sort((a, b) => a.position - b.position)
      .map((reward) => ({
        position: reward.position,
        amount: reward.amount,
        label: text(reward.label, language),
      })),

    previousWinners: competition.previousWinners.map((winner) => ({
      name: winner.name,
      position: winner.position,
      thumbnailUrl: winner.thumbnailUrl,
      videoUrl: winner.videoUrl,
      season: winner.season,
    })),

    disclaimer: text(competition.disclaimer, language),
    media: competition.media,
    policies: competition.policies,

    referral: {
      isEnabled: Boolean(competition.referral?.isEnabled),
      bonusPerSignup: competition.referral?.bonusPerSignup ?? 0,
      link: buildReferralLink(competition, viewerUser),
    },

    viewer: {
      isAuthenticated: Boolean(viewerUser),
      isRegistered: viewerRegistration?.status === 'registered',
      registration: viewerRegistration,
      cta,
    },
  };
};

const presentCompetitionSummary = (competition, { lang, at } = {}) => {
  const language = env.supportedLanguages.includes(lang) ? lang : env.defaultLanguage;
  const lifecycle = evaluate(competition, at);
  return {
    id: String(competition._id),
    slug: competition.slug,
    title: text(competition.title, language),
    category: competition.category,
    tags: textList(competition.tags, language),
    prizePool: competition.prizePool,
    entryFee: competition.entryFee,
    currency: competition.currency,
    bannerUrl: competition.media?.bannerUrl ?? null,
    stage: lifecycle.stage,
    capacity: lifecycle.capacity,
    registerBefore: competition.dates.registerBefore,
  };
};

module.exports = { presentCompetitionDetails, presentCompetitionSummary };
