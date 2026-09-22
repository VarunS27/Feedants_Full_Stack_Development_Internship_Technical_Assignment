const mongoose = require('mongoose');

const SubmissionSchema = new mongoose.Schema(
  {
    fileUrl: { type: String, required: true },
    fileName: { type: String, default: null },
    mimeType: { type: String, default: null },
    sizeBytes: { type: Number, default: null },
    caption: { type: String, default: null, maxlength: 300 },
    submittedAt: { type: Date, default: Date.now },
    version: { type: Number, default: 1, min: 1 },
  },
  { _id: false }
);

const registrationSchema = new mongoose.Schema(
  {
    competition: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Competition',
      required: true,
      index: true,
    },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },

    status: {
      type: String,
      enum: ['registered', 'cancelled'],
      default: 'registered',
    },

    payment: {
      status: { type: String, enum: ['pending', 'paid', 'refunded', 'failed'], default: 'pending' },
      amount: { type: Number, required: true, min: 0 },
      currency: { type: String, default: 'INR' },
      provider: { type: String, default: 'mock' },
      orderId: { type: String, default: null },
      referenceId: { type: String, default: null },
      paidAt: { type: Date, default: null },
    },

    // Client-supplied key that makes a retried registration request a no-op instead
    // of a second booking when a response is lost mid-flight.
    idempotencyKey: { type: String, default: null },

    submission: { type: SubmissionSchema, default: null },

    registeredAt: { type: Date, default: Date.now },
    cancelledAt: { type: Date, default: null },
  },
  { timestamps: true }
);

/**
 * The hard guarantee against double-booking: one active row per (competition, user).
 * Partial index so a cancelled registration does not block re-registering later.
 */
registrationSchema.index(
  { competition: 1, user: 1 },
  { unique: true, partialFilterExpression: { status: 'registered' } }
);

/**
 * Partial (not sparse): in a compound sparse index a row is still indexed when only
 * `competition` is present, so every row with a null key would collide with every
 * other. Restricting to actual string keys scopes the constraint to real replays.
 */
registrationSchema.index(
  { competition: 1, idempotencyKey: 1 },
  { unique: true, partialFilterExpression: { idempotencyKey: { $type: 'string' } } }
);

// Admin/judging feed: paid entries for a competition, newest submission first.
registrationSchema.index({ competition: 1, 'payment.status': 1, 'submission.submittedAt': -1 });

registrationSchema.virtual('hasSubmitted').get(function hasSubmitted() {
  return Boolean(this.submission && this.submission.fileUrl);
});

registrationSchema.set('toJSON', { virtuals: true });
registrationSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Registration', registrationSchema);
