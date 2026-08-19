import { JwtPayload } from 'jsonwebtoken';
import { USER_ROLES } from '../../../enums/user';
import QueryBuilder from '../../builder/QueryBuilder';
import { Digital } from './digital.model';
import ApiError from '../../../errors/ApiError';
import { StatusCodes } from 'http-status-codes';

const getDigitalProducts = async (
  user: JwtPayload,
  query: Record<string, any>,
) => {
  const initQuery = [USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN].includes(
    user.role,
  )
    ? {
        paymentStatus: 'paid',
      }
    : {
        user: user.id,
        paymentStatus: 'paid',
      };

  const qb = new QueryBuilder(
    Digital.find(initQuery)
      .populate({
        path: 'user',
        select: 'name email role',
      })
      .populate({
        path: 'product',
        select: 'title image',
      }),
    query,
  )
    .search(['user.name', 'paymentIntentId', 'product.title'])
    .filter()
    .sort()
    .paginate()
    .fields();

  const [products, pagination] = await Promise.all([
    qb.modelQuery.lean(),
    qb.getPaginationInfo(),
  ]);

  return {
    products,
    pagination,
  };
};

const getMySingleProduct = async (user: JwtPayload, id: string) => {
  const isExist = await Digital.findOne({ product: id, user: user.id })
    .populate({
      path: 'user',
      select: 'name email role',
    })
    .populate({
      path: 'product',
      select: 'title image',
    });
  if (!isExist) {
    throw new ApiError(
      StatusCodes.BAD_GATEWAY,
      'You didnt bought this product!',
    );
  }
  return isExist;
};

export const DigitalServices = {
  getDigitalProducts,
  getMySingleProduct,
};
