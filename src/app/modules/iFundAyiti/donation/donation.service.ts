import { Types } from 'mongoose';
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
      email,
      amount: amount.toString(),
    },
  });

  return { paymentUrl: session.url };
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
    Donation.find(initQuery).populate({
      path: 'applicant',
      select: 'personal applicationPeriod awardedAmount status projectTitle',
      populate: {
        path: 'applicationPeriod',
        select: 'title startDate endDate',
      },
    }),
    query,
  )
    .search(['name', 'email', 'transactionId'])
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

  const donation = await Donation.findById(id).populate({
    path: 'applicant',
    select:
      'personal applicationPeriod awardedAmount status projectTitle quote successStory',
    populate: {
      path: 'applicationPeriod',
      select: 'title startDate endDate',
    },
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

  // Adjust ProgramFund balance to stay consistent
  if (donation.type === 'donation') {
    await ProgramFund.updateOne(
      {},
      {
        $inc: { amount: -donation.amount },
      },
    );
  } else if (donation.type === 'grant') {
    await ProgramFund.updateOne(
      {},
      {
        $inc: { amount: donation.amount },
      },
    );
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
    if (d.type === 'donation') {
      netFundAdjustment -= d.amount;
    } else if (d.type === 'grant') {
      netFundAdjustment += d.amount;
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
  const [stats, currentFund] = await Promise.all([
    Donation.aggregate([
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
          totalCount: { $sum: 1 },
        },
      },
    ]),
    ProgramFund.findOne({}).lean(),
  ]);

  const totalDonations = stats[0]?.totalDonations || 0;
  const totalGrants = stats[0]?.totalGrants || 0;
  const donationCount = stats[0]?.donationCount || 0;
  const grantCount = stats[0]?.grantCount || 0;
  const totalCount = stats[0]?.totalCount || 0;

  return {
    balance: totalDonations - totalGrants,
    programFundBalance: currentFund?.amount ?? totalDonations - totalGrants,
    totalDonations,
    totalGrants,
    donationCount,
    grantCount,
    totalCount,
  };
};

export const DonationServices = {
  createDonationToDB,
  getAllDonationsFromDB,
  getSingleDonationFromDB,
  deleteDonationFromDB,
  deleteMultipleDonationsFromDB,
  updateStatusToDB,
  getFundStatsFromDB,
};
