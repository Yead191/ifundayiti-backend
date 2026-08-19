export type ICreateAccount = {
  name: string;
  email: string;
  otp: number;
};

export type IResetPassword = {
  email: string;
  otp: number;
};

export type IApplicationStatusUpdate = {
  email: string;
  name: string;
  projectName: string;
  status: string;
  rejectionReason?: string;
};

export type IDonationReceipt = {
  donorEmail: string;
  donorName: string;
  amount: number;
  transactionId?: string;
};

export type IDonationReceived = {
  adminEmail: string;
  adminName: string;
  donorName: string;
  donorEmail: string;
  amount: number;
  transactionId?: string;
};
export type IOrderItem = {
  title: string;
  quantity: number;
  unit_price: number;
  total_price: number;
};

export type IOrderConfirmation = {
  email: string;
  name: string;
  orderId: string;
  transactionId?: string;
  items: IOrderItem[];
  totalPrice: number;
  originalPrice?: number;
  productsPrice?: number;
  deliveryCharge?: number;
  serviceFee?: number;
  tax?: number;
  couponCode?: string;
  discountAmount?: number;
  formattedAddress: string;
  contactNumber?: string;
};

export type IAdminOrderNotification = {
  adminEmail: string;
  adminName: string;
  customerName: string;
  customerEmail: string;
  orderId: string;
  transactionId?: string;
  items: IOrderItem[];
  totalPrice: number;
  originalPrice?: number;
  productsPrice?: number;
  deliveryCharge?: number;
  serviceFee?: number;
  tax?: number;
  couponCode?: string;
  discountAmount?: number;
  formattedAddress: string;
};

export type IOrderStatusUpdate = {
  email: string;
  name: string;
  orderId: string;
  status: string;
  formattedAddress?: string;
  totalPrice?: number;
};

export type IMembershipSubscriptionUserConfirmation = {
  email: string;
  name: string;
  membershipName: string;
  price: number;
  recurring: string;
  isTrial: boolean;
  trialPeriodDays?: number;
  trialEndDate?: string;
  startDate?: string;
  endDate?: string;
  features?: string[];
  autoRenew?: boolean;
  transactionId?: string;
};

export type IAdminMembershipNotification = {
  adminEmail: string;
  adminName: string;
  customerName: string;
  customerEmail: string;
  membershipName: string;
  price: number;
  recurring: string;
  isTrial: boolean;
  trialPeriodDays?: number;
  trialEndDate?: string;
  startDate?: string;
  endDate?: string;
  features?: string[];
  autoRenew?: boolean;
  transactionId?: string;
};

export type ISubscriptionPaymentSuccess = {
  email: string;
  name: string;
  membershipName: string;
  amountPaid: number;
  transactionId?: string;
  nextBillingDate?: string;
};

export type ISubscriptionPaymentFailed = {
  email: string;
  name: string;
  membershipName: string;
  amountDue: number;
  reason?: string;
};

export type IVendorStatusUpdate = {
  email: string;
  name: string;
  status: string;
  rejectionReason?: string;
};

export type IServiceBookingUserConfirmation = {
  email: string;
  name: string;
  serviceTitle: string;
  price: number;
  originalPrice?: number;
  couponCode?: string;
  discountAmount?: number;
  phone?: string;
  preferredDate?: string;
  preferredTime?: string;
  note?: string;
  transactionId?: string;
};

export type IServiceBookingAdminNotification = {
  adminEmail: string;
  customerName: string;
  customerEmail: string;
  serviceTitle: string;
  price: number;
  originalPrice?: number;
  couponCode?: string;
  discountAmount?: number;
  phone?: string;
  preferredDate?: string;
  preferredTime?: string;
  note?: string;
  transactionId?: string;
};

export type IInquiryUserConfirmation = {
  name: string;
  email: string;
  projectDescription: string;
  budget: string;
  phone?: string;
  company?: string;
};

export type IInquiryAdminNotification = {
  adminEmail: string;
  name: string;
  email: string;
  projectDescription: string;
  budget: string;
  phone?: string;
  company?: string;
};

export type IWelcomeAccount = {
  name: string;
  email: string;
};

export type ISubscriptionCancelled = {
  email: string;
  name: string;
  membershipName: string;
  cancelType: 'end_of_period' | 'immediate';
  endDate?: string;
};

export type IVendorCredentials = {
  name: string;
  email: string;
  password?: string;
};

export type IVendorProfileVisibilityUpdate = {
  email: string;
  name: string;
  isProfileVisible: boolean;
};
