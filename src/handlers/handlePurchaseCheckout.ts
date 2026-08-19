import Stripe from 'stripe';
import { handleMembershipCheckout } from './handleMembershipCheckout';

export const handlePurchaseCheckout = async (data: Stripe.Subscription) => {
  await handleMembershipCheckout(data);
};
