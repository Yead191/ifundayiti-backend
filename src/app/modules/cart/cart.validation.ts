import { z } from 'zod';

const addToCartZodSchema = z.object({
  body: z.object({
    product: z.string({ required_error: 'Product ID is required' }).trim(),
    size: z.string({ required_error: 'Size is required' }).trim(),
    color: z.string({ required_error: 'Color is required' }).trim(),
    quantity: z.coerce
      .number({ required_error: 'Quantity is required' })
      .int('Quantity must be an integer')
      .min(1, 'Quantity must be at least 1'),
  }),
});

const increaseOrDecreaseQuantityZodSchema = z.object({
  body: z.object({
    quantity: z.coerce
      .number({ required_error: 'Quantity adjustment is required' })
      .int('Quantity must be an integer')
      .refine(value => value === 1 || value === -1, {
        message: 'Quantity adjustment must be either 1 or -1',
      }),
  }),
});

export const CartValidations = {
  addToCartZodSchema,
  increaseOrDecreaseQuantityZodSchema,
};
