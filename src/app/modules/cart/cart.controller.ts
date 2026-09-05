import { Request, Response } from 'express';
import { CartServices } from './cart.service';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';

const addProductIntoCart = catchAsync(async (req: Request, res: Response) => {
  const result = await CartServices.addProductIntoCart(req.user, req.body);

  return sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Product added to cart successfully',
    data: result,
  });
});

const increaseOrDecreaseQuantity = catchAsync(
  async (req: Request, res: Response) => {
    const { quantity } = req.body;
    const result = await CartServices.increaseOrDecreaseQuantity(
      req.user,
      req.params.id,
      Number(quantity),
    );

    return sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: 'Cart quantity adjusted successfully',
      data: result,
    });
  },
);

const removeProductFromCart = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await CartServices.removeProductFromCart(req.user, id);

    return sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: 'Product removed from cart successfully',
      data: result,
    });
  },
);

const getCartOfUser = catchAsync(async (req: Request, res: Response) => {
  const result = await CartServices.getCartOfUser(req.user);

  return sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Cart fetched successfully',
    data: result,
  });
});

const clearCart = catchAsync(async (req: Request, res: Response) => {
  const result = await CartServices.clearCart(req.user);

  return sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Cart cleared successfully',
    data: result,
  });
});

export const CartController = {
  addProductIntoCart,
  increaseOrDecreaseQuantity,
  removeProductFromCart,
  getCartOfUser,
  clearCart,
};
