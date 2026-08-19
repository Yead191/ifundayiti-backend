import { z } from 'zod';

const createCouponValidation = z.object({
  body: z.object({
    coupon_code: z.string({ message: 'Coupon code is required' }),
    name: z.string({ message: 'Coupon name is required' }),
    type: z.enum(['percentage', 'fixed'], {
      message: 'Coupon type is required',
    }),
    amount: z.number({ message: 'Coupon amount is required' }),
    max_use: z.number({ message: 'Coupon max use is required' }),
    start_date: z.coerce.date({ message: 'Coupon start date is required' }),
    end_date: z.coerce.date({ message: 'Coupon end date is required' }),
  }),
});

const updateCouponValidation = z.object({
  body: z.object({
    coupon_code: z.string().optional(),
    name: z.string().optional(),
    type: z.enum(['percentage', 'fixed']).optional(),
    amount: z.number().optional(),
    max_use: z.number().optional(),
    start_date: z.coerce
      .date({ message: 'Coupon start date is required' })
      .optional(),
    end_date: z.coerce
      .date({ message: 'Coupon end date is required' })
      .optional(),
  }),
  params: z.object({
    id: z.string(),
  }),
});

const deleteCouponValidation = z.object({
  params: z.object({
    id: z.string(),
  }),
});

export const CouponValidations = {
  createCouponValidation,
  updateCouponValidation,
  deleteCouponValidation,
};
