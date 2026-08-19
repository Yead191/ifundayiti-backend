import { z } from 'zod';

const createDonationSchema = z.object({
  body: z.object({
    name: z.string({ required_error: 'Name is required' }),
    email: z.string({ required_error: 'Email is required' }).email('Invalid email address'),
    amount: z.number({ required_error: 'Amount is required' }).positive('Amount must be positive'),
    transactionId: z.string().optional(),
  }),
});

export const DonationValidations = {
  createDonationSchema,
};
