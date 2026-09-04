import { z } from 'zod';
import {
  IProductVariant,
  PRODUCT_GENDERS,
  PRODUCT_STATUS,
} from './product.constants';
import ApiError from '../../../errors/ApiError';
import { StatusCodes } from 'http-status-codes';
import { Types } from 'mongoose';
import { Productcategory } from '../productcategory/productcategory.model';

// Helper validator for variants array
const validateVariants = (variants: IProductVariant[]) => {
  if (!variants || !Array.isArray(variants) || variants.length === 0) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'At least one product variant is required.',
    );
  }

  const variantKeys = new Set<string>();

  for (const variant of variants) {
    const size = variant.size?.trim();
    const color = variant.color?.trim();

    if (!size || !color) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        'Variant size and color are required.',
      );
    }

    if (variant.stock === undefined || Number(variant.stock) < 0) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        'Variant stock cannot be negative.',
      );
    }

    // Prevent duplicate size + color combinations
    const key = `${size.toLowerCase()}-${color.toLowerCase()}`;

    if (variantKeys.has(key)) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        `Duplicate variant found: ${size} / ${color}.`,
      );
    }

    variantKeys.add(key);

    // Pre-order validation
    if (variant.isPreOrder && !variant.expectedAvailableDate) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        `Expected available date is required for pre-order variant: ${size} / ${color}.`,
      );
    }

    if (!variant.isPreOrder && variant.expectedAvailableDate) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        `Expected available date is only allowed for pre-order variant: ${size} / ${color}.`,
      );
    }

    // Expected date should not be in the past
    if (
      variant.isPreOrder &&
      variant.expectedAvailableDate &&
      new Date(variant.expectedAvailableDate) < new Date()
    ) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        `Expected available date cannot be in the past: ${size} / ${color}.`,
      );
    }
  }
};

// Helper validator for category reference
const validateCategory = async (categoryId: Types.ObjectId | string) => {
  if (!Types.ObjectId.isValid(categoryId)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid product category ID.');
  }

  const category = await Productcategory.findById(categoryId)
    .select('_id status')
    .lean();

  if (!category) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Product category not found.');
  }

  if ('status' in category && category.status !== 'active') {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Selected product category is not active.',
    );
  }

  return category;
};

// Helper validator for pricing consistency
const validatePrice = (
  price: number | string,
  compareAtPrice?: number | string,
) => {
  const numPrice = Number(price);
  const numCompareAtPrice =
    compareAtPrice !== undefined &&
    compareAtPrice !== null &&
    compareAtPrice !== ''
      ? Number(compareAtPrice)
      : undefined;

  if (isNaN(numPrice) || numPrice < 0) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Product price cannot be negative.',
    );
  }

  if (numCompareAtPrice !== undefined && !isNaN(numCompareAtPrice)) {
    if (numCompareAtPrice < 0) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        'Compare-at price cannot be negative.',
      );
    }

    if (numCompareAtPrice < numPrice) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        'Compare-at price must be greater than or equal to the selling price.',
      );
    }
  }
};

// Zod validation schemas for requests
const createProductZod = z.object({
  body: z.object({
    name: z.string({ required_error: 'Product name is required' }).trim(),
    description: z
      .string({ required_error: 'Product description is required' })
      .trim(),
    category: z.string({ required_error: 'Product category is required' }),
    price: z.coerce
      .number({ required_error: 'Price is required' })
      .min(0, 'Price cannot be negative'),
    compareAtPrice: z.coerce.number().min(0).optional(),
    gender: z.enum(PRODUCT_GENDERS).optional(),
    status: z.enum(PRODUCT_STATUS).optional(),
    featured: z.coerce.boolean().optional(),
    // variants and tags can arrive as JSON string (from multipart/form-data) or array
    variants: z.any().optional(),
    tags: z.any().optional(),
  }),
});

const updateProductZod = z.object({
  body: z.object({
    name: z.string().trim().optional(),
    description: z.string().trim().optional(),
    category: z.string().optional(),
    price: z.coerce.number().min(0).optional(),
    compareAtPrice: z.coerce.number().min(0).optional(),
    gender: z.enum(PRODUCT_GENDERS).optional(),
    status: z.enum(PRODUCT_STATUS).optional(),
    featured: z.coerce.boolean().optional(),
    variants: z.any().optional(),
    tags: z.any().optional(),
    images: z.any().optional(),
  }),
});

const updateProductStatusZod = z.object({
  body: z.object({
    status: z.enum(PRODUCT_STATUS, {
      required_error: 'Product status is required',
    }),
  }),
});

const updateVariantStockZod = z.object({
  body: z.object({
    size: z.string({ required_error: 'Size is required' }).trim(),
    color: z.string({ required_error: 'Color is required' }).trim(),
    stock: z.coerce
      .number({ required_error: 'Stock is required' })
      .min(0, 'Stock cannot be negative'),
  }),
});

const increaseVariantStockZod = z.object({
  body: z.object({
    size: z.string({ required_error: 'Size is required' }).trim(),
    color: z.string({ required_error: 'Color is required' }).trim(),
    quantity: z.coerce
      .number({ required_error: 'Quantity is required' })
      .positive('Quantity must be greater than zero'),
  }),
});

const updateVariantPreOrderZod = z.object({
  body: z.object({
    size: z.string({ required_error: 'Size is required' }).trim(),
    color: z.string({ required_error: 'Color is required' }).trim(),
    isPreOrder: z.coerce.boolean({ required_error: 'isPreOrder is required' }),
    expectedAvailableDate: z.string().optional(),
  }),
});

export const ProductValidations = {
  validateVariants,
  validateCategory,
  validatePrice,
  createProductZod,
  updateProductZod,
  updateProductStatusZod,
  updateVariantStockZod,
  increaseVariantStockZod,
  updateVariantPreOrderZod,
};
