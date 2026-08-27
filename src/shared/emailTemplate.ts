import {
  createAccount,
  resetPassword,
  welcomeAccount,
} from '../templates/authTemplate';
import { applicationStatusUpdate, applicationSubmissionConfirmation } from '../templates/applicationTemplate';
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

import {
  teamMemberCreated,
  teamStatusUpdate,
  volunteerApplicationAdminNotification,
} from '../templates/teamTemplate';

export const emailTemplate = {
  createAccount,
  resetPassword,
  welcomeAccount,
  applicationStatusUpdate,
  applicationSubmissionConfirmation,
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
  teamMemberCreated,
  teamStatusUpdate,
  volunteerApplicationAdminNotification,
};
