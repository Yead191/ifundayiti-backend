import { Model, Types } from 'mongoose';

export type IBookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'attended';
export type IBookingPaymentStatus =
  | 'pending'
  | 'paid'
  | 'free'
  | 'failed'
  | 'refunded';

export interface IBookings {
  event?: Types.ObjectId;
  service?: Types.ObjectId; // For backwards compatibility
  user?: Types.ObjectId;

  // Customer / Attendee Details
  customerName: string;
  customerEmail: string;
  customerPhone?: string;

  // Ticket & Check-in
  ticketCode?: string;
  qrCode?: string; // Base64 data URL
  checkedIn: boolean;
  checkedInAt?: Date;

  // Pricing & Payment
  quantity: number;
  price: number;
  updatedPrice?: number;
  discountType?: 'percentage' | 'fixed';
  discountAmount?: number;
  discountPercentage?: number;
  coupon?: string;

  status: IBookingStatus;
  paymentStatus: IBookingPaymentStatus;
  paymentIntentId?: string;
  stripeSessionId?: string;

  // Preferences / Notes
  preferredDate?: Date;
  preferredTime?: string;
  note?: string;

  createdAt?: string;
  updatedAt?: string;
}

export type BookingsModel = Model<IBookings>;
