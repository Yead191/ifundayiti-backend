import { JwtPayload } from 'jsonwebtoken';
import { Cart } from '../cart/cart.model';
import ApiError from '../../../errors/ApiError';
import { StatusCodes } from 'http-status-codes';
import { CartHelper } from '../cart/cart.helper';
import { Order } from './order.model';
import config from '../../../config';
import stripe from '../../../config/stripe';
import QueryBuilder from '../../builder/QueryBuilder';
import { USER_ROLES } from '../../../enums/user';
import { NotificationServices } from '../notification/notification.service';
import { emailHelper } from '../../../helpers/emailHelper';
import { emailTemplate } from '../../../shared/emailTemplate';
import { logger } from '../../../shared/logger';
import Stripe from 'stripe';
import {
  ORDER_STATUS,
  PAYMENT_STATUS,
  PRE_ORDER_STATUS,
} from './order.constants';
import { Product } from '../product/product.model';
import { User } from '../user/user.model';
import mongoose from 'mongoose';

const createOrderToDB = async (
  user: JwtPayload,
  payload: {
    country: string;
    city: string;
    postal_code: string;
    street_address: string;
    contact_number: string;
  },
) => {
  const myCart = await Cart.find({
    user: user.id,
  })
    .populate('product', 'name images price variants status')
    .lean()
    .exec();

  if (!myCart || myCart.length === 0) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Cart is empty');
  }

  /*
   * Revalidate cart before creating order.
   */
  for (const cartItem of myCart) {
    const product: any = cartItem.product;

    if (!product) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        'A product in your cart no longer exists',
      );
    }

    if (product.status !== 'active') {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        `${product.name} is no longer available`,
      );
    }

    const variant = product.variants.find(
      (item: any) =>
        item.size.toLowerCase() === cartItem.size.toLowerCase() &&
        item.color.toLowerCase() === cartItem.color.toLowerCase(),
    );

    if (!variant) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        `${product.name} (${cartItem.size}/${cartItem.color}) is no longer available`,
      );
    }

    /*
     * Regular product
     */
    if (!variant.isPreOrder) {
      if (variant.stock < cartItem.quantity) {
        throw new ApiError(
          StatusCodes.BAD_REQUEST,
          `Only ${variant.stock} ${product.name} item(s) available`,
        );
      }
    }

    /*
     * Pre-order
     */
    if (variant.isPreOrder) {
      if (
        !variant.expectedAvailableDate ||
        new Date(variant.expectedAvailableDate) <= new Date()
      ) {
        throw new ApiError(
          StatusCodes.BAD_REQUEST,
          `Pre-order availability for ${product.name} is no longer valid`,
        );
      }
    }
  }

  /*
   * Calculate price from backend data.
   */
  const price_breakdown = CartHelper.calculateThePrice(myCart);

  const items = myCart.map((item: any) => {
    const product = item.product;

    const variant = product.variants.find(
      (variant: any) =>
        variant.size.toLowerCase() === item.size.toLowerCase() &&
        variant.color.toLowerCase() === item.color.toLowerCase(),
    );

    return {
      product: product._id,

      name: product.name,

      image: product.images?.[0],

      size: item.size,

      color: item.color,

      quantity: item.quantity,

      price: item.unit_price,

      total_price: item.unit_price * item.quantity,

      isPreOrder: Boolean(variant.isPreOrder),

      ...(variant.isPreOrder
        ? {
            expectedAvailableDate: variant.expectedAvailableDate,
            preOrderStatus: PRE_ORDER_STATUS.PENDING,
          }
        : {}),
    };
  });

  const order = await Order.create({
    user: user.id,

    items,

    price_breakdown,

    total_items: items.reduce((total, item) => total + item.quantity, 0),

    formatted_address: `${payload.street_address}, ${payload.city}, ${payload.postal_code}, ${payload.country}`,

    address_breakdown: payload,

    contact_number: payload.contact_number,

    status: ORDER_STATUS.PENDING,

    payment_status: PAYMENT_STATUS.PENDING,
  });

  if (!order) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Order creation failed');
  }

  /*
   * Stripe line items.
   */
  const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] = items.map(
    item => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: `${item.isPreOrder ? '[Pre-Order] ' : ''}${item.name} - ${item.size} / ${item.color}`,
          ...(item.isPreOrder && {
            description: `Pre-Order${
              item.expectedAvailableDate
                ? ` (Est. delivery: ${new Date(
                    item.expectedAvailableDate,
                  ).toLocaleDateString()})`
                : ''
            }`,
          }),
        },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.quantity,
    }),
  );

  /*
   * Delivery charge.
   */
  if (price_breakdown.delivery_charge > 0) {
    line_items.push({
      price_data: {
        currency: 'usd',

        product_data: {
          name: 'Delivery Charge',
        },

        unit_amount: Math.round(price_breakdown.delivery_charge * 100),
      },

      quantity: 1,
    });
  }

  /*
   * Tax.
   */
  if (price_breakdown.tax > 0) {
    line_items.push({
      price_data: {
        currency: 'usd',

        product_data: {
          name: 'Tax',
        },

        unit_amount: Math.round(price_breakdown.tax * 100),
      },

      quantity: 1,
    });
  }

  /*
   * Stripe Checkout.
   */
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],

    line_items,

    mode: 'payment',

    success_url: `${config.frontend_url}/payment/success?type=order`,

    cancel_url: `${config.frontend_url}/payment/failed?type=order`,

    customer_email: user.email,

    metadata: {
      userId: user.id!.toString(),
      orderId: order._id.toString(),
    },
  });

  if (!session.url) {
    await Order.findByIdAndDelete(order._id);

    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Unable to create payment session',
    );
  }

  return session.url;
};

