import { Request, Response } from 'express';
import { DigitalServices } from './digital.service';
import sendResponse from '../../../shared/sendResponse';
import catchAsync from '../../../shared/catchAsync';
import { StatusCodes } from 'http-status-codes';

const getDigitalProducts = catchAsync(async (req: Request, res: Response) => {
  const user = req.user;
  const query = req.query;
  const result = await DigitalServices.getDigitalProducts(user, query);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'My digital products fetched successfully',
    data: result.products,
    pagination: result.pagination,
  });
});

const getMySingleProduct = catchAsync(async (req: Request, res: Response) => {
  const result = await DigitalServices.getMySingleProduct(
    req.user,
    req.params.id,
  );
  return sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'My digital product fetched successfully!',
    data: result,
  });
});

export const DigitalController = {
  getDigitalProducts,
  getMySingleProduct,
};
