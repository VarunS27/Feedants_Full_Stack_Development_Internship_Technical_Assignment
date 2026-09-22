const mongoose = require('mongoose');
const competitionRepository = require('../repositories/competitionRepository');
const registrationRepository = require('../repositories/registrationRepository');
const {
  presentCompetitionDetails,
  presentCompetitionSummary,
} = require('../presenters/competitionPresenter');
const ApiError = require('../utils/ApiError');

const resolveCompetition = async (idOrSlug) => {
  const competition = mongoose.isValidObjectId(idOrSlug)
    ? await competitionRepository.findPublishedById(idOrSlug)
    : await competitionRepository.findBySlug(idOrSlug);

  if (!competition) {
    throw ApiError.notFound('COMPETITION_NOT_FOUND', 'Competition not found.');
  }
  if (competition.status === 'draft') {
    throw ApiError.notFound('COMPETITION_NOT_FOUND', 'Competition not found.');
  }
  return competition;
};

/**
 * Single read that powers the whole details screen: competition content, the
 * server-computed lifecycle, and the viewer's own registration state in one payload,
 * so the screen never stitches together multiple sources of truth.
 */
const getCompetitionDetails = async (idOrSlug, { user = null, lang } = {}) => {
  const competition = await resolveCompetition(idOrSlug);

  const registration = user
    ? await registrationRepository.findActive(competition._id, user._id)
    : null;

  return presentCompetitionDetails(competition, {
    lang,
    viewerUser: user,
    registration,
  });
};

const listCompetitions = async ({ page, limit, category, lang } = {}) => {
  const result = await competitionRepository.listPublished({ page, limit, category });
  return {
    items: result.items.map((item) => presentCompetitionSummary(item, { lang })),
    meta: {
      page: result.page,
      limit: result.limit,
      total: result.total,
      hasMore: result.hasMore,
    },
  };
};

module.exports = { getCompetitionDetails, listCompetitions, resolveCompetition };