const getOrdersFromDB = async (
  user: JwtPayload,
  query: Record<string, any>,
) => {
  const initQuery = [USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN].includes(
    user?.role,
  )
    ? { payment_status: PAYMENT_STATUS.PAID }
    : { user: user.id, payment_status: PAYMENT_STATUS.PAID };

  const qb = new QueryBuilder(
    Order.find(initQuery).populate([
      {
        path: 'user',
        select: 'name email image contact_number',
      },
      {
        path: 'items.product',
        select: 'name images sold variants category',
      },
    ]),
    query,
  )
    .search([
      'order_id',
      'contact_number',
      'formatted_address',
      'items.name',
      'status',
      'payment_status',
    ])
    .filter()
    .paginate()
    .sort()
    .fields();

  const [orders, pagination] = await Promise.all([
    qb.modelQuery.lean(),
    qb.getPaginationInfo(),
  ]);
  return { orders, pagination };
};

const getSingleOrderFromDB = async (user: JwtPayload, id: string) => {
  const isSuperAdminOrAdmin = [
    USER_ROLES.SUPER_ADMIN,
    USER_ROLES.ADMIN,
  ].includes(user?.role);

  const filter = isSuperAdminOrAdmin ? { _id: id } : { _id: id, user: user.id };

  const order = await Order.findOne(filter).populate([
    {
      path: 'user',
      select: 'name email image contact_number',
    },
    {
      path: 'items.product',
      select: 'name images sold variants category',
    },
    {
      path: 'transaction_id',
    },
  ]);

  if (!order) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Order not found');
  }

  return order;
};

