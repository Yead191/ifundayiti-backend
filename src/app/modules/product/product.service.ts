import { Product } from './product.model';
import QueryBuilder from '../../builder/QueryBuilder';
import { IProduct } from './product.interface';
import unlinkFile from '../../../shared/unlinkFile';
import ApiError from '../../../errors/ApiError';
import { StatusCodes } from 'http-status-codes';
import { JwtPayload } from 'jsonwebtoken';
import { ProductValidations } from './product.validation';
import { USER_ROLES } from '../../../enums/user';
import { Types } from 'mongoose';
import { IProductVariant } from './product.constants';

const { validateVariants, validateCategory, validatePrice } =
  ProductValidations;

// Safe parser for multipart/form-data stringified fields
const parseIfString = <T>(value: unknown): T => {
  if (typeof value === 'string') {
    try {
      return JSON.parse(value) as T;
    } catch {
      return value as T;
    }
  }
  return value as T;
};

// Normalize variant objects
const normalizeVariants = (variants: IProductVariant[]): IProductVariant[] => {
  return variants.map(variant => ({
    ...variant,
    size: variant.size.trim(),
    color: variant.color.trim(),
    stock: Number(variant.stock) || 0,
    isPreOrder: Boolean(variant.isPreOrder),
    expectedAvailableDate: variant.expectedAvailableDate
      ? new Date(variant.expectedAvailableDate)
      : undefined,
  }));
};

// ======================================================
// Create Product
// ======================================================

const createProductToDB = async (payload: IProduct) => {
  try {
    if (payload.variants) {
      payload.variants = parseIfString<IProductVariant[]>(payload.variants);
    }
    if (payload.tags) {
      payload.tags = parseIfString<string[]>(payload.tags);
    }

    await validateCategory(payload.category);
    validatePrice(payload.price, payload.compareAtPrice);
    validateVariants(payload.variants);

    payload.variants = normalizeVariants(payload.variants);

    return await Product.create(payload);
  } catch (error) {
    if (payload.images?.length) {
      for (const image of payload.images) {
        unlinkFile(image);
      }
    }
    throw error;
  }
};

// ======================================================
// Get All Products
// ======================================================

const getAllProductsFromDB = async (
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

  if (query.minPrice !== undefined || query.maxPrice !== undefined) {
    const priceFilter: Record<string, number> = {};
    if (query.minPrice !== undefined) priceFilter.$gte = Number(query.minPrice);
    if (query.maxPrice !== undefined) priceFilter.$lte = Number(query.maxPrice);
    initQuery.price = priceFilter;
  }

  const productQuery = new QueryBuilder(
    Product.find(initQuery).populate('category', 'name'),
    query,
  )
    .search(['name', 'description', 'tags'])
    .filter()
    .sort()
    .paginate()
    .fields();

  const [result, pagination] = await Promise.all([
    productQuery.modelQuery.lean(),
    productQuery.getPaginationInfo(),
  ]);

  return {
    pagination,
    result,
  };
};

// ======================================================
// Get Single Product
// ======================================================

const getSingleProductFromDB = async (user: JwtPayload, id: string) => {
  if (!Types.ObjectId.isValid(id)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid product ID.');
  }

  const isAdmin = [USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN].includes(
    user?.role,
  );

  const filter: Record<string, unknown> = { _id: id };
  if (!isAdmin) {
    filter.status = 'active';
  }

  const product = await Product.findOne(filter)
    .populate('category', 'name')
    .lean();

  if (!product) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Product not found.');
  }

  return product;
};

// ======================================================
// Update Product
// ======================================================

const updateProductToDB = async (id: string, payload: Partial<IProduct>) => {
  if (!Types.ObjectId.isValid(id)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid product ID.');
  }

  const existingProduct = await Product.findById(id);
  if (!existingProduct) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Product not found.');
  }

  if (payload.variants) {
    payload.variants = parseIfString<IProductVariant[]>(payload.variants);
  }
  if (payload.tags) {
    payload.tags = parseIfString<string[]>(payload.tags);
  }
  if (payload.images) {
    payload.images = parseIfString<string[]>(payload.images);
  }

  if (payload.category) {
    await validateCategory(payload.category);
  }

  if (payload.price !== undefined || payload.compareAtPrice !== undefined) {
    validatePrice(
      payload.price ?? existingProduct.price,
      payload.compareAtPrice ?? existingProduct.compareAtPrice,
    );
  }

  if (payload.variants) {
    validateVariants(payload.variants);
    payload.variants = normalizeVariants(payload.variants);
  }

  const oldImages = existingProduct.images || [];
  if (payload.images) {
    payload.images = payload.images.filter(Boolean);
  }

  try {
    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      { $set: payload },
      { new: true, runValidators: true },
    ).populate('category', 'name');

    if (!updatedProduct) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Product not found.');
    }

    if (payload.images) {
      const newImagesSet = new Set(payload.images);
      const removedImages = oldImages.filter(image => !newImagesSet.has(image));

      for (const image of removedImages) {
        unlinkFile(image);
      }
    }

    return updatedProduct;
  } catch (error) {
    if (payload.images) {
      const oldImageSet = new Set(oldImages);
      const newUploadedImages = payload.images.filter(
        image => !oldImageSet.has(image),
      );

      for (const image of newUploadedImages) {
        unlinkFile(image);
      }
    }
    throw error;
  }
};

