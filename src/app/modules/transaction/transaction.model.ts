import { Schema, model } from 'mongoose';
import { ITransaction, TransactionModel } from './transaction.interface';
import {
  TRANSACTION_CATEGORY,
  TRANSACTION_STATUS,
  TRANSACTION_TYPE,
} from '../../../enums/transaction';

const transactionSchema = new Schema<ITransaction, TransactionModel>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    total_price: {
      type: Number,
      default: 0,
    },
    payment_received: {
      type: Number,
      required: false,
      default: 0,
    },

    discount_percentage: {
      type: Number,
      required: false,
      default: 0,
    },
    discount_amount: {
      type: Number,
      required: false,
      default: 0,
    },
    order: {
      type: Schema.Types.ObjectId,
      ref: 'Order',
    },
    platform_fee: {
      type: Number,
      required: false,
      default: 0,
    },
    transaction_id: {
      type: String,
    },
    status: {
      type: String,
      enum: Object.values(TRANSACTION_STATUS),
      default: TRANSACTION_STATUS.SUCCESS,
    },
    type: {
      type: String,
      enum: Object.values(TRANSACTION_TYPE),
      required: true,
    },
    category: {
      type: String,
      enum: Object.values(TRANSACTION_CATEGORY),
      required: true,
    },
    prev_transaction_id: {
      type: String,
      required: false,
    },
  },
  { timestamps: true },
);

export const Transaction = model<ITransaction, TransactionModel>(
  'Transaction',
  transactionSchema,
);
