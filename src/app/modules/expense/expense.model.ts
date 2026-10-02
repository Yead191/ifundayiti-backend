import { Schema, model } from 'mongoose';
import { IExpense, ExpenseModel } from './expense.interface';
import {
  EXPENSE_CATEGORY,
  EXPENSE_PAYMENT_METHOD,
  EXPENSE_PAYMENT_STATUS,
  EXPENSE_SUBCATEGORY,
} from './expense.constants';

const expenseSchema = new Schema<IExpense, ExpenseModel>(
  {
    title: { type: String, required: true },

    amount: {
      type: Number,
      required: true,
      min: 0.01,
    },
    category: {
      type: String,
      enum: Object.values(EXPENSE_CATEGORY),
      required: true,
    },
    subcategory: {
      type: String,
      enum: Object.values(EXPENSE_SUBCATEGORY),
      required: true,
    },
    payment_status: {
      type: String,
      enum: Object.values(EXPENSE_PAYMENT_STATUS),
      default: EXPENSE_PAYMENT_STATUS.PAID,
      required: true,
    },
    payment_method: {
      type: String,
      enum: Object.values(EXPENSE_PAYMENT_METHOD),
      default: EXPENSE_PAYMENT_METHOD.CASH,
      required: true,
    },
    expenseDate: { type: Date, required: true },
    reference: { type: String, trim: true },
    notes: { type: String, trim: true },
    recordedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true },
);

expenseSchema.index({ expenseDate: -1 });

expenseSchema.index({
  category: 1,
  expenseDate: -1,
});

expenseSchema.index({
  subcategory: 1,
  expenseDate: -1,
});

expenseSchema.index({
  payment_status: 1,
  expenseDate: -1,
});

expenseSchema.index({
  payment_status: 1,
  category: 1,
  expenseDate: -1,
});

expenseSchema.index({
  reference: 1,
});

expenseSchema.index({
  recordedBy: 1,
  expenseDate: -1,
});

export const Expense = model<IExpense, ExpenseModel>('Expense', expenseSchema);
