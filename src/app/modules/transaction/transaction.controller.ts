import { Request, Response } from 'express';
import { TransactionServices } from './transaction.service';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';

const getTransactions = catchAsync(async (req: Request, res: Response) => {
  const result = await TransactionServices.getTransactions(req.user, req.query);
  return sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Transactions fetched successfully',
    data: result.transactions,
    pagination: result.pagination,
  });
});

export const TransactionController = { getTransactions };
