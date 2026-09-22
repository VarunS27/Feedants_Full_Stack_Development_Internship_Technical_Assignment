const Competition = require('../models/Competition');

/**
 * Data access for competitions. Services depend on this module, never on Mongoose
 * directly, so the persistence layer can be swapped or cached without touching
 * business logic.
 */

const findPublishedById = (id) =>
  Competition.findOne({ _id: id, status: { $ne: 'archived' } }).lean({ virtuals: true });

const findBySlug = (slug) =>
  Competition.findOne({ slug, status: { $ne: 'archived' } }).lean({ virtuals: true });

const listPublished = async ({ page = 1, limit = 10, category } = {}) => {
  const filter = { status: 'published' };
  if (category) filter.category = category;

  const skip = (page - 1) * limit;
  const [items, total] = await Promise.all([
    Competition.find(filter)
      .sort({ 'dates.registerBefore': 1 })
      .skip(skip)
      .limit(limit)
      .lean({ virtuals: true }),
    Competition.countDocuments(filter),
  ]);

  return { items, total, page, limit, hasMore: skip + items.length < total };
};

/**
 * Atomically books one spot, or returns null if the competition can no longer accept it.
 *
 * Every precondition (published, registration window open, spots remaining) is part of
 * the update filter, so the check and the write happen in one atomic MongoDB operation.
 * This is what makes thousands of simultaneous registrations safe: the database, not the
 * application, decides who gets the last spot. A read-then-write would allow oversell.
 */
const reserveSpot = (competitionId, at = new Date()) =>
  Competition.findOneAndUpdate(
    {
      _id: competitionId,
      status: 'published',
      'dates.registerBefore': { $gt: at },
      $and: [
        {
          $or: [
            { 'dates.registrationOpensAt': null },
            { 'dates.registrationOpensAt': { $lte: at } },
          ],
        },
        { $expr: { $lt: ['$capacity.bookedSpots', '$capacity.totalSpots'] } },
      ],
    },
    { $inc: { 'capacity.bookedSpots': 1 } },
    { new: true }
  ).lean({ virtuals: true });

/**
 * Compensating action for a reservation that could not be completed (duplicate
 * registration, payment failure). Guarded so the counter can never go negative.
 */
const releaseSpot = (competitionId) =>
  Competition.findOneAndUpdate(
    { _id: competitionId, 'capacity.bookedSpots': { $gt: 0 } },
    { $inc: { 'capacity.bookedSpots': -1 } },
    { new: true }
  ).lean({ virtuals: true });

module.exports = {
  findPublishedById,
  findBySlug,
  listPublished,
  reserveSpot,
  releaseSpot,
};
