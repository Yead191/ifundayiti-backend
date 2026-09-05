import express from 'express';
import { OrderController } from './order.controller';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../../../enums/user';
import { OrderValidations } from './order.validation';
import validateRequest from '../../middlewares/validateRequest';

const router = express.Router();

router
  .route('/')
  .post(
    auth(USER_ROLES.USER, USER_ROLES.VENDOR),
    validateRequest(OrderValidations.createOrderZodSchema),
    OrderController.createOrder,
  )
  .get(auth(), OrderController.getAllOrders);
router.patch(
  '/pre-order-ready/:orderId/items/:itemIndex',
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  OrderController.markPreOrderReady,
);
router
  .route('/:id')
  .get(auth(), OrderController.getSingleOrder)
  .patch(
    auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
    validateRequest(OrderValidations.changeOrderStatusZodSchema),
    OrderController.changeOrderStatus,
  )
  .delete(
    auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
    OrderController.deleteOrder,
  );

export const OrderRoutes = router;
