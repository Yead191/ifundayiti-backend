import { Types } from 'mongoose';
import { StatusCodes } from 'http-status-codes';
import { JwtPayload } from 'jsonwebtoken';
import { USER_ROLES } from '../../../enums/user';
import QueryBuilder from '../../builder/QueryBuilder';
import { Transaction } from './transaction.model';
import ApiError from '../../../errors/ApiError';
import {
  TRANSACTION_CATEGORY,
  TRANSACTION_STATUS,
  TRANSACTION_TYPE,
} from '../../../enums/transaction';

const getTransactions = async (
  user: JwtPayload,
  query: Record<string, any>,
) => {
  const isAdmin = [USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN].includes(
    user.role,
  );

  const initQuery = isAdmin ? {} : { user: user.id };

  const transactionQuery = new QueryBuilder(
    Transaction.find(initQuery).populate([
      { path: 'user', select: 'name email image role' },
      {
        path: 'order',
        select:
          'orderNumber totalAmount status deliveryStatus paymentStatus createdAt',
      },
    ]),
    query,
  )
    .search([
      'transaction_id',
      'payment_intent_id',
      'payment_method',
      'total_price',
    ])
    .filter()
    .sort()
    .paginate()
    .sort()
    .filter();
  const [transactions, pagination] = await Promise.all([
    transactionQuery.modelQuery.lean(),
    transactionQuery.getPaginationInfo(),
  ]);

  return { transactions, pagination };
};

const getSingleTransactionFromDB = async (id: string, user: JwtPayload) => {
  if (!Types.ObjectId.isValid(id)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid transaction ID');
  }

  const transaction = await Transaction.findById(id)
    .populate([
      { path: 'user', select: 'name email image role' },
      {
        path: 'order',
        select:
          'orderNumber totalAmount status deliveryStatus paymentStatus createdAt items',
      },
    ])
    .lean();

  if (!transaction) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Transaction not found');
  }

  const isAdmin = [USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN].includes(
    user.role,
  );

  const transactionUserId =
    (transaction.user as any)?._id?.toString() || transaction.user?.toString();
  if (!isAdmin && transactionUserId !== user.id) {
    throw new ApiError(
      StatusCodes.FORBIDDEN,
      'You are not authorized to view this transaction',
    );
  }

  return transaction;
};

const getTransactionStatsFromDB = async () => {
  const [stats] = await Transaction.aggregate([
    {
      $group: {
        _id: null,
        totalTransactions: { $sum: 1 },
        totalRevenue: {
          $sum: {
            $cond: [
              { $eq: ['$status', TRANSACTION_STATUS.SUCCESS] },
              { $ifNull: ['$total_price', '$amount'] },
              0,
            ],
          },
        },
        shopRevenue: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $eq: ['$status', TRANSACTION_STATUS.SUCCESS] },
                  { $eq: ['$category', TRANSACTION_CATEGORY.SHOP] },
                ],
              },
              { $ifNull: ['$total_price', '$amount'] },
              0,
            ],
          },
        },
        membershipRevenue: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $eq: ['$status', TRANSACTION_STATUS.SUCCESS] },
                  { $eq: ['$category', TRANSACTION_CATEGORY.MEMBERSHIP] },
                ],
              },
              { $ifNull: ['$total_price', '$amount'] },
              0,
            ],
          },
        },
        successfulTransactions: {
          $sum: {
            $cond: [{ $eq: ['$status', TRANSACTION_STATUS.SUCCESS] }, 1, 0],
          },
        },
        pendingTransactions: {
          $sum: {
            $cond: [{ $eq: ['$status', TRANSACTION_STATUS.PENDING] }, 1, 0],
          },
        },
        failedTransactions: {
          $sum: {
            $cond: [{ $eq: ['$status', TRANSACTION_STATUS.FAILED] }, 1, 0],
          },
        },
        creditTransactions: {
          $sum: {
            $cond: [{ $eq: ['$type', TRANSACTION_TYPE.CREDIT] }, 1, 0],
          },
        },
        debitTransactions: {
          $sum: {
            $cond: [{ $eq: ['$type', TRANSACTION_TYPE.DEBIT] }, 1, 0],
          },
        },
      },
    },
  ]);

  return {
    totalRevenue: stats?.totalRevenue || 0,
    shopRevenue: stats?.shopRevenue || 0,
    membershipRevenue: stats?.membershipRevenue || 0,
    totalTransactions: stats?.totalTransactions || 0,
    successfulTransactions: stats?.successfulTransactions || 0,
    pendingTransactions: stats?.pendingTransactions || 0,
    failedTransactions: stats?.failedTransactions || 0,
    creditTransactions: stats?.creditTransactions || 0,
    debitTransactions: stats?.debitTransactions || 0,
  };
};

const deleteTransactionFromDB = async (id: string) => {
  if (!Types.ObjectId.isValid(id)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid transaction ID');
  }

  const transaction = await Transaction.findById(id);
  if (!transaction) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Transaction not found');
  }

  const result = await Transaction.findByIdAndDelete(id);
  return result;
};

const deleteMultipleTransactionsFromDB = async (ids: string[]) => {
  const validIds = ids.filter(id => Types.ObjectId.isValid(id));
  if (validIds.length === 0) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'No valid transaction IDs provided',
    );
  }

  const result = await Transaction.deleteMany({ _id: { $in: validIds } });
  return {
    deletedCount: result.deletedCount,
  };
};

export const TransactionServices = {
  getTransactions,
  getSingleTransactionFromDB,
  getTransactionStatsFromDB,
  deleteTransactionFromDB,
  deleteMultipleTransactionsFromDB,
};
