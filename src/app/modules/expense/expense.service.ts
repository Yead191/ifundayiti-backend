import { JwtPayload } from 'jsonwebtoken';
import { IExpense } from './expense.interface';
import mongoose, { Types } from 'mongoose';
import { Expense } from './expense.model';
import { EXPENSE_PAYMENT_STATUS } from './expense.constants';
import { ProgramFund } from '../iFundAyiti/programFund/programFund.model';
import ApiError from '../../../errors/ApiError';
import { StatusCodes } from 'http-status-codes';
import { Transaction } from '../transaction/transaction.model';
import {
  TRANSACTION_CATEGORY,
  TRANSACTION_STATUS,
  TRANSACTION_TYPE,
} from '../../../enums/transaction';
import QueryBuilder from '../../builder/QueryBuilder';
import { getRandomId } from '../../../shared/getRandomId';

const createExpenseToDB = async (user: JwtPayload, payload: IExpense) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const reference =
      payload.reference || getRandomId('EXP-', 4, 'uppercase');

    const [expense] = await Expense.create(
      [
        {
          ...payload,
          reference,
          recordedBy: new Types.ObjectId(user.id),
        },
      ],
      { session },
    );

    /**
     * Only paid expenses reduce the available program fund.
     */
    if (payload.payment_status === EXPENSE_PAYMENT_STATUS.PAID) {
      const fund = await ProgramFund.findOneAndUpdate(
        {},
        {
          $inc: {
            amount: -payload.amount,
          },
        },
        {
          new: true,
          session,
        },
      );

      if (!fund) {
        throw new ApiError(
          StatusCodes.NOT_FOUND,
          'Program fund record not found',
        );
      }
    }

    /**
     * Create financial transaction for platform audit and ledger.
     */
    await Transaction.create(
      [
        {
          user: new Types.ObjectId(user.id),
          total_price: payload.amount,
          amount: payload.amount,
          payment_received:
            payload.payment_status === EXPENSE_PAYMENT_STATUS.PAID
              ? payload.amount
              : 0,
          type: TRANSACTION_TYPE.DEBIT,
          category: TRANSACTION_CATEGORY.EXPENSE,
          status:
            payload.payment_status === EXPENSE_PAYMENT_STATUS.PAID
              ? TRANSACTION_STATUS.SUCCESS
              : TRANSACTION_STATUS.PENDING,
          payment_method: payload.payment_method,
          transaction_id: reference,
        },
      ],
      { session },
    );

    await session.commitTransaction();

    await expense.populate({
      path: 'recordedBy',
      select: 'name email role image',
    });

    return expense;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    await session.endSession();
  }
};

const updateExpenseToDB = async (id: string, payload: Partial<IExpense>) => {
  if (!Types.ObjectId.isValid(id)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid expense ID');
  }

  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const expense = await Expense.findById(id).session(session);

    if (!expense) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Expense record not found');
    }

    const previousStatus = expense.payment_status;
    const previousAmount = expense.amount;

    const targetStatus = payload.payment_status ?? previousStatus;
    const targetAmount = payload.amount ?? previousAmount;

    /**
     * Calculate financial delta for ProgramFund:
     * - oldDeducted: amount that was subtracted from fund previously
     * - newDeducted: amount that should be subtracted now
     * fundAdjustment = oldDeducted - newDeducted
     * (Positive adjustment adds funds back; negative adjustment reduces funds)
     */
    const oldDeducted =
      previousStatus === EXPENSE_PAYMENT_STATUS.PAID ? previousAmount : 0;
    const newDeducted =
      targetStatus === EXPENSE_PAYMENT_STATUS.PAID ? targetAmount : 0;
    const fundAdjustment = oldDeducted - newDeducted;

    if (fundAdjustment !== 0) {
      const fund = await ProgramFund.findOneAndUpdate(
        {},
        {
          $inc: {
            amount: fundAdjustment,
          },
        },
        {
          new: true,
          session,
        },
      );

      if (!fund) {
        throw new ApiError(
          StatusCodes.NOT_FOUND,
          'Program fund record not found',
        );
      }
    }

    /**
     * Synchronize linked Transaction ledger entry
     */
    if (expense.reference) {
      const txnStatus =
        targetStatus === EXPENSE_PAYMENT_STATUS.PAID
          ? TRANSACTION_STATUS.SUCCESS
          : targetStatus === EXPENSE_PAYMENT_STATUS.CANCELLED
            ? TRANSACTION_STATUS.FAILED
            : TRANSACTION_STATUS.PENDING;

      await Transaction.updateOne(
        { transaction_id: expense.reference },
        {
          amount: targetAmount,
          total_price: targetAmount,
          payment_received:
            targetStatus === EXPENSE_PAYMENT_STATUS.PAID ? targetAmount : 0,
          status: txnStatus,
          payment_method: payload.payment_method ?? expense.payment_method,
        },
        { session },
      );
    }

    // Apply updates
    Object.assign(expense, payload);
    await expense.save({ session });

    await session.commitTransaction();

    await expense.populate({
      path: 'recordedBy',
      select: 'name email role image',
    });

    return expense;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    await session.endSession();
  }
};

