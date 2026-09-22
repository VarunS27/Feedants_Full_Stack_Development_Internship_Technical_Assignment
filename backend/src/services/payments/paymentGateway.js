const crypto = require('crypto');
const env = require('../../config/env');
const ApiError = require('../../utils/ApiError');

/**
 * Payment provider port. The registration service depends on this interface only,
 * so wiring real Razorpay later means adding an adapter below and flipping
 * PAYMENT_PROVIDER — no business logic changes.
 */

const mockAdapter = {
  name: 'mock',

  async createOrder({ amount, currency, receipt }) {
    return {
      orderId: `order_mock_${crypto.randomBytes(8).toString('hex')}`,
      amount,
      currency,
      receipt,
    };
  },

  /**
   * In mock mode any reference that belongs to the order is accepted. A real adapter
   * verifies the gateway signature instead, which is why verification lives behind
   * this port rather than inline in the service.
   */
  async verifyPayment({ orderId, referenceId }) {
    if (!referenceId) {
      throw ApiError.badRequest('PAYMENT_REFERENCE_REQUIRED', 'A payment reference is required.');
    }
    return { verified: true, orderId, referenceId };
  },
};

const razorpayAdapter = {
  name: 'razorpay',

  async createOrder() {
    throw ApiError.internal(
      'Razorpay adapter is not configured. Set PAYMENT_PROVIDER=mock or implement this adapter.'
    );
  },

  async verifyPayment({ orderId, referenceId, signature }) {
    if (!env.payments.keySecret) {
      throw ApiError.internal('RAZORPAY_KEY_SECRET is not configured.');
    }
    const expected = crypto
      .createHmac('sha256', env.payments.keySecret)
      .update(`${orderId}|${referenceId}`)
      .digest('hex');

    const valid =
      signature &&
      expected.length === signature.length &&
      crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));

    if (!valid) {
      throw ApiError.badRequest('PAYMENT_VERIFICATION_FAILED', 'Payment could not be verified.');
    }
    return { verified: true, orderId, referenceId };
  },
};

const adapters = { mock: mockAdapter, razorpay: razorpayAdapter };

const gateway = adapters[env.payments.provider] || mockAdapter;

module.exports = gateway;
