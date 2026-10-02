import { Model, Types } from 'mongoose';
import {
  EXPENSE_CATEGORY,
  EXPENSE_PAYMENT_METHOD,
  EXPENSE_PAYMENT_STATUS,
  EXPENSE_SUBCATEGORY,
} from './expense.constants';

export interface IExpense {
  title: string;
  amount: number;

  category: EXPENSE_CATEGORY;
  subcategory: EXPENSE_SUBCATEGORY;

  payment_status: EXPENSE_PAYMENT_STATUS;
  payment_method: EXPENSE_PAYMENT_METHOD;

  expenseDate: Date;

  reference?: string;
  notes?: string;

  recordedBy: Types.ObjectId;

  createdAt?: Date;
  updatedAt?: Date;
}

export type ExpenseModel = Model<IExpense>;