const updateExpenseStatusToDB = async (
  id: string,
  payment_status: EXPENSE_PAYMENT_STATUS,
) => {
  return updateExpenseToDB(id, { payment_status });
};

const getAllExpensesFromDB = async (query: Record<string, any>) => {
  const qb = new QueryBuilder(
    Expense.find().populate({
      path: 'recordedBy',
      select: 'name email role image',
    }),
    query,
  )
    .search(['title', 'reference', 'notes'])
    .filter()
    .sort()
    .paginate()
    .fields();

  const [data, pagination] = await Promise.all([
    qb.modelQuery.lean(),
    qb.getPaginationInfo(),
  ]);

  return {
    data,
    pagination,
  };
};

const getSingleExpenseFromDB = async (id: string) => {
  if (!Types.ObjectId.isValid(id)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid expense ID');
  }

  const data = await Expense.findById(id)
    .populate({
      path: 'recordedBy',
      select: 'name email role image',
    })
    .lean();

  if (!data) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Expense record not found');
  }

  return data;
};

const getExpenseStatsFromDB = async () => {
  const now = new Date();
  const startOfMonth = new Date(
    now.getFullYear(),
    now.getMonth(),
    1,
    0,
    0,
    0,
    0,
  );

  const [stats] = await Expense.aggregate([
    {
      $group: {
        _id: null,
        totalExpenses: { $sum: 1 },
        totalAmount: { $sum: '$amount' },

        // Paid expenses
        totalPaidAmount: {
          $sum: {
            $cond: [
              { $eq: ['$payment_status', EXPENSE_PAYMENT_STATUS.PAID] },
              '$amount',
              0,
            ],
          },
        },
        paidCount: {
          $sum: {
            $cond: [
              { $eq: ['$payment_status', EXPENSE_PAYMENT_STATUS.PAID] },
              1,
              0,
            ],
          },
        },

        // Unpaid / Pending expenses
        totalUnpaidAmount: {
          $sum: {
            $cond: [
              { $eq: ['$payment_status', EXPENSE_PAYMENT_STATUS.UNPAID] },
              '$amount',
              0,
            ],
          },
        },
        unpaidCount: {
          $sum: {
            $cond: [
              { $eq: ['$payment_status', EXPENSE_PAYMENT_STATUS.UNPAID] },
              1,
              0,
            ],
          },
        },

        // Cancelled expenses
        totalCancelledAmount: {
          $sum: {
            $cond: [
              { $eq: ['$payment_status', EXPENSE_PAYMENT_STATUS.CANCELLED] },
              '$amount',
              0,
            ],
          },
        },
        cancelledCount: {
          $sum: {
            $cond: [
              { $eq: ['$payment_status', EXPENSE_PAYMENT_STATUS.CANCELLED] },
              1,
              0,
            ],
          },
        },

        // Category breakdown
        businessAmount: {
          $sum: {
            $cond: [{ $eq: ['$category', 'business'] }, '$amount', 0],
          },
        },
        eventAmount: {
          $sum: {
            $cond: [{ $eq: ['$category', 'event'] }, '$amount', 0],
          },
        },
        programAmount: {
          $sum: {
            $cond: [{ $eq: ['$category', 'program'] }, '$amount', 0],
          },
        },
        otherAmount: {
          $sum: {
            $cond: [{ $eq: ['$category', 'other'] }, '$amount', 0],
          },
        },

        // Month-to-date metrics
        thisMonthAmount: {
          $sum: {
            $cond: [{ $gte: ['$expenseDate', startOfMonth] }, '$amount', 0],
          },
        },
        thisMonthPaidAmount: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $gte: ['$expenseDate', startOfMonth] },
                  { $eq: ['$payment_status', EXPENSE_PAYMENT_STATUS.PAID] },
                ],
              },
              '$amount',
              0,
            ],
          },
        },
      },
    },
  ]);

  return {
    totalExpenses: stats?.totalExpenses || 0,
    totalAmount: stats?.totalAmount || 0,
    totalPaidAmount: stats?.totalPaidAmount || 0,
    paidCount: stats?.paidCount || 0,
    totalUnpaidAmount: stats?.totalUnpaidAmount || 0,
    unpaidCount: stats?.unpaidCount || 0,
    totalCancelledAmount: stats?.totalCancelledAmount || 0,
    cancelledCount: stats?.cancelledCount || 0,
    byCategory: {
      business: stats?.businessAmount || 0,
      event: stats?.eventAmount || 0,
      program: stats?.programAmount || 0,
      other: stats?.otherAmount || 0,
    },
    thisMonthAmount: stats?.thisMonthAmount || 0,
    thisMonthPaidAmount: stats?.thisMonthPaidAmount || 0,
  };
};

