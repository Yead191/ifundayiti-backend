import { Model, Types } from 'mongoose';
import {
  DONATION_PAYMENT_METHOD,
  DONATION_PAYMENT_STATUS,
} from './donation.constants';

export type IDonation = {
  name: string;
  email: string;
  amount: number;
  payment_status: DONATION_PAYMENT_STATUS;
  payment_method: DONATION_PAYMENT_METHOD;
  transactionId?: string;
  stripeCheckoutSessionId?: string;
  type: 'donation' | 'grant' | string;
  applicant?: Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
  recordedBy?: Types.ObjectId;
};

export type DonationModel = Model<IDonation>;