// ======================================================
// Delete Product
// ======================================================

const deleteProductFromDB = async (id: string) => {
  if (!Types.ObjectId.isValid(id)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid product ID.');
  }

  const product = await Product.findById(id);
  if (!product) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Product not found.');
  }

  if (product.sold > 0) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Products with existing sales history cannot be deleted. Please archive the product instead.',
    );
  }

  await Product.findByIdAndDelete(id);

  if (product.images?.length) {
    for (const image of product.images) {
      unlinkFile(image);
    }
  }

  return null;
};

// ======================================================
// Update Product Status
// ======================================================

const updateProductStatusToDB = async (
  id: string,
  status: IProduct['status'],
) => {
  if (!Types.ObjectId.isValid(id)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid product ID.');
  }

  const product = await Product.findByIdAndUpdate(
    id,
    { $set: { status } },
    { new: true, runValidators: true },
  ).populate('category', 'name');

  if (!product) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Product not found.');
  }

  return product;
};

// ======================================================
// Toggle Featured
// ======================================================

const toggleProductFeaturedToDB = async (id: string) => {
  if (!Types.ObjectId.isValid(id)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid product ID.');
  }

  const product = await Product.findById(id);
  if (!product) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Product not found.');
  }

  product.featured = !product.featured;
  await product.save();

  return product;
};

// ======================================================
// Update Variant Stock
// ======================================================

const updateProductVariantStockToDB = async (
  productId: string,
  size: string,
  color: string,
  stock: number,
) => {
  if (!Types.ObjectId.isValid(productId)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid product ID.');
  }

  if (!size?.trim() || !color?.trim()) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Size and color are required.');
  }

  if (stock < 0) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Stock cannot be negative.');
  }

  const result = await Product.findOneAndUpdate(
    {
      _id: productId,
      variants: {
        $elemMatch: {
          size: size.trim(),
          color: color.trim(),
        },
      },
    },
    {
      $set: {
        'variants.$.stock': Number(stock),
      },
    },
    { new: true, runValidators: true },
  );

  if (!result) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Product variant not found.');
  }

  return result;
};

// ======================================================
// Increase / Add Stock to Variant
// ======================================================

const increaseProductVariantStockToDB = async (
  productId: string,
  size: string,
  color: string,
  quantity: number,
) => {
  if (!Types.ObjectId.isValid(productId)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid product ID.');
  }

  if (!size?.trim() || !color?.trim()) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Size and color are required.');
  }

  if (quantity <= 0) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Quantity must be greater than zero.',
    );
  }

  const result = await Product.findOneAndUpdate(
    {
      _id: productId,
      variants: {
        $elemMatch: {
          size: size.trim(),
          color: color.trim(),
        },
      },
    },
    {
      $inc: {
        'variants.$.stock': Number(quantity),
      },
    },
    { new: true, runValidators: true },
  );

  if (!result) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Product variant not found.');
  }

  return result;
};

// ======================================================
// Update Pre-Order Settings
// ======================================================

const updateVariantPreOrderToDB = async (
  productId: string,
  size: string,
  color: string,
  isPreOrder: boolean,
  expectedAvailableDate?: Date | string,
) => {
  if (!Types.ObjectId.isValid(productId)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid product ID.');
  }

  if (!size?.trim() || !color?.trim()) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Size and color are required.');
  }

  if (isPreOrder && !expectedAvailableDate) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Expected available date is required for pre-order.',
    );
  }

  if (!isPreOrder && expectedAvailableDate) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Expected available date is only allowed for pre-order.',
    );
  }

  const parsedDate = expectedAvailableDate
    ? new Date(expectedAvailableDate)
    : undefined;

  if (parsedDate && parsedDate < new Date()) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Expected available date cannot be in the past.',
    );
  }

  const product = await Product.findOneAndUpdate(
    {
      _id: productId,
      variants: {
        $elemMatch: {
          size: size.trim(),
          color: color.trim(),
        },
      },
    },
    {
      $set: {
        'variants.$.isPreOrder': isPreOrder,
        'variants.$.expectedAvailableDate': parsedDate,
      },
    },
    { new: true, runValidators: true },
  );

  if (!product) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Product variant not found.');
  }

  return product;
};

