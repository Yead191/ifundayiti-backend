import { JwtPayload } from 'jsonwebtoken';
import { OrderPayload } from './order.interface';
import { Cart } from '../cart/cart.model';
import ApiError from '../../../errors/ApiError';
import { StatusCodes } from 'http-status-codes';
import { CartHelper } from '../cart/cart.helper';
import { Order } from './order.model';
import config from '../../../config';
import stripe from '../../../config/stripe';
import QueryBuilder from '../../builder/QueryBuilder';
import { USER_ROLES } from '../../../enums/user';
import { ORDER_STATUS } from '../../../enums/orders';
import { NotificationServices } from '../notification/notification.service';
import { emailHelper } from '../../../helpers/emailHelper';
import { emailTemplate } from '../../../shared/emailTemplate';
import { logger } from '../../../shared/logger';
import { Coupon } from '../coupon/coupon.model';

const createOrderToDb = async (user: JwtPayload, payload: OrderPayload) => {
  const myCart = await Cart.find({ user: user.id })
    .populate('product', 'title image')
    .lean()
    .exec();

  if (!myCart || myCart.length === 0) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Cart is empty');
  }
  const price_breakdown = CartHelper.calculateThePrice(myCart);

  let coupon = null;
  if (payload?.coupon) {
    coupon = await Coupon.checkCoupon(
      payload.coupon,
      user.id,
      price_breakdown.total_price,
    );
  }

  const items = myCart.map((item: any) => ({
    title: item.product.title,
    image: item.product.image,
    quantity: item.quantity,
    unit_price: item.unit_price,
    total_price: item.total_price,
  }));
  // console.log(items);

  const order = {
    user: user.id,
    items,
    price_breakdown,
    formatted_address: `${payload.street_address}, ${payload.city}, ${payload.postal_code}, ${payload.country}`,
    address_breakdown: payload,
    contact_number: payload.contact_number,
    total_items: items.length,
    coupon: payload.coupon || '',
  };
  const line_items = myCart.map((item: any) => ({
    price_data: {
      currency: 'usd',
      product_data: {
        name: item.product.title,
        images: [
          `http://${config.ip_address}:${config.port}/files/${item.product.image}`,
        ],
      },
      unit_amount: Math.round(item.unit_price * 100),
    },
    quantity: item.quantity,
  }));
  if (price_breakdown.delivery_charge) {
    line_items.push({
      price_data: {
        currency: 'usd',
        product_data: {
          name: 'Delivery Charge',
          images: [],
        },
        unit_amount: Math.round(price_breakdown.delivery_charge * 100),
      },
      quantity: 1,
    });
  }
  if (price_breakdown.serviceFee) {
    line_items.push({
      price_data: {
        currency: 'usd',
        product_data: {
          name: 'Service Fee',
          images: [],
        },
        unit_amount: Math.round(price_breakdown.serviceFee * 100),
      },
      quantity: 1,
    });
  }
  //   tax
  if (price_breakdown.tax) {
    line_items.push({
      price_data: {
        currency: 'usd',
        product_data: {
          name: 'Tax',
          images: [],
        },
        unit_amount: Math.round(price_breakdown.tax * 100),
      },
      quantity: 1,
    });
  }

  const createOrder = await Order.create(order);
  if (!createOrder) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Order creation failed');
  }

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items,
    mode: 'payment',
    success_url: `${config.frontend_url}/payment/success?type=checkout`,
    cancel_url: `${config.frontend_url}/payment/failed?type=checkout`,
    customer_email: user.email,
    metadata: {
      userId: user.id!,
      orderId: createOrder._id.toString()!,
      coupon: payload.coupon || '',
    },
    ...(payload.coupon
      ? {
          discounts: [
            {
              coupon: coupon?.stripe_coupon_code,
            },
          ],
        }
      : {}),
  });
  if (!session.url) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Order not created!');
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
    ? { payment_status: 'paid' }
    : { user: user.id, payment_status: 'paid' };

  const qb = new QueryBuilder(
    Order.find(initQuery).populate({
      path: 'user',
      select: 'name email image',
    }),
    query,
  )
    .search([
      'title',
      'order_id',
      'transaction_id',
      'contact_number',
      'payment_intent_id',
      'coupon',
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

const changeOrderStatus = async (id: string, status: ORDER_STATUS) => {
  const order = await Order.findById(id).populate('user');
  if (!order) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Order not found');
  }

  if ([ORDER_STATUS.DELIVERD, ORDER_STATUS.CANCELLED].includes(order.status)) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      `Order already ${order.status}!`,
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

  // 1. Send notification to user
  if (customer?._id) {
    try {
      await NotificationServices.createNotification({
        receiver: customer._id,
        title: 'Order Status Updated',
        message: `Your order #${updatedOrder.order_id} status has been changed to ${status}.`,
        refId: updatedOrder._id,
        path: '/orders',
      });
    } catch (notifErr) {
      logger.error('Error sending order status notification:', notifErr);
    }
  }

  // 2. Send email to user
  if (customer?.email) {
    try {
      const emailData = emailTemplate.orderStatusUpdate({
        email: customer.email,
        name: customer.name || 'Customer',
        orderId: updatedOrder.order_id,
        status: status,
        formattedAddress: updatedOrder.formatted_address,
        totalPrice: updatedOrder.price_breakdown?.total_price || 0,
      });
      await emailHelper.sendEmail(emailData);
    } catch (emailErr) {
      logger.error('Error sending order status email:', emailErr);
    }
  }

  return updatedOrder;
};

export const OrderServices = {
  createOrderToDb,
  getOrdersFromDB,
  changeOrderStatus,
};
