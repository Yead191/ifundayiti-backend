import mongoose, { Types } from 'mongoose';
import { StatusCodes } from 'http-status-codes';
import stripe from '../../../../config/stripe';
import { Donation } from './donation.model';
import { IDonation } from './donation.interface';
import QueryBuilder from '../../../builder/QueryBuilder';
import config from '../../../../config';
import ApiError from '../../../../errors/ApiError';
import { ProgramFund } from '../programFund/programFund.model';
import { JwtPayload } from 'jsonwebtoken';
import { USER_ROLES } from '../../../../enums/user';
import {
  DONATION_PAYMENT_METHOD,
  DONATION_PAYMENT_STATUS,
  DONATION_TYPE,
} from './donation.constants';
import { getRandomId } from '../../../../shared/getRandomId';
import { Transaction } from '../../transaction/transaction.model';
import {
  TRANSACTION_CATEGORY,
  TRANSACTION_STATUS,
  TRANSACTION_TYPE,
} from '../../../../enums/transaction';
import { User } from '../../user/user.model';
import { NotificationServices } from '../../notification/notification.service';
import { emailTemplate } from '../../../../shared/emailTemplate';
import { emailHelper } from '../../../../helpers/emailHelper';
import { OrderServices } from '../../order/order.service';
import { Application } from '../application/application.model';
import { Expense } from '../../expense/expense.model';
import { EXPENSE_PAYMENT_STATUS } from '../../expense/expense.constants';

const createDonationToDB = async (payload: IDonation) => {
  const { name, email, amount } = payload;

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'Donation to Fund Ayiti',
          },
          unit_amount: Math.round(amount * 100),
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
    success_url: `${config.frontend_url}/payment/success?type=donation`,
    cancel_url: `${config.frontend_url}/payment/failed?type=donation`,
    customer_email: email,
    metadata: {
      paymentType: 'ifundayiti_donation',
      project: 'ifundayiti',
      name,
      email: email || '',
      amount: amount.toString(),
    },
  });

  return { paymentUrl: session.url };
};

const createManualDonationToDB = async (
  user: JwtPayload,
  payload: Partial<IDonation>,
) => {
  const {
    name,
    email,
    amount,
    payment_method = DONATION_PAYMENT_METHOD.CASH,
    payment_status = DONATION_PAYMENT_STATUS.PAID,
    type = DONATION_TYPE.DONATION,
    reference,
    notes,
  } = payload;

  if (!amount || amount <= 0) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Valid donation amount is required',
    );
  }

  const transactionId =
    payload.transactionId ||
    reference ||
    getRandomId('TXN-MAN-', 4, 'uppercase');

  const mongoSession = await mongoose.startSession();
  try {
    mongoSession.startTransaction();

    const [donation] = await Donation.create(
      [
        {
          name,
          email: email || '',
          amount,
          payment_status,
          payment_method,
          transactionId,
          type,
          reference,
          notes,
          recordedBy: new Types.ObjectId(user.id),
        },
      ],
      { session: mongoSession },
    );

    // Update ProgramFund balance if payment is confirmed/paid
    if (payment_status === DONATION_PAYMENT_STATUS.PAID) {
      if (
        type === DONATION_TYPE.DONATION ||
        type === DONATION_TYPE.FUND_RAISING ||
        (type as string) === 'donation' ||
        (type as string) === 'fund_raising'
      ) {
        await ProgramFund.updateOne(
          {},
          {
            $inc: { amount: amount },
          },
          { session: mongoSession },
        );
      } else if (type === DONATION_TYPE.GRANT || (type as string) === 'grant') {
        await ProgramFund.updateOne(
          {},
          {
            $inc: { amount: -amount },
          },
          { session: mongoSession },
        );
      }
    }

    // Match donor to existing User if email exists
    const userDoc = email
      ? await User.findOne({ email }).session(mongoSession)
      : null;

    // Create financial transaction record for audit and dashboard financial tracking
    await Transaction.create(
      [
        {
          user: userDoc?._id || new Types.ObjectId(user.id),
          total_price: amount,
          amount,
          payment_received:
            payment_status === DONATION_PAYMENT_STATUS.PAID ? amount : 0,
          type:
            type === 'grant' ? TRANSACTION_TYPE.DEBIT : TRANSACTION_TYPE.CREDIT,
          category: TRANSACTION_CATEGORY.DONATION,
          status:
            payment_status === DONATION_PAYMENT_STATUS.PAID
              ? TRANSACTION_STATUS.SUCCESS
              : TRANSACTION_STATUS.PENDING,
          payment_method: payment_method || 'cash',
          payment_intent_id: transactionId,
          transaction_id: transactionId,
        },
      ],
      { session: mongoSession },
    );

    await mongoSession.commitTransaction();
    mongoSession.endSession();

    // Populate recordedBy for response
    await donation.populate({
      path: 'recordedBy',
      select: 'name email role avatar',
    });

    // Notify other admins about the recorded donation
    NotificationServices.sendNotificationToAdmins({
      title: 'Manual Donation Recorded',
      message: `${name} contributed $${amount} via ${payment_method} (recorded by admin)`,
      refId: donation._id,
      path: '/transactions',
    }).catch(err => console.error('[Notification Error]:', err));

    // Send receipt email to donor if email is present
    if (email && payment_status === DONATION_PAYMENT_STATUS.PAID) {
      try {
        const emailData = emailTemplate.donationReceipt({
          donorEmail: email,
          donorName: name || 'Valued Donor',
          amount,
          transactionId,
        });
        await emailHelper.sendEmail(emailData);
      } catch (emailError) {
        console.error('[Manual Donation Receipt Email Error]:', emailError);
      }
    }

    return donation;
  } catch (error) {
    await mongoSession.abortTransaction();
    mongoSession.endSession();
    throw error;
  }
};

