import { createRegistrationOrder } from '../api/competitions';

/**
 * Runs the payment step for a paid registration and returns the proof the backend needs
 * to verify it.
 *
 * This is the single swap point for a real gateway: with Razorpay, `presentGatewayUI`
 * opens the checkout SDK and resolves with the signed response. Everything around it —
 * order creation, the register call, the error handling — stays the same, because the
 * backend verifies whatever proof it is handed through the same port.
 */
const presentGatewayUI = async (order) => ({
  orderId: order.orderId,
  referenceId: `pay_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`,
});

export const runCheckout = async (idOrSlug) => {
  const order = await createRegistrationOrder(idOrSlug);

  // Free entry: nothing to charge, register directly.
  if (!order.orderRequired) return undefined;

  return presentGatewayUI(order);
};
