import mongoose from 'mongoose';
import Stripe from 'stripe';
import { Order } from '../app/modules/order/order.model';
import ApiError from '../errors/ApiError';
import { StatusCodes } from 'http-status-codes';
import { Transaction } from '../app/modules/transaction/transaction.model';
import { Coupon, CouponUser } from '../app/modules/coupon/coupon.model';
import {
  TRANSACTION_CATEGORY,
  TRANSACTION_STATUS,
  TRANSACTION_TYPE,
} from '../enums/transaction';
import { Cart } from '../app/modules/cart/cart.model';
import { NotificationServices } from '../app/modules/notification/notification.service';
import { emailHelper } from '../helpers/emailHelper';
import { emailTemplate } from '../shared/emailTemplate';
import { User } from '../app/modules/user/user.model';
import { USER_ROLES } from '../enums/user';
import config from '../config';

export const handleOrderPurchase = async (
  orderSession: Stripe.Checkout.Session,
) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();
    const metadata = orderSession?.metadata || {};
    const userId = metadata?.userId;
    const orderId = metadata?.orderId;
    const couponCode = metadata?.coupon || '';

    const orderDetails = await Order.findById(orderId)
      .populate('user')
      .session(session);

    if (!orderDetails) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Order not found');
    }

    const subtotal = orderSession?.amount_subtotal
      ? orderSession.amount_subtotal / 100
      : orderDetails.price_breakdown?.total_price || 0;
    const amountPaid = orderSession?.amount_total
      ? orderSession.amount_total / 100
      : subtotal;
    let discountAmount = orderSession?.total_details?.amount_discount
      ? orderSession.total_details.amount_discount / 100
      : subtotal > amountPaid
        ? subtotal - amountPaid
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
            discountAmount = (subtotal * couponDoc.amount) / 100;
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
              user: userId,
            },
          ],
          { session },
        );
      }
    }

    const paymentTxnId =
      (orderSession.payment_intent as string) || orderSession.id;

    const transaction = (
      await Transaction.create(
        [
          {
            user: userId,
            total_price: subtotal,
            payment_received: amountPaid,
            discount_amount: discountAmount,
            discount_percentage: discountPercentage,
            platform_fee: orderDetails.price_breakdown.serviceFee,
            status: TRANSACTION_STATUS.SUCCESS,
            type: TRANSACTION_TYPE.CREDIT,
            category: TRANSACTION_CATEGORY.SHOP,
            order: orderId,
            transaction_id: paymentTxnId,
          },
        ],
        { session },
      )
    )[0];

    await Order.findOneAndUpdate(
      { _id: orderId },
      {
        payment_status: 'paid',
        payment_intent_id: paymentTxnId,
        transaction_id: transaction.transaction_id,
        coupon: couponCode,
        discount_amount: discountAmount,
        discount_percentage: discountPercentage,
        'price_breakdown.discount_amount': discountAmount,
        'price_breakdown.total_price': amountPaid,
      },
    ).session(session);

    await Cart.deleteMany({ user: userId }).session(session);

    await session.commitTransaction();
    session.endSession();

    // Send Notifications & Emails after successful transaction commit
    const customer = orderDetails.user as any;
    const customerName = customer?.name || 'Customer';
    const customerEmail = customer?.email;

    // 1. Notification to User
    if (customer?._id) {
      try {
        await NotificationServices.createNotification({
          receiver: customer._id,
          title: 'Order Placed Successfully',
          message: `Your order #${orderDetails.order_id} has been placed successfully.`,
          refId: orderDetails._id,
          path: '/dashboard/orders',
        });
      } catch (notifErr) {
        console.error('Failed to create user notification:', notifErr);
      }
    }

    // 2. Notification to Admins
    try {
      await NotificationServices.sendNotificationToAdmins({
        title: 'New Order Received',
        message: `A new order #${orderDetails.order_id} was placed by ${customerName}.`,
        refId: orderDetails._id,
        path: '/store/orders',
      });
    } catch (notifErr) {
      console.error('Failed to send admin notification:', notifErr);
    }

    // 3. Email to User
    if (customerEmail) {
      try {
        const userEmailData = emailTemplate.orderConfirmation({
          email: customerEmail,
          name: customerName,
          orderId: orderDetails.order_id,
          transactionId: transaction.transaction_id,
          items: (orderDetails.items || []).map((item: any) => ({
            title: item.title,
            quantity: item.quantity,
            unit_price: item.unit_price,
            total_price: item.total_price,
          })),
          productsPrice: orderDetails.price_breakdown?.products_price,
          deliveryCharge: orderDetails.price_breakdown?.delivery_charge,
          serviceFee: orderDetails.price_breakdown?.serviceFee,
          tax: orderDetails.price_breakdown?.tax,
          totalPrice: amountPaid,
          originalPrice: subtotal,
          couponCode: couponCode || undefined,
          discountAmount: discountAmount || undefined,
          formattedAddress: orderDetails.formatted_address,
          contactNumber: orderDetails.contact_number,
        });
        await emailHelper.sendEmail(userEmailData);
      } catch (emailErr) {
        console.error(
          'Failed to send user order confirmation email:',
          emailErr,
        );
      }
    }

    // 4. Email to Admin(s)
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
          customerName,
          customerEmail: customerEmail || 'N/A',
          orderId: orderDetails.order_id,
          transactionId: transaction.transaction_id,
          items: (orderDetails.items || []).map((item: any) => ({
            title: item.title,
            quantity: item.quantity,
            unit_price: item.unit_price,
            total_price: item.total_price,
          })),
          productsPrice: orderDetails.price_breakdown?.products_price,
          deliveryCharge: orderDetails.price_breakdown?.delivery_charge,
          serviceFee: orderDetails.price_breakdown?.serviceFee,
          tax: orderDetails.price_breakdown?.tax,
          totalPrice: amountPaid,
          originalPrice: subtotal,
          couponCode: couponCode || undefined,
          discountAmount: discountAmount || undefined,
          formattedAddress: orderDetails.formatted_address,
        });
        await emailHelper.sendEmail(adminEmailData);
      }
    } catch (emailErr) {
      console.error('Failed to send admin order notification email:', emailErr);
    }
  } catch (error) {
    session.abortTransaction();
    session.endSession();
    console.log(error);
  }
};
