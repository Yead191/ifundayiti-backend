import { Schema, model } from 'mongoose';
import { IOrder, IOrderItem, OrderModel } from './order.interface';
import {
  ORDER_STATUS,
  PAYMENT_STATUS,
  PRE_ORDER_STATUS,
} from './order.constants';
import { getRandomId } from '../../../shared/getRandomId';

const orderItemSchema = new Schema<IOrderItem>(
  {
    product: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    image: {
      type: String,
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
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    total_price: {
      type: Number,
      required: true,
      min: 0,
    },

    isPreOrder: {
      type: Boolean,
      default: false,
    },

    expectedAvailableDate: {
      type: Date,
    },

    preOrderStatus: {
      type: String,
      enum: Object.values(PRE_ORDER_STATUS),
    },
  },
  {
    _id: false,
  },
);

const orderSchema = new Schema<IOrder, OrderModel>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    items: {
      type: [orderItemSchema],
      required: true,
      validate: {
        validator: (value: IOrderItem[]) => value.length > 0,
        message: 'Order must contain at least one item',
      },
    },

    price_breakdown: {
      subtotal: {
        type: Number,
        required: true,
        min: 0,
      },

      delivery_charge: {
        type: Number,
        default: 0,
        min: 0,
      },

      tax: {
        type: Number,
        default: 0,
        min: 0,
      },

      discount_amount: {
        type: Number,
        default: 0,
        min: 0,
      },

      total_price: {
        type: Number,
        required: true,
        min: 0,
      },
    },

    total_items: {
      type: Number,
      required: true,
      min: 1,
    },

    formatted_address: {
      type: String,
      required: true,
      trim: true,
    },

    address_breakdown: {
      country: {
        type: String,
        required: true,
        trim: true,
      },

      city: {
        type: String,
        required: true,
        trim: true,
      },

      postal_code: {
        type: String,
        required: true,
        trim: true,
      },

      street_address: {
        type: String,
        required: true,
        trim: true,
      },
    },

    contact_number: {
      type: String,
      required: true,
      trim: true,
    },

    status: {
      type: String,
      enum: Object.values(ORDER_STATUS),
      default: ORDER_STATUS.PENDING,
    },

    payment_status: {
      type: String,
      enum: Object.values(PAYMENT_STATUS),
      default: PAYMENT_STATUS.PENDING,
    },

    order_id: {
      type: String,
      unique: true,
      default: () => getRandomId('ORDER', 8, 'number'),
    },

    payment_intent_id: {
      type: String,
    },

    transaction_id: {
      type: Schema.Types.ObjectId,
      ref: 'Transaction',
    },
  },
  {
    timestamps: true,
  },
);

orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ payment_status: 1 });
orderSchema.index({ status: 1 });

export const Order = model<IOrder, OrderModel>('Order', orderSchema);
