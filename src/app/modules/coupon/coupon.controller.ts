import { Request, Response, NextFunction } from 'express';
import { CouponServices } from './coupon.service';
import catchAsync from '../../../shared/catchAsync';
import { StatusCodes } from 'http-status-codes';
import sendResponse from '../../../shared/sendResponse';

const createCoupon = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await CouponServices.createCoupon(req.body);
    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: 'Coupon created successfully',
      data: result,
    });
  },
);

const getAllCoupons = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await CouponServices.getAllCoupon(req.query);
    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: 'Coupons fetched successfully',
      data: result.coupons,
      pagination: result.pagination,
    });
  },
);

const updateCoupon = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await CouponServices.updateCoupon(req.params.id, req.body);
    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: 'Coupon updated successfully',
      data: result,
    });
  },
);

const deleteCoupon = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await CouponServices.deleteCoupon(req.params.id);
    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: 'Coupon deleted successfully',
      data: result,
    });
  },
);

export const CouponController = {
  createCoupon,
  getAllCoupons,
  updateCoupon,
  deleteCoupon,
};
