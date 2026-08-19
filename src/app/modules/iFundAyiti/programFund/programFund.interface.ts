import { Model, Types } from 'mongoose';

export type IProgramFund = {
  amount: number;
  type: string;
};

export type ProgramFundModel = Model<IProgramFund>;
