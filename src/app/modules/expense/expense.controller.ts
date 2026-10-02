import { Request, Response } from 'express';
import { ExpenseServices } from './expense.service';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';

const createExpense = catchAsync(async (req: Request, res: Response) => {
  const result = await ExpenseServices.createExpenseToDB(req.user, req.body);

  return sendResponse(res, {
    success: true,
    statusCode: StatusCodes.CREATED,
    message: 'Expense recorded successfully',
    data: result,
  });
});

const updateExpense = catchAsync(async (req: Request, res: Response) => {
  const result = await ExpenseServices.updateExpenseToDB(
    req.params.id,
    req.body,
  );

  return sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Expense updated successfully',
    data: result,
  });
});

const updateExpenseStatus = catchAsync(async (req: Request, res: Response) => {
  const result = await ExpenseServices.updateExpenseStatusToDB(
    req.params.id,
    req.body.payment_status,
  );

  return sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Expense status updated successfully',
    data: result,
  });
});

const getExpenseStats = catchAsync(async (req: Request, res: Response) => {
  const result = await ExpenseServices.getExpenseStatsFromDB();

  return sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Expense stats fetched successfully',
    data: result,
  });
});

const getAllExpenses = catchAsync(async (req: Request, res: Response) => {
  const result = await ExpenseServices.getAllExpensesFromDB(req.query);

  return sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Expenses fetched successfully',
    data: result.data,
    pagination: result.pagination,
  });
});

const getSingleExpense = catchAsync(async (req: Request, res: Response) => {
  const result = await ExpenseServices.getSingleExpenseFromDB(req.params.id);

  return sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Expense fetched successfully',
    data: result,
  });
});

const deleteExpense = catchAsync(async (req: Request, res: Response) => {
  const result = await ExpenseServices.deleteExpenseFromDB(req.params.id);

  return sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Expense deleted successfully',
    data: result,
  });
});

const deleteMultipleExpenses = catchAsync(
  async (req: Request, res: Response) => {
    const result = await ExpenseServices.deleteMultipleExpensesFromDB(
      req.body.ids,
    );

    return sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Expenses deleted successfully',
      data: result,
    });
  },
);

export const ExpenseController = {
  createExpense,
  updateExpense,
  updateExpenseStatus,
  getExpenseStats,
  getAllExpenses,
  getSingleExpense,
  deleteExpense,
  deleteMultipleExpenses,
};