const changeOrderStatus = async (id: string, status: ORDER_STATUS) => {
  const order = await Order.findById(id).populate('user');
  if (!order) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Order not found');
  }

  if (
    [ORDER_STATUS.DELIVERED, ORDER_STATUS.CANCELLED].includes(order?.status)
  ) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      `Order is already ${order.status}!`,
    );
  }

  const updatedOrder = await Order.findByIdAndUpdate(
    id,
    { status: status },
    { new: true },
  ).populate('user');

  if (!updatedOrder) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Failed to update order status',
    );
  }

  const customer = updatedOrder.user as any;

  // 1. Send in-app notification to the user
  if (customer?._id) {
    try {
      await NotificationServices.createNotification({
        receiver: customer._id,
        title: 'Order Status Updated',
        message: `Your order #${updatedOrder.order_id} status has been changed to ${status.toUpperCase()}.`,
        refId: updatedOrder._id,
        path: '/dashboard/orders',
      });
    } catch (notifErr) {
      logger.error('Error sending order status notification:', notifErr);
    }
  }

  // 2. Send status update email to the user
  if (customer?.email) {
    try {
      const emailData = emailTemplate.orderStatusUpdate({
        email: customer.email,
        name: customer.name || 'Valued Customer',
        orderId: updatedOrder.order_id,
        status: status,
        formattedAddress: updatedOrder.formatted_address,
        totalPrice: updatedOrder.price_breakdown?.total_price || 0,
        items: (updatedOrder.items || []).map(item => ({
          name: item.name,
          size: item.size,
          color: item.color,
          quantity: item.quantity,
          price: item.price,
          total_price: item.total_price,
        })),
      });
      await emailHelper.sendEmail(emailData);
    } catch (emailErr) {
      logger.error('Error sending order status email:', emailErr);
    }
  }

  return updatedOrder;
};

const markPreOrderReadyToDB = async (orderId: string, itemIndex: number) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    // Find order
    const order = await Order.findById(orderId).session(session);

    if (!order) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Order not found');
    }

    // Order must be paid
    if (order.payment_status !== PAYMENT_STATUS.PAID) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        'Only paid orders can be fulfilled',
      );
    }

    // Find order item
    if (isNaN(itemIndex) || itemIndex < 0 || itemIndex >= order.items.length) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid order item index');
    }

    const item = order.items[itemIndex];

    if (!item) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Order item not found');
    }

    // Must be preorder
    if (!item.isPreOrder) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        'This order item is not a pre-order',
      );
    }

    // Must currently be confirmed
    if (item.preOrderStatus !== PRE_ORDER_STATUS.CONFIRMED) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        `This pre-order is already ${item.preOrderStatus}`,
      );
    }

    // Find product
    const product = await Product.findById(item.product).session(session);

    if (!product) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Product not found');
    }

    // Find exact variant
    const variant = product.variants.find(
      variant =>
        variant.size.toLowerCase() === item.size.toLowerCase() &&
        variant.color.toLowerCase() === item.color.toLowerCase(),
    );

    if (!variant) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Product variant not found');
    }

    // Check current stock from Product
    if (variant.stock < item.quantity) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        `Not enough stock in inventory. Required: ${item.quantity}, Available in stock: ${variant.stock}`,
      );
    }

    // FIFO check: ensure earlier confirmed pre-orders for this same variant are fulfilled first
    const olderPreOrder = await Order.findOne({
      _id: { $ne: order._id },
      payment_status: PAYMENT_STATUS.PAID,
      createdAt: {
        $lt: order.createdAt,
      },
      items: {
        $elemMatch: {
          product: item.product,
          size: variant.size,
          color: variant.color,
          isPreOrder: true,
          preOrderStatus: PRE_ORDER_STATUS.CONFIRMED,
        },
      },
    })
      .sort({ createdAt: 1 })
      .session(session);

    if (olderPreOrder) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        `An older pre-order (#${olderPreOrder.order_id}) for this variant must be fulfilled first.`,
      );
    }

    // Atomically decrease stock and increase sold
    const result = await Product.updateOne(
      {
        _id: product._id,
        variants: {
          $elemMatch: {
            size: variant.size,
            color: variant.color,
            stock: { $gte: item.quantity },
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
        session,
      },
    );

    if (result.modifiedCount === 0) {
      throw new ApiError(
        StatusCodes.CONFLICT,
        'Stock changed while processing this pre-order. Please try again.',
      );
    }

    // Mark preorder as ready
    item.preOrderStatus = PRE_ORDER_STATUS.READY;

    await order.save({
      session,
    });

    await session.commitTransaction();

    // Fetch customer details for notification & email
    const customer = await User.findById(order.user).lean();
    const customerName = customer?.name || 'Valued Customer';
    const customerEmail = customer?.email;

    // 1. Send customer in-app notification
    if (order.user) {
      try {
        await NotificationServices.createNotification({
          receiver: order.user,
          title: 'Pre-Order Ready!',
          message: `Good news! Your pre-ordered item "${item.name} (${item.size}/${item.color})" in order #${order.order_id} is now prepared and ready for shipment.`,
          refId: order._id,
          path: '/dashboard/orders',
        });
      } catch (notifErr) {
        logger.error('Error sending pre-order ready notification:', notifErr);
      }
    }

    // 2. Send customer email notification
    if (customerEmail) {
      try {
        const emailData = emailTemplate.preOrderReady({
          email: customerEmail,
          name: customerName,
          orderId: order.order_id,
          productName: item.name,
          size: item.size,
          color: item.color,
          quantity: item.quantity,
          formattedAddress: order.formatted_address,
          totalPrice: order.price_breakdown?.total_price,
        });
        await emailHelper.sendEmail(emailData);
      } catch (emailErr) {
        logger.error('Error sending pre-order ready email:', emailErr);
      }
    }

    return order;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    await session.endSession();
  }
};

