import mongoose from 'mongoose';
import Stripe from 'stripe';
import { Product } from '../app/modules/product/product.model';
import { Digital } from '../app/modules/digital/digital.model';
import { User } from '../app/modules/user/user.model';
import { Transaction } from '../app/modules/transaction/transaction.model';
import { Coupon, CouponUser } from '../app/modules/coupon/coupon.model';
import {
  TRANSACTION_CATEGORY,
  TRANSACTION_STATUS,
  TRANSACTION_TYPE,
} from '../enums/transaction';
import { NotificationServices } from '../app/modules/notification/notification.service';
import { emailHelper } from '../helpers/emailHelper';
import { emailTemplate } from '../shared/emailTemplate';
import { USER_ROLES } from '../enums/user';
import config from '../config';

export const handleDigitalPurchase = async (
  payload: Stripe.Checkout.Session,
) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const userId = payload?.metadata?.userId;
    const productId = payload?.metadata?.productId;
    const couponCode = payload?.metadata?.coupon || '';

    if (!userId || !productId) {
      throw new Error('Missing userId or productId in metadata');
    }

    const productInfo = await Product.findById(productId).lean();
    if (!productInfo) {
      throw new Error('Product not found!');
    }
    await Product.findOneAndUpdate(
      { _id: productId },
      { $inc: { sold: 1 } },
      { new: true, session },
    );

    const user = await User.findById(userId).session(session);
    if (!user) {
      throw new Error('User not found!');
    }

    const originalPrice = payload?.amount_subtotal
      ? payload.amount_subtotal / 100
      : Number(productInfo.price) || 0;
    const amountPaid = payload?.amount_total
      ? payload.amount_total / 100
      : originalPrice;
    let discountAmount = payload?.total_details?.amount_discount
      ? payload.total_details.amount_discount / 100
      : originalPrice > amountPaid
        ? originalPrice - amountPaid
        : 0;

    let discountPercentage = 0;
    let couponDoc: any = null;

    if (couponCode) {
      couponDoc = await Coupon.findOne({ coupon_code: couponCode }).session(
        session,
      );

      if (couponDoc) {
        if (couponDoc.type === 'percentage') {
          discountPercentage = couponDoc.amount;
          if (!discountAmount) {
            discountAmount = (originalPrice * couponDoc.amount) / 100;
          }
        } else if (couponDoc.type === 'fixed') {
          discountPercentage = 0;
          if (!discountAmount) {
            discountAmount = couponDoc.amount;
          }
        }

        // Track user's coupon usage and increment total_uses
        await CouponUser.create(
          [
            {
              coupon: couponDoc._id,
              user: user._id,
            },
          ],
          { session },
        );
      }
    }

    const paymentTxnId = (payload?.payment_intent as string) || payload.id;

    // 1. Create Digital Record
    const digitalRecord = (
      await Digital.create(
        [
          {
            user: user._id,
            product: productInfo._id,
            price: amountPaid,
            paymentStatus: 'paid',
            paymentIntentId: paymentTxnId,
          },
        ],
        { session },
      )
    )[0];

    // 2. Create Transaction History (Category: SHOP)
    const transaction = (
      await Transaction.create(
        [
          {
            user: user._id,
            total_price: originalPrice,
            payment_received: amountPaid,
            discount_amount: discountAmount,
            discount_percentage: discountPercentage,
            status: TRANSACTION_STATUS.SUCCESS,
            type: TRANSACTION_TYPE.CREDIT,
            category: TRANSACTION_CATEGORY.SHOP,
            transaction_id: paymentTxnId,
          },
        ],
        { session },
      )
    )[0];

    await session.commitTransaction();
    session.endSession();

    // 3. Send Notifications to User & Admins
    if (user._id) {
      try {
        await NotificationServices.createNotification({
          receiver: user._id,
          title: 'Digital Product Purchased',
          message: `Your purchase of "${productInfo.title}" was successful!`,
          refId: digitalRecord._id,
          path: '/dashboard/digital',
        });
      } catch (notifErr) {
        console.error(
          '[Digital Purchase] Failed to send user notification:',
          notifErr,
        );
      }
    }

    try {
      await NotificationServices.sendNotificationToAdmins({
        title: 'New Digital Product Purchase',
        message: `${user.name || 'A customer'} purchased "${productInfo.title}" ($${amountPaid}).`,
        refId: digitalRecord._id,
        path: '/transactions',
      });
    } catch (notifErr) {
      console.error(
        '[Digital Purchase] Failed to send admin notification:',
        notifErr,
      );
    }

    // 4. Send Confirmation Email to User
    if (user.email) {
      try {
        const userEmailData = emailTemplate.orderConfirmation({
          email: user.email,
          name: user.name || 'Customer',
          orderId: productInfo.title,
          transactionId: transaction.transaction_id || paymentTxnId,
          items: [
            {
              title: productInfo.title,
              quantity: 1,
              unit_price: originalPrice,
              total_price: originalPrice,
            },
          ],
          productsPrice: originalPrice,
          originalPrice: originalPrice,
          couponCode: couponCode || undefined,
          discountAmount: discountAmount || undefined,
          totalPrice: amountPaid,
          formattedAddress: 'Digital Access',
        });
        await emailHelper.sendEmail(userEmailData);
      } catch (emailErr) {
        console.error(
          '[Digital Purchase] Failed to send user email:',
          emailErr,
        );
      }
    }

    // 5. Send Notification Email to Admins
    try {
      const admins = await User.find({
        $or: [{ role: USER_ROLES.ADMIN }, { role: USER_ROLES.SUPER_ADMIN }],
      });

      const adminEmails = Array.from(
        new Set(
          [...admins.map(a => a.email), config.super_admin.email].filter(
            Boolean,
          ),
        ),
      );

      for (const adminEmail of adminEmails) {
        const adminEmailData = emailTemplate.adminOrderNotification({
          adminEmail: adminEmail as string,
          adminName: 'Admin',
          customerName: user.name || 'Customer',
          customerEmail: user.email || 'N/A',
          orderId: productInfo.title,
          transactionId: transaction.transaction_id || paymentTxnId,
          items: [
            {
              title: productInfo.title,
              quantity: 1,
              unit_price: originalPrice,
              total_price: originalPrice,
            },
          ],
          productsPrice: originalPrice,
          originalPrice: originalPrice,
          couponCode: couponCode || undefined,
          discountAmount: discountAmount || undefined,
          totalPrice: amountPaid,
          formattedAddress: 'Digital Access',
        });
        await emailHelper.sendEmail(adminEmailData);
      }
    } catch (emailErr) {
      console.error('[Digital Purchase] Failed to send admin email:', emailErr);
    }

    return digitalRecord;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error('[Digital Purchase Error]:', error);
  }
};