const getAllDonationsFromDB = async (
  user: JwtPayload,
  query: Record<string, any>,
) => {
  const initQuery = [USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN].includes(
    user.role,
  )
    ? {}
    : { email: user.email, payment_status: 'paid' };

  const qb = new QueryBuilder(
    Donation.find(initQuery)
      .populate({
        path: 'applicant',
        select: 'personal applicationPeriod awardedAmount status projectTitle',
        populate: {
          path: 'applicationPeriod',
          select: 'title startDate endDate',
        },
      })
      .populate({
        path: 'recordedBy',
        select: 'name email role avatar',
      }),
    query,
  )
    .search(['name', 'email', 'transactionId', 'reference'])
    .filter()
    .sort()
    .paginate()
    .fields();

  const [transactions, pagination] = await Promise.all([
    qb.modelQuery.lean(),
    qb.getPaginationInfo(),
  ]);

  return { transactions, pagination };
};

const getSingleDonationFromDB = async (id: string) => {
  if (!Types.ObjectId.isValid(id)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid donation ID');
  }

  const donation = await Donation.findById(id)
    .populate({
      path: 'applicant',
      select:
        'personal applicationPeriod awardedAmount status projectTitle quote successStory',
      populate: {
        path: 'applicationPeriod',
        select: 'title startDate endDate',
      },
    })
    .populate({
      path: 'recordedBy',
      select: 'name email role avatar',
    });

  if (!donation) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Donation transaction not found');
  }

  return donation;
};

const deleteDonationFromDB = async (id: string) => {
  if (!Types.ObjectId.isValid(id)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid donation ID');
  }

  const donation = await Donation.findById(id);
  if (!donation) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Donation record not found');
  }

  // Adjust ProgramFund balance to stay consistent if paid
  const isPaid =
    donation.payment_status === DONATION_PAYMENT_STATUS.PAID ||
    (donation.payment_status as string) === 'paid';
  if (isPaid) {
    if (
      donation.type === DONATION_TYPE.DONATION ||
      donation.type === DONATION_TYPE.FUND_RAISING ||
      (donation.type as string) === 'donation' ||
      (donation.type as string) === 'fund_raising'
    ) {
      await ProgramFund.updateOne(
        {},
        {
          $inc: { amount: -donation.amount },
        },
      );
    } else if (
      donation.type === DONATION_TYPE.GRANT ||
      (donation.type as string) === 'grant'
    ) {
      await ProgramFund.updateOne(
        {},
        {
          $inc: { amount: donation.amount },
        },
      );
    }
  }

  const result = await Donation.findByIdAndDelete(id);
  return result;
};

