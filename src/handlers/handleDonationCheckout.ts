import mongoose from "mongoose";
import Stripe from "stripe";
import { Donation } from "../app/modules/iFundAyiti/donation/donation.model";
import { ProgramFund } from "../app/modules/iFundAyiti/programFund/programFund.model";
import { NotificationServices } from "../app/modules/notification/notification.service";
import { emailHelper } from "../helpers/emailHelper";
import { emailTemplate } from "../shared/emailTemplate";
import config from "../config";

export const handleDonationCheckout = async (data: Stripe.Checkout.Session) => {
    const mongoSession = await mongoose.startSession();
    try {
        mongoSession.startTransaction();

        const metadata = data?.metadata;

        if (metadata?.paymentType === 'donation') {
            const name = metadata.name;
            const email = metadata.email;
            const amount = Number(metadata.amount);

            if (name && email && !isNaN(amount)) {
                const donations = await Donation.create(
                    [
                        {
                            name,
                            email,
                            amount,
                            type: "donation",
                            transactionId: data.id,
                        },
                    ],
                    { session: mongoSession }
                );
                // const donationDoc = donations[0];
                await ProgramFund.updateOne(
                    {}
                    ,
                    {
                        $inc: { amount: amount },
                    },
                    { session: mongoSession }
                );
                NotificationServices.sendNotificationToAdmins({
                    title: "New Donation Received",
                    message: `${name} donated $${amount}`,
                    refId: donations[0]._id,
                    path: "/transactions"
                })
            }
        }

        console.log(`[Donation] Dontation create and fund add done`)

        await mongoSession.commitTransaction();
        mongoSession.endSession();

        if (metadata?.paymentType === 'donation') {
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
                    console.error("Failed to send donation receipt email to donor:", emailError);
                }

                // Send donation notification to admin
                try {
                    const adminEmail = config.super_admin.email;
                    if (adminEmail) {
                        const adminEmailData = emailTemplate.donationReceived({
                            adminEmail: adminEmail,
                            adminName: "Administrator",
                            donorName: name,
                            donorEmail: email,
                            amount: amount,
                            transactionId: data.id,
                        });
                        await emailHelper.sendEmail(adminEmailData);
                    }
                } catch (emailError) {
                    console.error("Failed to send donation received notification email to admin:", emailError);
                }
            }
        }

    } catch (error) {
        mongoSession.abortTransaction();
        mongoSession.endSession();
        console.log(error);
    }
};
