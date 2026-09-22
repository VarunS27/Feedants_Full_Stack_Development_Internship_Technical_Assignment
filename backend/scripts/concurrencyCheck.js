/* eslint-disable no-console */
/**
 * Proves the two concurrency guarantees the registration flow depends on:
 *
 *   1. No overselling  — N users storm a competition with S spots simultaneously;
 *                        exactly S registrations may succeed.
 *   2. No double-booking — one user fires K simultaneous registrations;
 *                        exactly one row is created and one seat consumed.
 *
 * Run against a live API:  node scripts/concurrencyCheck.js
 */
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const env = require('../src/config/env');
const { connectDatabase, disconnectDatabase } = require('../src/config/database');
const Competition = require('../src/models/Competition');
const Registration = require('../src/models/Registration');
const User = require('../src/models/User');
const { classicalDance, relativeDates } = require('../src/seed/competitionData');

const API = process.env.API_URL || 'http://localhost:5000/api';
const TOTAL_SPOTS = 5;
const CONTENDERS = 30;
const PASSWORD = 'Feedants@123';

const post = async (path, body, token) => {
  const res = await fetch(`${API}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });
  return { status: res.status, body: await res.json() };
};

/**
 * Users are minted directly against the database rather than through /auth/signup,
 * so the auth rate limiter does not distort the measurement. Only the registration
 * endpoint is under test here.
 */
const mintUser = async (index, runId) => {
  const user = await User.create({
    name: `Load User ${index}`,
    email: `load_${runId}_${index}@feedants.test`,
    passwordHash: await User.hashPassword(PASSWORD),
    referralCode: `ld${crypto.randomBytes(4).toString('hex')}`,
  });
  return jwt.sign({ sub: String(user._id) }, env.jwt.secret, { expiresIn: '1h' });
};

const run = async () => {
  await connectDatabase();
  const runId = crypto.randomBytes(3).toString('hex');
  const slug = `load-test-${runId}`;

  const competition = await Competition.create({
    ...classicalDance(relativeDates(new Date())),
    slug,
    entryFee: 0, // keep the gateway out of the measurement
    capacity: { totalSpots: TOTAL_SPOTS, bookedSpots: 0 },
  });

  console.log(`\nCompetition ${slug}: ${TOTAL_SPOTS} spots, ${CONTENDERS} concurrent users\n`);

  const tokens = await Promise.all(
    Array.from({ length: CONTENDERS }, (_, i) => mintUser(i, runId))
  );

  // Fire every registration in the same tick — no staggering.
  const results = await Promise.all(
    tokens.map((token) => post(`/competitions/${competition._id}/register`, {}, token))
  );

  const succeeded = results.filter((r) => r.status === 201).length;
  const rejected = results.filter((r) => r.status !== 201);
  const reasons = rejected.reduce((acc, r) => {
    const code = r.body?.error?.code || `HTTP_${r.status}`;
    acc[code] = (acc[code] || 0) + 1;
    return acc;
  }, {});

  const fresh = await Competition.findById(competition._id).lean();
  const rows = await Registration.countDocuments({
    competition: competition._id,
    status: 'registered',
  });

  console.log('Test 1 — oversell protection');
  console.log(`  successful registrations : ${succeeded}  (expected ${TOTAL_SPOTS})`);
  console.log(`  registration rows in DB  : ${rows}  (expected ${TOTAL_SPOTS})`);
  console.log(`  bookedSpots counter      : ${fresh.capacity.bookedSpots}/${fresh.capacity.totalSpots}`);
  console.log(`  rejections               :`, reasons);

  const test1 =
    succeeded === TOTAL_SPOTS && rows === TOTAL_SPOTS && fresh.capacity.bookedSpots === TOTAL_SPOTS;
  console.log(`  ${test1 ? 'PASS' : 'FAIL'}\n`);

  // Test 2 — one user, many simultaneous attempts.
  const solo = await Competition.create({
    ...classicalDance(relativeDates(new Date())),
    slug: `load-solo-${runId}`,
    entryFee: 0,
    capacity: { totalSpots: 10, bookedSpots: 0 },
  });
  const soloToken = await mintUser(999, runId);
  const soloResults = await Promise.all(
    Array.from({ length: 8 }, () => post(`/competitions/${solo._id}/register`, {}, soloToken))
  );

  const soloCreated = soloResults.filter((r) => r.status === 201).length;
  const soloRows = await Registration.countDocuments({ competition: solo._id, status: 'registered' });
  const soloFresh = await Competition.findById(solo._id).lean();

  console.log('Test 2 — double-booking protection (1 user, 8 simultaneous requests)');
  console.log(`  registration rows in DB : ${soloRows}  (expected 1)`);
  console.log(`  bookedSpots counter     : ${soloFresh.capacity.bookedSpots}  (expected 1)`);
  console.log(`  HTTP 201 responses      : ${soloCreated}`);
  const test2 = soloRows === 1 && soloFresh.capacity.bookedSpots === 1;
  console.log(`  ${test2 ? 'PASS' : 'FAIL'}\n`);

  // Clean up everything this run created.
  await Promise.all([
    Competition.deleteMany({ slug: { $in: [slug, `load-solo-${runId}`] } }),
    Registration.deleteMany({ competition: { $in: [competition._id, solo._id] } }),
    User.deleteMany({ email: new RegExp(`^load_${runId}_`) }),
  ]);

  await disconnectDatabase();
  process.exit(test1 && test2 ? 0 : 1);
};

run().catch(async (error) => {
  console.error('Concurrency check failed:', error);
  await disconnectDatabase().catch(() => {});
  process.exit(1);
});
