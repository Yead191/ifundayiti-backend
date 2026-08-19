import { Request, Response } from 'express';
import { CartServices } from './cart.service';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';

const addProductIntoCart = catchAsync(async (req: Request, res: Response) => {
  const { ...data } = req.body;
  data.user = req.user.id;

  const result = await CartServices.addProductIntoCart(data);

  return sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Product added to cart successfully',
    data: result,
  });
});

const increaseOrDecreseQuantity = catchAsync(
  async (req: Request, res: Response) => {
    const { amount } = req.body;
    await CartServices.increaseOrDecreseQuantity(req.params.id, amount);

    return sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: 'Quantity increased or decreased successfully',
      data: amount,
    });
  },
);

const deleteProductFromCart = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.body;
    const result = await CartServices.deleteProductFromCart(id);

    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: 'Product deleted from cart successfully',
      data: result,
    });
  },
);

const getCartOfUser = catchAsync(async (req: Request, res: Response) => {
  const result = await CartServices.getCartOfUser(req.user);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Cart fetched successfully',
    data: result,
  });
});

export const CartController = {
  addProductIntoCart,
  increaseOrDecreseQuantity,
  deleteProductFromCart,
  getCartOfUser,
};