const deleteMultipleDonationsFromDB = async (ids: string[]) => {
  const validIds = ids.filter(id => Types.ObjectId.isValid(id));
  if (validIds.length === 0) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'No valid donation IDs provided',
    );
  }

  const donations = await Donation.find({ _id: { $in: validIds } });
  if (donations.length === 0) {
    throw new ApiError(
      StatusCodes.NOT_FOUND,
      'No matching donation records found',
    );
  }

  let netFundAdjustment = 0;
  for (const d of donations) {
    const isPaid =
      d.payment_status === DONATION_PAYMENT_STATUS.PAID ||
      (d.payment_status as string) === 'paid';
    if (isPaid) {
      if (
        d.type === DONATION_TYPE.DONATION ||
        d.type === DONATION_TYPE.FUND_RAISING ||
        (d.type as string) === 'donation' ||
        (d.type as string) === 'fund_raising'
      ) {
        netFundAdjustment -= d.amount;
      } else if (
        d.type === DONATION_TYPE.GRANT ||
        (d.type as string) === 'grant'
      ) {
        netFundAdjustment += d.amount;
      }
    }
  }

  if (netFundAdjustment !== 0) {
    await ProgramFund.updateOne(
      {},
      {
        $inc: { amount: netFundAdjustment },
      },
    );
  }

  const result = await Donation.deleteMany({ _id: { $in: validIds } });

  return {
    deletedCount: result.deletedCount,
  };
};

const updateStatusToDB = async (status: string, res: any) => {
  if (status === 'success') {
    return res.redirect(`${config.frontend_url}/payment/success?type=donation`);
  } else {
    return res.redirect(`${config.frontend_url}/payment/failed?type=donation`);
  }
};

const getFundStatsFromDB = async () => {
  const [stats, orderStats, ApplicationCount, expenseStats] = await Promise.all([
    Donation.aggregate([
      {
        $match: {
          $or: [
            {
              payment_status: {
                $in: [DONATION_PAYMENT_STATUS.PAID, 'paid'],
              },
            },
            {
              type: {
                $in: [DONATION_TYPE.GRANT, 'grant'],
              },
            },
          ],
        },
      },
      {
        $group: {
          _id: null,
          totalDonations: {
            $sum: {
              $cond: [{ $eq: ['$type', 'donation'] }, '$amount', 0],
            },
          },
          totalGrants: {
            $sum: {
              $cond: [{ $eq: ['$type', 'grant'] }, '$amount', 0],
            },
          },
          totalFundRaised: {
            $sum: {
              $cond: [{ $eq: ['$type', 'fund_raising'] }, '$amount', 0],
            },
          },
          donationCount: {
            $sum: {
              $cond: [{ $eq: ['$type', 'donation'] }, 1, 0],
            },
          },
          grantCount: {
            $sum: {
              $cond: [{ $eq: ['$type', 'grant'] }, 1, 0],
            },
          },
          fundRaisedCount: {
            $sum: {
              $cond: [{ $eq: ['$type', 'fund_raising'] }, 1, 0],
            },
          },
          totalCount: { $sum: 1 },
        },
      },
    ]),
    OrderServices.getOrderStatsFromDB(),
    Application.countDocuments(),
    Expense.aggregate([
      {
        $match: {
          payment_status: {
            $in: [EXPENSE_PAYMENT_STATUS.PAID, 'paid'],
          },
        },
      },
      {
        $group: {
          _id: null,
          totalPaidExpenses: { $sum: '$amount' },
          paidExpenseCount: { $sum: 1 },
        },
      },
    ]),
  ]);

  const totalDonations = stats[0]?.totalDonations || 0;
  const totalGrants = stats[0]?.totalGrants || 0;
  const offlineFundRaised = stats[0]?.totalFundRaised || 0;
  const orderRevenue = orderStats?.totalRevenue || 0;
  const totalFundRaised = offlineFundRaised + orderRevenue;

  const totalPaidExpenses = expenseStats[0]?.totalPaidExpenses || 0;
  const paidExpenseCount = expenseStats[0]?.paidExpenseCount || 0;

  const donationCount = stats[0]?.donationCount || 0;
  const grantCount = stats[0]?.grantCount || 0;
  const offlineFundRaisedCount = stats[0]?.fundRaisedCount || 0;
  const orderPaidCount = orderStats?.paidOrders || 0;
  const fundRaisedCount = offlineFundRaisedCount + orderPaidCount;

  const totalCount = donationCount + grantCount + fundRaisedCount;

  const totalInflows = totalDonations + totalFundRaised;
  const totalOutflows = totalGrants + totalPaidExpenses;
  const totalBalance = totalInflows - totalOutflows;

  const totalApplication = ApplicationCount || 0;

  return {
    totalBalance,
    totalDonations,
    totalGrants,
    totalFundRaised,
    totalPaidExpenses,
    donationCount,
    grantCount,
    fundRaisedCount,
    paidExpenseCount,
    totalCount,
    totalApplication,
  };
};

export const DonationServices = {
  createDonationToDB,
  createManualDonationToDB,
  getAllDonationsFromDB,
  getSingleDonationFromDB,
  deleteDonationFromDB,
  deleteMultipleDonationsFromDB,
  updateStatusToDB,
  getFundStatsFromDB,
};
