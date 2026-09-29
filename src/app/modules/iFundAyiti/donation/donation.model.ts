import { Schema, model } from 'mongoose';
import { IDonation, DonationModel } from './donation.interface';
import {
  DONATION_PAYMENT_METHOD,
  DONATION_PAYMENT_STATUS,
} from './donation.constants';

const donationSchema = new Schema<IDonation, DonationModel>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 1,
    },
    payment_status: {
      type: String,
      enum: Object.values(DONATION_PAYMENT_STATUS),
      default: DONATION_PAYMENT_STATUS.UNPAID,
      required: true,
    },
    payment_method: {
      type: String,
      enum: Object.values(DONATION_PAYMENT_METHOD),
      default: DONATION_PAYMENT_METHOD.OTHER,
      required: true,
    },
    transactionId: {
      type: String,
      trim: true,
    },
    stripeCheckoutSessionId: {
      type: String,
      trim: true,
    },
    type: {
      type: String,
      enum: ['donation', 'grant'],
      default: 'donation',
      required: true,
    },
    applicant: {
      type: Schema.Types.ObjectId,
      ref: 'Application',
    },
    recordedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: false,
    },
  },
  {
    timestamps: true,
  },
);

donationSchema.index({ createdAt: -1 });
donationSchema.index({ type: 1 });
donationSchema.index({ email: 1 });
donationSchema.index({ transactionId: 1 });

export const Donation = model<IDonation, DonationModel>(
  'Donation',
  donationSchema,
);
