import { Schema, model } from 'mongoose';
import {
  ICoupon,
  CouponModel,
  ICouponUser,
  CouponUserModel,
} from './coupon.interface';
import ApiError from '../../../errors/ApiError';
import { StatusCodes } from 'http-status-codes';

const couponSchema = new Schema<ICoupon, CouponModel>(
  {
    coupon_code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    stripe_coupon_code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ['percentage', 'fixed'],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    max_use: {
      type: Number,
      default: 0,
    },
    total_uses: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'expired'],
      default: 'active',
    },
    start_date: {
      type: Date,
      default: Date.now,
    },
    end_date: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true },
);

couponSchema.statics.checkCoupon = async function (
  couponCode: string,
  user: string,
  price?: number,
) {
  const coupon = await this.findOne({ coupon_code: couponCode });
  if (!coupon) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Coupon not found');
  }
  console.log(coupon);
  const isUserCouponExist = await CouponUser.findOne({
    coupon: coupon._id,
    user,
  });
  if (isUserCouponExist) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Coupon has already been used');
  }
  if (coupon.status !== 'active') {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Coupon is not active');
  }
  if ((coupon.total_uses || 0) >= (coupon.max_use || 0)) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Coupon has been used too many times',
    );
  }
  if (new Date(coupon.start_date) > new Date()) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Coupon is not active');
  }
  if (new Date(coupon.end_date) < new Date()) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Coupon has expired');
  }

  if (price) {
    if (coupon.type === 'fixed' && price < coupon.amount) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        'Coupon is not applicable for this price',
      );
    }
    if (coupon.type === 'percentage') {
      const price_with_discount = price - (price * coupon.amount) / 100;
      return {
        stripe_coupon_code: coupon.stripe_coupon_code,
        price_with_discount: price_with_discount,
        discount_amount: coupon.amount,
        discount_type: coupon.type,
        orginal_price: price,
      };
    }
    if (coupon.type === 'fixed') {
      const price_with_discount = price - coupon.amount;
      return {
        stripe_coupon_code: coupon.stripe_coupon_code,
        price_with_discount: price_with_discount,
        discount_amount: coupon.amount,
        discount_type: coupon.type,
        orginal_price: price,
      };
    }
  }

  return {
    stripe_coupon_code: coupon.stripe_coupon_code,
    discount_amount: coupon.amount,
    discount_type: coupon.type,
  };
};

export const Coupon = model<ICoupon, CouponModel>('Coupon', couponSchema);

const couponUserSchema = new Schema<ICouponUser, CouponUserModel>({
  coupon: {
    type: Schema.Types.ObjectId,
    ref: 'Coupon',
    required: true,
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
});

couponUserSchema.pre('save', async function (next) {
  await Coupon.findByIdAndUpdate(this.coupon, {
    $inc: { total_uses: 1 },
  });
  next();
});

export const CouponUser = model<ICouponUser, CouponUserModel>(
  'CouponUser',
  couponUserSchema,
);
