import stripe from '../../../../config/stripe';
import { Donation } from './donation.model';
import { IDonation } from './donation.interface';
import QueryBuilder from '../../../builder/QueryBuilder';

const createDonationToDB = async (payload: IDonation, hostUrl: string) => {
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
    success_url: `${hostUrl}/donation/webhook?status=success`,
    cancel_url: `${hostUrl}/donation/webhook?status=failed`,
    customer_email: email,
    metadata: {
      paymentType: 'donation',
      name,
      email,
      amount: amount.toString(),
    },
  });


  return { paymentUrl: session.url };
};

const getAllDonationsFromDB = async (query: Record<string, any>) => {
  const qb = new QueryBuilder(Donation.find().populate({
    path: "applicant",
    select: "personal applicationPeriod",
    populate: {
      path: "applicationPeriod",
      select: "title startDate endDate"
    }
  }), query).search(['name', 'email', 'transactionId', "applicant.name"]).filter().sort().paginate().fields()

  const [transactions, pagination] = await Promise.all([
    qb.modelQuery.lean(),
    qb.getPaginationInfo()
  ])

  return { transactions, pagination }
};

const updateStatusToDB = async (status: string, res: any) => {


  if (status === "success") {

    res.redirect(`https://hubology-frontend.vercel.app/ifundayiti/payment-success`);
  }

  else if (status === "failed") {
    res.redirect(`https://hubology-frontend.vercel.app/ifundayiti/payment-cancel`);
  }
}

const getFundStatsFromDB = async () => {
  const stats = await Donation.aggregate([
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
      },
    },
  ]);

  if (stats.length === 0) {
    return {
      balance: 0,
      totalDonations: 0,
      totalGrants: 0,
    };
  }

  const { totalDonations, totalGrants } = stats[0];
  return {
    balance: totalDonations - totalGrants,
    totalDonations,
    totalGrants,
  };
};

export const DonationServices = {
  createDonationToDB,
  getAllDonationsFromDB,
  updateStatusToDB,
  getFundStatsFromDB
};
