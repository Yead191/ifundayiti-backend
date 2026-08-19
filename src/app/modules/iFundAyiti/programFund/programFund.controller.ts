import { Request, Response } from 'express';
import catchAsync from '../../../../shared/catchAsync';
import sendResponse from '../../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';
import { ProgramFundServices } from './programFund.service';

// const getAllTransactions = catchAsync(async (req: Request, res: Response) => {
//   const result = await ProgramFundServices.getAllTransactionsFromDB();
//   return sendResponse(res, {
//     success: true,
//     statusCode: StatusCodes.OK,
//     message: 'Transactions fetched successfully',
//     data: result,
//   });
// });

const getFundBalance = catchAsync(async (req: Request, res: Response) => {
  const result = await ProgramFundServices.getFundBalanceFromDB();
  return sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Fund balance fetched successfully',
    data: result,
  });
});

export const ProgramFundController = {
  getFundBalance,
};
