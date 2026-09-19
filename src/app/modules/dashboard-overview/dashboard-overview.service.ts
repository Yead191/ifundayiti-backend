import { JwtPayload } from 'jsonwebtoken';
import { Application } from '../iFundAyiti/application/application.model';
import { Applicationperiod } from '../iFundAyiti/applicationperiod/applicationperiod.model';
import { Donation } from '../iFundAyiti/donation/donation.model';
import { PROJECT_STATUS } from '../project/project.constants';
import { Project } from '../project/project.model';
import { Order } from '../order/order.model';
import { Types } from 'mongoose';

const getDashboardOverview = async () => {
  const [
    totalApplication,
    submitted,
    underReview,
    approved,
    rejected,
    finalist,
    winner,
    archived,
  ] = await Promise.all([
    Application.countDocuments(),
    Application.countDocuments({ status: 'submitted' }),
    Application.countDocuments({ status: 'underReview' }),
    Application.countDocuments({ status: 'approved' }),
    Application.countDocuments({ status: 'rejected' }),
    Application.countDocuments({ status: 'finalist' }),
    Application.countDocuments({ status: 'winner' }),
    Application.countDocuments({ status: 'archived' }),
  ]);

  return {
    totalApplication,
    submitted,
    underReview,
    approved,
    rejected,
    finalist,
    winner,
    archived,
  };
};

const getImpactStatsFromDB = async () => {
  const [
    applicationReceived,
    stats,
    grantsAwardedCount,
    projectSupported,
    grantCycleCount,
  ] = await Promise.all([
    Application.countDocuments(),

    Donation.aggregate([
      {
        $group: {
          _id: null,
          totalGrants: {
            $sum: {
              $cond: [{ $eq: ['$type', 'grant'] }, '$amount', 0],
            },
          },
        },
      },
    ]),

    Application.countDocuments({ status: 'winner' }),
    Project.countDocuments({ status: PROJECT_STATUS.PUBLISHED }),
    Applicationperiod.countDocuments(),
  ]);

  const totalFundsAwarded = stats[0]?.totalGrants ?? 0;

  return {
    applicationReceived,
    grantsAwardedCount,
    totalFundsAwarded,
    projectSupported,
    grantCycleCount,
  };
};

const getMyStatsFromDB = async (user: JwtPayload) => {
  const [myOrders, myTotalDonation] = await Promise.all([
    Order.countDocuments({ user: user.id, payment_status: 'paid' }),
    Donation.aggregate([
      {
        $match: {
          email: user.email,
          payment_status: 'paid',
        },
      },
      {
        $group: {
          _id: null,
          myTotalDonation: {
            $sum: '$amount',
          },
        },
      },
    ]),
  ]);

  const myTotalDonationValue = myTotalDonation[0]?.myTotalDonation ?? 0;

  return {
    myOrders,
    myTotalDonation: myTotalDonationValue,
  };
};
export const DashboardOverviewServices = {
  getDashboardOverview,
  getImpactStatsFromDB,
  getMyStatsFromDB,
};