// ======================================================
// Check Variant Availability
// ======================================================

const checkProductVariantAvailability = async (
  productId: string,
  size: string,
  color: string,
  quantity: number,
) => {
  if (!Types.ObjectId.isValid(productId)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid product ID.');
  }

  if (quantity <= 0) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Quantity must be greater than zero.',
    );
  }

  const product = await Product.findOne({
    _id: productId,
    status: 'active',
  }).select('name price variants');

  if (!product) {
    throw new ApiError(
      StatusCodes.NOT_FOUND,
      'Product not found or is inactive.',
    );
  }

  const variant = product.variants.find(
    item =>
      item.size.toLowerCase() === size.trim().toLowerCase() &&
      item.color.toLowerCase() === color.trim().toLowerCase(),
  );

  if (!variant) {
    throw new ApiError(
      StatusCodes.NOT_FOUND,
      'Selected product variant does not exist.',
    );
  }

  if (variant.stock >= quantity) {
    return {
      available: true,
      isPreOrder: false,
      stock: variant.stock,
      expectedAvailableDate: null,
    };
  }

  if (variant.isPreOrder) {
    return {
      available: true,
      isPreOrder: true,
      stock: variant.stock,
      expectedAvailableDate: variant.expectedAvailableDate ?? null,
    };
  }

  return {
    available: false,
    isPreOrder: false,
    stock: variant.stock,
    expectedAvailableDate: null,
  };
};

// ======================================================
// Aggregate Product Stats (For Admin Dashboard)
// ======================================================

const getProductStatsFromDB = async () => {
  const [stats] = await Product.aggregate([
    {
      $facet: {
        statusCounts: [
          {
            $group: {
              _id: null,
              totalProducts: { $sum: 1 },
              activeProducts: {
                $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] },
              },
              draftProducts: {
                $sum: { $cond: [{ $eq: ['$status', 'draft'] }, 1, 0] },
              },
              inactiveProducts: {
                $sum: { $cond: [{ $eq: ['$status', 'inactive'] }, 1, 0] },
              },
              archivedProducts: {
                $sum: { $cond: [{ $eq: ['$status', 'archived'] }, 1, 0] },
              },
              featuredProducts: {
                $sum: { $cond: [{ $eq: ['$featured', true] }, 1, 0] },
              },
              totalSold: { $sum: '$sold' },
            },
          },
        ],
        inventoryCounts: [
          { $unwind: '$variants' },
          {
            $group: {
              _id: null,
              totalInventoryUnits: { $sum: '$variants.stock' },
              outOfStockVariants: {
                $sum: { $cond: [{ $lte: ['$variants.stock', 0] }, 1, 0] },
              },
            },
          },
        ],
      },
    },
  ]);

  const statusSummary = stats?.statusCounts?.[0] || {};
  const inventorySummary = stats?.inventoryCounts?.[0] || {};

  return {
    totalProducts: statusSummary.totalProducts || 0,
    activeProducts: statusSummary.activeProducts || 0,
    draftProducts: statusSummary.draftProducts || 0,
    inactiveProducts: statusSummary.inactiveProducts || 0,
    archivedProducts: statusSummary.archivedProducts || 0,
    featuredProducts: statusSummary.featuredProducts || 0,
    totalSold: statusSummary.totalSold || 0,
    totalInventoryUnits: inventorySummary.totalInventoryUnits || 0,
    outOfStockVariants: inventorySummary.outOfStockVariants || 0,
  };
};

export const ProductService = {
  createProductToDB,
  getAllProductsFromDB,
  getSingleProductFromDB,
  updateProductToDB,
  deleteProductFromDB,
  updateProductStatusToDB,
  toggleProductFeaturedToDB,
  updateProductVariantStockToDB,
  increaseProductVariantStockToDB,
  updateVariantPreOrderToDB,
  checkProductVariantAvailability,
  getProductStatsFromDB,
};
