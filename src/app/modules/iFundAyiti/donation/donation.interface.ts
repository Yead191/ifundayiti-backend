import { Model, Types } from 'mongoose';

export type IDonation = {
  name: string;
  email: string;
  amount: number;
  transactionId?: string;
  type: string;
  applicant?: Types.ObjectId;
};

export type DonationModel = Model<IDonation>;
