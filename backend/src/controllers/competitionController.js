const competitionService = require('../services/competitionService');
const { asyncHandler, sendSuccess } = require('../utils/http');

/** Language resolution order: explicit query → saved user preference → server default. */
const resolveLanguage = (req) => req.validatedQuery?.lang || req.user?.preferredLanguage;

const list = asyncHandler(async (req, res) => {
  const { page, limit, category } = req.validatedQuery;
  const result = await competitionService.listCompetitions({
    page,
    limit,
    category,
    lang: resolveLanguage(req),
  });
  sendSuccess(res, result.items, { meta: result.meta });
});

const details = asyncHandler(async (req, res) => {
  const competition = await competitionService.getCompetitionDetails(req.params.id, {
    user: req.user || null,
    lang: resolveLanguage(req),
  });
  sendSuccess(res, competition);
});

module.exports = { list, details };
