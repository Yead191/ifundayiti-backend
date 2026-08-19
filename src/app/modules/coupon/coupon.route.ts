import express from 'express';
import { CouponController } from './coupon.controller';
import validateRequest from '../../middlewares/validateRequest';
import { CouponValidations } from './coupon.validation';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../../../enums/user';

const router = express.Router();

router
  .route('/')
  .post(
    auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
    validateRequest(CouponValidations.createCouponValidation),
    CouponController.createCoupon,
  )
  .get(
    auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
    CouponController.getAllCoupons,
  );

router
  .route('/:id')
  .patch(
    auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
    validateRequest(CouponValidations.updateCouponValidation),
    CouponController.updateCoupon,
  )
  .delete(
    auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
    validateRequest(CouponValidations.deleteCouponValidation),
    CouponController.deleteCoupon,
  );
export const CouponRoutes = router;
