import { z } from 'zod';
import { ORDER_STATUS } from './order.constants';

const createOrderZodSchema = z.object({
  body: z.object({
    country: z.string().min(2, 'Country is required'),

    city: z.string().min(2, 'City is required'),

    postal_code: z.string().min(2, 'Postal code is required'),

    street_address: z.string().min(5, 'Street address is required'),

    contact_number: z.string().min(8, 'Contact number is required'),
  }),
});

const changeOrderStatusZodSchema = z.object({
  body: z.object({
    status: z.nativeEnum(ORDER_STATUS),
  }),
});

export const OrderValidations = {
  createOrderZodSchema,
  changeOrderStatusZodSchema,
};
