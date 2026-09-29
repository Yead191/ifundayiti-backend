import { z } from 'zod';
import {
  DONATION_PAYMENT_METHOD,
  DONATION_PAYMENT_STATUS,
  DONATION_TYPE,
} from './donation.constants';

const createDonationSchema = z.object({
  body: z.object({
    name: z
      .string({ required_error: 'Name is required' })
      .trim()
      .min(1, 'Name cannot be empty'),
    email: z
      .string({ required_error: 'Email is required' })
      .email('Invalid email address'),
    amount: z
      .number({ required_error: 'Amount is required' })
      .positive('Amount must be positive'),
    transactionId: z.string().optional(),
    type: z.nativeEnum(DONATION_TYPE).optional(),
  }),
});

const createManualDonationSchema = z.object({
  body: z.object({
    name: z
      .string({ required_error: 'Donor name is required' })
      .trim()
      .min(1, 'Donor name cannot be empty'),
    email: z
      .string()
      .email('Invalid email address')
      .optional()
      .or(z.literal('')),
    amount: z
      .number({ required_error: 'Amount is required' })
      .positive('Amount must be positive'),
    payment_method: z.nativeEnum(DONATION_PAYMENT_METHOD, {
      required_error: 'Payment method is required',
    }),
    payment_status: z
      .nativeEnum(DONATION_PAYMENT_STATUS)
      .optional()
      .default(DONATION_PAYMENT_STATUS.PAID),
    type: z
      .nativeEnum(DONATION_TYPE)
      .optional()
      .default(DONATION_TYPE.DONATION),
    reference: z.string().optional(),
    notes: z.string().optional(),
    transactionId: z.string().optional(),
  }),
});

const deleteMultipleDonationsSchema = z.object({
  body: z.object({
    ids: z
      .array(z.string().min(1, 'ID cannot be empty'), {
        required_error: 'Array of donation IDs is required',
      })
      .min(1, 'At least one ID is required'),
  }),
});

export const DonationValidations = {
  createDonationSchema,
  createManualDonationSchema,
  deleteMultipleDonationsSchema,
};
