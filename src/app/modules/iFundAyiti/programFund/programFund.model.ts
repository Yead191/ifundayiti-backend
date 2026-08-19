import { Schema, model } from 'mongoose';
import { IProgramFund, ProgramFundModel } from './programFund.interface';

const programFundSchema = new Schema<IProgramFund, ProgramFundModel>(
  {
    type: {
      type: String,
      enum: ['Donation', 'Grant'],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },

  },
  {
    timestamps: true,
  }
);

export const ProgramFund = model<IProgramFund, ProgramFundModel>('ProgramFund', programFundSchema);