const deleteExpenseFromDB = async (id: string) => {
  if (!Types.ObjectId.isValid(id)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid expense ID');
  }

  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const expense = await Expense.findById(id).session(session);

    if (!expense) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Expense record not found');
    }

    /**
     * If it already reduced the fund, restore the amount before deleting it.
     */
    if (expense.payment_status === EXPENSE_PAYMENT_STATUS.PAID) {
      const fund = await ProgramFund.findOneAndUpdate(
        {},
        {
          $inc: {
            amount: expense.amount,
          },
        },
        {
          new: true,
          session,
        },
      );

      if (!fund) {
        throw new ApiError(
          StatusCodes.NOT_FOUND,
          'Program fund record not found',
        );
      }
    }

    // Clean up or mark ledger Transaction
    if (expense.reference) {
      await Transaction.deleteOne(
        { transaction_id: expense.reference },
        { session },
      );
    }

    await Expense.findByIdAndDelete(id).session(session);

    await session.commitTransaction();

    return null;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    await session.endSession();
  }
};

const deleteMultipleExpensesFromDB = async (ids: string[]) => {
  const validIds = ids.filter(id => Types.ObjectId.isValid(id));

  if (validIds.length === 0) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'No valid expense IDs provided',
    );
  }

  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const expenses = await Expense.find({
      _id: { $in: validIds },
    }).session(session);

    if (expenses.length === 0) {
      throw new ApiError(
        StatusCodes.NOT_FOUND,
        'No matching expense records found',
      );
    }

    const paidExpenseAmount = expenses.reduce(
      (total, expense) =>
        expense.payment_status === EXPENSE_PAYMENT_STATUS.PAID
          ? total + expense.amount
          : total,
      0,
    );

    if (paidExpenseAmount > 0) {
      const fund = await ProgramFund.findOneAndUpdate(
        {},
        {
          $inc: {
            amount: paidExpenseAmount,
          },
        },
        {
          new: true,
          session,
        },
      );

      if (!fund) {
        throw new ApiError(
          StatusCodes.NOT_FOUND,
          'Program fund record not found',
        );
      }
    }

    const references = expenses
      .map(e => e.reference)
      .filter((ref): ref is string => Boolean(ref));

    if (references.length > 0) {
      await Transaction.deleteMany(
        { transaction_id: { $in: references } },
        { session },
      );
    }

    const result = await Expense.deleteMany(
      {
        _id: { $in: expenses.map(expense => expense._id) },
      },
      { session },
    );

    await session.commitTransaction();

    return {
      deletedCount: result.deletedCount,
    };
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    await session.endSession();
  }
};

export const ExpenseServices = {
  createExpenseToDB,
  updateExpenseToDB,
  updateExpenseStatusToDB,
  getExpenseStatsFromDB,
  getAllExpensesFromDB,
  getSingleExpenseFromDB,
  deleteExpenseFromDB,
  deleteMultipleExpensesFromDB,
};
