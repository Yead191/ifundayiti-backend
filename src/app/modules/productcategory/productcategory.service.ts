import { Productcategory } from './productcategory.model';
import { IProductcategory } from './productcategory.interface';
import QueryBuilder from '../../builder/QueryBuilder';
import { JwtPayload } from 'jsonwebtoken';
import { USER_ROLES } from '../../../enums/user';
import { Types } from 'mongoose';
import ApiError from '../../../errors/ApiError';
import { StatusCodes } from 'http-status-codes';
import { Product } from '../product/product.model';

const createCategoryToDB = async (payload: IProductcategory) => {
  return await Productcategory.create(payload);
};

const getAllCategoriesFromDB = async (
  user: JwtPayload,
  query: Record<string, unknown>,
) => {
  const isAdmin = [USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN].includes(
    user?.role,
  );

  const initQuery: Record<string, unknown> = isAdmin
    ? {}
    : { status: 'active' };

  if (isAdmin && query.status) {
    initQuery.status = query.status;
  }

  const categoryQuery = new QueryBuilder(Productcategory.find(initQuery), query)
    .search(['name'])
    .filter()
    .sort()
    .paginate()
    .fields();

  const [result, pagination] = await Promise.all([
    categoryQuery.modelQuery.lean(),
    categoryQuery.getPaginationInfo(),
  ]);

  return {
    pagination,
    result,
  };
};

const getSingleCategoryFromDB = async (id: string) => {
  if (!Types.ObjectId.isValid(id)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid category ID.');
  }

  const category = await Productcategory.findById(id).lean();

  if (!category) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Category not found.');
  }

  return category;
};

const updateCategoryToDB = async (
  id: string,
  payload: Partial<IProductcategory>,
) => {
  if (!Types.ObjectId.isValid(id)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid category ID.');
  }

  const updatedCategory = await Productcategory.findByIdAndUpdate(
    id,
    { $set: payload },
    { new: true, runValidators: true },
  );

  if (!updatedCategory) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Category not found.');
  }

  return updatedCategory;
};

const deleteCategoryFromDB = async (id: string) => {
  if (!Types.ObjectId.isValid(id)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid category ID.');
  }

  const category = await Productcategory.findById(id);

  if (!category) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Category not found.');
  }

  // Prevent deleting category if it is referenced by existing products
  const productCount = await Product.countDocuments({ category: id });
  if (productCount > 0) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      `Cannot delete category. There are ${productCount} product(s) linked to this category.`,
    );
  }

  await Productcategory.findByIdAndDelete(id);
  return null;
};

export const ProductcategoryServices = {
  createCategoryToDB,
  getAllCategoriesFromDB,
  getSingleCategoryFromDB,
  updateCategoryToDB,
  deleteCategoryFromDB,
};
