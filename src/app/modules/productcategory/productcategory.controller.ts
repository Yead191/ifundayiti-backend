import { Request, Response } from 'express';
import { ProductcategoryServices } from './productcategory.service';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';

const createCategory = catchAsync(async (req: Request, res: Response) => {
  const result = await ProductcategoryServices.createCategoryToDB(req.body);
  return sendResponse(res, {
    success: true,
    statusCode: StatusCodes.CREATED,
    message: 'Product category created successfully!',
    data: result,
  });
});

const getAllCategories = catchAsync(async (req: Request, res: Response) => {
  const result = await ProductcategoryServices.getAllCategoriesFromDB(
    req.user,
    req.query,
  );
  return sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Product categories retrieved successfully!',
    data: result.result,
    pagination: result.pagination,
  });
});

const getSingleCategory = catchAsync(async (req: Request, res: Response) => {
  const result = await ProductcategoryServices.getSingleCategoryFromDB(
    req.params.id,
  );
  return sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Product category retrieved successfully!',
    data: result,
  });
});

const updateCategory = catchAsync(async (req: Request, res: Response) => {
  const result = await ProductcategoryServices.updateCategoryToDB(
    req.params.id,
    req.body,
  );
  return sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Product category updated successfully!',
    data: result,
  });
});

const deleteCategory = catchAsync(async (req: Request, res: Response) => {
  const result = await ProductcategoryServices.deleteCategoryFromDB(
    req.params.id,
  );
  return sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Product category deleted successfully!',
    data: result,
  });
});

export const ProductcategoryController = {
  createCategory,
  getAllCategories,
  getSingleCategory,
  updateCategory,
  deleteCategory,
};
