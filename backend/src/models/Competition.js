const mongoose = require('mongoose');

/**
 * Every user-visible string is stored per language so the ENG / हिंदी toggle on the
 * details screen is a data concern, not a client-side hardcoded dictionary.
 */
const localized = (opts = {}) => ({
  en: { type: String, required: opts.required !== false, trim: true },
  hi: { type: String, default: null, trim: true },
  _id: false,
});

const LocalizedString = new mongoose.Schema(localized(), { _id: false });
const OptionalLocalizedString = new mongoose.Schema(localized({ required: false }), { _id: false });

const JudgeSchema = new mongoose.Schema(
  {
    name: { type: LocalizedString, required: true },
    title: { type: LocalizedString, required: true },
    experienceYears: { type: Number, required: true, min: 0 },
    photoUrl: { type: String, default: null },
    introVideoUrl: { type: String, default: null },
  },
  { _id: false }
);

const RewardSchema = new mongoose.Schema(
  {
    position: { type: Number, required: true, min: 1 },
    amount: { type: Number, required: true, min: 0 },
    label: { type: OptionalLocalizedString, default: undefined },
  },
  { _id: false }
);

const PreviousWinnerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    position: { type: Number, required: true, min: 1 },
    thumbnailUrl: { type: String, default: null },
    videoUrl: { type: String, default: null },
    season: { type: String, default: null },
  },
  { _id: false }
);

const competitionSchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    title: { type: LocalizedString, required: true },
    // `category` is the canonical taxonomy key used for filtering and stays untranslated;
    // `tags` are display-only chips, so they carry translations like the rest of the copy.
    category: { type: String, required: true, index: true },
    tags: { type: [LocalizedString], default: [] },

    isMultiWin: { type: Boolean, default: false },
    certificateProvided: { type: Boolean, default: false },

    prizePool: { type: Number, required: true, min: 0 },
    entryFee: { type: Number, required: true, min: 0 },
    currency: { type: String, default: 'INR' },

    capacity: {
      totalSpots: { type: Number, required: true, min: 1 },
      // Denormalised counter. Mutated ONLY through a conditional atomic $inc so
      // concurrent registrations can never oversell the competition.
      bookedSpots: { type: Number, default: 0, min: 0 },
    },

    judge: { type: JudgeSchema, required: true },

    dates: {
      registrationOpensAt: { type: Date, default: null },
      registerBefore: { type: Date, required: true, index: true },
      submissionStarts: { type: Date, required: true },
      submissionEnds: { type: Date, required: true },
      resultDate: { type: Date, required: true },
    },

    content: {
      about: { type: LocalizedString, required: true },
      judgingParameters: { type: [LocalizedString], default: [] },
      rulesAndEligibility: { type: [LocalizedString], default: [] },
    },

    rewards: { type: [RewardSchema], default: [] },
    previousWinners: { type: [PreviousWinnerSchema], default: [] },

    disclaimer: { type: OptionalLocalizedString, default: undefined },

    media: {
      bannerUrl: { type: String, default: null },
      prizeMoneyVideoUrl: { type: String, default: null },
    },

    policies: {
      refundPolicyUrl: { type: String, default: null },
      paymentPartner: { type: String, default: 'Razorpay' },
    },

    referral: {
      isEnabled: { type: Boolean, default: true },
      bonusPerSignup: { type: Number, default: 0, min: 0 },
      baseUrl: { type: String, default: null },
    },

    status: {
      type: String,
      enum: ['draft', 'published', 'archived'],
      default: 'draft',
      index: true,
    },
  },
  {
    timestamps: true,
    // Lifecycle is derived from dates at read time; never denormalised into a column
    // that would drift out of date between writes.
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

competitionSchema.virtual('spotsLeft').get(function spotsLeft() {
  return Math.max(this.capacity.totalSpots - this.capacity.bookedSpots, 0);
});

// Listing feed: published competitions ordered by the deadline users care about.
competitionSchema.index({ status: 1, 'dates.registerBefore': 1 });
competitionSchema.index({ category: 1, status: 1 });

competitionSchema.pre('validate', function validateDates(next) {
  const { registerBefore, submissionStarts, submissionEnds, resultDate } = this.dates;
  if (submissionEnds <= submissionStarts) {
    return next(new Error('submissionEnds must be after submissionStarts'));
  }
  if (resultDate < submissionEnds) {
    return next(new Error('resultDate must be on or after submissionEnds'));
  }
  if (registerBefore > submissionEnds) {
    return next(new Error('registerBefore cannot be after submissionEnds'));
  }
  if (this.capacity.bookedSpots > this.capacity.totalSpots) {
    return next(new Error('bookedSpots cannot exceed totalSpots'));
  }
  return next();
});

module.exports = mongoose.model('Competition', competitionSchema);
