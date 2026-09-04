import { z } from 'zod';
import { PRODUCT_CATEGORY_STATUS } from './productcategory.constants';

const createCategoryZod = z.object({
  body: z.object({
    name: z
      .string({ required_error: 'Category name is required' })
      .trim()
      .min(1, 'Category name cannot be empty'),
    status: z.enum(PRODUCT_CATEGORY_STATUS).optional(),
  }),
});

const updateCategoryZod = z.object({
  body: z.object({
    name: z.string().trim().min(1).optional(),
    status: z.enum(PRODUCT_CATEGORY_STATUS).optional(),
  }),
});

export const ProductcategoryValidations = {
  createCategoryZod,
  updateCategoryZod,
};
