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
import {
  ORDER_STATUS,
  PAYMENT_STATUS,
  PRE_ORDER_STATUS,
} from '../app/modules/order/order.constants';
import { Product } from '../app/modules/product/product.model';

export const handleOrderPurchase = async (session: Stripe.Checkout.Session) => {
  const orderId = session.metadata?.orderId;

  if (!orderId) {
    throw new Error('Order ID missing from Stripe metadata');
  }

  const mongoSession = await mongoose.startSession();

  try {
    mongoSession.startTransaction();

    const order = await Order.findById(orderId).session(mongoSession);

    if (!order) {
      throw new Error('Order not found');
    }

    /*
     * Idempotency protection.
     *
     * Stripe can send the same webhook more than once.
     */
    if (order.payment_status === PAYMENT_STATUS.PAID) {
      await mongoSession.commitTransaction();

      return;
    }

    /*
     * Payment amount from Stripe.
     */
    const amountPaid = (session.amount_total || 0) / 100;

    /*
     * Make sure Stripe amount matches our order.
     */
    if (Math.abs(amountPaid - order.price_breakdown.total_price) > 0.01) {
      throw new Error('Stripe payment amount does not match order total');
    }

    /*
     * Process each order item.
     */
    for (const item of order.items) {
      /*
       * PRE-ORDER
       */
      if (item.isPreOrder) {
        item.preOrderStatus = PRE_ORDER_STATUS.CONFIRMED;

        continue;
      }

      /*
       * REGULAR PRODUCT
       *
       * Atomically decrease stock.
       */
      const updatedProduct = await Product.findOneAndUpdate(
        {
          _id: item.product,

          variants: {
            $elemMatch: {
              size: item.size,
              color: item.color,
              stock: {
                $gte: item.quantity,
              },
              isPreOrder: false,
            },
          },
        },
        {
          $inc: {
            'variants.$.stock': -item.quantity,
            sold: item.quantity,
          },
        },
        {
          new: true,
          session: mongoSession,
        },
      );

      if (!updatedProduct) {
        throw new Error(
          `Insufficient stock for ${item.name} (${item.size}/${item.color})`,
        );
      }
    }

    /*
     * Update order payment information.
     */
    order.payment_status = PAYMENT_STATUS.PAID;

    order.status = ORDER_STATUS.CONFIRMED;

    order.payment_intent_id =
      typeof session.payment_intent === 'string'
        ? session.payment_intent
        : session.payment_intent?.id;
    const transaction = await Transaction.create(
      [
        {
          user: order.user,
          amount: amountPaid,
          type: TRANSACTION_TYPE.DEBIT,
          category: TRANSACTION_CATEGORY.SHOP,
          status: TRANSACTION_STATUS.SUCCESS,
          payment_method: 'stripe',
          payment_intent_id: order.payment_intent_id,
          order: order._id,
        },
      ],
      {
        session: mongoSession,
      },
    );

    order.transaction_id = transaction[0]._id;
    await order.save({
      session: mongoSession,
    });

    /*
     * Remove cart only after successful payment
     * and successful inventory processing.
     */
    await Cart.deleteMany(
      {
        user: order.user,
      },
      {
        session: mongoSession,
      },
    );

    await mongoSession.commitTransaction();

    /*
     * Send notifications and emails AFTER transaction commit
     */
    try {
      const customer = await User.findById(order.user).lean();
      const customerName = customer?.name || 'Valued Customer';
      const customerEmail = customer?.email;

      // 1. Notification to Customer
      if (order.user) {
        try {
          await NotificationServices.createNotification({
            receiver: order.user,
            title: 'Order Confirmed',
            message: `Your order #${order.order_id} has been confirmed and paid successfully.`,
            refId: order._id,
            path: '/dashboard/orders',
          });
        } catch (notifErr) {
          console.error(
            'Failed to send order notification to customer:',
            notifErr,
          );
        }
      }

      // 2. Notification to Admins
      try {
        await NotificationServices.sendNotificationToAdmins({
          title: 'New Store Order Received',
          message: `A new order #${order.order_id} ($${Number(order.price_breakdown.total_price).toFixed(2)}) was placed by ${customerName}.`,
          refId: order._id,
          path: '/admin/orders',
        });
      } catch (notifErr) {
        console.error('Failed to send order notification to admins:', notifErr);
      }

      // 3. Confirmation Email to Customer
      if (customerEmail) {
        try {
          const userEmailData = emailTemplate.orderConfirmation({
            email: customerEmail,
            name: customerName,
            orderId: order.order_id,
            transactionId: order.payment_intent_id,
            items: order.items.map(item => ({
              name: item.name,
              size: item.size,
              color: item.color,
              quantity: item.quantity,
              price: item.price,
              total_price: item.total_price,
              isPreOrder: item.isPreOrder,
            })),
            subtotal: order.price_breakdown.subtotal,
            deliveryCharge: order.price_breakdown.delivery_charge,
            tax: order.price_breakdown.tax,
            discountAmount: order.price_breakdown.discount_amount,
            totalPrice: order.price_breakdown.total_price,
            formattedAddress: order.formatted_address,
            contactNumber: order.contact_number,
          });
          await emailHelper.sendEmail(userEmailData);
        } catch (emailErr) {
          console.error(
            'Failed to send customer order confirmation email:',
            emailErr,
          );
        }
      }

      // 4. Order Details Email to config.support.order (and Admin Support)
      const supportOrderEmail =
        config.support.order ||
        config.support.admin ||
        config.super_admin.email;

      if (supportOrderEmail) {
        try {
          const adminEmailData = emailTemplate.adminOrderNotification({
            adminEmail: supportOrderEmail,
            adminName: 'Store Administrator',
            customerName,
            customerEmail: customerEmail || 'N/A',
            customerPhone: order.contact_number,
            orderId: order.order_id,
            transactionId: order.payment_intent_id,
            items: order.items.map(item => ({
              name: item.name,
              size: item.size,
              color: item.color,
              quantity: item.quantity,
              price: item.price,
              total_price: item.total_price,
              isPreOrder: item.isPreOrder,
            })),
            subtotal: order.price_breakdown.subtotal,
            deliveryCharge: order.price_breakdown.delivery_charge,
            tax: order.price_breakdown.tax,
            discountAmount: order.price_breakdown.discount_amount,
            totalPrice: order.price_breakdown.total_price,
            formattedAddress: order.formatted_address,
          });
          await emailHelper.sendEmail(adminEmailData);
        } catch (emailErr) {
          console.error(
            'Failed to send admin order notification email:',
            emailErr,
          );
        }
      }
    } catch (postProcessErr) {
      console.error(
        'Error during post-order notifications and emails:',
        postProcessErr,
      );
    }

    return order;
  } catch (error) {
    await mongoSession.abortTransaction();

    console.error('Order purchase processing failed:', error);

    throw error;
  } finally {
    await mongoSession.endSession();
  }
};
