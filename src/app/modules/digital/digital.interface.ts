import { Model, Types } from 'mongoose';

export type IDigital = {
  product: Types.ObjectId;
  user: Types.ObjectId;
  price: number;
  paymentStatus: string;
  paymentIntentId: string;
};

export type DigitalModel = Model<IDigital>;
