import {
  createAccount,
  resetPassword,
  welcomeAccount,
} from '../templates/authTemplate';
import { applicationStatusUpdate } from '../templates/applicationTemplate';
import {
  donationReceipt,
  donationReceived,
} from '../templates/donationTemplate';
import {
  orderConfirmation,
  adminOrderNotification,
  orderStatusUpdate,
} from '../templates/orderTemplate';
import {
  vendorStatusUpdate,
  vendorCredentials,
  vendorProfileVisibilityUpdate,
} from '../templates/vendorTemplate';
import {
  serviceBookingUserConfirmation,
  serviceBookingAdminNotification,
} from '../templates/serviceBookingTemplate';
import {
  inquiryUserConfirmation,
  inquiryAdminNotification,
} from '../templates/inquiryTemplate';
import {
  membershipSubscriptionUserConfirmation,
  adminMembershipNotification,
  subscriptionPaymentSuccess,
  subscriptionPaymentFailed,
  subscriptionCancelled,
} from '../templates/subscriptionTemplate';

export const emailTemplate = {
  createAccount,
  resetPassword,
  welcomeAccount,
  applicationStatusUpdate,
  donationReceipt,
  donationReceived,
  orderConfirmation,
  adminOrderNotification,
  orderStatusUpdate,
  vendorStatusUpdate,
  vendorCredentials,
  vendorProfileVisibilityUpdate,
  serviceBookingUserConfirmation,
  serviceBookingAdminNotification,
  inquiryUserConfirmation,
  inquiryAdminNotification,
  membershipSubscriptionUserConfirmation,
  adminMembershipNotification,
  subscriptionPaymentSuccess,
  subscriptionPaymentFailed,
  subscriptionCancelled,
};
