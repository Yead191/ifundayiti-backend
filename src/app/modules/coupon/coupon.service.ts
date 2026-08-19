import { StatusCodes } from 'http-status-codes';
import stripe from '../../../config/stripe';
import ApiError from '../../../errors/ApiError';
import { CouponModel, ICoupon } from './coupon.interface';
import { Coupon } from './coupon.model';
import QueryBuilder from '../../builder/QueryBuilder';

const createCoupon = async (payload: ICoupon) => {
  const stripe_coupon_code = await stripe.coupons.create({
    name: payload.coupon_code,
    ...(payload.type === 'percentage' && {
      percent_off: payload.amount,
    }),
    ...(payload.type === 'fixed' && {
      amount_off: Math.round(payload.amount * 100),
    }),
    currency: 'usd',
  });
  payload.stripe_coupon_code = stripe_coupon_code.id;

  const result = await Coupon.create(payload);
  return result;
};

const updateCoupon = async (id: string, payload: Partial<ICoupon>) => {
  const existCoupon = await Coupon.findById(id);
  if (!existCoupon) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Coupon not found');
  }
  await stripe.coupons.del(existCoupon.stripe_coupon_code);
  const stripe_coupon_code = await stripe.coupons.create({
    name: payload.coupon_code,
    ...(payload.type === 'percentage' && {
      percent_off: payload.amount,
    }),
    ...(payload.type === 'fixed' && {
      amount_off: Math.round((payload?.amount || 0) * 100),
    }),
    currency: 'usd',
  });
  payload.stripe_coupon_code = stripe_coupon_code.id;
  const result = await Coupon.findByIdAndUpdate(id, payload, { new: true });
  return result;
};

const deleteCoupon = async (id: string) => {
  const existCoupon = await Coupon.findById(id).lean();
  if (!existCoupon) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Coupon not found');
  }
  await stripe.coupons.del(existCoupon.stripe_coupon_code);
  const result = await Coupon.findByIdAndDelete(id);
  return result;
};

const getAllCoupon = async (query: Record<string, any>) => {
  const couponQuery = new QueryBuilder(Coupon.find(), query)
    .search(['name', 'coupon_code'])
    .filter()
    .paginate()
    .sort()
    .fields();
  const [coupons, pagination] = await Promise.all([
    couponQuery.modelQuery.lean(),
    couponQuery.getPaginationInfo(),
  ]);
  return { coupons, pagination };
};

export const CouponServices = {
  createCoupon,
  updateCoupon,
  deleteCoupon,
  getAllCoupon,
};
