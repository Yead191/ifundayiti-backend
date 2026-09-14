import mongoose from 'mongoose';
import Stripe from 'stripe';
import { Donation } from '../app/modules/iFundAyiti/donation/donation.model';
import { ProgramFund } from '../app/modules/iFundAyiti/programFund/programFund.model';
import { NotificationServices } from '../app/modules/notification/notification.service';
import { emailHelper } from '../helpers/emailHelper';
import { emailTemplate } from '../shared/emailTemplate';
import config from '../config';
import { Transaction } from '../app/modules/transaction/transaction.model';
import { User } from '../app/modules/user/user.model';
import {
  TRANSACTION_CATEGORY,
  TRANSACTION_STATUS,
  TRANSACTION_TYPE,
} from '../enums/transaction';

export const handleDonationCheckout = async (data: Stripe.Checkout.Session) => {
  const mongoSession = await mongoose.startSession();
  try {
    mongoSession.startTransaction();

    const metadata = data?.metadata;
    const isDonation =
      metadata?.paymentType === 'ifundayiti_donation' ||
      metadata?.paymentType === 'donation' ||
      (metadata?.project === 'ifundayiti' && (metadata?.amount || data?.amount_total));

    if (isDonation) {
      const name =
        metadata?.name || data?.customer_details?.name || 'Anonymous Donor';
      const email =
        metadata?.email ||
        data?.customer_email ||
        data?.customer_details?.email ||
        '';
      const amount =
        Number(metadata?.amount) ||
        (data?.amount_total ? data.amount_total / 100 : 0);

      if (amount > 0) {
        const donations = await Donation.create(
          [
            {
              name,
              email,
              amount,
              type: 'donation',
              transactionId: data.id,
            },
          ],
          { session: mongoSession },
        );

        await ProgramFund.updateOne(
          {},
          {
            $inc: { amount: amount },
          },
          { session: mongoSession },
        );

        // Find associated user if email matches
        const user = email
          ? await User.findOne({ email }).session(mongoSession)
          : null;

        const paymentTxnId =
          (typeof data.payment_intent === 'string'
            ? data.payment_intent
            : data.payment_intent?.id) || data.id;

        // Create transaction record for platform financial tracking
        await Transaction.create(
          [
            {
              user: user?._id,
              total_price: amount,
              amount: amount,
              payment_received: amount,
              type: TRANSACTION_TYPE.CREDIT,
              category: TRANSACTION_CATEGORY.DONATION,
              status: TRANSACTION_STATUS.SUCCESS,
              payment_method: 'stripe',
              payment_intent_id: paymentTxnId,
              transaction_id: paymentTxnId,
            },
          ],
          { session: mongoSession },
        );

        NotificationServices.sendNotificationToAdmins({
          title: 'New Donation Received',
          message: `${name} donated $${amount}`,
          refId: donations[0]._id,
          path: '/transactions',
        });
      }
    }

    console.log(`[Donation] Donation and transaction creation done`);

    await mongoSession.commitTransaction();
    mongoSession.endSession();

    if (isDonation && metadata) {
      const name = metadata.name;
      const email = metadata.email;
      const amount = Number(metadata.amount);

      if (name && email && !isNaN(amount)) {
        // Send donation receipt to donor
        try {
          const emailData = emailTemplate.donationReceipt({
            donorEmail: email,
            donorName: name,
            amount: amount,
            transactionId: data.id,
          });
          await emailHelper.sendEmail(emailData);
        } catch (emailError) {
          console.error(
            'Failed to send donation receipt email to donor:',
            emailError,
          );
        }

        // Send donation notification to admin
        try {
          const adminEmail = config.support.admin;
          if (adminEmail) {
            const adminEmailData = emailTemplate.donationReceived({
              adminEmail: adminEmail,
              adminName: 'Administrator',
              donorName: name,
              donorEmail: email,
              amount: amount,
              transactionId: data.id,
            });
            await emailHelper.sendEmail(adminEmailData);
          }
        } catch (emailError) {
          console.error(
            'Failed to send donation received notification email to admin:',
            emailError,
          );
        }
      }
    }
  } catch (error) {
    mongoSession.abortTransaction();
    mongoSession.endSession();
    console.log(error);
  }
};
