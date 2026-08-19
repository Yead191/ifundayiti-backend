import { Product } from './book.model';
import QueryBuilder from '../../builder/QueryBuilder';
import { IProduct } from './book.interface';
import unlinkFile from '../../../shared/unlinkFile';
import ApiError from '../../../errors/ApiError';
import { StatusCodes } from 'http-status-codes';
import { sendNotificationToAllUsers } from '../notification/notification.util';
import { JwtPayload } from 'jsonwebtoken';
import stripe from '../../../config/stripe';
import config from '../../../config';
import { Digital } from '../digital/digital.model';
import { Coupon } from '../coupon/coupon.model';

const createBook = async (data: IProduct) => {
  const result = await Product.create(data);
  sendNotificationToAllUsers({
    title: 'New Product Published',
    message: `${result.title} is now available for purchase!`,
    path: `/${data?.type === 'digital' ? 'store' : 'office-supplies'}/${result._id}`,
  });
  return result;
};

const getAllBooks = async (query: Record<string, any>) => {
  const booksQuery = new QueryBuilder(Product.find(), query)
    .search(['title'])
    .filter()
    .fields()
    .paginate()
    .sort();

  const [books, pagination] = await Promise.all([
    booksQuery.modelQuery.lean(),
    booksQuery.getPaginationInfo(),
  ]);

  return { books, pagination };
};

const getSingleBook = async (id: string) => {
  const isExist = await Product.findById({ _id: id });
  if (!isExist) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Product not found');
  }
  return isExist;
};

const updateBook = async (id: string, payload: IProduct) => {
  const isExist = await Product.findById({ _id: id });
  if (!isExist) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Product not found');
  }

  if (payload.image && isExist.image !== payload.image) {
    unlinkFile(isExist.image);
  }
  if (payload.file && isExist.file !== payload.file) {
    unlinkFile(isExist.file!);
  }

  const result = await Product.findOneAndUpdate(
    { _id: id },
    {
      $set: payload,
    },
    { new: true },
  );
  return result;
};

const deleteBook = async (id: string) => {
  const isExist = await Product.findById({ _id: id });
  if (!isExist) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Product not found');
  }
  if (isExist.image) {
    unlinkFile(isExist.image);
  }
  if (isExist.file) {
    unlinkFile(isExist.file);
  }
  const result = await Product.deleteOne({ _id: id });
  return result;
};

const purchaseSingleProduct = async (
  user: JwtPayload,
  id: string,
  couponCode: string,
) => {
  const product = await Product.findById(id).lean();
  if (!product) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Product not found!');
  }

  const isBought = await Digital.findOne({ user: user.id, product: id });
  if (isBought) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'You already bought this product!',
    );
  }

  let coupon = null;
  if (couponCode) {
    coupon = await Coupon.checkCoupon(couponCode, user.id, product.price);
  }

  const imageUrl = product.image
    ? `http://${config.ip_address}:${config.port}/files${product.image.startsWith('/') ? product.image : `/${product.image}`}`
    : undefined;

  const line_items = [
    {
      price_data: {
        product_data: {
          name: product.title,
          description: product.description,
          images: imageUrl ? [imageUrl] : [],
        },
        currency: 'usd',
        unit_amount: Math.round(product.price * 100),
      },
      quantity: 1,
    },
  ];

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: line_items,
    mode: 'payment',
    success_url: `${config.frontend_url}/payment/success?type=digital`,
    cancel_url: `${config.frontend_url}/payment/failed?type=digital`,
    customer_email: user.email,
    metadata: {
      userId: user?.id!.toString(),
      productId: product._id.toString(),
      type: 'digital-shop',
      coupon: couponCode || '',
    },
    ...(couponCode
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
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Booking not created!');
  }

  return session.url;
};

export const BookServices = {
  createBook,
  getAllBooks,
  getSingleBook,
  updateBook,
  deleteBook,
  purchaseSingleProduct,
};
