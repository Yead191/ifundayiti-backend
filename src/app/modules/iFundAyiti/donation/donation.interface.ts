import { Model, Types } from 'mongoose';

export type IDonation = {
  name: string;
  email: string;
  amount: number;
  transactionId?: string;
  type: 'donation' | 'grant' | string;
  applicant?: Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
};

export type DonationModel = Model<IDonation>;
