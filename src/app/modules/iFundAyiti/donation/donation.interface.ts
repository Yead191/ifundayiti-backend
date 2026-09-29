import { Model, Types } from 'mongoose';
import {
  DONATION_PAYMENT_METHOD,
  DONATION_PAYMENT_STATUS,
  DONATION_TYPE,
} from './donation.constants';

export type IDonation = {
  name: string;
  email?: string;
  amount: number;
  payment_status: DONATION_PAYMENT_STATUS;
  payment_method: DONATION_PAYMENT_METHOD;
  transactionId?: string;
  stripeCheckoutSessionId?: string;
  type: DONATION_TYPE;
  applicant?: Types.ObjectId;
  reference?: string;
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
  recordedBy?: Types.ObjectId;
};

export type DonationModel = Model<IDonation>;
