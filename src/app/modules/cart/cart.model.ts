import { Schema, model } from 'mongoose';
import { ICart, CartModel } from './cart.interface';

const cartSchema = new Schema<ICart, CartModel>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    product: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },

    size: {
      type: String,
      required: true,
      trim: true,
    },

    color: {
      type: String,
      required: true,
      trim: true,
    },

    quantity: {
      type: Number,
      required: true,
      min: 1,
      default: 1,
    },

    unit_price: {
      type: Number,
      required: true,
      min: 0,
    },

    total_price: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { timestamps: true },
);

// One user cannot have duplicate rows for the same product variant
cartSchema.index(
  {
    user: 1,
    product: 1,
    size: 1,
    color: 1,
  },
  {
    unique: true,
  },
);

export const Cart = model<ICart, CartModel>('Cart', cartSchema);
