import { Model, Types } from 'mongoose';

export interface ICart {
  user: Types.ObjectId;
  product: Types.ObjectId;
  size: string;
  color: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IAddToCart {
  product: Types.ObjectId | string;
  size: string;
  color: string;
  quantity: number;
}

export type CartModel = Model<ICart>;
