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
    transactionId: {
      type: String,
      trim: true,
    },
    type: {
      type: String,
      enum: ['donation', 'grant'],
      default: 'donation',
      required: true
    },
    applicant: {
      type: Schema.Types.ObjectId,
      ref: 'Application',
    },
  },
  {
    timestamps: true,
  }
);

export const Donation = model<IDonation, DonationModel>('Donation', donationSchema);
