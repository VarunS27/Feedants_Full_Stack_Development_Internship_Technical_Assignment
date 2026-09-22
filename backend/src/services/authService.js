const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const env = require('../config/env');
const ApiError = require('../utils/ApiError');

const issueToken = (user) =>
  jwt.sign({ sub: String(user._id) }, env.jwt.secret, { expiresIn: env.jwt.expiresIn });

const generateReferralCode = () => `fd${crypto.randomBytes(4).toString('hex')}`;

const signup = async ({ name, email, password, referredByCode }) => {
  const existing = await User.findOne({ email });
  if (existing) {
    throw ApiError.conflict('EMAIL_TAKEN', 'An account with this email already exists.');
  }

  const referrer = referredByCode ? await User.findOne({ referralCode: referredByCode }) : null;

  const user = await User.create({
    name,
    email,
    passwordHash: await User.hashPassword(password),
    referralCode: generateReferralCode(),
    referredBy: referrer?._id ?? null,
  });

  return { user: user.toJSON(), token: issueToken(user) };
};

const login = async ({ email, password }) => {
  const user = await User.findOne({ email }).select('+passwordHash');
  if (!user || !(await user.verifyPassword(password))) {
    throw ApiError.unauthorized('Invalid email or password.', 'INVALID_CREDENTIALS');
  }
  return { user: user.toJSON(), token: issueToken(user) };
};

const verifyToken = async (token) => {
  let payload;
  try {
    payload = jwt.verify(token, env.jwt.secret);
  } catch {
    throw ApiError.unauthorized('Session expired, please sign in again.', 'INVALID_TOKEN');
  }
  const user = await User.findById(payload.sub).lean();
  if (!user) {
    throw ApiError.unauthorized('Account no longer exists.', 'INVALID_TOKEN');
  }
  return user;
};

const updateLanguage = async (userId, language) => {
  const user = await User.findByIdAndUpdate(
    userId,
    { $set: { preferredLanguage: language } },
    { new: true }
  );
  return user.toJSON();
};

module.exports = { signup, login, verifyToken, updateLanguage };
