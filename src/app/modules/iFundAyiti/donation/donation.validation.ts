import { z } from 'zod';

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
    type: z.enum(['donation', 'grant']).optional(),
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
  deleteMultipleDonationsSchema,
};
