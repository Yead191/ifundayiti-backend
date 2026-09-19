import { Schema, model } from 'mongoose';
import { IDonation, DonationModel } from './donation.interface';

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
      enum: ['paid', 'unpaid', 'failed', 'cancelled'],
      default: 'unpaid',
      required: true,
    },
    transactionId: {
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
