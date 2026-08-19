import { z } from 'zod';
import { ORDER_STATUS } from '../../../enums/orders';
const createOrderZodSchema = z.object({
  body: z.object({
    country: z.string({ required_error: 'Country is required' }),
    city: z.string({ required_error: 'City is required' }),
    postal_code: z.string({ required_error: 'Postal code is required' }),
    street_address: z.string({ required_error: 'Street address is required' }),
    contact_number: z.string({ required_error: 'Contact number is required' }),
  }),
});

const changeOrderStatusZodSchema = z.object({
  body: z.object({
    status: z.nativeEnum(ORDER_STATUS, {
      required_error: 'Status is required',
    }),
  }),
});
export const OrderValidations = {
  createOrderZodSchema,
  changeOrderStatusZodSchema,
};
