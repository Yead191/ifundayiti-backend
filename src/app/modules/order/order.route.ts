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
router
  .route('/:id')
  .patch(
    auth(),
    validateRequest(OrderValidations.changeOrderStatusZodSchema),
    OrderController.changeOrderStatus,
  );
export const OrderRoutes = router;