const deleteOrderFromDB = async (id: string) => {
  const isExist = await Order.findById(id);
  if (!isExist) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Order not found');
  }

  const result = await Order.findByIdAndDelete(id);
  return result;
};

const getOrderStatsFromDB = async (user?: JwtPayload) => {
  const now = new Date();
  const startOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    0,
    0,
    0,
    0,
  );
  const startOfMonth = new Date(
    now.getFullYear(),
    now.getMonth(),
    1,
    0,
    0,
    0,
    0,
  );

  const matchStage: Record<string, any> = {};
  if (user && ![USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN].includes(user.role)) {
    matchStage.user = new mongoose.Types.ObjectId(user.id);
  }

  const [stats] = await Order.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: null,
        // 1. Order Status Counts
        totalOrders: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $eq: ['$payment_status', PAYMENT_STATUS.PAID] },
                  { $ne: ['$status', ORDER_STATUS.CANCELLED] },
                ],
              },
              1,
              0,
            ],
          },
        }, //only paid orders
        pendingOrders: {
          $sum: { $cond: [{ $eq: ['$status', ORDER_STATUS.PENDING] }, 1, 0] },
        },
        confirmedOrders: {
          $sum: { $cond: [{ $eq: ['$status', ORDER_STATUS.CONFIRMED] }, 1, 0] },
        },
        processingOrders: {
          $sum: {
            $cond: [{ $eq: ['$status', ORDER_STATUS.PROCESSING] }, 1, 0],
          },
        },
        shippedOrders: {
          $sum: { $cond: [{ $eq: ['$status', ORDER_STATUS.SHIPPED] }, 1, 0] },
        },
        deliveredOrders: {
          $sum: { $cond: [{ $eq: ['$status', ORDER_STATUS.DELIVERED] }, 1, 0] },
        },
        cancelledOrders: {
          $sum: { $cond: [{ $eq: ['$status', ORDER_STATUS.CANCELLED] }, 1, 0] },
        },

        // 2. Payment Status Counts
        paidOrders: {
          $sum: {
            $cond: [{ $eq: ['$payment_status', PAYMENT_STATUS.PAID] }, 1, 0],
          },
        },
        pendingPaymentOrders: {
          $sum: {
            $cond: [{ $eq: ['$payment_status', PAYMENT_STATUS.PENDING] }, 1, 0],
          },
        },
        failedOrders: {
          $sum: {
            $cond: [{ $eq: ['$payment_status', PAYMENT_STATUS.FAILED] }, 1, 0],
          },
        },
        refundedOrders: {
          $sum: {
            $cond: [
              { $eq: ['$payment_status', PAYMENT_STATUS.REFUNDED] },
              1,
              0,
            ],
          },
        },

        // 3. Time-based Volume
        todayOrders: {
          $sum: {
            $cond: [{ $gte: ['$createdAt', startOfToday] }, 1, 0],
          },
        },
        thisMonthOrders: {
          $sum: {
            $cond: [{ $gte: ['$createdAt', startOfMonth] }, 1, 0],
          },
        },

        // 4. Financial Metrics (Computed directly on paid & non-cancelled orders)
        totalRevenue: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $eq: ['$payment_status', PAYMENT_STATUS.PAID] },
                  { $ne: ['$status', ORDER_STATUS.CANCELLED] },
                ],
              },
              { $ifNull: ['$price_breakdown.total_price', 0] },
              0,
            ],
          },
        },
        totalSubtotal: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $eq: ['$payment_status', PAYMENT_STATUS.PAID] },
                  { $ne: ['$status', ORDER_STATUS.CANCELLED] },
                ],
              },
              { $ifNull: ['$price_breakdown.subtotal', 0] },
              0,
            ],
          },
        },
        totalDeliveryCharges: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $eq: ['$payment_status', PAYMENT_STATUS.PAID] },
                  { $ne: ['$status', ORDER_STATUS.CANCELLED] },
                ],
              },
              { $ifNull: ['$price_breakdown.delivery_charge', 0] },
              0,
            ],
          },
        },
        totalTaxCollected: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $eq: ['$payment_status', PAYMENT_STATUS.PAID] },
                  { $ne: ['$status', ORDER_STATUS.CANCELLED] },
                ],
              },
              { $ifNull: ['$price_breakdown.tax', 0] },
              0,
            ],
          },
        },
        totalDiscountAmount: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $eq: ['$payment_status', PAYMENT_STATUS.PAID] },
                  { $ne: ['$status', ORDER_STATUS.CANCELLED] },
                ],
              },
              { $ifNull: ['$price_breakdown.discount_amount', 0] },
              0,
            ],
          },
        },
        totalItemsSold: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $eq: ['$payment_status', PAYMENT_STATUS.PAID] },
                  { $ne: ['$status', ORDER_STATUS.CANCELLED] },
                ],
              },
              { $ifNull: ['$total_items', 0] },
              0,
            ],
          },
        },
        todayRevenue: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $gte: ['$createdAt', startOfToday] },
                  { $eq: ['$payment_status', PAYMENT_STATUS.PAID] },
                  { $ne: ['$status', ORDER_STATUS.CANCELLED] },
                ],
              },
              { $ifNull: ['$price_breakdown.total_price', 0] },
              0,
            ],
          },
        },
        thisMonthRevenue: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $gte: ['$createdAt', startOfMonth] },
                  { $eq: ['$payment_status', PAYMENT_STATUS.PAID] },
                  { $ne: ['$status', ORDER_STATUS.CANCELLED] },
                ],
              },
              { $ifNull: ['$price_breakdown.total_price', 0] },
              0,
            ],
          },
        },

        // 5. Pre-Order Metrics (Zero $unwind: streaming $reduce over in-document arrays)
        totalPreOrderItems: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $eq: ['$payment_status', PAYMENT_STATUS.PAID] },
                  { $ne: ['$status', ORDER_STATUS.CANCELLED] },
                ],
              },
              {
                $reduce: {
                  input: {
                    $filter: {
                      input: '$items',
                      as: 'item',
                      cond: { $eq: ['$$item.isPreOrder', true] },
                    },
                  },
                  initialValue: 0,
                  in: { $add: ['$$value', '$$this.quantity'] },
                },
              },
              0,
            ],
          },
        },
        confirmedPreOrders: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $eq: ['$payment_status', PAYMENT_STATUS.PAID] },
                  { $ne: ['$status', ORDER_STATUS.CANCELLED] },
                ],
              },
              {
                $reduce: {
                  input: {
                    $filter: {
                      input: '$items',
                      as: 'item',
                      cond: {
                        $and: [
                          { $eq: ['$$item.isPreOrder', true] },
                          {
                            $eq: [
                              '$$item.preOrderStatus',
                              PRE_ORDER_STATUS.CONFIRMED,
                            ],
                          },
                        ],
                      },
                    },
                  },
                  initialValue: 0,
                  in: { $add: ['$$value', '$$this.quantity'] },
                },
              },
              0,
            ],
          },
        },
        readyPreOrders: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $eq: ['$payment_status', PAYMENT_STATUS.PAID] },
                  { $ne: ['$status', ORDER_STATUS.CANCELLED] },
                ],
              },
              {
                $reduce: {
                  input: {
                    $filter: {
                      input: '$items',
                      as: 'item',
                      cond: {
                        $and: [
                          { $eq: ['$$item.isPreOrder', true] },
                          {
                            $eq: [
                              '$$item.preOrderStatus',
                              PRE_ORDER_STATUS.READY,
                            ],
                          },
                        ],
                      },
                    },
                  },
                  initialValue: 0,
                  in: { $add: ['$$value', '$$this.quantity'] },
                },
              },
              0,
            ],
          },
        },
        completedPreOrders: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $eq: ['$payment_status', PAYMENT_STATUS.PAID] },
                  { $ne: ['$status', ORDER_STATUS.CANCELLED] },
                ],
              },
              {
                $reduce: {
                  input: {
                    $filter: {
                      input: '$items',
                      as: 'item',
                      cond: {
                        $and: [
                          { $eq: ['$$item.isPreOrder', true] },
                          {
                            $eq: [
                              '$$item.preOrderStatus',
                              PRE_ORDER_STATUS.COMPLETED,
                            ],
                          },
                        ],
                      },
                    },
                  },
                  initialValue: 0,
                  in: { $add: ['$$value', '$$this.quantity'] },
                },
              },
              0,
            ],
          },
        },
      },
    },
  ]);

  return {
    // Total & Fulfillment Statuses
    totalOrders: stats?.totalOrders || 0,
    pendingOrders: stats?.pendingOrders || 0,
    confirmedOrders: stats?.confirmedOrders || 0,
    processingOrders: stats?.processingOrders || 0,
    shippedOrders: stats?.shippedOrders || 0,
    deliveredOrders: stats?.deliveredOrders || 0,
    cancelledOrders: stats?.cancelledOrders || 0,

    // Payment Statuses
    paidOrders: stats?.paidOrders || 0,
    pendingPaymentOrders: stats?.pendingPaymentOrders || 0,
    failedOrders: stats?.failedOrders || 0,
    refundedOrders: stats?.refundedOrders || 0,

    // Financial & Revenue
    totalRevenue: stats?.totalRevenue || 0,
    totalSubtotal: stats?.totalSubtotal || 0,
    totalDeliveryCharges: stats?.totalDeliveryCharges || 0,
    totalTaxCollected: stats?.totalTaxCollected || 0,
    totalDiscountAmount: stats?.totalDiscountAmount || 0,
    totalItemsSold: stats?.totalItemsSold || 0,
    todayRevenue: stats?.todayRevenue || 0,
    thisMonthRevenue: stats?.thisMonthRevenue || 0,

    // Time-based Order Counts
    todayOrders: stats?.todayOrders || 0,
    thisMonthOrders: stats?.thisMonthOrders || 0,

    // Pre-Orders
    totalPreOrderItems: stats?.totalPreOrderItems || 0,
    confirmedPreOrders: stats?.confirmedPreOrders || 0,
    readyPreOrders: stats?.readyPreOrders || 0,
    completedPreOrders: stats?.completedPreOrders || 0,
  };
};

export const OrderServices = {
  createOrderToDB,
  getOrdersFromDB,
  getSingleOrderFromDB,
  changeOrderStatus,
  markPreOrderReadyToDB,
  deleteOrderFromDB,
  getOrderStatsFromDB,
};
