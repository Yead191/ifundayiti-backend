import { Request, Response, NextFunction } from 'express';
import { BookServices } from './book.service';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';
import { getSingleFilePath } from '../../../shared/getFilePath';
import catchAsync from '../../../shared/catchAsync';

const getAllBooks = catchAsync(async (req: Request, res: Response) => {
  const result = await BookServices.getAllBooks(req.query);
  return sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Books retrived successfully!',
    data: result.books,
    pagination: result.pagination,
  });
});

const createBook = catchAsync(async (req: Request, res: Response) => {
  let data = { ...req.body };
  const image = getSingleFilePath(req.files, 'image');
  const file = getSingleFilePath(req.files, 'file');
  // console.log(image);
  if (image) {
    data.image = image;
  }
  if (file) {
    data.file = file;
  }
  if (req.body.accent) {
    data.accent =
      typeof req.body.accent === 'string'
        ? JSON.parse(req.body.accent)
        : req.body.accent;
  }
  if (req.body.details) {
    data.details =
      typeof req.body.details === 'string'
        ? JSON.parse(req.body.details)
        : req.body.details;
  }

  const result = await BookServices.createBook(data);
  return sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Book created successfully!',
    data: result,
  });
});

const getSingleBook = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  const result = await BookServices.getSingleBook(id);
  return sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Product retrived successfully',
    data: result,
  });
});

const updateBook = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const payload = { ...req.body };
  const doc = getSingleFilePath(req.files, 'doc');
  const image = getSingleFilePath(req.files, 'image');

  if (doc) {
    payload.file = doc;
  }
  if (image) {
    payload.image = image;
  }
  if (req.body.accent) {
    payload.accent =
      typeof req.body.accent === 'string'
        ? JSON.parse(req.body.accent)
        : req.body.accent;
  }
  if (req.body.details) {
    payload.details =
      typeof req.body.details === 'string'
        ? JSON.parse(req.body.details)
        : req.body.details;
  }

  const result = await BookServices.updateBook(id, payload);
  return sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Product updated successfully',
    data: result,
  });
});
const deleteBook = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await BookServices.deleteBook(id);
  return sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Product deleted successfully!',
    data: result,
  });
});

const purchaseSingleProduct = catchAsync(
  async (req: Request, res: Response) => {
    const { coupon } = req.body;
    const result = await BookServices.purchaseSingleProduct(
      req.user,
      req.params.id,
      coupon,
    );
    return sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Product purchased successfully!',
      data: result,
    });
  },
);

export const BookController = {
  getAllBooks,
  createBook,
  getSingleBook,
  updateBook,
  deleteBook,
  purchaseSingleProduct,
};
