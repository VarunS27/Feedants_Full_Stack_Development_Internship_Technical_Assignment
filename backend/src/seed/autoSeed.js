const crypto = require('crypto');
const Competition = require('../models/Competition');
const Registration = require('../models/Registration');
const User = require('../models/User');
const logger = require('../utils/logger');
const { variants } = require('./competitionData');

const DEMO_USERS = [
  { name: 'Varun Shah', email: 'demo@feedants.com', password: 'Feedants@123' },
  { name: 'Ananya Rao', email: 'guest@feedants.com', password: 'Feedants@123' },
];

const upsertUser = async ({ name, email, password }) => {
  const existing = await User.findOne({ email });
  if (existing) return existing;
  return User.create({
    name,
    email,
    passwordHash: await User.hashPassword(password),
    referralCode: `fd${crypto.randomBytes(4).toString('hex')}`,
  });
};

/**
 * On every server start: refresh all competition dates relative to now, clear
 * all registrations for the main competition, and reset the spot counter to 0.
 * This gives the assessor a clean slate where they can register and see the
 * counter decrement from 20 → 19 every time.
 */
const autoSeed = async () => {
  try {
    const now = new Date();
    const payloads = variants(now);

    const competitions = [];
    for (const payload of payloads) {
      const existing = await Competition.findOne({ slug: payload.slug });
      if (existing) {
        await Competition.updateOne(
          { _id: existing._id },
          { $set: { dates: payload.dates, 'capacity.bookedSpots': 0 } }
        );
        competitions.push(existing);
      } else {
        competitions.push(await Competition.create(payload));
      }
    }

    // Ensure demo users exist (no registrations created — assessor starts fresh).
    for (const demo of DEMO_USERS) {
      await upsertUser(demo);
    }

    // Clear all registrations for the main competition so the spot counter matches.
    const main = competitions[0];
    await Registration.deleteMany({ competition: main._id });

    const refreshed = await Competition.findById(main._id).lean();
    logger.info(
      `Auto-seed complete: ${competitions.length} competitions, ` +
      `${refreshed.capacity.bookedSpots}/${refreshed.capacity.totalSpots} spots, ` +
      `registration closes ${refreshed.dates.registerBefore.toISOString()}`
    );
  } catch (err) {
    logger.error('Auto-seed failed', err);
  }
};

module.exports = autoSeed;
