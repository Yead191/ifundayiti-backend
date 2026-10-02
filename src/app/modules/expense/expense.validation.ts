import { z } from 'zod';
import {
  EXPENSE_CATEGORY,
  EXPENSE_PAYMENT_METHOD,
  EXPENSE_PAYMENT_STATUS,
  EXPENSE_SUBCATEGORY,
} from './expense.constants';

const createExpenseValidation = z.object({
  body: z.object({
    title: z
      .string({ required_error: 'Title is required' })
      .trim()
      .min(1, 'Title cannot be empty'),
    amount: z
      .number({ required_error: 'Amount is required' })
      .positive('Amount must be greater than 0'),
    category: z.nativeEnum(EXPENSE_CATEGORY, {
      required_error: 'Category is required',
    }),
    subcategory: z.nativeEnum(EXPENSE_SUBCATEGORY, {
      required_error: 'Subcategory is required',
    }),
    payment_status: z
      .nativeEnum(EXPENSE_PAYMENT_STATUS)
      .default(EXPENSE_PAYMENT_STATUS.PAID)
      .optional(),
    payment_method: z
      .nativeEnum(EXPENSE_PAYMENT_METHOD)
      .default(EXPENSE_PAYMENT_METHOD.CASH)
      .optional(),
    expenseDate: z.string({ required_error: 'Expense date is required' }),
    reference: z.string().trim().optional(),
    notes: z.string().trim().optional(),
  }),
});

const updateExpenseValidation = z.object({
  body: z.object({
    title: z.string().trim().min(1, 'Title cannot be empty').optional(),
    amount: z.number().positive('Amount must be greater than 0').optional(),
    category: z.nativeEnum(EXPENSE_CATEGORY).optional(),
    subcategory: z.nativeEnum(EXPENSE_SUBCATEGORY).optional(),
    payment_status: z.nativeEnum(EXPENSE_PAYMENT_STATUS).optional(),
    payment_method: z.nativeEnum(EXPENSE_PAYMENT_METHOD).optional(),
    expenseDate: z.string().optional(),
    reference: z.string().trim().optional(),
    notes: z.string().trim().optional(),
  }),
});

const deleteMultipleExpenseValidation = z.object({
  body: z.object({
    ids: z
      .array(z.string(), {
        required_error: 'Array of expense IDs is required',
      })
      .min(1, 'At least one ID must be provided'),
  }),
});

export const ExpenseValidations = {
  createExpenseValidation,
  updateExpenseValidation,
  deleteMultipleExpenseValidation,
};

