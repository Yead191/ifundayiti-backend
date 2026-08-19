import { Model, Types } from 'mongoose';

export type ICart = {
  user: Types.ObjectId
  product: Types.ObjectId
  quantity: number
  unit_price: number
  total_price: number
  cartId?: string
};

export type CartModel = Model<ICart>;
