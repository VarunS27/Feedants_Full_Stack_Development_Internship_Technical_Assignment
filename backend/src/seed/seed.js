/* eslint-disable no-console */
const crypto = require('crypto');
const { connectDatabase, disconnectDatabase } = require('../config/database');
const User = require('../models/User');
const Competition = require('../models/Competition');
const Registration = require('../models/Registration');
const { variants, classicalDance, LITERAL_DATES } = require('./competitionData');

const args = process.argv.slice(2);
const fresh = args.includes('--fresh');
const literalDates = args.includes('--literal-dates');

const DEMO_USERS = [
  { name: 'Varun Shah', email: 'demo@feedants.com', password: 'Feedants@123', registerToMain: true },
  { name: 'Ananya Rao', email: 'guest@feedants.com', password: 'Feedants@123', registerToMain: false },
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

const upsertCompetition = async (payload) => {
  const existing = await Competition.findOne({ slug: payload.slug });
  if (existing) {
    Object.assign(existing, payload);
    await existing.save();
    return existing;
  }
  return Competition.create(payload);
};

const run = async () => {
  await connectDatabase();

  if (fresh) {
    await Promise.all([
      Competition.deleteMany({}),
      Registration.deleteMany({}),
      User.deleteMany({ email: { $in: DEMO_USERS.map((u) => u.email) } }),
    ]);
    console.log('Cleared existing competitions, registrations and demo users');
  }

  const now = new Date();
  const payloads = literalDates
    ? [{ ...classicalDance(LITERAL_DATES) }]
    : variants(now);

  const competitions = [];
  for (const payload of payloads) {
    competitions.push(await upsertCompetition(payload));
  }
  console.log(`Seeded ${competitions.length} competition(s)`);

  const main = competitions[0];
  for (const demo of DEMO_USERS) {
    const user = await upsertUser(demo);

    if (!demo.registerToMain) continue;

    const already = await Registration.findOne({
      competition: main._id,
      user: user._id,
      status: 'registered',
    });
    if (already) continue;

    await Registration.create({
      competition: main._id,
      user: user._id,
      status: 'registered',
      payment: {
        status: 'paid',
        amount: main.entryFee,
        currency: main.currency,
        provider: 'mock',
        referenceId: 'pay_seeded_demo',
        paidAt: new Date(),
      },
    });

    // Keep the denormalised counter consistent with the row that was just inserted,
    // exactly as the registration service would have.
    await Competition.updateOne({ _id: main._id }, { $inc: { 'capacity.bookedSpots': 1 } });
    console.log(`Registered ${demo.email} for ${main.slug}`);
  }

  const refreshed = await Competition.findById(main._id).lean();
  console.log('\nDemo credentials');
  DEMO_USERS.forEach((u) => console.log(`  ${u.email} / ${u.password}`));
  console.log('\nMain competition');
  console.log(`  id:   ${main._id}`);
  console.log(`  slug: ${main.slug}`);
  console.log(
    `  spots: ${refreshed.capacity.bookedSpots}/${refreshed.capacity.totalSpots} booked`
  );
  console.log(`  registration closes: ${refreshed.dates.registerBefore.toISOString()}`);

  await disconnectDatabase();
};

run().catch(async (error) => {
  console.error('Seed failed:', error);
  await disconnectDatabase().catch(() => {});
  process.exit(1);
});
