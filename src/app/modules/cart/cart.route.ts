import express from 'express';
import { CartController } from './cart.controller';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { CartValidations } from './cart.validation';

const router = express.Router();

// Cart collection routes
router
  .route('/')
  .post(
    auth(),
    validateRequest(CartValidations.addToCartZodSchema),
    CartController.addProductIntoCart,
  )
  .get(auth(), CartController.getCartOfUser);

// Clear entire cart
router.route('/clear').delete(auth(), CartController.clearCart);

// Adjust quantity (+1 / -1) & Remove item
router
  .route('/:id')
  .patch(
    auth(),
    validateRequest(CartValidations.increaseOrDecreaseQuantityZodSchema),
    CartController.increaseOrDecreaseQuantity,
  )
  .delete(auth(), CartController.removeProductFromCart);

export const CartRoutes = router;
