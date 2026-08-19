import { Model, Types } from 'mongoose';

export type ICoupon = {
  coupon_code: string;
  stripe_coupon_code: string;
  name: string;
  type: 'percentage' | 'fixed';
  amount: number;
  max_use?: number;
  total_uses?: number;
  status: 'active' | 'inactive' | 'expired';
  start_date: Date;
  end_date: Date;
};

export type CouponModel = Model<ICoupon> & {
  checkCoupon: (
    coupon_code: string | Types.ObjectId,
    user: string | Types.ObjectId,
    price?: number,
  ) => Promise<{
    stripe_coupon_code: string;
    price_with_discount: number;
    discount_amount: number;
    discount_type: string;
    orginal_price: number;
  }>;
};

export type ICouponUser = {
  coupon: Types.ObjectId;
  user: Types.ObjectId;
};

export type CouponUserModel = Model<ICouponUser>;
